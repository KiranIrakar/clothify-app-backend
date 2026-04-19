import Store from "../models/store.model";

class StoreService {

  async createStore(data: any) {
    return await Store.create(data);
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