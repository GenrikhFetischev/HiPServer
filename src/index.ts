import "./devReload";
import { createChatApiServer } from "./chatApi";
import { createIncomingApiServer } from "./incomingApi";
import { Contacts } from "./contacts";
import { Dispatcher } from "./dispatcher";

console.clear();

(async () => {
  const contacts = new Contacts([
    {
      name: "User",
      networkAddress: "127.0.0.1:6666",
    },
  ]);
  const dispatcher = new Dispatcher();

  const chatServer = createChatApiServer(dispatcher);
  const incomingMessageServer = createIncomingApiServer(contacts, dispatcher);
})();
