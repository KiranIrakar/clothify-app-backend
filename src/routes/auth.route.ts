import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export default async function authRoutes(fastify: FastifyInstance) {

  const authController = new AuthController(); 

  fastify.post(
    "/signup",
    { preHandler: [authMiddleware] }, 
    authController.signup
  );

  fastify.post("/verify-otp", authController.verifyOtp);

  fastify.post("/resend-otp", authController.resendOtp);

  fastify.post("/reset-password", authController.resetPassword);

  fastify.post("/generate-otp", authController.generateOtp);
}