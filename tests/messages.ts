import { Message, MessageContent, User } from "../src/types";

export const generateMessage = (
  from?: Partial<User>,
  to?: Partial<User>,
  content?: Partial<MessageContent>,
  timestamp?: number
): Message => {
  const fromMock = {
    name: "user",
    networkAddress: "127.0.0.1:6666",
    ...from,
  };

  const toMock = {
    name: "user",
    networkAddress: "127.0.0.1:6666",
    ...from,
  };

  const contentMock = {
    text: "MEssage mock",
  };

  return {
    from: fromMock,
    to: toMock,
    content: contentMock,
    timestamp: timestamp ?? Date.now(),
  };
};

console.log(JSON.stringify(generateMessage()));
