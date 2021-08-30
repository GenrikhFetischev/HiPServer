import WebSocket, { Server } from "ws";
import { publicPort } from "./constants";
import { mergeAll, Observable, Subject, tap } from "rxjs";
import { parseMessage } from "./messageParser";
import { map, filter } from "rxjs/operators";
import { Message } from "./types";
import { fromSocket, fromWsServer, IncomingConnection } from "./observables";
import { identityFilter } from "./utils";

type MappedIncomingConnection = { destination: string; socket: WebSocket };

export class PublicApi {
  private highOrderIncomingStream = new Subject<Observable<Message>>();
  private server: Server;
  private sockets: Map<string, WebSocket> = new Map();
  public messageStream: Observable<Message>;

  constructor() {
    this.server = new Server({ port: publicPort });

    fromWsServer(this.server)
      .pipe(
        map(this.mapIncomingConnection),
        tap(({ destination }) =>
          console.log(`Got new incoming connection from: ${destination}`)
        ),
        tap(this.setSocket),
        map(this.observeSocket)
      )
      .subscribe();

    this.messageStream = this.highOrderIncomingStream.pipe(mergeAll());
  }

  private setSocket = ({ destination, socket }: MappedIncomingConnection) => {
    this.sockets.set(destination, socket);
  };

  private mapIncomingConnection = ({
    socket,
    req,
  }: IncomingConnection): MappedIncomingConnection => {
    const destination = `${req.socket.remoteAddress}:${req.socket.remotePort}`;

    return { socket, destination };
  };

  private observeSocket = ({
    socket,
    destination,
  }: MappedIncomingConnection) => {
    const deleteSocket = (_: WebSocket, e?: Error) => {
      if (e) {
        console.error(e);
      }
      this.sockets.delete(destination);
    };

    const observable = fromSocket(socket, {
      error: deleteSocket,
      complete: deleteSocket,
    }).pipe(
      map((msg) => {
        return parseMessage(msg);
      }),
      filter(identityFilter),
      map((msg) => {
        msg.from = destination;
        return msg;
      })
    );
    this.highOrderIncomingStream.next(observable);
  };

  private openSocket = (to: string) =>
    new Promise<WebSocket>((resolve, reject) => {
      try {
        const socket = new WebSocket(`ws://${to}`);
        socket.on("open", () => {
          this.sockets.set(to, socket);

          this.observeSocket({ socket, destination: to });
          resolve(socket);
        });
      } catch (e) {
        reject(e);
      }
    });

  public sendMessage = async (msg: Message) => {
    const { to } = msg;
    const storedSocket = this.sockets.get(to);
    try {
      const socket = storedSocket ? storedSocket : await this.openSocket(to);
      socket.send(JSON.stringify(msg));
    } catch (e) {
      console.error(e);
    }
  };
}
