import { FastifyInstance } from "fastify";
import AddressController from "../controllers/address.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export default async function addressRoutes(app: FastifyInstance) {
  const controller = new AddressController();

  app.post("/", { preHandler: [authMiddleware] }, controller.create);
  app.get("/", { preHandler: [authMiddleware] }, controller.getAll);
  app.get("/:id", { preHandler: [authMiddleware] }, controller.getById);
  app.put("/:id", { preHandler: [authMiddleware] }, controller.update);
  app.delete("/:id", { preHandler: [authMiddleware] }, controller.delete);
}