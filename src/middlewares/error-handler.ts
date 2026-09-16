import { ErrorRequestHandler } from "express";
import { UniqueConstraintError, ValidationError } from "sequelize";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  let statusCode = error instanceof AppError ? error.statusCode : 500;
  let message = error instanceof Error ? error.message : "Internal server error";
  if (error instanceof UniqueConstraintError) { statusCode = 409; message = "A record with that value already exists"; }
  if (error instanceof ValidationError || error instanceof ZodError) { statusCode = 400; message = error.message; }
  res.status(statusCode).json({ success: false, message });
};
