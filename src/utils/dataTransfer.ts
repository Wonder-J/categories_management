import { getProducts, getPackages, getOutboundOrders } from './storage';

interface StorageData {
  products: any[];
  packages: any[];
  outboundOrders: any[];
  exportDate: string;
}

// Export data to JSON file
export const exportData = (): void => {
  try {
    const data: StorageData = {
      products: getProducts(),
      packages: getPackages(),
      outboundOrders: getOutboundOrders(),
      exportDate: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and trigger it
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `inventory-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('导出数据失败');
  }
};

// Import data from JSON file
export const importData = (file: File): Promise<StorageData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (event.target?.result) {
          const data = JSON.parse(event.target.result as string) as StorageData;
          
          // Validate data structure
          if (!data.products || !data.packages || !data.outboundOrders) {
            throw new Error('无效的数据格式');
          }
          
          // Store data in localStorage
          localStorage.setItem('products', JSON.stringify(data.products));
          localStorage.setItem('packages', JSON.stringify(data.packages));
          localStorage.setItem('outboundOrders', JSON.stringify(data.outboundOrders));
          
          resolve(data);
        } else {
          reject(new Error('读取文件失败'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('读取文件失败'));
    };
    
    reader.readAsText(file);
  });
}; 