import Store from "../models/store.model";
import { Op } from "sequelize";

class StoreService {

async createStore(data: any) {
  const cleanName = data.name.trim();

  const existing = await Store.findOne({
    where: {
      name: {
        [Op.iLike]: cleanName, // case-insensitive
      },
    },
  });

  if (existing) {
    throw {
      statusCode: 409,
      message: `Store already exists: ${cleanName}`,
    };
  }

  return await Store.create({
    ...data,
    name: cleanName,
  });
}

  async getStores() {
    return await Store.findAll({
      order: [["createdAt", "DESC"]],
    });
  }

  async getStoreById(id: string) {
    const store = await Store.findByPk(id);

    if (!store) {
      throw { statusCode: 404, message: "Store not found" };
    }

    return store;
  }
}

export default StoreService;