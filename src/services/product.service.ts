import Product from "../models/product.model";
import { Op } from "sequelize";
import ProductImage from "../models/product-images-model";
import ProductReview from "../models/product-review-model";
import ProductColor from "../models/product-colors-model";
import ProductSize from "../models/product-sizes-model";
import ProductOffer from "../models/product-offers-model";
import { uploadToCloudinary, deleteFromCloudinary, } from "../utils/cloudinaty.utils";
import Store from "../models/store.model";
class ProductService {

  async createFullProduct(data: any) {
    const {
      name,
      brand,
      price,
      mrp,
      store_id,
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

    let image_url = null;
    let public_id = null;

    if (fileBuffer) {
      const upload: any = await uploadToCloudinary(fileBuffer);
      image_url = upload.secure_url;
      public_id = upload.public_id;
    }

    if (store_id) {
      const store = await Store.findByPk(store_id);

      if (!store) {
        throw {
          statusCode: 400,
          message: "Invalid store_id",
        };
      }
    }

    const product = await Product.create({
      name,
      brand,
      price,
      mrp,
      store_id: store_id,
      currency: "INR",
      rating: 0,
      rating_count: 0,
      image_url,
      public_id,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const productId = product.id;


    if (image_url) {
      await ProductImage.create({
        product_id: productId,
        url: image_url,
        public_id,
      });
    }

    if (colors?.length) {
      await ProductColor.bulkCreate(
        colors.map((c: any) => ({
          product_id: productId,
          name: c.name,
          hex_code: c.hexCode,
        }))
      );
    }

    if (sizes?.length) {
      await ProductSize.bulkCreate(
        sizes.map((s: any) => ({
          product_id: productId,
          label: s.label,
          is_available: true,
        }))
      );
    }

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
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    return {
      data,
      total: count,
      page,
      limit,
    };
  }

  async deleteProduct(id: string) {
    const product = await Product.findByPk(id);

    if (!product) {
      throw {
        statusCode: 404,
        message: "Product not found",
      };
    }

    await product.destroy();

    return {
      message: "Product deleted successfully",
    };
  }

  async updateFullProduct(id: string, data: any) {
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

    const product = await Product.findByPk(id);

    if (!product) {
      throw { statusCode: 404, message: "Product not found" };
    }

    // ---------------------------
    // DUPLICATE NAME CHECK
    // ---------------------------
    if (name !== undefined) {
      const existing = await Product.findOne({
        where: {
          name: {
            [Op.iLike]: name.trim(),
          },
          id: { [Op.ne]: id },
        },
      });

      if (existing) {
        throw {
          statusCode: 409,
          message: "Product name already exists",
        };
      }
    }

    // ---------------------------
    // IMAGE (OPTIONAL ✅)
    // ---------------------------
    let image_url = (product as any).image_url;
    let public_id = (product as any).public_id;

    if (fileBuffer) {
      // 🔥 only replace if new image provided
      await ProductImage.destroy({ where: { product_id: id } });

      const upload: any = await uploadToCloudinary(fileBuffer);

      image_url = upload.secure_url;
      public_id = upload.public_id;

      await ProductImage.create({
        product_id: id,
        url: image_url,
        public_id,
      });
    }

    // ---------------------------
    // UPDATE PRODUCT (SAFE ✅)
    // ---------------------------
    await product.update({
      name: name !== undefined ? name : product.name,
      brand: brand !== undefined ? brand : product.brand,
      price: price !== undefined ? price : product.price,
      mrp: mrp !== undefined ? mrp : product.mrp,
      image_url,
      public_id,
      updated_at: new Date(),
    });

    // ---------------------------
    // COLORS (ONLY IF SENT)
    // ---------------------------
    if (colors !== undefined) {
      await ProductColor.destroy({ where: { product_id: id } });

      if (colors.length) {
        await ProductColor.bulkCreate(
          colors.map((c: any) => ({
            product_id: id,
            name: c.name,
            hex_code: c.hexCode,
          }))
        );
      }
    }

    // ---------------------------
    // SIZES (ONLY IF SENT)
    // ---------------------------
    if (sizes !== undefined) {
      await ProductSize.destroy({ where: { product_id: id } });

      if (sizes.length) {
        await ProductSize.bulkCreate(
          sizes.map((s: any) => ({
            product_id: id,
            label: s.label,
            is_available: true,
          }))
        );
      }
    }

    // ---------------------------
    // OFFERS (ONLY IF SENT)
    // ---------------------------
    if (offers !== undefined) {
      await ProductOffer.destroy({ where: { product_id: id } });

      if (offers.length) {
        await ProductOffer.bulkCreate(
          offers.map((o: any) => ({
            product_id: id,
            title: o.title,
            description: o.description,
            type: o.type,
            action_text: o.action_text,
          }))
        );
      }
    }

    return await this.getProductById(id);
  }
}

export default ProductService;