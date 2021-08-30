export type MessageContent = {
  text: string;
};
export type Message = {
  from: string;
  to: string;
  timestamp: number;
  content: MessageContent;
};

export type Contact = {
  name: string;
  port: number;
  ip: string;
};
