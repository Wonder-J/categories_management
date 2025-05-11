import React, { useState, useEffect } from "react";
import { Table, Button, Space, message } from "antd";
import { Modal } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { OutboundOrder, Package, Product } from "../../types";
import {
  getOutboundOrders,
  deleteOutboundOrder,
  getPackages,
  getProducts,
} from "../../utils/storage";
import OutboundForm from "./OutboundForm";
import OutboundDetail from "./OutboundDetail";

const OutboundList: React.FC = () => {
  const [orders, setOrders] = useState<OutboundOrder[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OutboundOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, contextHolder] = Modal.useModal();

  const fetchData = () => {
    setLoading(true);
    try {
      const ordersData = getOutboundOrders();
      const packagesData = getPackages();
      const productsData = getProducts();
      setOrders(ordersData);
      setPackages(packagesData);
      setProducts(productsData);
    } catch (error) {
      message.error("获取出库单列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (order: OutboundOrder) => {
    setCurrentOrder(order);
    setIsFormVisible(true);
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: "确认删除",
      content: "确定要删除这个出库单吗？",
      okText: "确认",
      cancelText: "取消",
      onOk() {
        try {
          deleteOutboundOrder(id);
          message.success("删除成功");
          fetchData();
        } catch (error) {
          message.error("删除失败");
        }
      },
    });
  };

  const handleAddNew = () => {
    setCurrentOrder(null);
    setIsFormVisible(true);
  };

  const handleFormClose = () => {
    setIsFormVisible(false);
    setCurrentOrder(null);
  };

  const handleFormSubmit = () => {
    setIsFormVisible(false);
    fetchData();
  };

  const handleViewDetail = (order: OutboundOrder) => {
    setCurrentOrder(order);
    setIsDetailVisible(true);
  };

  const handleDetailClose = () => {
    setIsDetailVisible(false);
    setCurrentOrder(null);
  };

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get package names for an order
  const getPackageNames = (order: OutboundOrder) => {
    return order.packages
      .map((item) => {
        const pkg = packages.find((p) => p.id === item.packageId);
        return pkg ? `${pkg.name} x ${item.quantity}` : "";
      })
      .join(", ");
  };

  const columns = [
    {
      title: "出库单号",
      dataIndex: "id",
      key: "id",
      render: (id: string) => id.substring(0, 8),
    },
    {
      title: "出库时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => formatDate(date),
    },
    {
      title: "包含套餐",
      key: "packages",
      render: (_: any, record: OutboundOrder) => getPackageNames(record),
    },
    {
      title: "总价",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: "备注",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: OutboundOrder) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
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
          新建出库单
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
      />
      <OutboundForm
        visible={isFormVisible}
        onCancel={handleFormClose}
        onSubmit={handleFormSubmit}
        initialValues={currentOrder}
        packages={packages}
        products={products}
      />
      <OutboundDetail
        visible={isDetailVisible}
        onCancel={handleDetailClose}
        order={currentOrder}
        packages={packages}
        products={products}
      />
      {contextHolder}
    </div>
  );
};

export default OutboundList;
