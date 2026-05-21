import { FastifyInstance } from "fastify";
import StoreController from '../controllers/store.controller';
import StoreService from "../services/store.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import { TokenService } from "../middlewares/role.middleware";

export default async function storeRoutes(app: FastifyInstance) {
  const service = new StoreService();
  const storeController = new StoreController(service);

  app.addHook("preHandler", authMiddleware);

  app.post("/", { preHandler: TokenService.checkPermission(["O", "A"], ["SC"]) }, storeController.createStore);
  app.get("/", storeController.getStores);
  app.get("/:id", storeController.getStoreById);
  app.delete("/:id", { preHandler: TokenService.checkPermission(["A"], ["D"]) }, storeController.deleteStore);
  app.put("/:id", { preHandler: TokenService.checkPermission(["O", "A"], ["SC"]), }, storeController.updateStore);
  app.get("/user", { preHandler: TokenService.checkPermission(["O", "A"], ["SR"]), }, storeController.getStoreByUserId);
}