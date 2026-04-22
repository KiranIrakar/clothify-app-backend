import { FastifyRequest, FastifyReply } from "fastify";
import CartService from "../services/carts.service";

class CartController {
  private cartService = new CartService();

  addToCart = async (req: any, reply: FastifyReply) => {
    const userId = req.user.id;
    const result = await this.cartService.addToCart(userId, req.body);
    reply.send(result);
  };

  getCart = async (req: any, reply: FastifyReply) => {
    const userId = req.user.id;
    const cart = await this.cartService.getCart(userId);
    reply.send(cart);
  };

  updateItem = async (req: any, reply: FastifyReply) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const result = await this.cartService.updateItem(itemId, quantity);
    reply.send(result);
  };

  removeItem = async (req: any, reply: FastifyReply) => {
    const { itemId } = req.params;
    const result = await this.cartService.removeItem(itemId);
    reply.send(result);
  };

  clearCart = async (req: any, reply: FastifyReply) => {
    const userId = req.user.id;
    const result = await this.cartService.clearCart(userId);
    reply.send(result);
  };
}

export default CartController;