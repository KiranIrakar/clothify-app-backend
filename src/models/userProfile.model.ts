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
  public fullName!: string;
  public email!: string;
  public mobileNumber!: string;
  public password!: string | null;
  public isVerified!: boolean;
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
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    mobileNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "user_profiles",
    timestamps: true,
  }
);

export default UserProfile;