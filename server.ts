import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";
import sequelize from "./src/config/db";
import { logger } from "./src/utils/logger";
import { initModels } from "./src/plugins/modelInitializer-plugin";

const start = async () => {
  try {
    initModels();

    await sequelize.sync();
    logger.info("Database connected successfully");

    const port = Number(process.env.PORT) || 3000;

    // Server start
    await app.listen({
      port,
      host: "0.0.0.0",
    });

    app.log.info(`Server is running at http://localhost:${port}`);
  } catch (err) {
    logger.error("Error starting server", err);
    process.exit(1);
  }
};

start();