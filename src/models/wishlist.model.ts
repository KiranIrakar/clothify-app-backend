import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import Product from "./product.model";

class Wishlist extends Model {
  public id!: string;
  public user_id!: string;
  public product_id!: string;
}

Wishlist.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
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
  },
  {
    sequelize,
    tableName: "wishlists",
    timestamps: true,
  }
);

export default Wishlist;