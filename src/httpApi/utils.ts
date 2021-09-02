import { IncomingMessage } from "http";

export const parseJsonPostBody = <T>(req: IncomingMessage): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    let bodyString = "";

    req.on("data", (data) => {
      bodyString += String(data);
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(bodyString));
      } catch (e) {
        console.error("Can't parse request body as json");
        console.error(bodyString);
        reject(e);
      }
    });

    req.on("error", reject);
  });
