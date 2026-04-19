import Wishlist from "../models/wishlist.model";
import Product from "../models/product.model";
import Store from "../models/store.model";

class WishlistService {

  //  GET WISHLIST
  async getWishlist(userId: string) {

    const items = await Wishlist.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: "product",
          include: [
            {
              model: Store,
              as: "store",
              attributes: ["name", "lat", "lng"],
            },
          ],
        },
      ],
    });

    return items.map((item: any) => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      imageUrl: item.product.image_url,
      store: item.product.store
        ? {
            name: item.product.store.name,
            lat: item.product.store.lat,
            lng: item.product.store.lng,
          }
        : null,

    }));
  }

  //  ADD TO WISHLIST
  async addToWishlist(userId: string, productId: string) {

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

  //  REMOVE FROM WISHLIST
  async removeFromWishlist(userId: string, productId: string) {
    await Wishlist.destroy({
      where: { user_id: userId, product_id: productId },
    });

    return { message: "Product removed from wishlist" };
  }
}

export default WishlistService;