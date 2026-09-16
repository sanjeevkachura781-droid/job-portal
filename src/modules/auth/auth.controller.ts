import { RequestHandler } from "express";
import * as authService from "./auth.service";
import { loginSchema, registerSchema } from "./auth.validation";
import { AppError } from "../../utils/app-error";

export const register: RequestHandler = async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);

    res.status(201).json({
      message: "Registration successful",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);

    res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const me: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new AppError("Authentication required", 401);
    res.json({ success: true, user: await authService.getProfile(req.user.id) });
  } catch (error) { next(error); }
};

export const updateProfile: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new AppError("Authentication required", 401);
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json({ success: true, user });
  } catch (error) { next(error); }
};
