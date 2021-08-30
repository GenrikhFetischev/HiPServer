import { ChatApi } from "./chatApi";
import { PublicApi } from "./publicApi";
import { Message } from "./types";

type Middleware = (msg: Message) => Message;

export class Conductor {
  private chatApi: ChatApi;
  private publicApi: PublicApi;

  private chatApiMiddlewares: Middleware[] = [];
  private publicApiMiddlewares: Middleware[] = [];

  constructor(chatApi: ChatApi, publicApi: PublicApi) {
    this.chatApi = chatApi;
    this.publicApi = publicApi;

    this.chatApi.messageStream.subscribe(this.handleChatMessage);
    this.publicApi.messageStream.subscribe(this.handleIncomingMessage);
  }

  private handleChatMessage = async (msg: Message) => {
    for (let middleware of this.chatApiMiddlewares) {
      await middleware(msg);
    }
    await this.publicApi.sendMessage(msg);
  };

  private handleIncomingMessage = async (msg: Message) => {
    for (let middleware of this.publicApiMiddlewares) {
      await middleware(msg);
    }
    this.chatApi.sendMessage(msg);
  };

  public setChatApiMiddleware = (middleware: Middleware) => {
    this.chatApiMiddlewares.push(middleware);
  };

  public setPublicApiMiddleware = (middleware: Middleware) => {
    this.publicApiMiddlewares.push(middleware);
  };
}
