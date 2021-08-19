export type User = {
  name: string;
  networkAddress: string;
};

export type MessageContent = {
  text: string;
};
export type Message = {
  from: User;
  to: User;
  timestamp: number;
  content: MessageContent;
};
