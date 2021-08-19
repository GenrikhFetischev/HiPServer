import ws, { Data } from "ws";
import { clientPort } from "./constants";
import { messageForwarder } from "./messageForwarder";
import { parseMessage } from "./messageParser";
import { storeMessage } from "./storage";
import { Message } from "./types";
import { Dispatcher } from "./dispatcher";

const createFinalMessage = (sent: boolean, msg?: Message) => {
  const final = {
    sent,
    message: msg,
  };

  return JSON.stringify(final);
};

const createMessageHandler = (socket: ws) => async (msg: Data) => {
  const parsedMessage = parseMessage(msg);
  if (!parsedMessage) {
    socket.send(createFinalMessage(false));
    return;
  }

  const { sent } = await messageForwarder(parsedMessage);

  if (sent) {
    await storeMessage(parsedMessage);
  }
  socket.send(createFinalMessage(sent, parsedMessage));
};

export const createChatApiServer = (dispatcher: Dispatcher) => {
  const server = new ws.Server({ port: clientPort });

  server.on("connection", (socket, req) => {
    dispatcher.addClientSocket(socket);
    const from = `${req.socket.remoteAddress}:${req.socket.remotePort}`;
    console.log(from);

    socket.on("message", createMessageHandler(socket));
    socket.on("close", () => dispatcher.removeClientSocket(socket));
    socket.on("error", () => dispatcher.removeClientSocket(socket));

    socket.send(JSON.stringify({ connected: true }));
  });

  return server;
};
