import { HttpRouteHandler } from "./httpRouter";
import assert from "assert";
import { parseJsonPostBody } from "./utils";
import { Contact } from "../types";
import { createContact } from "../db";

export const createContactRouteMatcher = (path: string) => path === "/contacts/create"

export const createContactHandler: HttpRouteHandler = async (req, res) => {
  try {
    assert(
      req.headers["content-type"] === "application/json",
      "Content type should be application/json"
    );
    const contact = await parseJsonPostBody<Contact>(req);

    await createContact(contact);
    res.statusCode = 200;
    res.write("OK");
    res.end();
  } catch (e) {
    console.error(e);
    res.statusCode = 400;
    res.setHeader("content-type", "application/json");
    res.write(e.message);
    res.end();
  }
};
