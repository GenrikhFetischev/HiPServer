import ws, { Data } from "ws";
import { chatPort } from "./constants";
import { filter, from, mergeAll, Observable, scan, Subject } from "rxjs";
import { Message } from "./types";
import WebSocket from "ws";
import { map, tap } from "rxjs/operators";
import { parseMessage } from "./messageParser";

const identityFilter = <T>(arg: T | undefined): arg is T => Boolean(arg);

const storeSockets = (sockets: WebSocket[], socket: WebSocket) => {
  sockets.push(socket);
  return sockets;
};

const mapSocketArray = (sockets: WebSocket[]) => {
  const socket: WebSocket = sockets[sockets.length - 1];
  const removeSocket = () => sockets.splice(sockets.indexOf(socket), 1);
  const getAllSockets = () => sockets;

  return {
    socket,
    removeSocket,
    getAllSockets,
  };
};

const createConnectionHandler =
  (clientStream: Subject<Observable<Message>>) =>
  ({
    socket,
    removeSocket,
    getAllSockets,
  }: {
    socket: WebSocket;
    removeSocket: () => void;
    getAllSockets: () => WebSocket[];
  }) => {
    const connection = new Observable<Data>((subscriber) => {
      socket.on("message", (msg) => subscriber.next(msg));
      socket.on("error", (e) => subscriber.error(e));
      socket.on("close", () => {
        removeSocket();
        subscriber.complete();
      });
    });

    const connectionStream: Observable<Message> = connection.pipe(
      map(parseMessage),
      filter(identityFilter),
      tap((message) => {
        from(getAllSockets())
          .pipe(
            filter((ws) => ws !== socket),
            tap((ws) => {
              ws.send(JSON.stringify(message));
            })
          )
          .subscribe();
      })
    );

    clientStream.next(connectionStream);
  };

export const createChatApi = (): Observable<Message> => {
  const clientStream = new Subject<Observable<Message>>();
  const server = new ws.Server({ port: chatPort });
  const observableServer = new Observable<WebSocket>((subscriber) => {
    server.on("connection", (socket) => subscriber.next(socket));
    server.on("error", (e) => subscriber.error(e));
    server.on("close", () => subscriber.complete());
  });

  observableServer
    .pipe(
      tap(() => console.log("Got new connection")),
      scan(storeSockets, []),
      map(mapSocketArray)
    )
    .subscribe({
      next: createConnectionHandler(clientStream),
      error: console.error,
      complete: () => console.warn("Server's done"),
    });

  return clientStream.pipe(mergeAll());
};
