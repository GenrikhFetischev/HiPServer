import assert from "assert";
import { RouteHandler } from "./router";
import { parseJsonPostBody } from "./utils";
import {
  generateJwtToken,
  getOriginPassHash,
  hashPassword,
  salt,
} from "../auth";

export type LoginBody = {
  password: string;
};

export const loginHandler: RouteHandler = async (req, res) => {
  try {
    assert(
      req.headers["content-type"] === "application/json",
      "Content type should be application/json"
    );
    const { password } = await parseJsonPostBody<LoginBody>(req);

    const originPassHash = getOriginPassHash();

    assert(originPassHash, "impossible condition");

    const isPassValid = hashPassword(password, salt) === originPassHash;

    if (!isPassValid) {
      res.writeHead(401);
      res.write("Password is incorrect");
      res.end();
    } else {
      res.writeHead(200);
      res.write(generateJwtToken(originPassHash));
      res.end();
    }

    res.end();
  } catch (e) {
    console.error(e);
    res.writeHead(400);
    res.write(e.message);
    res.end();
  }
};
