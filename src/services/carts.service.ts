import Cart from "../models/carts.model";
import CartItem from "../models/cartItems.model";
import Product from "../models/product.model";

class CartService {

    async addToCart(userId: string, data: any) {
        const { product_id, quantity, selected_size, selected_color } = data;

        const product: any = await Product.findByPk(product_id);
        if (!product) throw { statusCode: 404, message: "Product not found" };

        if (quantity > product.stock) {
            throw { statusCode: 400, message: "Quantity exceeds stock" };
        }

        let cart: any = await Cart.findOne({ where: { user_id: userId } });

        if (!cart) {
            cart = await Cart.create({ user_id: userId });
        }

        let item: any = await CartItem.findOne({
            where: {
                cart_id: cart.id,
                product_id,
                selected_size,
                selected_color
            }
        });

        if (item) {
            item.quantity += quantity;
            item.total_price = item.quantity * item.price_at_time;
            await item.save();
        } else {
            item = await CartItem.create({
                cart_id: cart.id,
                product_id,
                quantity,
                price_at_time: product.price,
                total_price: product.price * quantity,
                selected_size,
                selected_color
            });
        }

        await this.recalculateCart(cart.id);

        return { message: "Item added to cart" };
    }

    async getCart(userId: string) {
        const cart = await Cart.findOne({
            where: { user_id: userId },
            include: [
                {
                    model: CartItem,
                    as: "items"
                }
            ]
        });
        return cart;
    }

    async updateItem(itemId: string, quantity: number) {
        const item: any = await CartItem.findByPk(itemId);
        if (!item) throw { statusCode: 404, message: "Item not found" };

        const product: any = await Product.findByPk(item.product_id);

        if (quantity > product.stock) {
            throw { statusCode: 400, message: "Stock exceeded" };
        }

        item.quantity = quantity;
        item.total_price = quantity * item.price_at_time;

        await item.save();

        await this.recalculateCart(item.cart_id);

        return { message: "Cart updated" };
    }

    async removeItem(itemId: string) {
        const item: any = await CartItem.findByPk(itemId);
        if (!item) throw { statusCode: 404, message: "Item not found" };

        const cartId = item.cart_id;

        await item.destroy();

        await this.recalculateCart(cartId);

        return { message: "Item removed" };
    }

    async clearCart(userId: string) {
        const cart: any = await Cart.findOne({ where: { user_id: userId } });

        if (!cart) return;

        await CartItem.destroy({ where: { cart_id: cart.id } });

        await cart.update({
            total_amount: 0,
            total_items: 0
        });

        return { message: "Cart cleared" };
    }

    async recalculateCart(cartId: string) {
        const items: any = await CartItem.findAll({ where: { cart_id: cartId } });

        const total_amount = items.reduce((sum: number, i: any) => sum + i.total_price, 0);
        const total_items = items.reduce((sum: number, i: any) => sum + i.quantity, 0);

        await Cart.update(
            { total_amount, total_items },
            { where: { id: cartId } }
        );
    }
}

export default CartService;