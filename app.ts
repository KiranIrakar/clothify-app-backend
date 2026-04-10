import Fastify from "fastify";
import dotenv from "dotenv";
import fastifyCors from "@fastify/cors";
import authRoutes from "./src/routes/auth.route";
import productRoutes from "./src/routes/product.route";
import sequelize from "./src/config/db";
import userProfileRoutes from "./src/routes/user-profile.route";
import { logger } from "./src/utils/logger";

dotenv.config();

export const app = Fastify({ logger: false });

app.addHook("onRequest", (request, reply, done) => {
  logger.info("Incoming request", {
    method: request.method,
    url: request.url,
    query: request.query,
    params: request.params,
  });
  done();
});

app.addHook("onResponse", (request, reply, done) => {
  logger.info("Response completed", {
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
  });
  done();
});

app.setErrorHandler((error, request, reply) => {
  logger.error("Unhandled request error", {
    method: request.method,
    url: request.url,
    statusCode: (error as any).statusCode || 500,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  const statusCode = (error as any).statusCode || 500;
  reply.status(statusCode).send({
    statusCode,
    error: statusCode === 500 ? "Internal Server Error" : (error as any).name || "Error",
    message: error instanceof Error ? error.message : String(error),
  });
});

app.register(fastifyCors, {
  origin: (origin, callback) => {
    callback(null, true); // Allow all origins
  },
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Include OPTIONS for preflight
  allowedHeaders: ["Authorization", "Content-Type", "Accept"], // Allow common headers
});

// routes register
app.register(authRoutes, { prefix: "/auth" });
app.register(productRoutes, { prefix: "/products" });
app.register(userProfileRoutes, { prefix: "/userprofile" });