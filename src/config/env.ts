import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().positive().default(5000),

  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().positive().default(3306),
  DB_NAME: z.string().default("job_portal"),
  DB_USER: z.string().default("root"),
  DB_PASSWORD: z.string().default(""),

  JWT_SECRET: z
    .string()
    .min(16)
    .default("development_secret_change_me"),

  JWT_EXPIRES_IN: z.string().default("1d"),
});

export const env = envSchema.parse(process.env);
