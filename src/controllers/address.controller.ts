import { FastifyReply, FastifyRequest } from "fastify";
import AddressService from "../services/address.service";

class AddressController {
  private service = new AddressService();

  create = async (req: any, reply: FastifyReply) => {
    try {
      const userId = req.user.id;

      const address = await this.service.createAddress(userId, req.body);

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

  getAll = async (req: any, reply: FastifyReply) => {
    try {
      const userId = req.user.id;

      const data = await this.service.getAddresses(userId);

      reply.send({
        success: true,
        data,
      });

    } catch (error: any) {
      reply.status(500).send({ success: false, message: error.message });
    }
  };

  getById = async (req: any, reply: FastifyReply) => {
    try {
      const { id } = req.params;

      const data = await this.service.getAddressById(id);

      reply.send({ success: true, data });

    } catch (error: any) {
      reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message,
      });
    }
  };

  update = async (req: any, reply: FastifyReply) => {
    try {
      const { id } = req.params;

      const data = await this.service.updateAddress(id, req.body);

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

  delete = async (req: any, reply: FastifyReply) => {
    try {
      const { id } = req.params;

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