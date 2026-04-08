import { FastifyInstance } from "fastify";
import controller from "../controllers/user-profile.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export default async function userProfileRoutes(fastify: FastifyInstance) {

  // fastify.addHook("preHandler", authMiddleware);

  // CRUD Routes
  fastify.post("/users", controller.createUser);
  fastify.get("/users", controller.getAllUsers);
  fastify.get("/users/:id", controller.getUserById);
  fastify.put("/users/:id", controller.updateUser);
  fastify.delete("/users/:id", controller.deleteUser);
}