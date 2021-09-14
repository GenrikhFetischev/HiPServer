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

  const privatePort = Number(process.env.PRIVATE_PORT) || 5555;
  const publicPort = Number(process.env.PUBLIC_PORT) || 7777;

  const { privateWsApi } = createPrivateApi(privatePort);
  const publicApi = new PublicApi(publicPort);

  privateWsApi.messageStream.subscribe(publicApi.sendMessage);
  publicApi.messageStream.subscribe(privateWsApi.sendMessage);
  publicApi.receiveConfirmationStream.subscribe(privateWsApi.sendMessage);
  publicApi.sendingFailStream.subscribe(privateWsApi.sendMessage);

  console.log(`Started on ports
    PRIVATE: ${privatePort},
    PUBLIC: ${publicPort}
  
  `);
})();
