import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class ProductReview extends Model {
  public id!: string;
  public product_id!: string;
  public user_name!: string;
  public user_initials!: string;
  public rating!: number;
  public comment!: string;
}

ProductReview.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    user_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    user_initials: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "product_reviews",
    timestamps: true,
  }
);

export default ProductReview;