import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User } from "../modules/auth/auth.model";
import { AppError } from "../utils/app-error";

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new AppError("Authentication required", 401);
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET) as { id: number; role: User["role"] };
    const user = await User.findByPk(payload.id, { attributes: ["id", "role", "isActive"] });
    if (!user || !user.isActive) throw new AppError("User account is inactive", 403);
    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) next(new AppError("Invalid or expired token", 401));
    else next(error);
  }
};
