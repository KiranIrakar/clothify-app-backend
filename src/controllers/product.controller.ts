import { FastifyRequest, FastifyReply } from "fastify";
import ProductService from "../services/product.service";
import { validate as isUUID } from "uuid";

class ProductController {
  constructor(private productService: ProductService) { }

  // ✅ CREATE (MULTIPART ONLY)
  createProduct = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const file = await (req as any).file();

      if (!file) {
        return reply.status(400).send({
          success: false,
          message: "Image file is required",
        });
      }

      const { name, price, stock, description, category }: any = file.fields;

      const buffer = await file.toBuffer();

      const product = await this.productService.createProduct({
        name: name.value,
        price: Number(price.value),
        stock: Number(stock?.value || 0),
        description: description?.value,
        category: category?.value,
        fileBuffer: buffer,
      });

      reply.send({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error: any) {
      reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Error creating product",
      });
    }
  };

  // ✅ GET ALL
  getAllProduct = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const query: any = req.query;
      const products = await this.productService.getProducts(query);

      reply.send({
        success: true,
        message: "Products fetched successfully",
        ...products,
      });
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        message: "Failed to fetch products",
      });
    }
  };

  // ✅ GET BY ID
  getProductById = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id }: any = req.params;

      if (!id || !isUUID(id)) {
        return reply.status(400).send({
          success: false,
          message: "Invalid UUID",
        });
      }

      const product = await this.productService.getProductById(id);

      reply.send({ success: true, data: product });
    } catch (error: any) {
      reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message,
      });
    }
  };

 updateProduct = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id }: any = req.params;

    if (!id || !isUUID(id)) {
      return reply.status(400).send({
        success: false,
        message: "Invalid UUID",
      });
    }

    let file: any = null;
    let buffer: Buffer | null = null;
    let fields: any = {};

    try {
      file = await (req as any).file();

      if (file) {
        buffer = await file.toBuffer();
        fields = file.fields || {};
      }
    } catch (err) {
      // no file sent → totally OK
    }

    const payload = {
      name: fields?.name?.value,
      price: fields?.price?.value,
      stock: fields?.stock?.value,
      description: fields?.description?.value,
      category: fields?.category?.value,
      fileBuffer: buffer, // ✅ optional image
    };

    const product = await this.productService.updateProduct(id, payload);

    reply.send({ success: true, data: product });
  } catch (error: any) {
    reply.status(error.statusCode || 500).send({
      success: false,
      message: error.message,
    });
  }
};

  // ✅ DELETE
  deleteProduct = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id }: any = req.params;

      if (!id || !isUUID(id)) {
        return reply.status(400).send({
          success: false,
          message: "Invalid UUID",
        });
      }

      const result = await this.productService.deleteProduct(id);

      reply.send({ success: true, ...result });
    } catch (error: any) {
      reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message,
      });
    }
  };
}

export default ProductController;