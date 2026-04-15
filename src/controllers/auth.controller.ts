import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/auth.service";
import { logger } from "../utils/logger";

export class AuthController {
  private authService = new AuthService();

  signup = async (req: FastifyRequest, reply: FastifyReply) => {
    const { email, name, password, phone }: any = req.body;

    const result = await this.authService.signup({
      email,
      name,
      password,
      phone
    });

    reply.send(result);
  };

  verifyOtp = async (req: FastifyRequest, reply: FastifyReply) => {
    const { email, phone, otp }: any = req.body;

    const result = await this.authService.verifyOtp({ email, phone, otp });
    reply.send(result);
  };

  resendOtp = async (req: FastifyRequest, reply: FastifyReply) => {
    const { email, phone }: any = req.body;

    const result = await this.authService.resendOtp({ email, phone });
    reply.send(result);
  };

  resetPassword = async (req: FastifyRequest, reply: FastifyReply) => {
    const { email, newPassword }: any = req.body;

    const result = await this.authService.resetPassword({
      email,
      newPassword
    });

    reply.send(result);
  };

  generateOtp = async (req: FastifyRequest, reply: FastifyReply) => {
  const { email, phone }: any = req.body;

  const result = await this.authService.generateOtp({
    email,
    phone
  });

  reply.send(result);
};

  login = async (req: FastifyRequest, reply: FastifyReply) => {
    const { email, password }: any = req.body;

    const result = await this.authService.login({
      email,
      password
    });

    reply.send(result);
  };

  changePhoneRequest = async (req: FastifyRequest, reply: FastifyReply) => {
    logger.debug("changePhoneRequest body", req.body);
    const { phone }: any = req.body;
    logger.info("Change phone request received", { phone });
    const userId = (req as any).user.id;

    const result = await this.authService.changePhoneRequest({
      userId,
      phone,
    });

    reply.send(result);
  };
 
 
verifyChangePhone = async (req: FastifyRequest, reply: FastifyReply) => {
  const { otp }: any = req.body;
  const userId = (req as any).user.id;
 
  const result = await this.authService.verifyChangePhone({
    userId,
    otp
  });
 
  reply.send(result);
};
 

}