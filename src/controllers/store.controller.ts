import { FastifyRequest, FastifyReply } from "fastify";
import StoreService from "../services/store.service";
import cloudinary from "../config/cloudinary";

class StoreController {
  constructor(private storeService: StoreService) {}

  // CREATE STORE
  createStore = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const parts = req.parts();

      let body: any = {};
      let logoUrl = "";

      for await (const part of parts) {
        if (part.type === "file") {
          const buffer = await part.toBuffer();

          const result = await cloudinary.uploader.upload(
            `data:${part.mimetype};base64,${buffer.toString("base64")}`,
            { folder: "stores" }
          );

          if (part.fieldname === "logo") {
            logoUrl = result.secure_url;
          }
        } else {
          body[part.fieldname] = part.value;
        }
      }

      const store = await this.storeService.createStore({
        ...body,
        ...(logoUrl && { logo: logoUrl }), //  optional logo
        user_id: (req as any).user.id,
      });

      return reply.status(201).send({
        success: true,
        message: "Store created successfully ",
        data: store,
      });
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        message: err.message,
      });
    }
  };

  // GET ALL STORES
  getStores = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await this.storeService.getStores(req.query);

      return reply.send({
        success: true,
        message: "Stores fetched successfully",
        ...data,
      });
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        message: err.message,
      });
    }
  };

  // GET STORE BY ID
  getStoreById = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as any;

      const store = await this.storeService.getStoreById(id);

      return reply.send({
        success: true,
        message: "Store fetched successfully by ID",
        data: store,
      });
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({
        success: false,
        message: err.message,
      });
    }
  };

  // UPDATE STORE
  updateStore = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as any;

      const parts = req.parts();

      let body: any = {};
      let logoUrl = "";

      for await (const part of parts) {
        if (part.type === "file") {
          const buffer = await part.toBuffer();

          const result = await cloudinary.uploader.upload(
            `data:${part.mimetype};base64,${buffer.toString("base64")}`,
            { folder: "stores" }
          );

          if (part.fieldname === "logo") {
            logoUrl = result.secure_url;
          }
        } else {
          body[part.fieldname] = part.value;
        }
      }

      const updated = await this.storeService.updateStore(id, {
        ...body,
        ...(logoUrl && { logo: logoUrl }),
      });

      return reply.send({
        success: true,
        message: "Store updated successfully",
        data: updated,
      });
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({
        success: false,
        message: err.message,
      });
    }
  };

  // DELETE STORE
  deleteStore = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as any;

      const result = await this.storeService.deleteStore(id);

      return reply.send({
        success: true,
        message: result.message,
      });
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({
        success: false,
        message: err.message,
      });
    }
  };
}

export default StoreController;