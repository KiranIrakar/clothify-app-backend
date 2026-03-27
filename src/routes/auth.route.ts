import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export default async function authRoutes(app: FastifyInstance) {

  const authController = new AuthController(); 

  app.post(
    "/signup",
    { preHandler: [authMiddleware] }, 
    authController.signup
  );

  app.post("/verify-otp", authController.verifyOtp);

  app.post("/resend-otp", authController.resendOtp);

  app.post("/reset-password", authController.resetPassword);
}