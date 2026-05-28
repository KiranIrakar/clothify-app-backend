import { FastifyRequest, FastifyReply } from "fastify";
import StoreService from "../services/store.service";
import cloudinary from "../config/cloudinary";

class StoreController {
  constructor(private storeService: StoreService) { }

  createStore = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const parts = req.parts();

      let body: any = {};
      let logoUrl = "";
      let bannerUrl = "";

      for await (const part of parts) {
        if (part.type === "file") {
          const buffer = await part.toBuffer();

          const result = await cloudinary.uploader.upload(
            `data:${part.mimetype};base64,${buffer.toString("base64")}`,
            { folder: "stores" }
          );

          // logo image
          if (part.fieldname.trim().toLowerCase() === "logo") {
            logoUrl = result.secure_url;
          }

          if (part.fieldname.trim().toLowerCase() === "banner") {
            bannerUrl = result.secure_url;
          }

        } else {

          body[part.fieldname] = part.value;

        }
      }

      const result = await this.storeService.createStore({
        ...body,

        ...(logoUrl && {
          logo: logoUrl,
        }),

        ...(bannerUrl && {
          banner: bannerUrl,
        }),

        user_id: (req as any).user.id,
      });

      return reply.status(201).send({
        success: true,
        message: "Store created successfully",
        data: result.store,

        // send token only when generated
        ...(result.token && {
          token: result.token,
        }),
      });

    } catch (err: any) {

      return reply.status(err.statusCode || 500).send({
        success: false,
        message: err.message || "Internal Server Error",
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
      let bannerUrl = "";

      for await (const part of parts) {
        if (part.type === "file") {
          const buffer = await part.toBuffer();

          const result = await cloudinary.uploader.upload(
            `data:${part.mimetype};base64,${buffer.toString("base64")}`,
            { folder: "stores" }
          );

          // logo upload
          if (part.fieldname === "logo") {
            logoUrl = result.secure_url;
          }

          // banner upload
          if (part.fieldname === "banner") {
            bannerUrl = result.secure_url;
          }

        } else {

          body[part.fieldname] = part.value;

        }
      }

      const updated =
        await this.storeService.updateStore(id, {
          ...body,

          ...(logoUrl && {
            logo: logoUrl,
          }),

          ...(bannerUrl && {
            banner: bannerUrl,
          }),
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

  getStoreByUserId = async (req: any, reply: FastifyReply) => {
    try {
      const userId = req.user.id;

      const stores = await this.storeService.getStoreByUserId(userId);


      if (!stores || stores.length === 0) {
        return reply.status(404).send({
          success: false,
          message: "No stores found for this user",
        });
      }

      // success response
      return reply.send({
        success: true,
        message: "User stores fetched successfully",
        data: stores,
      });

    } catch (error: any) {

      return reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Failed to fetch user stores",
      });

    }
  };

  getStoreAverageRating = async (req: any, reply: FastifyReply) => {
    try {

      const { storeId } = req.params;

      const result =
        await this.storeService.getStoreAverageRating(storeId);

      return reply.send({
        success: true,
        message: "Store average rating fetched successfully",
        data: result,
      });

    } catch (error: any) {

      return reply.status(error.statusCode || 500).send({
        success: false,
        message:
          error.message ||
          "Failed to fetch average rating",
      });

    }
  };
}

export default StoreController;