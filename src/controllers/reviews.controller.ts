import { FastifyRequest, FastifyReply } from "fastify";
import ReviewService from "../services/reviews.service";

export default class ReviewController {
  private reviewService: ReviewService;

  constructor(reviewService: ReviewService) {
    this.reviewService = reviewService;
  }

  // ADD REVIEW
  addReview = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as any;
      const body: any = req.body;

      const review = await this.reviewService.addReview(id, body);

      return reply.send({
        success: true,
        message: "Review added successfully",
        data: review,
      });
    } catch (e: any) {
      return reply.status(e.statusCode || 500).send({
        success: false,
        message: e.message,
      });
    }
  };

  // GET ALL REVIEWS
  getReviews = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any;

    const data = await this.reviewService.getReviews(id);

    return reply.send({
      success: true,
      message: "Reviews fetched successfully",
      data,
    });
  };

  // TOP REVIEW
  getTopReview = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any;

    const data = await this.reviewService.getTopReview(id);

    return reply.send({
      success: true,
      message: "Top review fetched successfully",
      data,
    });
  };

  // UPDATE REVIEW
  updateReview = async (req: FastifyRequest, reply: FastifyReply) => {
    const { reviewId } = req.params as any;

    const review = await this.reviewService.updateReview(
      reviewId,
      req.body
    );

    return reply.send({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  };

  // DELETE REVIEW
  deleteReview = async (req: FastifyRequest, reply: FastifyReply) => {
    const { reviewId } = req.params as any;

    await this.reviewService.deleteReview(reviewId);

    return reply.send({
      success: true,
      message: "Review deleted successfully",
    });
  };
}