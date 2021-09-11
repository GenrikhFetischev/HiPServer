import crypto from "crypto";
import {sign, verify} from "jsonwebtoken";
import {getOriginPassHash, salt} from "./constants";
import assert from "assert";

export const hashPassword = (pass: string, salt: string): string => {
  const hmac = crypto.createHmac("sha256", salt);
  return hmac.update(pass).digest("hex");
};

export const generateJwtToken = (passHash: string) => {
  return sign({p2p: true}, passHash);
};

export const validatePassword = (password: string) => {
  const originPassHash = getOriginPassHash();

  return (
    hashPassword(password, salt) === originPassHash && originPassHash !== null
  );
};

export const checkJwt = (jwt: string) => {
  const originPassHash = getOriginPassHash();
  assert(originPassHash, "impossible condition");
  return typeof verify(jwt, originPassHash) !== "string";
};
