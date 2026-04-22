import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/role.middleware";
import { PERMISSIONS } from "../config/permissions";

export default async function authRoutes(app: FastifyInstance) {
  const authController = new AuthController();

  app.post("/signup", authController.signup);
  app.post("/verify-otp", authController.verifyOtp);
  app.post("/resend-otp", authController.resendOtp);
  app.post("/reset-password", authController.resetPassword);
  app.post("/generate-otp", authController.generateOtp);
  app.post("/login", authController.login);

  app.register(async function protectedAuthRoutes(protectedApp) {
    protectedApp.addHook("preHandler", authMiddleware);

    protectedApp.post("/changephone", authController.changePhoneRequest);
    protectedApp.post("/verifychangephone", authController.verifyChangePhone);

    // ✅ SUPERADMIN only — assign a role to any user
    protectedApp.post(
      "/assign-role",
      { preHandler: requirePermission(PERMISSIONS.USER_MANAGE) },
      authController.assignRole
    );
  });
}
