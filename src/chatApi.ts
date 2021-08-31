import WebSocket, { Server } from "ws";
import { chatPort } from "./constants";
import { mergeAll, Observable, Subject, tap } from "rxjs";
import { filterToMeMessage, parseMessage } from "./messageParser";
import { map, filter } from "rxjs/operators";
import { IncomingMessage, Message } from "./types";
import { extractSocket, fromSocket, fromWsServer } from "./observables";
import { identityFilter, invertFilter } from "./utils";
import ws from "ws";
import { saveMessage } from "./db";

export class ChatApi {
  private highOrderIncomingStream = new Subject<Observable<Message>>();
  private server: Server;
  private sockets: WebSocket[] = [];
  public messageStream: Observable<Message>;

  constructor() {
    this.server = new ws.Server({ port: chatPort });

    fromWsServer(this.server)
      .pipe(
        tap(() => console.log("Got new client connection")),
        map(extractSocket),
        tap(this.setSocket),
        map(this.connectionHandler)
      )
      .subscribe();

    this.messageStream = this.highOrderIncomingStream.pipe(mergeAll());
  }

  private setSocket = (socket: WebSocket) => {
    this.sockets.push(socket);
  };

  private removeSocket = (socket: WebSocket) => {
    const index = this.sockets.indexOf(socket);
    this.sockets.splice(index, 1);
  };

  private setFromField = (msg: Message) => {
    msg.from = "me";
    return msg;
  };

  private connectionHandler = (socket: WebSocket) => {
    const connectionObservable = fromSocket(socket, {
      complete: this.removeSocket,
      error: this.removeSocket,
    }).pipe(
      map(parseMessage),
      filter(identityFilter),
      map(this.setFromField),
      tap(saveMessage),
      tap((msg) => this.sendMessage(msg)),
      filter(invertFilter(filterToMeMessage))
    );

    this.highOrderIncomingStream.next(connectionObservable);
  };

  public sendMessage = (msg: IncomingMessage) => {
    this.sockets.forEach((ws) => ws.send(JSON.stringify(msg)));
  };
}
