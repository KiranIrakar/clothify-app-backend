import { FastifyInstance } from "fastify";
import CartController from "../controllers/cart.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export default async function cartRoutes(app: FastifyInstance) {
  const controller = new CartController();

  app.post("/cart", { preHandler: [authMiddleware] }, controller.addToCart);
  app.get("/cart", { preHandler: [authMiddleware] }, controller.getCart);
  app.put("/cart/:itemId", { preHandler: [authMiddleware] }, controller.updateItem);
  app.delete("/cart/:itemId", { preHandler: [authMiddleware] }, controller.removeItem);
  app.delete("/cart", { preHandler: [authMiddleware] }, controller.clearCart);
}