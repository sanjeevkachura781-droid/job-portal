import { RequestHandler } from "express";
import { UserRole } from "../modules/auth/auth.model";
import { AppError } from "../utils/app-error";

export const authorize = (...roles: UserRole[]): RequestHandler => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    next(new AppError("You do not have permission to perform this action", 403));
    return;
  }
  next();
};
