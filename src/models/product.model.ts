import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Product extends Model {
  public id!: string;
  public name!: string;
  public price!: number;
  public description!: string;
  public image_url!: string;
  public public_id!: string;
  public stock!: number;
  public category!: string;
  public currency!: string;
  public created_at!: Date;
  public updated_at!: Date;
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
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    public_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "INR",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

  },
  {
    sequelize,
    tableName: "products",
    timestamps: true,
  }
);

export default Product;