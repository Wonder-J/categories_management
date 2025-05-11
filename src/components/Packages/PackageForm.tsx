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
import { Package, Product } from "../../types";
import { addPackage, updatePackage } from "../../utils/storage";
import { calculateFormPackagePrice } from "../../utils/priceCalculator";

interface PackageFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  initialValues: Package | null;
  products: Product[];
}

const PackageForm: React.FC<PackageFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  products,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!initialValues;
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        const formattedValues = {
          ...initialValues,
          products: initialValues.products.map((p) => ({
            productId: p.productId,
            quantity: p.quantity,
          })),
        };
        form.setFieldsValue(formattedValues);
        setSelectedProducts(initialValues.products.map((p) => p.productId));
        setTotalPrice(
          calculateFormPackagePrice(formattedValues.products, products)
        );
      } else {
        form.resetFields();
        setSelectedProducts([]);
        setTotalPrice(0);
      }
    }
  }, [visible, initialValues, form, products]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditing && initialValues) {
        updatePackage({ ...values, id: initialValues.id });
        message.success("套餐更新成功");
      } else {
        addPackage(values);
        message.success("套餐添加成功");
      }

      form.resetFields();
      onSubmit();
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  // Filter out already selected products
  const getAvailableProducts = (fieldName: number) => {
    const currentProducts = form.getFieldValue("products") || [];
    const currentFieldValue = currentProducts[fieldName]?.productId;

    return products.filter((product) => {
      if (product.id === currentFieldValue) return true;
      return !selectedProducts.includes(product.id);
    });
  };

  // Update selected products when form values change
  const updateSelectedProductsFromForm = () => {
    const formProducts = form.getFieldValue("products") || [];
    const productIds = formProducts
      .filter((p: any) => p && p.productId)
      .map((p: any) => p.productId);
    setSelectedProducts(productIds);
    setTotalPrice(calculateFormPackagePrice(formProducts, products));
  };

  return (
    <Modal
      title={isEditing ? "编辑套餐" : "添加套餐"}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText={isEditing ? "更新" : "添加"}
      cancelText="取消"
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={updateSelectedProductsFromForm}
      >
        <Form.Item
          name="name"
          label="套餐名称"
          rules={[{ required: true, message: "请输入套餐名称" }]}
        >
          <Input placeholder="请输入套餐名称" />
        </Form.Item>

        <Form.List name="products">
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
                    name={[field.name, "productId"]}
                    rules={[{ required: true, message: "请选择商品" }]}
                    style={{ width: 300 }}
                  >
                    <Select
                      placeholder="选择商品"
                      onChange={updateSelectedProductsFromForm}
                    >
                      {getAvailableProducts(field.name).map((product) => (
                        <Select.Option key={product.id} value={product.id}>
                          {product.name} (¥{product.price.toFixed(2)})
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
                      onChange={updateSelectedProductsFromForm}
                    />
                  </Form.Item>
                  <MinusCircleOutlined
                    onClick={() => {
                      remove(field.name);
                      updateSelectedProductsFromForm();
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
                  disabled={selectedProducts.length >= products.length}
                >
                  添加商品
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <div style={{ margin: "16px 0", fontWeight: "bold" }}>
          套餐总价: ¥{totalPrice.toFixed(2)}
        </div>
      </Form>
    </Modal>
  );
};

export default PackageForm;
