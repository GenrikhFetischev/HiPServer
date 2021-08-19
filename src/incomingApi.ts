import express, { Request, Response } from "express";
import { parseMessage } from "./messageParser";
import { Contacts } from "./contacts";
import { Dispatcher } from "./dispatcher";
import { storeMessage } from "./storage";
import { incomingMessagesPort } from "./constants";
import bodyParser from "body-parser";

const createIncomingMsgHandler =
  (contacts: Contacts, dispatcher: Dispatcher) =>
  async (req: Request, res: Response) => {
    const msg = req.body;

    debugger

    if (!msg) {
      res.status(400);
      res.end();
      return;
    }

    if (!contacts.isUserContact(msg.from)) {
      res.status(400);
      res.end();
      return;
    }

    await storeMessage(msg);
    res.status(200);
    res.send("OK");

    dispatcher.sendMessageToClients(msg);
  };

export const createIncomingApiServer = (
  contacts: Contacts,
  dispatcher: Dispatcher
) => {
  const incomingApi = express();
  incomingApi.use(bodyParser.json());

  incomingApi.post("/", createIncomingMsgHandler(contacts, dispatcher));

  incomingApi.listen(incomingMessagesPort);

  return incomingApi;
};
