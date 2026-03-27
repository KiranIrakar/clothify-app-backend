import Product from "../models/product.model";
import { Op } from "sequelize";

class ProductService {

  async createProduct(data: any) {
    const { name, price, stock } = data;

    if (!name || name.trim().length < 2) {
      throw { statusCode: 400, message: "Product name must be at least 2 characters" };
    }

    if (price == null || isNaN(price) || Number(price) <= 0) {
      throw { statusCode: 400, message: "Price must be a positive number" };
    }

    if (stock == null || !Number.isInteger(stock) || stock < 0) {
      throw { statusCode: 400, message: "Stock must be a non-negative integer" };
    }

    const existingProduct = await Product.findOne({
      where: { name: name.trim() },
    });

    if (existingProduct) {
      throw {
        statusCode: 409,
        message: `Product with name '${name}' already exists`,
      };
    }

    const product = await Product.create({
      ...data,
      name: name.trim(),
    });

    return product;
  }

  async getProducts(filters: any) {
    const where: any = {};

    if (filters.search) {
      where.name = {
        [Op.like]: `%${filters.search}%`,
      };
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) {
        where.price[Op.gte] = Number(filters.minPrice);
      }
      if (filters.maxPrice) {
        where.price[Op.lte] = Number(filters.maxPrice);
      }
    }

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    return {
      total: count,
      page,
      limit,
      data: rows,
    };
  }

  async getProductById(id: string) {
    const product = await Product.findByPk(id);

    if (!product) {
      throw { statusCode: 404, message: "Product not found" };
    }

    return product;
  }

  async updateProduct(id: string, data: any) {
    const product = await Product.findByPk(id);

    if (!product) {
      throw { statusCode: 404, message: "Product not found" };
    }

    await product.update(data);

    return product;
  }

  async deleteProduct(id: string) {
    const product = await Product.findByPk(id);

    if (!product) {
      throw { statusCode: 404, message: "Product not found" };
    }

    await product.destroy();

    return { message: "Product deleted successfully" };
  }
}

export default ProductService;