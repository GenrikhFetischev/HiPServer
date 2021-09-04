import { createHttpApiServer } from "./httpServer";
import { privatePort } from "../constants";
import { PrivateWsApi } from "./wsServer";
import { createHttpRouter, createHttpRoutes } from "./httpRouter";
import { createWsRouter, createWsRoutes } from "./wsRouter";

export const createPrivateApi = () => {
  const privateWsApi = new PrivateWsApi();

  const httpRouter = createHttpRouter(createHttpRoutes());
  const wsRouter = createWsRouter(
    createWsRoutes({
      "/chat": privateWsApi.upgradeConnectionHandler,
    })
  );

  const privateHttpServer = createHttpApiServer(
    privatePort,
    httpRouter,
    wsRouter
  );

  return {
    privateHttpServer,
    privateWsApi,
  };
};
