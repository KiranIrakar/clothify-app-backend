import Fastify from "fastify";
import dotenv from "dotenv";
import fastifyCors from "@fastify/cors";
import authRoutes from "./src/routes/auth.route";
import productRoutes from "./src/routes/product.route";
import sequelize from "./src/config/db"; 
import userProfileRoutes from "./src/routes/user-profile.route";
dotenv.config();

export const app = Fastify();
   app.register(fastifyCors, {
  origin: "http://localhost:4200",
  methods: ["GET", "POST", "PUT", "DELETE"],
});
// routes register
app.register(authRoutes, { prefix: "/auth" });
app.register(productRoutes, { prefix: "/products" });
app.register(userProfileRoutes, { prefix: "/userprofile" });