import { FastifyInstance } from "fastify";
import controller from "../controllers/user-profile.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export default async function userProfileRoutes(fastify: FastifyInstance) {

  fastify.addHook("preHandler", authMiddleware);

  // CRUD Routes
  fastify.post("/users", controller.create);
  fastify.get("/users", controller.getAll);
  fastify.get("/users/:id", controller.getById);
  fastify.put("/users/:id", controller.update);
  fastify.delete("/users/:id", controller.delete);
}