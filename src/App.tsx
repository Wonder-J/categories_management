import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/lib/locale/zh_CN";
import AppLayout from "./components/Layout/AppLayout";
import ProductsPage from "./pages/ProductsPage";
import PackagesPage from "./pages/PackagesPage";
import OutboundPage from "./pages/OutboundPage";
import { initializeStorage } from "./utils/storage";
import "./App.css";

const App: React.FC = () => {
  useEffect(() => {
    // Initialize local storage data
    initializeStorage();
  }, []);

  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/products" replace />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="packages" element={<PackagesPage />} />
            <Route path="outbound" element={<OutboundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
