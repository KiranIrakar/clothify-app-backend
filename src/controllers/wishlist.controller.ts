import { FastifyRequest, FastifyReply } from "fastify";
import WishlistService from "../services/wishlist.service";

class WishlistController {
  constructor(private wishlistService: WishlistService) { }

  // GET
  getWishlist = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (req as any).user;

      const data = await this.wishlistService.getWishlist(user.id);

      return reply.send({
        success: true,
        message: "Wishlist fetched successfully",
        data,
      });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Something went wrong",
      });
    }
  };

  // ADD
  addToWishlist = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (req as any).user;
      const { productId }: any = req.params;

      const result = await this.wishlistService.addToWishlist(
        user.id,
        productId
      );

      return reply.send({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Something went wrong",
      });
    }
  };

  // DELETE
  removeFromWishlist = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (req as any).user;
      const { productId }: any = req.params;

      const result = await this.wishlistService.removeFromWishlist(
        user.id,
        productId
      );

      return reply.send({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Something went wrong",
      });
    }
  };
}

export default WishlistController;