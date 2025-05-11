import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, message } from "antd";
import { Product } from "../../types";
import { addProduct, updateProduct } from "../../utils/storage";

interface ProductFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  initialValues: Product | null;
}

const ProductForm: React.FC<ProductFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!initialValues;

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditing && initialValues) {
        updateProduct({ ...values, id: initialValues.id });
        message.success("商品更新成功");
      } else {
        addProduct(values);
        message.success("商品添加成功");
      }

      form.resetFields();
      onSubmit();
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  return (
    <Modal
      title={isEditing ? "编辑商品" : "添加商品"}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText={isEditing ? "更新" : "添加"}
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ stock: 0, price: 0 }}
      >
        <Form.Item
          name="name"
          label="商品名称"
          rules={[{ required: true, message: "请输入商品名称" }]}
        >
          <Input placeholder="请输入商品名称" />
        </Form.Item>

        <Form.Item
          name="price"
          label="价格"
          rules={[{ required: true, message: "请输入价格" }]}
        >
          <InputNumber
            min={0}
            precision={2}
            style={{ width: "100%" }}
            placeholder="请输入价格"
            addonBefore="¥"
          />
        </Form.Item>

        <Form.Item
          name="brand"
          label="品牌"
          rules={[{ required: true, message: "请输入品牌" }]}
        >
          <Input placeholder="请输入品牌" />
        </Form.Item>

        <Form.Item
          name="stock"
          label="库存"
          rules={[{ required: true, message: "请输入库存" }]}
        >
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            placeholder="请输入库存"
          />
        </Form.Item>

        <Form.Item
          name="image"
          label="商品图片URL"
          rules={[{ required: true, message: "请输入商品图片URL" }]}
        >
          <Input placeholder="请输入商品图片URL" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductForm;
