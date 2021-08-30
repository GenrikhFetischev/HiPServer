import "./devReload";
import { PublicApi } from "./publicApi";
import { ChatApi } from "./chatApi";
import { Conductor } from "./conductor";
import { saveMessage } from "./db";

(async () => {
  const chatApi = new ChatApi();
  const publicApi = new PublicApi();

  const conductor = new Conductor(chatApi, publicApi);

  conductor.setPublicApiMiddleware((msg) => {
    console.log("saving message");
    saveMessage(msg).then(console.log);

    return msg;
  });

  conductor.setChatApiMiddleware((msg) => {
    console.log("saving message");
    saveMessage({
      ...msg,
      from: "me",
    }).then(console.log);

    return msg;
  });
})();
