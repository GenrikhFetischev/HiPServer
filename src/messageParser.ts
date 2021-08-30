import { Message } from "./types";
import { Data } from "ws";

export const parseMessage = (msg: Data): Message | undefined => {
  debugger
  try {
    return JSON.parse(String(msg)) as Message;
  } catch (e) {
    console.error(`Can't parse message: ${JSON.stringify(msg)}`);
    console.error(e);
  }
};
