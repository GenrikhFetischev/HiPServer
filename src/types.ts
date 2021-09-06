import exp from "constants";

export type MessageContent = {
  text: string;
};

export enum EventTypes {
  ReceiveConfirmation,
  FailSendNotification,
}

export enum MessageStatus {
  Sent,
  Received,
  FailedToSend,
}

export type Message = {
  from: string;
  to: string;
  messageId: number;
  timestamp: number;
  content: MessageContent;
  status: MessageStatus;
};

export type ReceiveConfirmation = {
  type: EventTypes.ReceiveConfirmation;
  messageId: number;
};

export type IncomingMessage = Message | ReceiveConfirmation;

export type FailSendNotification = {
  type: EventTypes.FailSendNotification;
  messageId: number;
};

export type PrivateApiMessage = IncomingMessage | FailSendNotification;

export type Contact = {
  name: string;
  port: number;
  ip: string;
};
