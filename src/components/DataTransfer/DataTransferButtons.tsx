import React, { useRef, useState } from "react";
import { Button, message, Space } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import { exportData, importData } from "../../utils/dataTransfer";

interface DataTransferButtonsProps {
  onImportSuccess?: () => void;
}

const DataTransferButtons: React.FC<DataTransferButtonsProps> = ({
  onImportSuccess,
}) => {
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      exportData();
      message.success("数据导出成功");
    } catch (error) {
      message.error("数据导出失败");
      console.error(error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleImport = async (file: File) => {
    setImportLoading(true);
    try {
      await importData(file);
      message.success("数据导入成功，即将刷新页面");

      // Call the success callback if provided
      if (onImportSuccess) {
        onImportSuccess();
      }

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      message.error("数据导入失败");
      console.error(error);
    } finally {
      setImportLoading(false);
    }

    // Return false to prevent Upload from automatically uploading
    return false;
  };

  const showImportConfirm = () => {
    modal.confirm({
      title: "确认导入数据",
      content: "导入数据将覆盖当前所有数据，确定要继续吗？",
      okText: "确认",
      cancelText: "取消",
      onOk() {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      },
    });
  };

  return (
    <Space>
      <Button
        type="primary"
        icon={<DownloadOutlined />}
        onClick={handleExport}
        loading={exportLoading}
      >
        导出数据
      </Button>
      <Button
        icon={<UploadOutlined />}
        onClick={showImportConfirm}
        loading={importLoading}
      >
        导入数据
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImport(file);
          }
          // Reset the input so the same file can be selected again
          e.target.value = "";
        }}
      />
      {contextHolder}
    </Space>
  );
};

export default DataTransferButtons;
