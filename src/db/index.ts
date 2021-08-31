import { Pool } from "pg";
import {
  buildConfirmReceivingCommand,
  buildDeleteContactQuery,
  buildGetMessagesForClientQuery,
  buildInsertMessageQuery,
  buildUpsertContactQuery,
  createMeContactCommand,
  createTablesCommand,
} from "./commands";
import { Contact, Message, ReceiveConfirmation } from "../types";

const pool = new Pool({
  database: "p2p",
});

(async () => {
  try {
    await pool.query(createTablesCommand);
    await pool.query(createMeContactCommand);
    console.log("Tables are ready");
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

export const markAsReceived = async (confirmation: ReceiveConfirmation) => {
  return await pool.query(buildConfirmReceivingCommand(confirmation.received));
};
