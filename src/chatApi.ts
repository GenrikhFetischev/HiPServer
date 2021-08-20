import ws, { Data } from "ws";
import { chatPort } from "./constants";
import { parseMessage } from "./messageParser";
import WebSocket from "ws";
import { storeMessage } from "./storage";

export class ChatWsServer {
  private server: WebSocket.Server;
  private chatClientSockets: WebSocket[] = [];

  constructor() {
    this.server = new ws.Server({ port: chatPort });
    this.server.on("connection", this.connectionHandler);
  }

  private connectionHandler = (socket: WebSocket) => {
    this.chatClientSockets.push(socket);
    const socketIndex = this.chatClientSockets.length - 1;
    socket.on("message", this.messageHandler);
    socket.on("close", this.createCloseConnectionHandler(socketIndex));
  };

  private createCloseConnectionHandler = (index: number) => () => {
    this.chatClientSockets.splice(index, 1);
  };

  private messageHandler = async (msg: Data) => {
    const message = parseMessage(msg);
    if (!message) {
      return;
    }

    // TODO connect to public ws server

  };
}


