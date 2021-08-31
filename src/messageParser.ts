import { IncomingMessage, Message, ReceiveConfirmation } from "./types";
import { Data } from "ws";

export const parseMessage = (msg: Data): Message | undefined => {
  try {
    return JSON.parse(String(msg)) as Message;
  } catch (e) {
    console.error(`Can't parse message: ${JSON.stringify(msg)}`);
    console.error(e);
  }
};

export const filterMessage = (msg: IncomingMessage): msg is Message =>
  "timestamp" in msg && "content" in msg;

export const filterReceiveConfirmation = (
  msg: IncomingMessage
): msg is ReceiveConfirmation => "received" in msg;

export const filterToMeMessage = (msg: Message): boolean =>
  filterMessage(msg) && msg.to === "me";






