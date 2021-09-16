import { HttpRouteHandler } from "./httpRouter";
import { getMessagesForContact } from "../db";
import { Message } from "../types";

const matchChatId = (path: string): string | null => {
  const match = path.match(/messages\?chatId=(.+)/);

  return match ? match[1] : match;
};

export const getMessagesPathMatcher = (path: string) => {
  return Boolean(matchChatId(path));
};

export const getMessagesByContact: HttpRouteHandler = async (req, res) => {
  const chatId = matchChatId(req.url as string);

  if (!chatId) {
    res.statusCode = 404;
    res.write(`Chat with host: ${chatId} isn't exist`);
    res.end();
    return;
  }

  const { rows } = await getMessagesForContact(chatId);

  const messages: Message[] = rows.map((m) => ({
    ...m,
    content: {
      text: m.text,
    },
  }));

  res.statusCode = 200;
  res.setHeader("content-type", "application/json");
  res.write(JSON.stringify(messages));
  res.end();
};
