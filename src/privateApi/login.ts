import assert from "assert";
import { parseJsonPostBody } from "./utils";
import { generateJwtToken, getOriginPassHash, validatePassword } from "../auth";
import { HttpRouteHandler } from "./httpRouter";

export type LoginBody = {
  password: string;
};

export const loginHandler: HttpRouteHandler = async (req, res) => {
  try {
    assert(
      req.headers["content-type"] === "application/json",
      "Content type should be application/json"
    );
    const { password } = await parseJsonPostBody<LoginBody>(req);

    const originPassHash = getOriginPassHash();
    assert(originPassHash, "impossible condition");

    const isPassValid = validatePassword(password);

    if (!isPassValid) {
      res.statusCode = 401;
      res.write("Password is incorrect");
    } else {
      res.statusCode = 200;
      res.write(generateJwtToken(originPassHash));
    }

    res.end();
  } catch (e) {
    console.error(e);
    res.statusCode = 400;
    res.write(e.message);
    res.end();
  }
};
