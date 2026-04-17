import Product from "../models/product.model";
import { Op } from "sequelize";
import ProductImage from "../models/product-images-model";
import ProductReview from "../models/product-review-model";
import ProductColor from "../models/product-colors-model";
import ProductSize from "../models/product-sizes-model";
import ProductOffer from "../models/product-offers-model";
import { uploadToCloudinary, deleteFromCloudinary, } from "../utils/cloudinaty.utils";
class ProductService {

  async getProductById(id: string) {
    const product = await Product.findByPk(id, {
      include: [
        {
          model: ProductImage,
          as: "images",
          attributes: ["url"],
        },
        {
          model: ProductReview,
          as: "reviews",
        },
        {
          model: ProductColor,
          as: "colors",
        },
        {
          model: ProductSize,
          as: "sizes",
        },
        {
          model: ProductOffer,
          as: "offers",
        },
      ],
    });

    const p: any = product;

    if (!product) {
      throw { statusCode: 404, message: "Product not found" };
    }

    const imageUrls = (product as any).images?.map((img: any) => img.url) || [];


    const discountPercent =
      product.mrp && product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    const topReview =
      (product as any).reviews
        ?.sort((a: any, b: any) => b.rating - a.rating)[0] || null;

    return {
      id: p.id,
      name: p.name,
      brand: p.brand,
      imageUrls,

      price: p.price,
      mrp: p.mrp,
      discountPercent,

      currency: p.currency || "INR",

      rating: p.rating,
      ratingCount: p.rating_count,

      offers: p.offers || [],
      colors: p.colors || [],
      sizes: p.sizes || [],

      delivery: {
        pincode: "110001",
        serviceable: true,
        shippingType: "Free Express Delivery",
        estimatedDeliveryDate: "2026-02-26",
        shippingCharge: 0,
        isFreeDelivery: true,
      },

      topReview: topReview
        ? {
          id: topReview.id,
          userName: topReview.user_name,
          userInitials: topReview.user_initials,
          rating: topReview.rating,
          comment: topReview.comment,
        }
        : null,

      store: {
        id: 1,
        name: "Snap2Shop Central Store",
      },

      isWishlisted: false,

      shareUrl: `https://yourapp.com/product/${p.id}`,
    };
  }


  async createFullProduct(data: any) {
    const {
      name,
      brand,
      price,
      mrp,
      colors,
      sizes,
      offers,
      fileBuffer,
    } = data;

    if (!name || name.trim().length < 2) {
      throw { statusCode: 400, message: "Invalid name" };
    }

    if (!price || price <= 0) {
      throw { statusCode: 400, message: "Invalid price" };
    }

    const cleanName = name.trim();

    // ---------------------------
    // DUPLICATE CHECK (BEFORE UPLOAD)
    // ---------------------------
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
        message: `Product already exists: ${cleanName}`,
      };
    }
    // ---------------------------
    // CLOUDINARY UPLOAD (MAIN IMAGE)
    // ---------------------------
    let image_url = null;
    let public_id = null;

    if (fileBuffer) {
      const upload: any = await uploadToCloudinary(fileBuffer);
      image_url = upload.secure_url;
      public_id = upload.public_id;
    }


    // ---------------------------
    // CREATE PRODUCT
    // ---------------------------
    const product = await Product.create({
      name,
      brand,
      price,
      mrp,
      currency: "INR",
      rating: 0,
      rating_count: 0,
      image_url,
      public_id,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const productId = product.id;

    // ---------------------------
    // IMAGES (OPTIONAL MULTIPLE)
    // ---------------------------
    if (image_url) {
      await ProductImage.create({
        product_id: productId,
        url: image_url,
        public_id,
      });
    }

    // ---------------------------
    // COLORS
    // ---------------------------
    if (colors?.length) {
      await ProductColor.bulkCreate(
        colors.map((c: any) => ({
          product_id: productId,
          name: c.name,
          hex_code: c.hexCode,
        }))
      );
    }

    // ---------------------------
    // SIZES
    // ---------------------------
    if (sizes?.length) {
      await ProductSize.bulkCreate(
        sizes.map((s: any) => ({
          product_id: productId,
          label: s.label,
          is_available: true,
        }))
      );
    }

    // ---------------------------
    // OFFERS
    // ---------------------------
    if (offers?.length) {
      await ProductOffer.bulkCreate(
        offers.map((o: any) => ({
          product_id: productId,
          title: o.title,
          description: o.description,
          type: o.type,
          action_text: o.action_text,
        }))
      );
    }

    return product;
  }

  async getProducts(filters: any) {
    const where: any = {};

    if (filters.search) {
      where.name = {
        [Op.iLike]: `%${filters.search.trim()}%`,
      };
    }

    if (filters.brand) {
      where.brand = {
        [Op.iLike]: `%${filters.brand}%`,
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

    let order: any = [["created_at", "DESC"]]; // default latest

    if (filters.sort === "price_asc") {
      order = [["price", "ASC"]];
    }

    if (filters.sort === "price_desc") {
      order = [["price", "DESC"]];
    }

    if (filters.sort === "rating") {
      order = [["rating", "DESC"]];
    }

    const { rows, count } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: ProductImage,
          as: "images",
          attributes: ["url"],
        },
      ],
      limit,
      offset: (page - 1) * limit,
      order,
    });


    const data = rows.map((p: any) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      mrp: p.mrp,
      currency: p.currency || "INR",
      rating: p.rating,
      ratingCount: p.rating_count,
      imageUrls: p.images?.map((img: any) => img.url) || [],
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    return {
      data,
      total: count,
      page,
      limit,
    };
  }

  // async updateProduct(id: string, data: any) {
  //   const product = await Product.findByPk(id);

  //   if (!product) {
  //     throw { statusCode: 404, message: "Product not found" };
  //   }

  //   let image_url = product.image_url;
  //   let public_id = product.public_id;

  //   if (data.fileBuffer) {
  //     if (public_id) {
  //       await deleteFromCloudinary(public_id);
  //     }

  //     const upload: any = await uploadToCloudinary(data.fileBuffer);

  //     image_url = upload.secure_url;
  //     public_id = upload.public_id;
  //   }

  //   const updateData: any = {
  //     updated_at: new Date(),
  //   };

  //   if (data.name !== undefined) updateData.name = data.name;
  //   if (data.price !== undefined) updateData.price = data.price;
  //   if (data.stock !== undefined) updateData.stock = data.stock;
  //   if (data.description !== undefined) updateData.description = data.description;
  //   if (data.category !== undefined) updateData.category = data.category;

  //   updateData.image_url = image_url;
  //   updateData.public_id = public_id;

  //   return await product.update(updateData);
  // }


  // async deleteProduct(id: string) {
  //   const product = await Product.findByPk(id);

  //   if (!product) {
  //     throw { statusCode: 404, message: "Product not found" };
  //   }

  //   if (product.public_id) {
  //     await deleteFromCloudinary(product.public_id);
  //   }

  //   await product.destroy();

  //   return { message: "Product deleted successfully" };
  // }
}

export default ProductService;