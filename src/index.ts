import "./devReload";
import { ChatWsServer } from "./chatApi";
import { PublicWsServer } from "./publicWsServer";

console.clear();

(async () => {
  const chatServer = new ChatWsServer();
  const incomingMessageServer = new PublicWsServer([]);





})();
