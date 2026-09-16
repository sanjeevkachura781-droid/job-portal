import bcrypt from "bcryptjs";
import { connectDatabase, sequelize } from "../src/config/database";
import { User, UserRole } from "../src/modules/auth/auth.model";
import "../src/config/env";

const run = async (): Promise<void> => {
  await connectDatabase();
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before seeding an admin");
  const hash = await bcrypt.hash(password, 12);
  await User.findOrCreate({ where: { email }, defaults: { name: "System Administrator", email, password: hash, role: UserRole.ADMIN } });
  await sequelize.close();
};
void run();
