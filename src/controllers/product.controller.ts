import { FastifyRequest, FastifyReply } from "fastify";
import ProductService from "../services/product.service";
import { validate as isUUID } from "uuid";

class ProductController {
  constructor(private productService: ProductService) { }

  createProduct = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const file = await (req as any).file();

      const fields = file?.fields || {};
      const buffer = file ? await file.toBuffer() : null;

      const payload = {
        name: fields.name?.value,
        brand: fields.brand?.value,

        price: fields.price?.value
          ? Number(fields.price.value)
          : undefined,

        mrp: fields.mrp?.value
          ? Number(fields.mrp.value)
          : undefined,

        store_id: fields.store_id?.value,

        // ✅ ADD THIS
        category: fields.category?.value,

        // ✅ ADD THIS
        stock: fields.stock?.value
          ? Number(fields.stock.value)
          : undefined,

        colors: fields.colors?.value
          ? JSON.parse(fields.colors.value)
          : [],

        sizes: fields.sizes?.value
          ? JSON.parse(fields.sizes.value)
          : [],

        offers: fields.offers?.value
          ? JSON.parse(fields.offers.value)
          : [],

        fileBuffer: buffer,
      };
      const product = await this.productService.createFullProduct(payload);

      return reply.send({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message,
      });
    }
  };


  getProductById = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id }: any = req.params;

      const product = await this.productService.getProductById(id);

      return reply.send({
        success: true,
        message: "Product fetched successfully",
        data: product,
      });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Error fetching product",
      });
    }
  };


  getAllProduct = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const query: any = req.query;
      const products = await this.productService.getAllProducts(query);

      reply.send({
        success: true,
        message: "Products fetched successfully",
        data: products
      });
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        message: "Failed to fetch products",
      });
    }
  };

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

      return reply.send({
        success: true,
        message: result.message,
      });

    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Failed to delete product",
      });
    }
  };

  updateProduct = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id }: any = req.params;

      // ✅ UUID validation
      if (!id || !isUUID(id)) {
        return reply.status(400).send({
          success: false,
          message: "Invalid UUID",
        });
      }

      let file = null;

      // ✅ Handle optional file (multipart)
      try {
        file = await (req as any).file();
      } catch {
        file = null;
      }

      // ✅ Extract fields (multipart OR JSON)
      const fields = file?.fields || (req.body as any) || {};

      const buffer = file ? await file.toBuffer() : null;

      // ✅ Call service
      const product = await this.productService.updateFullProduct(id, {
        name: fields.name?.value || fields.name,
        brand: fields.brand?.value || fields.brand,

        price:
          fields.price !== undefined
            ? Number(fields.price.value || fields.price)
            : undefined,

        mrp:
          fields.mrp !== undefined
            ? Number(fields.mrp.value || fields.mrp)
            : undefined,

        category:
          fields.category !== undefined
            ? fields.category.value || fields.category
            : undefined,

        stock:
          fields.stock !== undefined
            ? Number(fields.stock.value || fields.stock)
            : undefined,

        colors:
          fields.colors !== undefined
            ? JSON.parse(fields.colors.value || fields.colors)
            : undefined,

        sizes:
          fields.sizes !== undefined
            ? JSON.parse(fields.sizes.value || fields.sizes)
            : undefined,

        offers:
          fields.offers !== undefined
            ? JSON.parse(fields.offers.value || fields.offers)
            : undefined,

        fileBuffer: buffer,
      });

      // ✅ Success response
      return reply.send({
        success: true,
        message: "Product updated successfully",
        data: product,
      });

    } catch (error: any) {
      console.error(error);

      return reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Update failed",
      });
    }
  };

}

export default ProductController;