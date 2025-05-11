import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Space,
  message,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { OutboundOrder, Package, Product } from "../../types";
import {
  addOutboundOrder,
  updateOutboundOrder,
  updateProduct,
} from "../../utils/storage";
import { calculatePackagePrice } from "../../utils/priceCalculator";

interface OutboundFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  initialValues: OutboundOrder | null;
  packages: Package[];
  products: Product[];
}

const OutboundForm: React.FC<OutboundFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  packages,
  products,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!initialValues;
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          packages: initialValues.packages.map((p) => ({
            packageId: p.packageId,
            quantity: p.quantity,
          })),
        });
        setSelectedPackages(initialValues.packages.map((p) => p.packageId));
        setTotalPrice(initialValues.totalPrice);
      } else {
        form.resetFields();
        form.setFieldsValue({ packages: [{}] });
        setSelectedPackages([]);
        setTotalPrice(0);
      }
    }
  }, [visible, initialValues, form]);

  // Calculate the price of a package with quantity
  const calculatePackageTotalPrice = (
    packageId: string,
    quantity: number
  ): number => {
    const pkg = packages.find((p) => p.id === packageId);
    if (!pkg) return 0;

    return calculatePackagePrice(pkg, products) * quantity;
  };

  // Update total price when form values change
  const updateTotalPrice = () => {
    const formValues = form.getFieldValue("packages") || [];
    let total = 0;

    formValues.forEach((item: any) => {
      if (item && item.packageId && item.quantity) {
        total += calculatePackageTotalPrice(item.packageId, item.quantity);
      }
    });

    setTotalPrice(total);
  };

  // Update stock for products
  const updateProductStock = (
    orderedPackages: { packageId: string; quantity: number }[],
    oldOrderedPackages?: { packageId: string; quantity: number }[]
  ) => {
    // Create a map to track stock changes
    const stockChanges: Record<string, number> = {};

    // Process old order packages (add back stock)
    if (oldOrderedPackages) {
      oldOrderedPackages.forEach((orderPkg) => {
        const pkg = packages.find((p) => p.id === orderPkg.packageId);
        if (pkg) {
          pkg.products.forEach((pkgProduct) => {
            const stockChange = pkgProduct.quantity * orderPkg.quantity;
            stockChanges[pkgProduct.productId] =
              (stockChanges[pkgProduct.productId] || 0) + stockChange;
          });
        }
      });
    }

    // Process new order packages (reduce stock)
    orderedPackages.forEach((orderPkg) => {
      const pkg = packages.find((p) => p.id === orderPkg.packageId);
      if (pkg) {
        pkg.products.forEach((pkgProduct) => {
          const stockChange = -pkgProduct.quantity * orderPkg.quantity;
          stockChanges[pkgProduct.productId] =
            (stockChanges[pkgProduct.productId] || 0) + stockChange;
        });
      }
    });

    // Apply stock changes to products
    Object.entries(stockChanges).forEach(([productId, change]) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        const newStock = product.stock + change;
        updateProduct({ ...product, stock: newStock });
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Calculate the total price
      let total = 0;
      values.packages.forEach((item: any) => {
        total += calculatePackageTotalPrice(item.packageId, item.quantity);
      });

      if (isEditing && initialValues) {
        // Update product stock
        updateProductStock(values.packages, initialValues.packages);

        // Update order
        updateOutboundOrder({
          ...values,
          id: initialValues.id,
          totalPrice: total,
          createdAt: initialValues.createdAt,
        });
        message.success("出库单更新成功");
      } else {
        // Update product stock
        updateProductStock(values.packages);

        // Add new order
        addOutboundOrder({
          ...values,
          totalPrice: total,
        });
        message.success("出库单创建成功");
      }

      form.resetFields();
      onSubmit();
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  // Filter out already selected packages
  const getAvailablePackages = (fieldName: number) => {
    const formPackages = form.getFieldValue("packages") || [];
    const currentFieldValue = formPackages[fieldName]?.packageId;

    return packages.filter((pkg) => {
      if (pkg.id === currentFieldValue) return true;
      return !selectedPackages.includes(pkg.id);
    });
  };

  // Update selected packages when form values change
  const updateSelectedPackagesFromForm = () => {
    const formPackages = form.getFieldValue("packages") || [];
    const packageIds = formPackages
      .filter((p: any) => p && p.packageId)
      .map((p: any) => p.packageId);
    setSelectedPackages(packageIds);
    updateTotalPrice();
  };

  return (
    <Modal
      title={isEditing ? "编辑出库单" : "新建出库单"}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText={isEditing ? "更新" : "创建"}
      cancelText="取消"
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={updateSelectedPackagesFromForm}
      >
        <Form.List name="packages">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Space
                  key={field.key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...field}
                    name={[field.name, "packageId"]}
                    rules={[{ required: true, message: "请选择套餐" }]}
                    style={{ width: 300 }}
                  >
                    <Select
                      placeholder="选择套餐"
                      onChange={updateSelectedPackagesFromForm}
                    >
                      {getAvailablePackages(field.name).map((pkg) => (
                        <Select.Option key={pkg.id} value={pkg.id}>
                          {pkg.name} (¥
                          {calculatePackagePrice(pkg, products).toFixed(2)})
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, "quantity"]}
                    rules={[{ required: true, message: "请输入数量" }]}
                    initialValue={1}
                  >
                    <InputNumber
                      min={1}
                      placeholder="数量"
                      onChange={updateTotalPrice}
                    />
                  </Form.Item>
                  <MinusCircleOutlined
                    onClick={() => {
                      remove(field.name);
                      updateSelectedPackagesFromForm();
                    }}
                  />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  disabled={selectedPackages.length >= packages.length}
                >
                  添加套餐
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <div style={{ margin: "16px 0", fontWeight: "bold" }}>
          总价: ¥{totalPrice.toFixed(2)}
        </div>

        <Form.Item name="note" label="备注">
          <Input.TextArea rows={4} placeholder="请输入备注信息" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OutboundForm;
