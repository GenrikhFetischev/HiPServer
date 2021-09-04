import "./devReload";
import { PublicApi } from "./publicApi";

import { inputPassword } from "./initPrompt";
import { createPrivateApi } from "./privateApi";

(async () => {
  await inputPassword();

  console.log("password is set");
  const { privateWsApi } = createPrivateApi();
  const publicApi = new PublicApi();

  privateWsApi.messageStream.subscribe(publicApi.sendMessage);
  publicApi.messageStream.subscribe(privateWsApi.sendMessage);
  publicApi.receiveConfirmationStream.subscribe(privateWsApi.sendMessage);
})();
