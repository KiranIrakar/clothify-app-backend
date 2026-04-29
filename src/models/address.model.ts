import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Address extends Model {}

Address.init(
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

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    altMobile: {
      type: DataTypes.STRING,
    },

    flat: DataTypes.STRING,
    area: DataTypes.STRING,
    address: DataTypes.TEXT,

    type: {
      type: DataTypes.ENUM("home", "work", "other"),
      defaultValue: "home",
    },

    lat: DataTypes.FLOAT,
    lng: DataTypes.FLOAT,

    selected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "addresses",
    timestamps: true,
  }
);

export default Address;