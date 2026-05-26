import { FastifyInstance } from "fastify";
import ReviewController from "../controllers/reviews.controller";
import ReviewService from "../services/reviews.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import { TokenService } from "../middlewares/role.middleware";

export default async function reviewRoutes(app: FastifyInstance) {

  const reviewService = new ReviewService();
  const reviewController = new ReviewController(reviewService);


  app.get("/product/:id/reviews", reviewController.getReviews);
  app.get("/product/:id/top-review", reviewController.getTopReview);
  app.post("/product/:id/reviews", { preHandler: [authMiddleware, TokenService.checkPermission(["U"], ["RC"])] }, reviewController.addReview);
  app.put("/reviews/:reviewId", { preHandler: [authMiddleware, TokenService.checkPermission(["U"], ["RU"])] }, reviewController.updateReview);
  app.delete("/reviews/:reviewId", { preHandler: [authMiddleware, TokenService.checkPermission(["U", "A"], ["RD"])] }, reviewController.deleteReview);
}