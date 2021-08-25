import WebSocket, { Data, Server } from "ws";
import { IncomingMessage } from "http";
import { Observable } from "rxjs";

export type SocketObserver = {
  next: (arg: Data) => Data;
  complete: (arg: WebSocket) => void;
  error: (arg: WebSocket, e: Error) => void;
};

export const fromSocket = (
  socket: WebSocket,
  observer: Partial<SocketObserver> = {}
): Observable<Data> => {
  return new Observable<Data>((subscriber) => {
    socket.on("message", (msg) => {
      const next = observer.next ? observer.next(msg) : msg;
      subscriber.next(next);
    });
    socket.on("close", () => {
      observer.complete && observer.complete(socket);
      subscriber.complete();
    });
    socket.on("error", (e) => {
      observer.error && observer.error(socket, e);
      subscriber.error();
    });
  });
};

export type IncomingConnection = { socket: WebSocket; req: IncomingMessage };
export type ServerObserver = {
  next: (arg: IncomingConnection) => IncomingConnection;
  complete: (arg: Server) => void;
  error: (arg: Server, e: Error) => void;
};

export const fromWsServer = (
  server: Server,
  observer: Partial<ServerObserver> = {}
): Observable<IncomingConnection> => {
  return new Observable<IncomingConnection>((subscriber) => {
    server.on("connection", (socket, req) => {
      const next = observer.next
        ? observer.next({ socket, req })
        : { socket, req };
      subscriber.next(next);
    });
    server.on("close", () => {
      observer.complete && observer.complete(server);
      subscriber.complete();
    });
    server.on("error", (e) => {
      observer.error && observer.error(server, e);
      subscriber.error();
    });
  });
};

export const extractSocket = <T extends { socket: WebSocket }>(
  incoming: T
): WebSocket => incoming.socket;
