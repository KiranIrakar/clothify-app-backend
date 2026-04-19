import { FastifyInstance } from "fastify";
import StoreController from "../controllers/store.controller";
import StoreService from "../services/store.service";
import { authMiddleware } from "../middlewares/auth.middleware";

export default async function storeRoutes(app: FastifyInstance) {

    const service = new StoreService();
    const storeController = new StoreController(service);

    app.post("/", { preHandler: authMiddleware }, storeController.createStore);
    app.get("/", storeController.getStores);
    app.get("/:id", storeController.getStoreById);
}