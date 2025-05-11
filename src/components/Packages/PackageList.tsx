import React, { useState, useEffect } from "react";
import { Table, Button, Space, message } from "antd";
import { Modal } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Package, Product } from "../../types";
import { getPackages, deletePackage, getProducts } from "../../utils/storage";
import { calculatePackagePrice } from "../../utils/priceCalculator";
import PackageForm from "./PackageForm";

const PackageList: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, contextHolder] = Modal.useModal();

  const fetchData = () => {
    setLoading(true);
    try {
      const packagesData = getPackages();
      const productsData = getProducts();
      setPackages(packagesData);
      setProducts(productsData);
    } catch (error) {
      message.error("获取套餐列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (pkg: Package) => {
    setCurrentPackage(pkg);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: "确认删除",
      content: "确定要删除这个套餐吗？",
      okText: "确认",
      cancelText: "取消",
      onOk() {
        try {
          deletePackage(id);
          message.success("删除成功");
          fetchData();
        } catch (error) {
          message.error("删除失败");
        }
      },
    });
  };

  const handleAddNew = () => {
    setCurrentPackage(null);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setCurrentPackage(null);
  };

  const handleFormSubmit = () => {
    setIsModalVisible(false);
    fetchData();
  };

  // Calculate total products in a package
  const getTotalProducts = (pkg: Package) => {
    return pkg.products.reduce((total, item) => total + item.quantity, 0);
  };

  // Get product names for a package
  const getProductNames = (pkg: Package) => {
    return pkg.products
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return product ? `${product.name} x ${item.quantity}` : "";
      })
      .join(", ");
  };

  const columns = [
    {
      title: "套餐名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "包含商品",
      key: "products",
      render: (_: any, record: Package) => getProductNames(record),
    },
    {
      title: "商品总数",
      key: "totalProducts",
      render: (_: any, record: Package) => getTotalProducts(record),
    },
    {
      title: "套餐总价",
      key: "totalPrice",
      render: (_: any, record: Package) =>
        `¥${calculatePackagePrice(record, products).toFixed(2)}`,
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: Package) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          添加套餐
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={packages}
        rowKey="id"
        loading={loading}
      />
      <PackageForm
        visible={isModalVisible}
        onCancel={handleModalClose}
        onSubmit={handleFormSubmit}
        initialValues={currentPackage}
        products={products}
      />
      {contextHolder}
    </div>
  );
};

export default PackageList;
