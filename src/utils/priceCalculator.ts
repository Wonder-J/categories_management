import { Package, Product } from "../types";

// Calculate total price of a package
export const calculatePackagePrice = (pkg: Package, products: Product[]): number => {
  let totalPrice = 0;
  pkg.products.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      totalPrice += product.price * item.quantity;
    }
  });
  return totalPrice;
};

// Calculate total price of form values
export const calculateFormPackagePrice = (packageProducts: any[], products: Product[]): number => {
  let total = 0;
  if (packageProducts && packageProducts.length > 0) {
    packageProducts.forEach(item => {
      if (item && item.productId && item.quantity) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          total += product.price * item.quantity;
        }
      }
    });
  }
  return total;
}; 