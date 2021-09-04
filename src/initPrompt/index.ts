import readline from "readline";
import { setPassword, validatePassword } from "../auth";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.on("SIGINT", () => process.exit(130));

const askQuestion = (question: string) =>
  new Promise<string>((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });

export const inputPassword = () =>
  new Promise(async (resolve) => {
    let loopCondition = true;

    while (loopCondition) {
      const password = await askQuestion("Set password for clients: \n");
      setPassword(password);

      const confirmation = await askQuestion("Confirm password: \n");

      const isPasswordSame = validatePassword(confirmation);

      if (isPasswordSame) {
        loopCondition = false;
        console.log("Password confirmed");
        resolve(true);
        rl.close();
      } else {
        console.log("Confirmation is incorrect, let's do it again");
      }
    }
  });
