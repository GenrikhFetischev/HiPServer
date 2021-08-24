import "./devReload";
import { createChatApi } from "./rxChatApi";

console.clear();

(async () => {
  const chatApi = createChatApi();

  chatApi.subscribe(console.log);
})();
