export type MessageContent = {
  text: string;
};

export enum EventTypes {
  ReceiveConfirmation,
  FailSendNotification,
  Message,
}

export enum MessageStatus {
  Sent,
  Received,
  FailedToSend,
}

export type Message = {
  type: EventTypes.Message;
  from: string;
  to: string;
  messageId: string;
  timestamp: number;
  content: MessageContent;
  status: MessageStatus;
};

export type ReceiveConfirmation = {
  type: EventTypes.ReceiveConfirmation;
  messageId: string;
  chatId: string;
};

export type IncomingMessage = Message | ReceiveConfirmation;

export type FailSendNotification = {
  type: EventTypes.FailSendNotification;
  messageId: string;
  chatId: string;
};

export type PrivateApiMessage = IncomingMessage | FailSendNotification;

export type Contact = {
  name: string;
  port: number;
  ip: string;
  socket: string;
};
