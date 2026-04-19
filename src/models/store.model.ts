import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Store extends Model {
    public id!: string;
    public name!: string;
    public address!: string;
    public lat!: number;
    public lng!: number;
}

Store.init(
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
        address: {
            type: DataTypes.STRING,
        },
        lat: {
            type: DataTypes.FLOAT,
        },
        lng: {
            type: DataTypes.FLOAT,
        },
    },
    {
        sequelize,
        tableName: "stores",
        timestamps: true,
    }
);

export default Store;