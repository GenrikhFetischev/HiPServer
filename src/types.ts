export type MessageContent = {
  text: string;
};
export type Message = {
  from: string;
  to: string;
  timestamp: number;
  content: MessageContent;
};
