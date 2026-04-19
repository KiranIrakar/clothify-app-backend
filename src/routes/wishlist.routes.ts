import { FastifyInstance } from "fastify";
import WishlistController from '../controllers/wishlist.controller';
import WishlistService from "../services/wishlist.service";
import { authMiddleware } from "../middlewares/auth.middleware";

export default async function wishlistRoutes(app: FastifyInstance) {

  const service = new WishlistService();
  const wishlistController = new WishlistController(service);

  app.addHook("preHandler", authMiddleware);

  app.get("/", wishlistController.getWishlist);
  app.post("/:productId", wishlistController.addToWishlist);
  app.delete("/:productId", wishlistController.removeFromWishlist);
}