import Store from "../models/store.model";
import { Op } from "sequelize";
import User from "../models/user-profile.model";
import { getPagination } from "../utils/pagination";
import { USER_ROLE_ENUM } from "../interface/user-profile.interface";
import { generateToken } from "../utils/jwt";
import Product from "../models/product.model";
import ProductReview from "../models/product-review-model";

class StoreService {
  // CREATE STORE
  async createStore(data: any) {

    const cleanName = data.store_name?.trim();

    const existing = await Store.findOne({
      where: {
        store_name: {
          [Op.iLike]: cleanName,
        },
      },
    });

    if (existing) {
      throw {
        statusCode: 409,
        message: `Store already exists with name: ${cleanName}`,
      };
    }

    // create store
    const store = await Store.create({
      ...data,
      store_name: cleanName,
    });

    // find user
    const user = await User.findByPk(data.user_id);

    let token: string | null = null;

    // change role only first time
    if (user && user.role === USER_ROLE_ENUM.ROLE_USER) {

      await user.update({
        role: USER_ROLE_ENUM.STORE_OWNER,
      });

      // generate new token only after role change
      token = generateToken({
        ...user.toJSON(),
        role: USER_ROLE_ENUM.STORE_OWNER,
      });
    }

    return {
      store,
      token,
    };
  }

  // GET ALL STORES
  async getStores(query: any) {
    const { page, limit, offset } = getPagination(query);

    const { rows, count } = await Store.findAndCountAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "fullName"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return {
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  // GET STORE BY ID
  async getStoreById(id: string) {
    const store = await Store.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "fullName",
            "email",
            "mobileNumber",
            "role",
          ],
        },
      ],
    });

    if (!store) {
      throw {
        statusCode: 404,
        message: "Store not found",
      };
    }

    return store;
  }

  // UPDATE STORE
  async updateStore(id: string, data: any) {
    const store = await Store.findByPk(id);

    if (!store) {
      throw {
        statusCode: 404,
        message: "Store not found",
      };
    }

    await store.update(data);

    return store;
  }

  // DELETE STORE
  async deleteStore(id: string) {
    const store = await Store.findByPk(id);

    if (!store) {
      throw {
        statusCode: 404,
        message: "Store not found",
      };
    }

    await store.destroy();

    return { message: "Store deleted successfully" };
  }

  async getStoreByUserId(userId: string) {

    // validate user id
    if (!userId) {
      throw {
        statusCode: 400,
        message: "User id is required",
      };
    }

    const stores = await Store.findAll({
      where: {
        user_id: userId,
      },
      order: [["created_at", "DESC"]],
    });

    // if no stores found
    if (!stores || stores.length === 0) {
      throw {
        statusCode: 404,
        message: "No stores found for this user",
      };
    }

    return stores;
  }

  async getStoreAverageRating(storeId: string) {

    const store: any = await Store.findByPk(storeId);

    if (!store) {
      throw {
        statusCode: 404,
        message: "Store not found",
      };
    }

    const products: any = await Product.findAll({
      where: {
        store_id: storeId,
      },

      attributes: ["id"],
    });

    const productIds = products.map(
      (p: any) => p.id
    );

    // if no products
    if (!productIds.length) {
      return {
        store: {
          id: store.id,
          name: store.store_name,
          category: store.store_type,
          logo: store.logo,
          banner: store.banner,
          address: store.address,
        },

        average_rating: 0,
      
      };
    }

    const reviews: any = await ProductReview.findAll({
      where: {
        product_id: productIds,
      },

      attributes: ["rating"],
    });

    const totalReviews = reviews.length;

    // if no reviews
    if (!reviews.length) {
      return {
        store: {
          id: store.id,
          name: store.store_name,
          category: store.store_type,
          logo: store.logo,
          banner: store.banner,
          address: store.address,
        },

        average_rating: 0,
        total_reviews: 0,
      
      };
    }

    const totalRating = reviews.reduce(
      (sum: number, r: any) => sum + r.rating,
      0
    );

    const average =
      totalRating / totalReviews;

    return {
      store: {
        id: store.id,
        name: store.store_name,
        category: store.store_type,
        logo: store.logo,
        banner: store.banner,
        address: store.address,
      },

      average_rating: Number(
        average.toFixed(1)
      ),

      total_reviews: totalReviews,
    
    };
  }
}

export default StoreService;