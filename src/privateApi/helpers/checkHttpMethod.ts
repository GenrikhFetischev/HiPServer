import { HttpRouteHandler } from "../httpRouter";

const checkHttpMethod =
  (possibleMethod: string) =>
  (handler: HttpRouteHandler): HttpRouteHandler =>
  (req, res) => {
    const method = req.method;

    if (possibleMethod === method) {
      return handler(req, res);
    } else {
      res.writeHead(405);
      res.end();
    }
  };

export const strictGet = checkHttpMethod("GET");
export const strictPods = checkHttpMethod("POST")
