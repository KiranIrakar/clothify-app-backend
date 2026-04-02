import dotenv from "dotenv";
dotenv.config(); 
import "./src/utils/whatsapp"; 
import { app } from "./app";
import sequelize from "./src/config/db";
const start = async () => {
  try {
    // DB connect
    await sequelize.sync();
    console.log(" Database connected");

    // Server start
await app.listen({
  port: Number(process.env.PORT) || 3000, 
  host: "0.0.0.0", 
});    
console.log("🚀 Server running on port", process.env.PORT || 3000);

  } catch (err) {
    console.error("❌ Error starting server:", err);
    process.exit(1);
  }
};

start();