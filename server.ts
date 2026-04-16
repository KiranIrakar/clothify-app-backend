import dotenv from "dotenv";
dotenv.config();
// import "./src/utils/whatsapp";
// import "./src/utils/whatsapp";
import { app } from "./app";
import sequelize from "./src/config/db";
import { logger } from "./src/utils/logger";

const start = async () => {
  try {
    // DB connect
    await sequelize.sync();
    logger.info("Database connected");
     app.log.info("Database connected successfully");

   const port = Number(process.env.PORT) || 3000;
   
    // Server start
    await app.listen({
      port: Number(process.env.PORT) || 3000,
      host: "0.0.0.0",
    });
    logger.info("Server running", { port: Number(process.env.PORT) || 3000 });
  } catch (err) {
    logger.error("Error starting server", err);
    process.exit(1);
  }
};

start();