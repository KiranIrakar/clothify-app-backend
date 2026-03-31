import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class UserModel extends Model {
    id: any;
    name: any;
    email: any;
    password: any;
    phone: any;
    role: any;
    enabled: any;

    otp: any;
    otp_expiry: any;

    created_at: any;
    updated_at: any;
}

UserModel.init(
    {
        id: {
            type: DataTypes.CHAR(36),
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        role: {
            type: DataTypes.ENUM("ROLE_USER", "ROLE_ADMIN"),
            defaultValue: "ROLE_USER",
        },
        enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        otp: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        otp_expiry: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: true,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "users",
        timestamps: false,
    }
);

sequelize.sync();

export default UserModel;