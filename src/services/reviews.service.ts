import Product from "../models/product.model";
import ProductReview from "../models/product-review-model";

export default class ReviewService {

  // ADD REVIEW
  async addReview(productId: string, data: any) {
    const { userName, rating, comment } = data;

    if (!rating || rating < 1 || rating > 5) {
      throw { statusCode: 400, message: "Invalid rating" };
    }

    const product = await Product.findByPk(productId);
    if (!product) throw { statusCode: 404, message: "Product not found" };

    const review = await ProductReview.create({
      product_id: productId,
      user_name: userName,
      user_initials: userName?.slice(0, 2).toUpperCase(),
      rating,
      comment,
    });

    // ⭐ UPDATE PRODUCT RATING
    const totalRating =
      product.rating * product.rating_count + rating;

    const newCount = product.rating_count + 1;

    await product.update({
      rating: totalRating / newCount,
      rating_count: newCount,
    });

    return review;
  }

  // GET ALL REVIEWS
  async getReviews(productId: string) {
    return await ProductReview.findAll({
      where: { product_id: productId },
      order: [["createdAt", "DESC"]],
    });
  }

  // TOP REVIEW
  async getTopReview(productId: string) {
    return await ProductReview.findOne({
      where: { product_id: productId },
      order: [["rating", "DESC"]],
    });
  }

  // UPDATE REVIEW
  async updateReview(reviewId: string, data: any) {
    const review = await ProductReview.findByPk(reviewId);
    if (!review) throw { statusCode: 404, message: "Not found" };

    await review.update({
      rating: data.rating ?? review.rating,
      comment: data.comment ?? review.comment,
    });

    return review;
  }

  // DELETE REVIEW
  async deleteReview(reviewId: string) {
    const review = await ProductReview.findByPk(reviewId);
    if (!review) throw { statusCode: 404, message: "Review not found" };

    const product = await Product.findByPk(review.product_id);

    // UPDATE PRODUCT RATING AFTER DELETE
    const totalRating =
      product!.rating * product!.rating_count - review.rating;

    const newCount = product!.rating_count - 1;

    await product!.update({
      rating: newCount > 0 ? totalRating / newCount : 0,
      rating_count: newCount,
    });

    await review.destroy();
  }
}