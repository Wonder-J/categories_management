import React, { useState } from "react";
import { Layout, Menu, Space } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  InboxOutlined,
  AppstoreOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import DataTransferButtons from "../DataTransfer/DataTransferButtons";

const { Header, Content, Sider } = Layout;

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      key: "/products",
      icon: <InboxOutlined />,
      label: <Link to="/products">仓库管理</Link>,
    },
    {
      key: "/packages",
      icon: <AppstoreOutlined />,
      label: <Link to="/packages">套餐管理</Link>,
    },
    {
      key: "/outbound",
      icon: <ExportOutlined />,
      label: <Link to="/outbound">出库管理</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ color: "white", fontSize: "18px", fontWeight: "bold" }}>
          库存管理系统
        </div>
        <div>
          <DataTransferButtons />
        </div>
      </Header>
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <Menu
            theme="dark"
            selectedKeys={[location.pathname]}
            mode="inline"
            items={menuItems}
          />
        </Sider>
        <Layout style={{ padding: "24px" }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              background: "#fff",
              borderRadius: "4px",
              minHeight: 280,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
