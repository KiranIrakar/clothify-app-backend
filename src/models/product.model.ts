import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Product extends Model {
  public id!: string;
  public name!: string;
  public brand!: string;
  public price!: number;
  public mrp!: number;
  public currency!: string;
  public rating!: number;
  public rating_count!: number;
  public store_id!: string;
  public category!: string;
  public stock!: number;
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

    brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    mrp: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    currency: {
      type: DataTypes.STRING,
      defaultValue: "INR",
    },
    store_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "stores",
        key: "id",
      },
      onDelete: "SET NULL",
    },

    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    rating_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

  },
  {
    sequelize,
    tableName: "products",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Product;