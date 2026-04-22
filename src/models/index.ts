import Cart from "./carts.model";
import CartItem from "./cartItems.model";
import Product from "./product.model";

// 🔗 associations
Cart.hasMany(CartItem, {
  foreignKey: "cart_id",
  as: "items"
});

CartItem.belongsTo(Cart, {
  foreignKey: "cart_id",
  as: "cart"
});

CartItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product"
});

export { Cart, CartItem, Product };