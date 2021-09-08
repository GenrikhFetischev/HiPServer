import { HttpRouteHandler } from "./httpRouter";

export const corsHandler: HttpRouteHandler = (req, res) => {
  setCorsHeaders(req, res);
  res.end();
};

export const setCorsHeaders: HttpRouteHandler = (_req, res) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.ALLOWED_ORIGIN || "null"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, token");
};
