import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";

class Product extends Model {
  public id!: string;
  public name!: string;
  public price!: number;
  public description!: string;
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
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    tableName: "products",
    timestamps: true,
  }
);

export default Product;