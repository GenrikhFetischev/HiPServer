import { IncomingMessage, ServerResponse } from "http";
import { loginHandler } from "./login";
import { getAllContact } from "./getContacts";
import { checkAuth } from "./helpers/checkAuth";
import { strictGet } from "./helpers/checkHttpMethod";

export type HttpRouteHandler = (
  req: IncomingMessage,
  res: ServerResponse
) => Promise<void> | void;

type Routes = Map<string, HttpRouteHandler>;

export const defaultRoutes = {
  "/login": loginHandler,
  "/contacts": strictGet(checkAuth(getAllContact)),
};

export const createHttpRoutes = (
  routes: {
    [path: string]: HttpRouteHandler;
  } = {}
): Routes => {
  return new Map(
    Object.entries({
      ...defaultRoutes,
      ...routes,
    })
  );
};

export const createHttpRouter =
  (routes: Routes): HttpRouteHandler =>
  async (req, res) => {
    console.log(req.headers);

    if (!req.url) {
      console.warn("Incoming request without url prop");
      return;
    }

    const routeHandler = routes.get(req.url);
    if (!routeHandler) {
      res.writeHead(404);
    } else {
      routeHandler(req, res);
    }
  };
