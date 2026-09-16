import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../utils/app-error";
import { User, UserRole } from "./auth.model";
import { LoginInput, RegisterInput } from "./auth.validation";

const removePassword = (user: User) => {
  const data = user.toJSON() as {
    id: number;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
  };

  const { password: _password, ...safeUser } = data;
  return safeUser;
};

const createToken = (user: User): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    env.JWT_SECRET,
    options
  );
};

export const register = async (input: RegisterInput) => {
  const existingUser = await User.findOne({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: hashedPassword,
    role: input.role as UserRole,
  });

  return {
    user: removePassword(user),
    token: createToken(user),
  };
};

export const login = async (input: LoginInput) => {
  const user = await User.findOne({
    where: { email: input.email },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) throw new AppError("User account is inactive", 403);

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.password
  );

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  return {
    user: removePassword(user),
    token: createToken(user),
  };
};

export const updateProfile = async (userId: number, input: { name?: string; email?: string }) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError("User not found", 404);
  if (input.email && input.email !== user.email) {
    const existing = await User.findOne({ where: { email: input.email } });
    if (existing) throw new AppError("Email is already registered", 409);
  }
  await user.update({ name: input.name ?? user.name, email: input.email ?? user.email });
  return removePassword(user);
};

export const getProfile = async (userId: number) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return removePassword(user);
};
