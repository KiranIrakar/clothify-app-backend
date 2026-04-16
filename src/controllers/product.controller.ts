import { FastifyRequest, FastifyReply } from "fastify";
import type { Multipart } from "@fastify/multipart";
import ProductService from "../services/product.service";
import { validate as isUUID } from "uuid";
import cloudinary from "../config/cloudinary";

class ProductController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  createProduct = async (req: FastifyRequest, reply: FastifyReply) => {
    const { name, description, price, stock, category }: any = req.body;

      // ✅ Validations
      if (!name || name.length < 2) {
        throw { statusCode: 400, message: "Name must be at least 2 chars" };
      }

      if (price == null || isNaN(price) || Number(price) <= 0) {
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

      req.log.info({ product }, "✅ Product created successfully");

      reply.send({
        message: "Product created successfully",
        success: true,
        data: product,
      });
    } catch (error: any) {
      req.log.error(error, "❌ Create product error");

      reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  };

  getAllProduct = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      req.log.info("📦 Fetching all products");

      const query: any = req.query;
      const products = await this.productService.getProducts(query);

      reply.send({ success: true, ...products });
    } catch (error: any) {
      req.log.error(error, "❌ Get all products error");
      reply.status(500).send({ message: "Failed to fetch products" });
    }
  };

  getProductById = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id }: any = req.params;

      if (!id || !isUUID(id)) {
        throw { statusCode: 400, message: "Invalid UUID" };
      }

      const product = await this.productService.getProductById(id);

      reply.send({ success: true, data: product });
    } catch (error: any) {
      req.log.error(error, "❌ Get product by ID error");
      reply.status(error.statusCode || 500).send({
        message: error.message || "Failed to fetch product",
      });
    }
  };

  updateProduct = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
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
    } catch (error: any) {
      req.log.error(error, "❌ Update product error");
      reply.status(error.statusCode || 500).send({
        message: error.message || "Failed to update product",
      });
    }
  };

  deleteProduct = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id }: any = req.params;

      if (!id || !isUUID(id)) {
        throw { statusCode: 400, message: "Invalid UUID" };
      }

      const result = await this.productService.deleteProduct(id);

      reply.send({ success: true, ...result });
    } catch (error: any) {
      req.log.error(error, "❌ Delete product error");
      reply.status(error.statusCode || 500).send({
        message: error.message || "Failed to delete product",
      });
    }
  };
}

export default ProductController;