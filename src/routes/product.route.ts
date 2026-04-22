import { FastifyInstance } from "fastify";
import ProductController from "../controllers/product.controller";
import ProductService from "../services/product.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import { TokenService } from "../middlewares/role.middleware";

export default async function productRoutes(app: FastifyInstance) {

  const productService = new ProductService();
  const productController = new ProductController(productService);

  // 🔐 All product routes require authentication
  app.addHook("preHandler", authMiddleware);

  // Public (authenticated) — any logged-in user can read
  app.get("/",            productController.getAllProduct);
  app.get("/product/:id", productController.getProductById);
  app.post("/", {
    preHandler: TokenService.checkPermission(['O', 'A'], ['C'])
  }, productController.createProduct);

  app.put("/product/:id", {
    preHandler: TokenService.checkPermission(['O', 'A'], ['U'])
  }, productController.updateProduct);

  app.delete("/product/:id", {
    preHandler: TokenService.checkPermission(['A'], ['D'])
  }, productController.deleteProduct);
}