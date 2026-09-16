import { RequestHandler } from "express";
import { z } from "zod";

export const validate = (schema: z.ZodType): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!result.success) {
    next(new Error(result.error.issues.map((issue) => issue.message).join(", ")));
    return;
  }
  if (result.data && typeof result.data === "object" && "body" in result.data) {
    req.body = result.data.body;
  }
  next();
};
