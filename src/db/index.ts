import { Pool, QueryResult } from "pg";
import {
  buildDeleteContactQuery,
  buildGetMessagesForClientQuery,
  buildInsertMessageQuery,
  buildSetMessageStatusCommand,
  buildUpsertContactQuery,
  createMeContactCommand,
  createTablesCommand,
  getContactsQuery,
} from "./commands";
import {
  Contact,
  DbMessage,
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

export const getContacts = async () => {
  return await pool.query(getContactsQuery);
};

export const deleteContact = async (contact: Contact) => {
  return await pool.query(buildDeleteContactQuery(contact));
};

export const saveMessage = async (msg: Message) => {
  try {
    await pool.query(buildInsertMessageQuery(msg));
  } catch (e) {
    console.log("Can't save message");
    console.error(e);
  }
};

export const getMessagesForContact = async (
  host: string
): Promise<QueryResult<DbMessage>> => {
  try {
    return await pool.query<DbMessage>(buildGetMessagesForClientQuery(host));
  } catch (e) {
    console.error(e);
    return {
      rows: [],
      command: "SELECT",
      rowCount: 0,
      oid: 0,
      fields: [],
    };
  }
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

  const sqlReq = buildSetMessageStatusCommand(event.messageId, status);
  try {
    await pool.query(sqlReq);
  } catch (e) {
    console.error(`Failed to set message status with req: ${sqlReq}`);
    console.error(e);
  }
};
