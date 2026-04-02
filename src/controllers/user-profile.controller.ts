import { FastifyRequest, FastifyReply } from "fastify";
import userService from "../services/user-profile.service";
import {
  UserProfileCreationAttributes,
} from "../interface/user-profile.interface";

class UserProfileController {
  async create(
    req: FastifyRequest<{ Body: UserProfileCreationAttributes }>,
    reply: FastifyReply
  ) {
    try {
      const user = await userService.createUser(req.body);
      reply.send({ success: true, data: user });
    } catch (err: any) {
      reply.status(400).send({
        success: false,
        message: err.message || "Error creating user",
      });
    }
  }

  async getAll(req: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await userService.getAllUsers();
      reply.send({ success: true, data: users });
    } catch (err: any) {
      reply.status(500).send({
        success: false,
        message: err.message || "Error fetching users",
      });
    }
  }

  async getById(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: "User not found",
        });
      }

      reply.send({ success: true, data: user });
    } catch (err: any) {
      reply.status(500).send({
        success: false,
        message: err.message || "Error fetching user",
      });
    }
  }

  async update(
    req: FastifyRequest<{
      Params: { id: string };
      Body: UserProfileCreationAttributes;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = req.params;
      const user = await userService.updateUser(id, req.body);

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: "User not found",
        });
      }

      reply.send({ success: true, data: user });
    } catch (err: any) {
      reply.status(400).send({
        success: false,
        message: err.message || "Error updating user",
      });
    }
  }

  async delete(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = req.params;
      const deleted = await userService.deleteUser(id);

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          message: "User not found",
        });
      }

      reply.send({
        success: true,
        message: "User deleted",
      });
    } catch (err: any) {
      reply.status(500).send({
        success: false,
        message: err.message || "Error deleting user",
      });
    }
  }
}

export default new UserProfileController();