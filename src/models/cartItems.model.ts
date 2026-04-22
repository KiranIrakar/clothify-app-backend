import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class CartItem extends Model {}

CartItem.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    cart_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    price_at_time: {
      type: DataTypes.FLOAT
    },
    total_price: {
      type: DataTypes.FLOAT
    },
    selected_size: DataTypes.STRING,
    selected_color: DataTypes.STRING,
    is_selected: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: "cart_items",
    timestamps: true
  }
);

export default CartItem;