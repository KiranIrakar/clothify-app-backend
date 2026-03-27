import dotenv from "dotenv";
dotenv.config(); //  MUST BE FIRST

import { app } from "./app";
import { sequelize } from "./src/config/db";

const start = async () => {
  try {
    console.log("DB USER:", process.env.DB_USER);
    console.log("DB PASS:", process.env.DB_PASSWORD);

    // DB connect
    await sequelize.sync();
    console.log(" Database connected");

    // Server start
    await app.listen({ port: Number(process.env.PORT) || 3000 });
    console.log("🚀 Server running on port", process.env.PORT || 3000);

  } catch (err) {
    console.error("❌ Error starting server:", err);
    process.exit(1);
  }
};

start();