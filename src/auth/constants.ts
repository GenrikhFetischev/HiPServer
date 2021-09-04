import crypto from "crypto";
import { hashPassword } from "./utils";

export const salt = crypto.randomBytes(128).toString("base64");

let originPassHash: string | null = null;

export const setPassword = (pass: string) => {
  originPassHash = hashPassword(pass, salt);
};

export const getOriginPassHash = () => originPassHash;
