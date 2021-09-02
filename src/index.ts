import "./devReload";
import { PublicApi } from "./publicApi";
import { ChatApi } from "./chatApi";
import { createHttpApiServer } from "./httpApi";

(async () => {
  const chatApi = new ChatApi();
  const publicApi = new PublicApi();
  const httpApi = createHttpApiServer();

  chatApi.messageStream.subscribe(publicApi.sendMessage);
  publicApi.messageStream.subscribe(chatApi.sendMessage);
  publicApi.receiveConfirmationStream.subscribe(chatApi.sendMessage);
})();
