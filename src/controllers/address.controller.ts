import { FastifyReply, FastifyRequest } from "fastify";
import AddressService from "../services/address.service";
import { AddressAttributes } from "../interface/address.interface";

class AddressController {
  private service = new AddressService();

  create = async (
    req: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const userId = (req as any).user.id;
      const body = req.body as AddressAttributes;
      const address = await this.service.createAddress(userId, body);

      reply.send({
        success: true,
        message: "Address created successfully",
        data: address,
      });

    } catch (error: any) {
      reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message,
      });
    }
  };


  getAll = async (
    req: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const userId = (req as any).user.id;

      const data = await this.service.getAddresses(userId);

      reply.send({
        success: true,
        data,
      });

    } catch (error: any) {
      reply.status(500).send({
        success: false,
        message: error.message,
      });
    }
  };

  
  getById = async (
    req: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
     const { id } = req.params as { id: string }; // 👈 cast

      const data = await this.service.getAddressById(id);

      reply.send({ success: true, data });

    } catch (error: any) {
      reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message,
      });
    }
  };


  update = async (
    req: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
    const { id } = req.params as { id: string }; // 👈 cast
      const body = req.body as Partial<AddressAttributes>; // 👈 cast
      const data = await this.service.updateAddress(id, body);

      reply.send({
        success: true,
        message: "Address updated successfully",
        data,
      });

    } catch (error: any) {
      reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message,
      });
    }
  };

  delete = async (
    req: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
    const { id } = req.params as { id: string }; // 👈 cast

      const result = await this.service.deleteAddress(id);

      reply.send({
        success: true,
        ...result,
      });

    } catch (error: any) {
      reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message,
      });
    }
  };
}

export default AddressController;