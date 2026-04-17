import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class ProductImage extends Model {
  public id!: string;
  public product_id!: string;
  public url!: string;
  public public_id!: string;
}

ProductImage.init(
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

    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    public_id: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    tableName: "product_images",
    timestamps: true,
  }
);

export default ProductImage;