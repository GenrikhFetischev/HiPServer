import { IncomingMessage } from "http";
import stream from "stream";
import { URL } from "url";
import { checkJwt } from "../auth";

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
    const url = new URL(`${req.headers.origin}${req.url}`);
    const token = url.searchParams.get("token");
    const routeHandler = routes.get(url.pathname);

    if (!routeHandler || !token) {
      socket.end();
    } else {
      const check = checkJwt(token);
      if (check) {
        routeHandler(req, socket, head);
      } else {
        socket.end();
      }
    }
  };
