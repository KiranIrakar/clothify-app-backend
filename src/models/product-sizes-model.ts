import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class ProductSize extends Model {
    public id!: string;
    public product_id!: string;
    public label!: string;
    public is_available!: boolean;
}

ProductSize.init(
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
        
        label: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        is_available: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: "product_sizes",
        timestamps: true,
    }
);

export default ProductSize;