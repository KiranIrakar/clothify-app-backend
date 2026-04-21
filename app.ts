import Fastify from "fastify";
import dotenv from "dotenv";
import fastifyCors from "@fastify/cors";
import authRoutes from "./src/routes/auth.route";
import productRoutes from "./src/routes/product.route";
import sequelize from "./src/config/db"; 
import fastifyMultipart from "@fastify/multipart";
import userProfileRoutes from "./src/routes/user-profile.route";
import reviewRoutes from "./src/routes/reviews.route";
import wishlistRoutes from "./src/routes/wishlist.routes";
import storeRoutes from "./src/routes/store.route";
// import logger from "./src/config/logger";

dotenv.config();

export const app = Fastify({ 
  logger: {
    level: "debug",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,              
        translateTime: "SYS:HH:MM:ss", 
        ignore: "pid,hostname",       
        singleLine: false,          
      },
    },
  },
});
   app.register(fastifyCors, {
  origin: "*", // allow all origins so APK/mobile devices can connect
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
});

app.register(fastifyMultipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
});

// routes register
app.register(authRoutes, { prefix: "/auth" });
app.register(productRoutes, { prefix: "/products" });
app.register(userProfileRoutes, { prefix: "/user-profile" });
app.register(reviewRoutes, { prefix: "/reviews" });
app.register(wishlistRoutes, { prefix: "/wishlist" });
app.register(storeRoutes, { prefix: "/stores" });
  