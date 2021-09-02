import { createServer } from "http";
import { router } from "./router";

export const createHttpApiServer = () => {
  const server = createServer();

  server.on("request", router);

  server.listen(3333);

  return server;
};
