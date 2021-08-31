export type MessageContent = {
  text: string;
};
export type Message = {
  from: string;
  to: string;
  timestamp: number;
  content: MessageContent;
};

export type ReceiveConfirmation = {
  received: number;
};

export type IncomingMessage = Message | ReceiveConfirmation;

export type Contact = {
  name: string;
  port: number;
  ip: string;
};
