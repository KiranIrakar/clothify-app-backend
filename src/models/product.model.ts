import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Product extends Model {
  public id!: string;
  public name!: string;
  public brand!: string;
  public imageUrls!: string[];
  public price!: number;
  public mrp!: number;
  public discountPercent!: number;
  public currency!: string;
  public rating!: number;
  public ratingCount!: number;

  public offers!: object[];
  public colors!: object[];
  public sizes!: object[];
  public delivery!: object;
  public topReview!: object;
  public store!: object;

  public isWishlisted!: boolean;
  public shareUrl!: string;
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

    discountPercent: {
      type: DataTypes.INTEGER,
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

    isWishlisted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    shareUrl: {
      type: DataTypes.STRING,
    }
  },
  {
    sequelize,
    tableName: "products",
    timestamps: true,
  }
);

export default Product;