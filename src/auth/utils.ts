import crypto from "crypto";
import jwt from "jsonwebtoken";

export const hashPassword = (pass: string, salt: string): string => {
  const hmac = crypto.createHmac("sha256", salt);
  return hmac.update(pass).digest("hex");
};

export const generateJwtToken = (passHash: string) => {
  return jwt.sign({ p2p: true }, passHash);
};
