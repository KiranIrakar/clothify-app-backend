import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import {
  UserProfileAttributes,
  UserProfileCreationAttributes,
} from "../interface/user-profile.interface";

class UserProfile
  extends Model<UserProfileAttributes, UserProfileCreationAttributes>
  implements UserProfileAttributes
{
  public id!: string;
  public fullName!: string | null;
  public name!: string | null;
  public email!: string | null;
  public mobileNumber!: string | null;
  public phone!: string | null;
  public password!: string | null;
  public isVerified!: boolean;
  public enabled!: boolean;
  public role!: "ROLE_USER" | "ROLE_ADMIN";
  public otp!: string | null;
  public otp_expiry!: Date | number | null;
  public temprory_phone!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserProfile.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "fullName",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    mobileNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      field: "mobileNumber",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "isVerified",
    },
    role: {
      type: DataTypes.ENUM("ROLE_USER", "ROLE_ADMIN"),
      defaultValue: "ROLE_USER",
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otp_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    temprory_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "user_profiles",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export default UserProfile;
