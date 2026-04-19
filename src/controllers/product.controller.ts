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
        price: Number(fields.price?.value),
        mrp: Number(fields.mrp?.value),

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
        ...result,
      });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message,
      });
    }
  };


  //   try {
  //     const { id }: any = req.params;

  //     if (!id || !isUUID(id)) {
  //       return reply.status(400).send({
  //         success: false,
  //         message: "Invalid UUID",
  //       });
  //     }

  //     let buffer: Buffer | null = null;

  //     const fields: any = {};

  //     for await (const part of (req as any).parts()) {
  //       if (part.file) {
  //         buffer = await part.toBuffer();
  //       } else {
  //         fields[part.fieldname] = part.value;
  //       }
  //     }

  //     const payload = {
  //       name: fields.name,
  //       price: fields.price,
  //       stock: fields.stock,
  //       description: fields.description,
  //       category: fields.category,
  //       fileBuffer: buffer,
  //     };

  //     const product = await this.productService.updateProduct(id, payload);

  //     reply.send({
  //       success: true,
  //       message: "Product updated successfully",
  //       data: product,
  //     });
  //   } catch (error: any) {
  //     reply.status(error.statusCode || 500).send({
  //       success: false,
  //       message: error.message || "Update failed",
  //     });
  //   }
  // };

  // deleteProduct = async (req: FastifyRequest, reply: FastifyReply) => {
  //   try {
  //     const { id }: any = req.params;

  //     if (!id || !isUUID(id)) {
  //       return reply.status(400).send({
  //         success: false,
  //         message: "Invalid UUID",
  //       });
  //     }

  //     const result = await this.productService.deleteProduct(id);

  //     reply.send({ success: true, ...result });
  //   } catch (error: any) {
  //     reply.status(error.statusCode || 500).send({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // };

 updateProduct = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id }: any = req.params;

    let file = null;

    // ✅ file optional handling
    try {
      file = await (req as any).file();
    } catch {
      file = null;
    }

    // ✅ fields from multipart OR JSON
    const fields = file?.fields || (req.body as any) || {};

    const buffer = file ? await file.toBuffer() : null;

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