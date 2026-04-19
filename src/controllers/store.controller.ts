import { FastifyRequest, FastifyReply } from "fastify";
import StoreService from "../services/store.service";

class StoreController {
  constructor(private storeService: StoreService) {}

  createStore = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const store = await this.storeService.createStore(req.body);

      return reply.send({
        success: true,
        message: "Store created successfully",
        data: store,
      });
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        message: err.message,
      });
    }
  };

  getStores = async (_: FastifyRequest, reply: FastifyReply) => {
    const data = await this.storeService.getStores();

    return reply.send({
      success: true,
      message: "Stores retrieved successfully",
      data,
    });
  };

  getStoreById = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id }: any = req.params;

      const store = await this.storeService.getStoreById(id);

      return reply.send({
        success: true,
        message: "Store retrieved successfully",
        data: store,
      });
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({
        success: false,
        message: err.message,
      });
    }
  };
}

export default StoreController;