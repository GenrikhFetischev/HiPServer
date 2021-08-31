import WebSocket, { Server as WsServer } from "ws";
import { createServer, Server } from "http";
import { mergeAll, Observable, Subject, tap } from "rxjs";
import { chatPort } from "./constants";
import { filterToMeMessage, parseMessage } from "./messageParser";
import { map, filter } from "rxjs/operators";
import { IncomingMessage, Message } from "./types";
import { extractSocket, fromSocket, fromWsServer } from "./observables";
import { identityFilter, invertFilter } from "./utils";
import { markAsReceived, saveMessage } from "./db";
import { Socket } from "net";

export class ChatApi {
  private highOrderIncomingStream = new Subject<Observable<Message>>();
  private wsServer: WsServer;
  private httpServer;
  public messageStream: Observable<Message>;

  constructor() {
    this.wsServer = new WsServer({ noServer: true });
    this.httpServer = this.createHttpServer();

    fromWsServer(this.wsServer)
      .pipe(
        tap(() => console.log("Got new client connection")),
        map(extractSocket),
        map(this.connectionHandler)
      )
      .subscribe();

    this.messageStream = this.highOrderIncomingStream.pipe(mergeAll());
  }

  private createHttpServer = (): Server => {
    const server = createServer();

    server.on("upgrade", (request, socket: Socket, head) => {
      console.log(request.headers);

      this.wsServer.handleUpgrade(request, socket, head, (ws) => {
        this.wsServer.emit("connection", ws, request);
      });
    });

    server.listen(chatPort);
    return server;
  };

  private setFromField = (msg: Message) => {
    msg.from = "me";
    return msg;
  };

  private setReceivedFlag = (msg: Message) => {
    msg.received = true;
    return msg;
  };

  private connectionHandler = (socket: WebSocket) => {
    const connectionObservable = fromSocket(socket).pipe(
      map(parseMessage),
      filter(identityFilter),
      map(this.setFromField),
      map(this.setReceivedFlag),
      tap(saveMessage),
      tap((msg) => this.sendMessage(msg, { excludeSocket: socket })),
      filter(invertFilter(filterToMeMessage))
    );

    this.highOrderIncomingStream.next(connectionObservable);
  };

  public sendMessage = (
    msg: IncomingMessage,
    { excludeSocket }: { excludeSocket?: WebSocket } = {}
  ) => {
    this.wsServer.clients.forEach((ws) => {
      if (ws !== excludeSocket) {
        ws.send(JSON.stringify(msg));
      }
    });
  };
}
