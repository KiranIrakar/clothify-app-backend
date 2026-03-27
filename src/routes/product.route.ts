import { FastifyInstance } from "fastify";
import ProductController from "../controllers/product.controller";
import ProductService from "../services/product.service";
import { authMiddleware } from "../middlewares/auth.middleware";

export default async function productRoutes(app: FastifyInstance) {

  const productService = new ProductService();
  const productController = new ProductController(productService);

  app.addHook("preHandler", authMiddleware);

  app.post("/", productController.createProduct);
  app.get("/", productController.getAllProduct);
  app.get("/product/:id", productController.getProductById);
  app.put("/product/:id", productController.updateProduct);
  app.delete("/product/:id", productController.deleteProduct);
}