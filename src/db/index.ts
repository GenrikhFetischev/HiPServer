import { Pool } from "pg";
import {
  buildDeleteContactQuery,
  buildGetMessagesForClientQuery,
  buildInsertMessageQuery,
  buildSetMessageStatusCommand,
  buildUpsertContactQuery,
  createMeContactCommand,
  createTablesCommand,
} from "./commands";
import {
  Contact,
  EventTypes,
  FailSendNotification,
  Message,
  MessageStatus,
  ReceiveConfirmation,
} from "../types";

const pool = new Pool({
  database: "p2p",
});

(async () => {
  try {
    await pool.query(createTablesCommand);
    await pool.query(createMeContactCommand);
  } catch (e) {
    console.error("Problem with creating tables in db");
    console.error(e);
  }
})();

export const createContact = async (contact: Contact) => {
  return await pool.query(buildUpsertContactQuery(contact));
};

export const deleteContact = async (contact: Contact) => {
  return await pool.query(buildDeleteContactQuery(contact));
};

export const saveMessage = async (msg: Message) => {
  return await pool.query(buildInsertMessageQuery(msg));
};

export const getMessagesForContact = async (contact: Contact) => {
  return await pool.query(buildGetMessagesForClientQuery(contact));
};

export const setMessageStatus = async (
  event: FailSendNotification | ReceiveConfirmation
) => {
  let status: MessageStatus;
  switch (event.type) {
    case EventTypes.ReceiveConfirmation:
      status = MessageStatus.Received;
      break;
    case EventTypes.FailSendNotification:
      status = MessageStatus.FailedToSend;
      break;
    default:
      status = MessageStatus.Sent;
  }

  return await pool.query(
    buildSetMessageStatusCommand(event.messageId, status)
  );
};
