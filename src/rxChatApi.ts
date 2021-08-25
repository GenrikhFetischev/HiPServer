import ws from "ws";
import { chatPort } from "./constants";
import { filter, from, mergeAll, Observable, scan, Subject } from "rxjs";
import { Message } from "./types";
import WebSocket from "ws";
import { map, tap } from "rxjs/operators";
import { parseMessage } from "./messageParser";
import { fromSocket, fromWsServer, extractSocket } from "./observables";
import { identityFilter } from "./utils";

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

const connectionHandler = ({
  socket,
  removeSocket,
  getAllSockets,
}: {
  socket: WebSocket;
  removeSocket: () => void;
  getAllSockets: () => WebSocket[];
}) => {
  const connection = fromSocket(socket, {
    complete: removeSocket,
    error: removeSocket,
  });

  return connection.pipe(
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
};

export const createChatApi = (): Observable<Message> => {
  const clientsStream = new Subject<Observable<Message>>();
  const server = new ws.Server({ port: chatPort });

  fromWsServer(server)
    .pipe(
      tap(() => console.log("Got new client connection")),
      map(extractSocket),
      scan(storeSockets, []),
      map(mapSocketArray),
      map(connectionHandler),
      tap((observable) => clientsStream.next(observable))
    )
    .subscribe();

  return clientsStream.pipe(mergeAll());
};
