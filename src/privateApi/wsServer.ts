import { Socket } from "net";
import WebSocket, { Server as WsServer } from "ws";
import { mergeAll, Observable, Subject, tap } from "rxjs";
import { filter, map } from "rxjs/operators";
import { filterToMeMessage, parseMessage } from "../messageParser";
import {
  EventTypes,
  Message,
  MessageStatus,
  PrivateApiMessage,
  ReceiveConfirmation,
} from "../types";
import { extractSocket, fromSocket, fromWsServer } from "../observables";
import { identityFilter, invertFilter } from "../utils";
import { saveMessage } from "../db";
import { UpgradeHandler } from "./wsRouter";

export class PrivateWsApi {
  private highOrderIncomingStream = new Subject<Observable<Message>>();
  private wsServer: WsServer;
  public messageStream: Observable<Message>;

  constructor() {
    this.wsServer = new WsServer({ noServer: true });

    fromWsServer(this.wsServer)
      .pipe(
        tap(() => console.log("Got new client connection")),
        map(extractSocket),
        map(this.connectionHandler)
      )
      .subscribe();

    this.messageStream = this.highOrderIncomingStream.pipe(mergeAll());
  }

  private setFromField = (msg: Message) => {
    msg.from = "me";
    return msg;
  };

  private setMessageStatus = (msg: Message) => {
    if (msg.to === "me") {
      msg.status = MessageStatus.Received;
    }
    return msg;
  };

  private sendConfirmation = (message: Message) => {
    const confirmation: ReceiveConfirmation = {
      type: EventTypes.ReceiveConfirmation,
      messageId: message.messageId,
      chatId: message.to,
    };
    this.sendMessage(confirmation);
  };

  private connectionHandler = (socket: WebSocket) => {
    const rootConnectionObservable = fromSocket(socket).pipe(
      map(parseMessage),
      filter(identityFilter),
      map(this.setFromField),
      map(this.setMessageStatus),
      tap(saveMessage),
      tap((msg) => this.sendMessage(msg, { excludeSocket: socket }))
    );

    rootConnectionObservable
      .pipe(filter(filterToMeMessage), tap(this.sendConfirmation))
      .subscribe();

    const toContactMessages = rootConnectionObservable.pipe(
      filter(invertFilter(filterToMeMessage))
    );

    this.highOrderIncomingStream.next(toContactMessages);
  };

  public upgradeConnectionHandler: UpgradeHandler = (request, socket, head) => {
    this.wsServer.handleUpgrade(request, socket as Socket, head, (ws) => {
      this.wsServer.emit("connection", ws, request);
    });
  };

  public sendMessage = (
    msg: PrivateApiMessage,
    { excludeSocket }: { excludeSocket?: WebSocket } = {}
  ) => {
    this.wsServer.clients.forEach((ws) => {
      if (ws !== excludeSocket) {
        ws.send(JSON.stringify(msg));
      }
    });
  };
}
