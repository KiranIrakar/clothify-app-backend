import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export default async function authRoutes(fastify: FastifyInstance) {

  const authController = new AuthController();

  fastify.post(
    "/signup",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["email", "name", "password"],
          properties: {
            email: { type: "string", format: "email" },
            name: { type: "string", minLength: 1 },
            password: { type: "string", minLength: 6 },
            phone: { type: "string", pattern: "^\\+91[6-9][0-9]{9}$" }
          }
        }
      }
    },
    authController.signup
  );

  fastify.post(
    "/verify-otp",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["otp"],
          properties: {
            email: { type: "string", format: "email" },
            phone: { type: "string", pattern: "^\\+91[6-9][0-9]{9}$" },
            otp: { type: "string", minLength: 4 }
          },
          oneOf: [{ required: ["email"] }, { required: ["phone"] }]
        }
      }
    },
    authController.verifyOtp
  );

  fastify.post(
    "/resend-otp",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          properties: {
            email: { type: "string", format: "email" },
            phone: { type: "string", pattern: "^\\+91[6-9][0-9]{9}$" }
          },
          oneOf: [{ required: ["email"] }, { required: ["phone"] }]
        }
      }
    },
    authController.resendOtp
  );

  fastify.post(
    "/reset-password",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["email", "newPassword"],
          properties: {
            email: { type: "string", format: "email" },
            newPassword: { type: "string", minLength: 6 }
          }
        }
      }
    },
    authController.resetPassword
  );

  fastify.post(
    "/generate-otp",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          properties: {
            email: { type: "string", format: "email" },
            phone: { type: "string", pattern: "^\\+91[6-9][0-9]{9}$" }
          },
          oneOf: [{ required: ["email"] }, { required: ["phone"] }]
        }
      }
    },
    authController.generateOtp
  );

  fastify.post(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 }
          }
        }
      }
    },
    authController.login
  );

  fastify.post(
    "/changephone",
    {
      preHandler: [authMiddleware],
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["phone"],
          properties: {
            phone: { type: "string", pattern: "^\\+91[6-9][0-9]{9}$" }
          }
        }
      }
    },
    authController.changePhoneRequest
  );

  fastify.post(
    "/verifychangephone",
    {
      preHandler: [authMiddleware],
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["otp"],
          properties: {
            otp: { type: "string", minLength: 4 }
          }
        }
      }
    },
    authController.verifyChangePhone
  );
 
}