import { IncomingMessage, ServerResponse } from "http";
import { loginHandler, loginRouteMatcher } from "./login";
import { getAllContact, getAllContactRouteMatcher } from "./getContacts";
import { checkAuth } from "./helpers/checkAuth";
import { strictGet, strictPost } from "./helpers/checkHttpMethod";
import { corsHandler, setCorsHeaders } from "./cors";
import {
  createContactHandler,
  createContactRouteMatcher,
} from "./createContact";
import { getMessagesByContact, getMessagesPathMatcher } from "./getMessages";

export type HttpRouteHandler = (
  req: IncomingMessage,
  res: ServerResponse
) => Promise<void> | void;

type RouteMatcher = (path: string) => boolean;

type Routes = Map<RouteMatcher, HttpRouteHandler>;

export const defaultRoutes: Array<[RouteMatcher, HttpRouteHandler]> = [
  [loginRouteMatcher, strictPost(loginHandler)],
  [getAllContactRouteMatcher, strictGet(checkAuth(getAllContact))],
  [createContactRouteMatcher, strictPost(createContactHandler)],
  [getMessagesPathMatcher, strictGet(checkAuth(getMessagesByContact))],
];

export const createHttpRoutes = (
  routes: Array<[RouteMatcher, HttpRouteHandler]> = []
): Routes => {
  return new Map([...defaultRoutes, ...routes]);
};

export const createHttpRouter =
  (routes: Routes): HttpRouteHandler =>
  async (req, res) => {
    if (req.method === "OPTIONS") {
      return corsHandler(req, res);
    }

    setCorsHeaders(req, res);

    const reqUrl = req.url;

    if (!reqUrl) {
      console.warn("Incoming request without url prop");
      return;
    }

    const [_, routeHandler] =
      [...routes.entries()].find(([routeMatcher]) => {
        return routeMatcher(reqUrl);
      }) || [];

    if (!routeHandler) {
      res.statusCode = 404;
    } else {
      await routeHandler(req, res);
    }

    if (!res.writableEnded) {
      res.end();
    }
  };
