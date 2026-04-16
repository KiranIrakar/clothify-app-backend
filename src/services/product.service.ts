import Product from "../models/product.model";
import { Op } from "sequelize";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinaty.utils";

class ProductService {

  async createProduct(data: any) {
    const { name, price, fileBuffer, ...rest } = data;

    if (!name || name.trim().length < 2) {
      throw { statusCode: 400, message: "Invalid name" };
    }

    if (price == null || isNaN(price) || Number(price) <= 0) {
      throw { statusCode: 400, message: "Invalid price" };
    }

    const cleanName = name.trim();

    const existingProduct = await Product.findOne({
      where: {
        name: {
          [Op.iLike]: cleanName, 
        },
      },
    });

    if (existingProduct) {
      throw {
        statusCode: 409,
        message: `Product already exists ${name}`,
      };
    }

    let image_url = null;
    let public_id = null;

    if (fileBuffer) {
      const upload: any = await uploadToCloudinary(fileBuffer);
      image_url = upload.secure_url;
      public_id = upload.public_id;
    }

    return await Product.create({
      name: cleanName,
      price,
      image_url,
      public_id,
      ...rest,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }


  async getProducts(filters: any) {
    const where: any = {};

    if (filters.search) {
      where.name = { [Op.like]: `%${filters.search}%` };
    }

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;

    const { rows, count } = await Product.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [["created_at", "DESC"]],
    });

    return { data: rows,  total: count, page, };
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

  let image_url = product.image_url;
  let public_id = product.public_id;

  if (data.fileBuffer) {
    if (public_id) {
      await deleteFromCloudinary(public_id);
    }

    const upload: any = await uploadToCloudinary(data.fileBuffer);

    image_url = upload.secure_url;
    public_id = upload.public_id;
  }

  const updateData: any = {
    updated_at: new Date(),
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.stock !== undefined) updateData.stock = data.stock;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.category !== undefined) updateData.category = data.category;

  updateData.image_url = image_url;
  updateData.public_id = public_id;

  return await product.update(updateData);
}
 

  async deleteProduct(id: string) {
    const product = await Product.findByPk(id);

    if (!product) {
      throw { statusCode: 404, message: "Product not found" };
    }

    if (product.public_id) {
      await deleteFromCloudinary(product.public_id);
    }

    await product.destroy();

    return { message: "Product deleted successfully" };
  }
}

export default ProductService;