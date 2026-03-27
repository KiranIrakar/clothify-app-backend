import { FastifyRequest, FastifyReply } from "fastify";
import ProductService from "../services/product.service";
import { validate as isUUID } from "uuid";

class ProductController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  createProduct = async (req: FastifyRequest, reply: FastifyReply) => {
    const { name, description, price, stock, category }: any = req.body;

    if (!name || name.length < 2) {
      throw { statusCode: 400, message: "Name must be at least 2 chars" };
    }

    if (price == null || isNaN(price) || price <= 0) {
      throw { statusCode: 400, message: "Invalid price" };
    }

    if (stock == null || stock < 0) {
      throw { statusCode: 400, message: "Invalid stock" };
    }

    const product = await this.productService.createProduct({
      name,
      description,
      price,
      stock,
      category,
    });

    reply.send({ success: true, data: product });
  };

  getAllProduct = async (req: FastifyRequest, reply: FastifyReply) => {
    const query: any = req.query;

    const products = await this.productService.getProducts(query);

    reply.send({ success: true, ...products });
  };

  getProductById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id }: any = req.params;

    if (!id || !isUUID(id)) {
      throw { statusCode: 400, message: "Invalid UUID" };
    }

    const product = await this.productService.getProductById(id);

    reply.send({ success: true, data: product });
  };

  updateProduct = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id }: any = req.params;
    const body: any = req.body;

    if (!id || !isUUID(id)) {
      throw { statusCode: 400, message: "Invalid UUID" };
    }

    if (body.price && (isNaN(body.price) || body.price <= 0)) {
      throw { statusCode: 400, message: "Invalid price" };
    }

    const product = await this.productService.updateProduct(id, body);

    reply.send({ success: true, data: product });
  };

  deleteProduct = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id }: any = req.params;

    if (!id || !isUUID(id)) {
      throw { statusCode: 400, message: "Invalid UUID" };
    }

    const result = await this.productService.deleteProduct(id);

    reply.send({ success: true, ...result });
  };
}

export default ProductController;