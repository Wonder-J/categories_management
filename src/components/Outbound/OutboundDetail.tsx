import React from "react";
import { Modal, Descriptions, Table } from "antd";
import { OutboundOrder, Package, Product } from "../../types";
import { calculatePackagePrice } from "../../utils/priceCalculator";

interface OutboundDetailProps {
  visible: boolean;
  onCancel: () => void;
  order: OutboundOrder | null;
  packages: Package[];
  products: Product[];
}

interface PackageDetailItem {
  key: string;
  packageName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface ProductDetailItem {
  key: string;
  productName: string;
  brand: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

const OutboundDetail: React.FC<OutboundDetailProps> = ({
  visible,
  onCancel,
  order,
  packages,
  products,
}) => {
  if (!order) return null;

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Prepare package data for table
  const packageData: PackageDetailItem[] = order.packages.map((item) => {
    const pkg = packages.find((p) => p.id === item.packageId);
    const packagePrice = pkg ? calculatePackagePrice(pkg, products) : 0;
    return {
      key: item.packageId,
      packageName: pkg ? pkg.name : "未知套餐",
      quantity: item.quantity,
      price: packagePrice,
      subtotal: packagePrice * item.quantity,
    };
  });

  // Prepare product data for table
  const productData: ProductDetailItem[] = [];
  order.packages.forEach((orderPackage) => {
    const pkg = packages.find((p) => p.id === orderPackage.packageId);
    if (pkg) {
      pkg.products.forEach((pkgProduct) => {
        const product = products.find((p) => p.id === pkgProduct.productId);
        if (product) {
          const totalQuantity = pkgProduct.quantity * orderPackage.quantity;
          productData.push({
            key: `${orderPackage.packageId}-${pkgProduct.productId}`,
            productName: product.name,
            brand: product.brand,
            unitPrice: product.price,
            quantity: totalQuantity,
            subtotal: product.price * totalQuantity,
          });
        }
      });
    }
  });

  // Merge duplicate products
  const mergedProductData: ProductDetailItem[] = [];
  productData.forEach((item) => {
    const existingItem = mergedProductData.find(
      (p) => p.productName === item.productName
    );
    if (existingItem) {
      existingItem.quantity += item.quantity;
      existingItem.subtotal += item.subtotal;
    } else {
      mergedProductData.push({ ...item });
    }
  });

  const packageColumns = [
    {
      title: "套餐名称",
      dataIndex: "packageName",
      key: "packageName",
    },
    {
      title: "数量",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "单价",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: "小计",
      dataIndex: "subtotal",
      key: "subtotal",
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
  ];

  const productColumns = [
    {
      title: "商品名称",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "品牌",
      dataIndex: "brand",
      key: "brand",
    },
    {
      title: "单价",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: "数量",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "小计",
      dataIndex: "subtotal",
      key: "subtotal",
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
  ];

  return (
    <Modal
      title="出库单详情"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="出库单号">{order.id}</Descriptions.Item>
        <Descriptions.Item label="出库时间">
          {formatDate(order.createdAt)}
        </Descriptions.Item>
        <Descriptions.Item label="总价格">
          ¥{order.totalPrice.toFixed(2)}
        </Descriptions.Item>
        <Descriptions.Item label="备注">{order.note || "无"}</Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 16 }}>
        <h3>套餐明细</h3>
        <Table
          columns={packageColumns}
          dataSource={packageData}
          pagination={false}
          summary={(pageData) => {
            let totalPrice = 0;
            pageData.forEach(({ subtotal }) => {
              totalPrice += subtotal;
            });

            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  总计
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <strong>¥{totalPrice.toFixed(2)}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>商品明细</h3>
        <Table
          columns={productColumns}
          dataSource={mergedProductData}
          pagination={false}
          summary={(pageData) => {
            let totalPrice = 0;
            pageData.forEach(({ subtotal }) => {
              totalPrice += subtotal;
            });

            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  总计
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <strong>¥{totalPrice.toFixed(2)}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </div>
    </Modal>
  );
};

export default OutboundDetail;
