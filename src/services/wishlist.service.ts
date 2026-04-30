import Wishlist from "../models/wishlist.model";
import Product from "../models/product.model";
import Store from "../models/store.model";

class WishlistService {

  async getWishlist(userId: string) {
    return await Wishlist.findAll({
      where: { user_id: userId },

      attributes: [], 

      include: [
        {
          model: Product,
          as: "product",
          attributes: [
            "id",
            "name",
            "price",
          ],
          include: [
            {
              model: Store,
              as: "store",
              attributes: [
                "id",
                ["store_name", "store_name"],
                "logo",
              ],
            },
          ],
        },
      ],
    });
  }


  async addToWishlist(userId: string, productId: string) {

    const product = await Product.findByPk(productId);
    if (!product) {
      throw { statusCode: 404, message: "Product not found" };
    }

    const existing = await Wishlist.findOne({
      where: { user_id: userId, product_id: productId },
    });

    if (existing) {
      return { message: "Product is already in wishlist" };
    }

    await Wishlist.create({
      user_id: userId,
      product_id: productId,
    });

    return { message: "Product added to wishlist" };
  }

  async removeFromWishlist(userId: string, productId: string) {

    const deleted = await Wishlist.destroy({
      where: { user_id: userId, product_id: productId },
    });


    if (!deleted) {
      throw { statusCode: 404, message: "Item not in wishlist" };
    }

    return { message: "Product removed from wishlist" };
  }
}

export default WishlistService;