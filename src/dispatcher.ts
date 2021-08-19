import ws from "ws";
import { Message } from "./types";

export class Dispatcher {
  private clientSockets: ws[] = [];

  public addClientSocket = (socket: ws) => {
    this.clientSockets.push(socket);
  };

  public removeClientSocket = (socket: ws) => {
    const index = this.clientSockets.indexOf(socket);
    if (index < 0) {
      return;
    }
    this.clientSockets.splice(index, 1);
  };

  public sendMessageToClients = async (msg: Message) => {
    this.clientSockets.forEach((socket) => {
      socket.send(JSON.stringify(msg));
    });
  };

}

