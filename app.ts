import Fastify from "fastify";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.route";

dotenv.config();

export const app = Fastify();

// routes register
app.register(authRoutes, { prefix: "/auth" });