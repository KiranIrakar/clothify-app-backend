import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Store extends Model {
  public id!: string;
  public user_id!: string;
  public store_name!: string;
  public store_type!: string;
  public logo!: string;
  public owner_name!: string;
  public address!: string;
  public gst_no!: string;
  public delivery_type!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Store.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "user_profiles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    store_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    store_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    owner_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    gst_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    delivery_type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pickup",
    },
  },
  {
    sequelize,
    tableName: "stores",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Store;