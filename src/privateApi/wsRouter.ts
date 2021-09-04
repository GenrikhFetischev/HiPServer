import { IncomingMessage } from "http";
import stream from "stream";

export type UpgradeHandler = (
  req: IncomingMessage,
  socket: stream.Duplex,
  head: Buffer
) => void;

type Routes = Map<string, UpgradeHandler>;

export const createWsRoutes = (routes: {
  [path: string]: UpgradeHandler;
}): Routes => {
  return new Map(Object.entries(routes));
};

export const createWsRouter =
  (routes: Routes): UpgradeHandler =>
  (req, socket, head) => {
    if (!req.url) {
      console.warn("Incoming request without url prop");
      return;
    }

    const routeHandler = routes.get(req.url);
    if (!routeHandler) {
      socket.end();
    } else {
      routeHandler(req, socket, head);
    }
  };
