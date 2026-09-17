import { describe, expect, it } from "vitest";
import { envSchema } from "../src/config/env";

describe("env schema", () => {
  it("accepts admin credentials when provided", () => {
    const parsed = envSchema.parse({
      ADMIN_EMAIL: "admin@example.com",
      ADMIN_PASSWORD: "super-secret-password",
    });

    expect(parsed.ADMIN_EMAIL).toBe("admin@example.com");
    expect(parsed.ADMIN_PASSWORD).toBe("super-secret-password");
  });
});
