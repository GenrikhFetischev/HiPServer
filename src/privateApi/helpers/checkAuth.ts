import { HttpRouteHandler } from "../httpRouter";
import { checkJwt } from "../../auth";

export const checkAuth =
  (routeHandler: HttpRouteHandler): HttpRouteHandler =>
  (req, res) => {
    try {
      const isAuthorized = checkJwt(req.headers.token as string);
      if (isAuthorized) {
        return routeHandler(req, res);
      } else {
        res.statusCode = 401;
        res.end();
      }
    } catch (e) {
      console.error(e);
      res.statusCode = 400;
      res.write(e.message);
      res.end();
    }
  };
