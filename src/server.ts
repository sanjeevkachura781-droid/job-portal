import { app } from "./app";
import { connectDatabase, sequelize } from "./config/database";
import { env } from "./config/env";
import "./config/associations";

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    await sequelize.sync();

    console.log("Database tables synchronized");

    app.listen(env.PORT, () => {
      console.log(`Server running at http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

void startServer();
