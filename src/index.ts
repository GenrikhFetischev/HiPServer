import "./devReload";
import { PublicApi } from "./publicApi";
import { ChatApi } from "./chatApi";

(async () => {
  const chatApi = new ChatApi();
  const publicApi = new PublicApi();

  chatApi.messageStream.subscribe(publicApi.sendMessage);
  publicApi.messageStream.subscribe(chatApi.sendMessage);
  publicApi.receiveConfirmationStream.subscribe(chatApi.sendMessage)
})();
