import { FastifyRequest, FastifyReply } from "fastify";
import CartService from "../services/carts.service";

class CartController {
  private cartService = new CartService();

  addToCart = async (req: any, reply: FastifyReply) => {
    try {
      const userId = req.user.id;
      const result = await this.cartService.addToCart(userId, req.body);

      reply.send({
        success: true,
        message: "Item added to cart",
        data: result
      });
    } catch (error: any) {
      reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Failed to add item to cart"
      });
    }
  };

  getCart = async (req: any, reply: FastifyReply) => {
    try {
      const userId = req.user.id;
      const cart = await this.cartService.getCart(userId);

      reply.send({
        success: true,
        message: "Cart fetched successfully",
        data: cart
      });
    } catch (error: any) {
      reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Failed to fetch cart"
      });
    }
  };

  updateItem = async (req: any, reply: FastifyReply) => {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;

      const result = await this.cartService.updateItem(itemId, quantity);

      reply.send({
        success: true,
        message: "Cart updated successfully",
        data: result
      });
    } catch (error: any) {
      reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Failed to update cart item"
      });
    }
  };

  removeItem = async (req: any, reply: FastifyReply) => {
    try {
      const { itemId } = req.params;

      const result = await this.cartService.removeItem(itemId);

      reply.send({
        success: true,
        message: "Item removed from cart",
        data: result
      });
    } catch (error: any) {
      reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Failed to remove item"
      });
    }
  };

  clearCart = async (req: any, reply: FastifyReply) => {
    try {
      const userId = req.user.id;

      const result = await this.cartService.clearCart(userId);

      reply.send({
        success: true,
        message: "Cart cleared successfully",
        data: result
      });
    } catch (error: any) {
      reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Failed to clear cart"
      });
    }
  };

  getAllCarts = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const carts = await this.cartService.getAllCarts((req as any).query);

      reply.send({
        success: true,
        message: "All carts fetched successfully",
        data: carts
      });
    } catch (error: any) {
      reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Failed to fetch carts"
      });
    }
  };
}

export default CartController;