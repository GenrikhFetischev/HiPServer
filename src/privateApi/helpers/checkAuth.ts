import { HttpRouteHandler } from "../httpRouter";
import { checkJwt } from "../../auth";

export const checkAuth =
  (routeHandler: HttpRouteHandler): HttpRouteHandler =>
  (req, res) => {
    console.log(req.method);
    try {
      const isAuthorized = checkJwt(req.headers.token as string);
      if (isAuthorized) {
        return routeHandler(req, res);
      } else {
        res.writeHead(401);
        res.end();
      }
    } catch (e) {
      console.error(e);
      res.writeHead(400);
      res.write(e.message);
      res.end();
    }
  };
