import { createServer } from "http";
import { HttpRouteHandler } from "./httpRouter";
import { UpgradeHandler } from "./wsRouter";

export const createHttpApiServer = (
  port: number,
  httpRouter: HttpRouteHandler,
  wsRouter: UpgradeHandler
) => {
  const server = createServer();

  server.on("request", httpRouter);
  server.on("upgrade", wsRouter);

  server.listen(port);

  return server;
};
