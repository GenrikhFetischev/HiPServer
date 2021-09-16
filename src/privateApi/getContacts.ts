import { HttpRouteHandler } from "./httpRouter";
import { getContacts } from "../db";

export const getAllContactRouteMatcher = (path: string) =>  path === "/contacts";

export const getAllContact: HttpRouteHandler = async (req, res) => {
  const contacts = await getContacts();

  res.statusCode = 200;
  res.setHeader("content-type", "application/json");
  res.write(JSON.stringify(contacts.rows));
  res.end();
};
