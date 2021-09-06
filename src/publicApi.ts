import WebSocket, { Server } from "ws";
import { publicPort } from "./constants";
import { mergeAll, Observable, Subject, tap } from "rxjs";
import {
  filterMessage,
  filterReceiveConfirmation,
  parseMessage,
} from "./messageParser";
import { filter, map } from "rxjs/operators";
import {
  EventTypes,
  FailSendNotification,
  Message,
  MessageStatus,
  ReceiveConfirmation,
} from "./types";
import { fromSocket, fromWsServer, IncomingConnection } from "./observables";
import { identityFilter } from "./utils";
import { saveMessage, setMessageStatus } from "./db";

type MappedIncomingConnection = { destination: string; socket: WebSocket };

export class PublicApi {
  private highOrderIncomingStream = new Subject<Observable<Message>>();
  private highOrderConfirmationStream = new Subject<
    Observable<ReceiveConfirmation>
  >();

  private server: Server;
  private sockets: Map<string, WebSocket> = new Map();
  public messageStream: Observable<Message>;
  public sendingFailStream = new Subject<FailSendNotification>();
  public receiveConfirmationStream: Observable<ReceiveConfirmation>;

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
    this.receiveConfirmationStream = this.highOrderConfirmationStream.pipe(
      mergeAll()
    );
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

    const setFromField = (msg: Message) => {
      msg.from = destination;
      return msg;
    };

    const sendConfirmation = (msg: Message) => {
      const confirmation: ReceiveConfirmation = {
        messageId: msg.messageId,
        type: EventTypes.ReceiveConfirmation,
      };

      socket.send(JSON.stringify(confirmation));
    };

    const connectionObservable = fromSocket(socket, {
      error: deleteSocket,
      complete: deleteSocket,
    }).pipe(map(parseMessage), filter(identityFilter));

    const messageObservable = connectionObservable.pipe(
      filter(filterMessage),
      tap(saveMessage),
      tap(sendConfirmation),
      map(setFromField)
    );

    const confirmationStream = connectionObservable.pipe(
      filter(filterReceiveConfirmation),
      tap((event) => setMessageStatus(event))
    );

    this.highOrderConfirmationStream.next(confirmationStream);
    this.highOrderIncomingStream.next(messageObservable);
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
        socket.on("error", reject);
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
      const failedNotification: FailSendNotification = {
        messageId: msg.messageId,
        type: EventTypes.FailSendNotification,
      };

      await setMessageStatus(failedNotification);
      this.sendingFailStream.next(failedNotification);
      console.error(e);
    }
  };
}
