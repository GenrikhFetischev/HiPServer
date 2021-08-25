import WebSocket, { Server } from "ws";
import { chatPort, publicPort } from "./constants";
import { from, mergeAll, Observable, scan, Subject, tap } from "rxjs";
import { parseMessage } from "./messageParser";
import { map, filter } from "rxjs/operators";
import { Message } from "./types";
import {
  extractSocket,
  fromSocket,
  fromWsServer,
  IncomingConnection,
} from "./observables";
import { identityFilter } from "./utils";
import ws from "ws";

export class ChatApi {
  private highOrderIncomingStream = new Subject<Observable<Message>>();
  private server: Server;
  private sockets: WebSocket[] = [];
  public incomingStream: Observable<Message>;

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

    this.incomingStream = this.highOrderIncomingStream.pipe(mergeAll());
  }

  private setSocket = (socket: WebSocket) => {
    this.sockets.push(socket);
  };

  private removeSocket = (socket: WebSocket) => {
    const index = this.sockets.indexOf(socket);
    this.sockets.splice(index, 1);
  };

  private connectionHandler = (socket: WebSocket) => {
    const connection = fromSocket(socket, {
      complete: this.removeSocket,
      error: this.removeSocket,
    });

    const observer = connection.pipe(
      map(parseMessage),
      filter(identityFilter),
      tap((message) => {
        from(this.sockets)
          .pipe(
            filter((ws) => ws !== socket),
            tap((ws) => {
              ws.send(JSON.stringify(message));
            })
          )
          .subscribe();
      })
    );

    this.highOrderIncomingStream.next(observer);
  };

  public sendMessage = (msg: Message) => {
    this.sockets.forEach((ws) => ws.send(JSON.stringify(msg)));
  };
}
