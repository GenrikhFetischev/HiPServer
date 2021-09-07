import { config } from "dotenv";

import "./devReload";
import { PublicApi } from "./publicApi";
// import { inputPassword } from "./initPrompt";
import { createPrivateApi } from "./privateApi";
import { setPassword } from "./auth";

(async () => {
  config();
  if (!process.env.PASSWORD) {
    // await inputPassword();
    console.log("password is set");
  } else {
    console.log("Got password from config file");
    setPassword(process.env.PASSWORD);
  }

  const { privateWsApi } = createPrivateApi();
  const publicApi = new PublicApi();

  privateWsApi.messageStream.subscribe(publicApi.sendMessage);
  publicApi.messageStream.subscribe(privateWsApi.sendMessage);
  publicApi.receiveConfirmationStream.subscribe(privateWsApi.sendMessage);
  publicApi.sendingFailStream.subscribe(privateWsApi.sendMessage);
})();
