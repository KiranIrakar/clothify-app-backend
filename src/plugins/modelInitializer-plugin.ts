import Product from "../models/product.model";
import ProductImage from "../models/product-images-model";
import ProductReview from "../models/product-review-model";
import ProductColor from "../models/product-colors-model";
import ProductSize from "../models/product-sizes-model";
import ProductOffer from "../models/product-offers-model";

export const initModels = () => {

  // PRODUCT → IMAGES
  Product.hasMany(ProductImage, {
    foreignKey: "product_id",
    as: "images",
    onDelete: "CASCADE",
  });

  ProductImage.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product",
  });


  // PRODUCT → REVIEWS
  Product.hasMany(ProductReview, {
    foreignKey: "product_id",
    as: "reviews",
    onDelete: "CASCADE",
  });

  ProductReview.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product",
  });


  // PRODUCT → COLORS
  Product.hasMany(ProductColor, {
    foreignKey: "product_id",
    as: "colors",
    onDelete: "CASCADE",
  });

  ProductColor.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product",
  });


  // PRODUCT → SIZES
  Product.hasMany(ProductSize, {
    foreignKey: "product_id",
    as: "sizes",
    onDelete: "CASCADE",
  });

  ProductSize.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product",
  });

  // PRODUCT → OFFERS
  Product.hasMany(ProductOffer, {
    foreignKey: "product_id",
    as: "offers",
    onDelete: "CASCADE",
  });

  ProductOffer.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product",
  });

};