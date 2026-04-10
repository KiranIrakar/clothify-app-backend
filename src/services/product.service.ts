// services/product.service.ts

import Product from "../models/product.model";
import { Op, WhereOptions } from "sequelize";
import {
  CreateProductInput,
  UpdateProductInput,
  GetProductsFilters,
  PaginatedProductsResponse,
  DeleteProductResponse,
} from "../interface/product.types";

class ProductService {
  async createProduct(data: CreateProductInput): Promise<Product> {
    const { name, price } = data;

    if (!name || name.trim().length < 2) {
      throw { statusCode: 400, message: "Product name must be at least 2 characters" };
    }

    if (price == null || isNaN(price) || Number(price) <= 0) {
      throw { statusCode: 400, message: "Price must be a positive number" };
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

    return await Product.create({
      ...data,
      name: name.trim(),
    });
  }

  async getProducts(filters: GetProductsFilters): Promise<PaginatedProductsResponse> {
    const where: WhereOptions = {};

    if (filters.search) {
      where.name = { [Op.like]: `%${filters.search}%` };
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {
        ...(filters.minPrice && { [Op.gte]: Number(filters.minPrice) }),
        ...(filters.maxPrice && { [Op.lte]: Number(filters.maxPrice) }),
      };
    }

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return { total: count, page, limit, data: rows };
  }

  async getProductById(id: string): Promise<Product> {
    const product = await Product.findByPk(id);

    if (!product) {
      throw { statusCode: 404, message: "Product not found" };
    }

    return product;
  }

  async updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
    const product = await Product.findByPk(id);

    if (!product) {
      throw { statusCode: 404, message: "Product not found" };
    }

    return await product.update(data);
  }

  async deleteProduct(id: string): Promise<DeleteProductResponse> {
    const product = await Product.findByPk(id);

    if (!product) {
      throw { statusCode: 404, message: "Product not found" };
    }

    await product.destroy();

    return { message: "Product deleted successfully" };
  }
}

export default ProductService;