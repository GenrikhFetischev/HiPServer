import { HttpRouteHandler } from "./httpRouter";
import { getContacts } from "../db";

export const getAllContact: HttpRouteHandler = async (req, res) => {
  const contacts = await getContacts();

  res.write(JSON.stringify(contacts.rows));
  res.writeHead(200, {
    "content-type": "application/json",
  });
  res.end();
};
