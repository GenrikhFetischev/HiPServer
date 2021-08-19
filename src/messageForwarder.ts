import fetch from "node-fetch";
import { Message } from "./types";

export type MessageForwarderResult = {
  sent: boolean;
};

export const messageForwarder = async (
  msg: Message
): Promise<MessageForwarderResult> => {
  console.log(`Forwarding message to: ${msg.to.networkAddress}`);

  const result = await fetch(`http://${msg.to.networkAddress}`, {
    method: "POST",
    body: JSON.stringify(msg),
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log(result);

  return {
    sent: true,
  };
};
