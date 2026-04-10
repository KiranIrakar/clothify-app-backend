// models/product.model.ts

import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import {
  ProductAttributes,
  ProductCreationAttributes,
  Offer,
  Color,
  Size,
  Delivery,
  Review,
  Store,
} from "../interface/product.types";

class Product extends Model<ProductAttributes, ProductCreationAttributes> {
  declare id: string;
  declare name: string;
  declare price: number;
  declare brand: string | null;
  declare imageUrls: string[] | null;
  declare mrp: number | null;
  declare currency: string;
  declare rating: number | null;
  declare ratingCount: number | null;
  declare offers: Offer[] | null;
  declare colors: Color[] | null;
  declare sizes: Size[] | null;
  declare delivery: Delivery | null;
  declare topReview: Review | null;
  declare store: Store | null;

  get discountPercent(): number | null {
    if (this.mrp && this.mrp > this.price) {
      return Math.round(((this.mrp - this.price) / this.mrp) * 100);
    }
    return null;
  }

  get shareUrl(): string {
    return `/products/${this.id}`;
  }
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING,
    },
    imageUrls: {
      type: DataTypes.JSON,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    mrp: {
      type: DataTypes.FLOAT,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "INR",
    },
    rating: {
      type: DataTypes.FLOAT,
    },
    ratingCount: {
      type: DataTypes.INTEGER,
    },
    offers: {
      type: DataTypes.JSON,
    },
    colors: {
      type: DataTypes.JSON,
    },
    sizes: {
      type: DataTypes.JSON,
    },
    delivery: {
      type: DataTypes.JSON,
    },
    topReview: {
      type: DataTypes.JSON,
    },
    store: {
      type: DataTypes.JSON,
    },
  },
  {
    sequelize,
    tableName: "products",
    timestamps: true,
  }
);

export default Product;