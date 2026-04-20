import Product from "../models/product.model";
import { Op } from "sequelize";
import ProductImage from "../models/product-images-model";
import ProductReview from "../models/product-review-model";
import ProductColor from "../models/product-colors-model";
import ProductSize from "../models/product-sizes-model";
import ProductOffer from "../models/product-offers-model";
import { uploadToCloudinary, deleteFromCloudinary, } from "../utils/cloudinaty.utils";
import Store from "../models/store.model";
import sequelize from "../config/db";
class ProductService {

  async createFullProduct(data: any) {
    const transaction = await sequelize.transaction();

    try {
      const {
        name,
        brand,
        price,
        mrp,
        store_id,
        category,
        stock,
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

      const cleanCategory =
        typeof category === "string"
          ? category.trim()
          : category?.value?.trim();

      if (!cleanCategory || cleanCategory.length < 2) {
        throw { statusCode: 400, message: "Invalid category" };
      }

      if (stock == null || stock < 0) {
        throw { statusCode: 400, message: "Invalid stock" };
      }

      const cleanName = name.trim();

      const existingProduct = await Product.findOne({
        where: {
          name: {
            [Op.iLike]: cleanName,
          },
        },
        transaction,
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
        const storeExists = await Store.findByPk(store_id, { transaction });

        if (!storeExists) {
          throw {
            statusCode: 400,
            message: "Invalid store_id",
          };
        }
      }

      // Create product
      const product = await Product.create(
        {
          name: cleanName,
          brand,
          price,
          mrp,
          store_id,
          category,
          stock,
          currency: "INR",
          rating: 0,
          rating_count: 0,
          image_url,
          public_id,
        },
        { transaction }
      );

      const productId = product.id;

      //  Related tables
      if (image_url) {
        await ProductImage.create(
          {
            product_id: productId,
            url: image_url,
            public_id,
          },
          { transaction }
        );
      }

      if (colors?.length) {
        await ProductColor.bulkCreate(
          colors.map((c: any) => ({
            product_id: productId,
            name: c.name,
            hex_code: c.hexCode,
          })),
          { transaction }
        );
      }

      if (sizes?.length) {
        await ProductSize.bulkCreate(
          sizes.map((s: any) => ({
            product_id: productId,
            label: s.label,
            is_available: true,
          })),
          { transaction }
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
          })),
          { transaction }
        );
      }

      // Fetch full product
      const fullProduct = await Product.findByPk(productId, {
        include: [
          {
            model: Store,
            as: "store",
            attributes: ["id", "name"],
          },
        ],
        transaction,
      });

      await transaction.commit();

      const result = fullProduct?.toJSON();

      delete result.store_id;

      return result;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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
        {
          model: Store,
          as: "store", 
          attributes: ["id", "name"],
        },
      ],
    });

    if (!product) {
      throw { statusCode: 404, message: "Product not found" };
    }

    const p: any = product;

    //  Images
    const imageUrls =
      p.images?.map((img: any) => img.url) || [];

    //  Discount
    const discountPercent =
      p.mrp && p.price
        ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
        : 0;

    //  Top Review
    const topReview =
      p.reviews?.sort((a: any, b: any) => b.rating - a.rating)[0] || null;

    //  Stock status
    let stock_status = "IN_STOCK";
    if (p.stock === 0) stock_status = "OUT_OF_STOCK";
    else if (p.stock <= 5) stock_status = "LOW_STOCK";

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

      //  NEW FIELDS
      category: p.category,
      stock: p.stock,
      stock_status,

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

      //  FIXED STORE (dynamic)
      store: p.store
        ? {
          id: p.store.id,
          name: p.store.name,
        }
        : null,

      isWishlisted: false,

      shareUrl: `https://yourapp.com/product/${p.id}`,
    };
  }

  async getAllProducts(filters: any) {
    const where: any = {};

    // 🔥 Stock filter (for tabs like All / In Stock / Out of Stock)
    if (filters.stock === "IN_STOCK") {
      where.stock = { [Op.gt]: 0 };
    }

    if (filters.stock === "OUT_OF_STOCK") {
      where.stock = 0;
    }

    const products = await Product.findAll({
      where,
      attributes: ["id", "name", "price", "stock", "image_url"],
      order: [["created_at", "DESC"]],
    });

    // ✅ Format for UI
    const result = products.map((p: any) => {
      const item = p.toJSON();

      let stock_status = "IN_STOCK";
      if (item.stock === 0) stock_status = "OUT_OF_STOCK";
      else if (item.stock <= 5) stock_status = "LOW_STOCK";

      return {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image_url,
        stock_status,
      };
    });

    return result;
  }

  async deleteProduct(id: string) {
    const product: any = await Product.findByPk(id, {
      include: [
        {
          model: ProductImage,
          as: "images",
          attributes: ["public_id"],
        },
      ],
    });

    if (!product) {
      throw {
        statusCode: 404,
        message: "Product not found",
      };
    }

    if (product.images?.length) {
      for (const img of product.images) {
        if (img.public_id) {
          await deleteFromCloudinary(img.public_id);
        }
      }
    }

    const transaction = await sequelize.transaction();

    try {
      await product.destroy({ transaction }); // cascade handles child tables

      await transaction.commit();

      return {
        message: "Product deleted successfully",
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateFullProduct(id: string, data: any) {
    const transaction = await sequelize.transaction();

    try {
      const {
        name,
        brand,
        price,
        mrp,
        category,
        stock,
        colors,
        sizes,
        offers,
        fileBuffer,
      } = data;

      const product: any = await Product.findByPk(id, { transaction });

      if (!product) {
        throw { statusCode: 404, message: "Product not found" };
      }

      // ---------------------------
      // VALIDATIONS (LIKE CREATE)
      // ---------------------------
      if (name !== undefined && name.trim().length < 2) {
        throw { statusCode: 400, message: "Invalid name" };
      }

      if (price !== undefined && price <= 0) {
        throw { statusCode: 400, message: "Invalid price" };
      }

      let cleanCategory = undefined;

      if (category !== undefined) {
        cleanCategory =
          typeof category === "string"
            ? category.trim()
            : category?.value?.trim();

        if (!cleanCategory || cleanCategory.length < 2) {
          throw { statusCode: 400, message: "Invalid category" };
        }
      }

      if (stock !== undefined && stock < 0) {
        throw { statusCode: 400, message: "Invalid stock" };
      }

      // ---------------------------
      // DUPLICATE NAME CHECK
      // ---------------------------
      if (name !== undefined) {
        const existing = await Product.findOne({
          where: {
            name: { [Op.iLike]: name.trim() },
            id: { [Op.ne]: id },
          },
          transaction,
        });

        if (existing) {
          throw {
            statusCode: 409,
            message: "Product name already exists",
          };
        }
      }

      // ---------------------------
      // IMAGE UPDATE
      // ---------------------------
      let image_url = product.image_url;
      let public_id = product.public_id;

      if (fileBuffer) {
        // 🔥 delete old image from Cloudinary
        if (public_id) {
          await deleteFromCloudinary(public_id);
        }

        const upload: any = await uploadToCloudinary(fileBuffer);

        image_url = upload.secure_url;
        public_id = upload.public_id;

        await ProductImage.destroy({
          where: { product_id: id },
          transaction,
        });

        await ProductImage.create(
          {
            product_id: id,
            url: image_url,
            public_id,
          },
          { transaction }
        );
      }

      // ---------------------------
      // UPDATE PRODUCT
      // ---------------------------
      await product.update(
        {
          name: name !== undefined ? name.trim() : product.name,
          brand: brand !== undefined ? brand : product.brand,
          price: price !== undefined ? price : product.price,
          mrp: mrp !== undefined ? mrp : product.mrp,
          category:
            cleanCategory !== undefined ? cleanCategory : product.category,
          stock: stock !== undefined ? stock : product.stock,
          image_url,
          public_id,
        },
        { transaction }
      );

      // ---------------------------
      // COLORS
      // ---------------------------
      if (colors !== undefined) {
        await ProductColor.destroy({ where: { product_id: id }, transaction });

        if (colors.length) {
          await ProductColor.bulkCreate(
            colors.map((c: any) => ({
              product_id: id,
              name: c.name,
              hex_code: c.hexCode,
            })),
            { transaction }
          );
        }
      }

      // ---------------------------
      // SIZES
      // ---------------------------
      if (sizes !== undefined) {
        await ProductSize.destroy({ where: { product_id: id }, transaction });

        if (sizes.length) {
          await ProductSize.bulkCreate(
            sizes.map((s: any) => ({
              product_id: id,
              label: s.label,
              is_available: true,
            })),
            { transaction }
          );
        }
      }

      // ---------------------------
      // OFFERS
      // ---------------------------
      if (offers !== undefined) {
        await ProductOffer.destroy({ where: { product_id: id }, transaction });

        if (offers.length) {
          await ProductOffer.bulkCreate(
            offers.map((o: any) => ({
              product_id: id,
              title: o.title,
              description: o.description,
              type: o.type,
              action_text: o.action_text,
            })),
            { transaction }
          );
        }
      }

      await transaction.commit();

      return await this.getProductById(id);

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default ProductService;