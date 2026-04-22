import { FastifyInstance } from "fastify";
import StoreController from "../controllers/store.controller";
import StoreService from "../services/store.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import { TokenService } from "../middlewares/role.middleware";

export default async function storeRoutes(app: FastifyInstance) {

    const service = new StoreService();
    const storeController = new StoreController(service);

    // Public routes — no auth required
    app.get("/", storeController.getStores);
    app.get("/:id", storeController.getStoreById);

    // Protected routes — auth + role/permission check
    // Short codes: O = STORE_OWNER, ST = STORE_OWNER, A = ADMIN, SC = store:create
    app.post("/", {
        preHandler: [authMiddleware, TokenService.checkPermission(['O', 'A'], ['SC'])]
    }, storeController.createStore);
}