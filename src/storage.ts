import { Message } from "./types";

export const storeMessage = async (msg: Message) => {
  console.log(`Saving message ${JSON.stringify(msg)}`);
};
