import React from "react";
import ProductList from "../components/Products/ProductList";

const ProductsPage: React.FC = () => {
  return (
    <div>
      <h2>仓库管理</h2>
      <ProductList />
    </div>
  );
};

export default ProductsPage;
