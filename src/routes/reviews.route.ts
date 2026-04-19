import { FastifyInstance } from "fastify";
import ReviewController from "../controllers/reviews.controller";
import ReviewService from "../services/reviews.service";
import { authMiddleware } from "../middlewares/auth.middleware";

export default async function reviewRoutes(app: FastifyInstance) {

  const reviewService = new ReviewService();
  const reviewController = new ReviewController(reviewService);


  // PUBLIC ROUTES (NO AUTH)
  app.get("/product/:id/reviews", reviewController.getReviews);
  app.get("/product/:id/top-review", reviewController.getTopReview);

  // PROTECTED ROUTES (AUTH REQUIRED)
  app.post( "/product/:id/reviews",{ preHandler: authMiddleware }, reviewController.addReview);
  app.put( "/reviews/:reviewId",{ preHandler: authMiddleware },reviewController.updateReview);
  app.delete("/reviews/:reviewId",{ preHandler: authMiddleware },reviewController.deleteReview);
}