import { loginHandler } from "./login";
import { IncomingMessage, ServerResponse } from "http";

export type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse
) => Promise<void> | void;

export const routes = new Map<string, RouteHandler>([["/login", loginHandler]]);

export const router = async (req: IncomingMessage, res: ServerResponse) => {
  console.log(req.headers);

  if (!req.url) {
    console.warn("Incoming response without url prop");
    return;
  }

  const routeHandler = routes.get(req.url);
  if (!routeHandler) {
    res.writeHead(404);
  } else {
    routeHandler(req, res);
  }
};
