import { IncomingMessage } from "http";
import WebSocket, { Data } from "ws";
import { publicPort } from "./constants";
import { parseMessage } from "./messageParser";
import assert from "assert";
import { storeMessage } from "./storage";
import { Message } from "./types";

export class PublicWsServer {
  private server: WebSocket.Server;
  private contactSockets: Map<string, WebSocket> = new Map();
  private contactList: string[];

  constructor(contactsList: string[]) {
    this.contactList = contactsList;
    this.server = new WebSocket.Server({ port: publicPort });

    this.server.on("connection", this.connectionHandler);
  }

  private checkIncomingConnection = (from: string): boolean => {
    return this.contactList.includes(from) || true;
  };

  private connectionHandler = (socket: WebSocket, req: IncomingMessage) => {
    const from = `${req.socket.remoteAddress}:${req.socket.remotePort}`;

    if (!this.checkIncomingConnection(from)) {
      socket.close(13);
      return;
    }

    this.contactSockets.set(from, socket);
    socket.on("message", this.buildIncomingMessageHandler(from));
    socket.on("close", this.buildCloseEventHandler(from));
  };

  private buildIncomingMessageHandler = (from: string) => async (msg: Data) => {
    const contactSocket = this.contactSockets.get(from);
    assert(contactSocket, "not existing socket got message");
    const message = parseMessage(msg);
    if (!message) {
      return;
    }
    contactSocket.send(
      JSON.stringify({ received: true, timestamp: message.timestamp })
    );
    await storeMessage(message);

    // TODO  connect with chatApi server
  };

  private buildCloseEventHandler = (from: string) => () => {
    this.contactSockets.delete(from);
  };

  private establishSocketConnection = (
    to: string
  ): Promise<WebSocket | undefined> =>
    new Promise((resolve) => {
      const socket = new WebSocket(`ws://${to}`);
      socket.on("open", () => {
        this.contactSockets.set(to, socket);
        socket.removeEventListener("error");
        socket.on("error", this.buildCloseEventHandler(to));
        socket.on("close", this.buildCloseEventHandler(to));
        resolve(socket);
      });

      socket.on("error", () => resolve(undefined));
    });

  private sendMessageToContact = async (msg: Message) => {
    const socket = this.contactSockets.has(msg.to)
      ? this.contactSockets.get(msg.to)
      : await this.establishSocketConnection(msg.to);

    if (!socket) {
      console.error(`Can't open socket to ${msg.to}`);
      return;
    }
    await storeMessage(msg);
    socket.send(JSON.stringify(msg));
  };
}
