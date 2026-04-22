import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Cart extends Model {}

Cart.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "active"
    },
    total_amount: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    total_items: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: "carts",
    timestamps: true
  }
);



export default Cart;