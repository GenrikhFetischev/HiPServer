import "./devReload";
import { PublicApi } from "./publicApi";
import { ChatApi } from "./chatApi";

(async () => {
  const chatApi = new ChatApi();
  const publicApi = new PublicApi();

  chatApi.incomingStream.subscribe((msg) => {
    console.log("Chat:", msg);
    publicApi.sendMessage(msg);
  });

  publicApi.incomingStream.subscribe((msg) => {
    console.log("Got from contact", msg);
    chatApi.sendMessage(msg);
  });
})();
