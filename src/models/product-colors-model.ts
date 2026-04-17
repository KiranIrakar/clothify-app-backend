import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class ProductColor extends Model {
    public id!: string;
    public product_id!: string;
    public name!: string;
    public hex_code!: string;
}

ProductColor.init(
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
        
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        hex_code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "product_colors",
        timestamps: true,
    }
);

export default ProductColor;