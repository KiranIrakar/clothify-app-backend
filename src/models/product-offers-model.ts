import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class ProductOffer extends Model {
    public id!: string;
    public product_id!: string;
    public title!: string;
    public description!: string;
    public type!: string;
    public action_text!: string;
}

ProductOffer.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },

        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "products",
                key: "id",
            },
            onDelete: "CASCADE",
        },

        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        action_text: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "product_offers",
        timestamps: true,
    }
);

export default ProductOffer;