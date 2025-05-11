import React, { useState, useEffect } from "react";
import { Table, Button, Space, message } from "antd";
import { Modal } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Product } from "../../types";
import { getProducts, deleteProduct } from "../../utils/storage";
import ProductForm from "./ProductForm";

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, contextHolder] = Modal.useModal();

  const fetchProducts = () => {
    setLoading(true);
    try {
      const data = getProducts();
      setProducts(data);
    } catch (error) {
      message.error("获取商品列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: "确认删除",
      content: "确定要删除这个商品吗？",
      okText: "确认",
      cancelText: "取消",
      onOk() {
        try {
          deleteProduct(id);
          message.success("删除成功");
          fetchProducts();
        } catch (error) {
          message.error("删除失败");
        }
      },
    });
  };

  const handleAddNew = () => {
    setCurrentProduct(null);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setCurrentProduct(null);
  };

  const handleFormSubmit = () => {
    setIsModalVisible(false);
    fetchProducts();
  };

  const columns = [
    {
      title: "商品图片",
      dataIndex: "image",
      key: "image",
      render: (image: string) => (
        <img
          src={image}
          alt="商品图片"
          style={{ width: "50px", height: "50px" }}
        />
      ),
    },
    {
      title: "商品名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "价格",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: "品牌",
      dataIndex: "brand",
      key: "brand",
    },
    {
      title: "库存",
      dataIndex: "stock",
      key: "stock",
      render: (stock: number) => (
        <span style={{ color: stock <= 0 ? "red" : "inherit" }}>{stock}</span>
      ),
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: Product) => (
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
          添加商品
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
      />
      <ProductForm
        visible={isModalVisible}
        onCancel={handleModalClose}
        onSubmit={handleFormSubmit}
        initialValues={currentProduct}
      />
      {contextHolder}
    </div>
  );
};

export default ProductList;
