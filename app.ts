import Fastify from "fastify";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.route";
import productRoutes from "./src/routes/product.route";
import { sequelize } from "./src/config/db";
dotenv.config();

export const app = Fastify();

// routes register
app.register(authRoutes, { prefix: "/auth" });
app.register(productRoutes, { prefix: "/products" });