import { UserRole } from "../modules/auth/auth.model";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: UserRole };
      params: Record<string, string>;
    }
  }
}

export {};
