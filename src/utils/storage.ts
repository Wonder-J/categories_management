import { Product, Package, OutboundOrder } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Initialize default data if not exists
export const initializeStorage = () => {
  if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify([]));
  }
  if (!localStorage.getItem('packages')) {
    localStorage.setItem('packages', JSON.stringify([]));
  }
  if (!localStorage.getItem('outboundOrders')) {
    localStorage.setItem('outboundOrders', JSON.stringify([]));
  }
};

// Products
export const getProducts = (): Product[] => {
  const products = localStorage.getItem('products');
  return products ? JSON.parse(products) : [];
};

export const addProduct = (product: Omit<Product, 'id'>): Product => {
  const newProduct = { ...product, id: uuidv4() };
  const products = getProducts();
  localStorage.setItem('products', JSON.stringify([...products, newProduct]));
  return newProduct;
};

export const updateProduct = (product: Product): void => {
  const products = getProducts();
  const updatedProducts = products.map(p => p.id === product.id ? product : p);
  localStorage.setItem('products', JSON.stringify(updatedProducts));
};

export const deleteProduct = (id: string): void => {
  const products = getProducts();
  const filteredProducts = products.filter(p => p.id !== id);
  localStorage.setItem('products', JSON.stringify(filteredProducts));
};

// Packages
export const getPackages = (): Package[] => {
  const packages = localStorage.getItem('packages');
  return packages ? JSON.parse(packages) : [];
};

export const addPackage = (pkg: Omit<Package, 'id'>): Package => {
  const newPackage = { ...pkg, id: uuidv4() };
  const packages = getPackages();
  localStorage.setItem('packages', JSON.stringify([...packages, newPackage]));
  return newPackage;
};

export const updatePackage = (pkg: Package): void => {
  const packages = getPackages();
  const updatedPackages = packages.map(p => p.id === pkg.id ? pkg : p);
  localStorage.setItem('packages', JSON.stringify(updatedPackages));
};

export const deletePackage = (id: string): void => {
  const packages = getPackages();
  const filteredPackages = packages.filter(p => p.id !== id);
  localStorage.setItem('packages', JSON.stringify(filteredPackages));
};

// Outbound Orders
export const getOutboundOrders = (): OutboundOrder[] => {
  const orders = localStorage.getItem('outboundOrders');
  return orders ? JSON.parse(orders) : [];
};

export const addOutboundOrder = (order: Omit<OutboundOrder, 'id' | 'createdAt'>): OutboundOrder => {
  const newOrder = { 
    ...order, 
    id: uuidv4(), 
    createdAt: new Date().toISOString() 
  };
  const orders = getOutboundOrders();
  localStorage.setItem('outboundOrders', JSON.stringify([...orders, newOrder]));
  return newOrder;
};

export const updateOutboundOrder = (order: OutboundOrder): void => {
  const orders = getOutboundOrders();
  const updatedOrders = orders.map(o => o.id === order.id ? order : o);
  localStorage.setItem('outboundOrders', JSON.stringify(updatedOrders));
};

export const deleteOutboundOrder = (id: string): void => {
  const orders = getOutboundOrders();
  const filteredOrders = orders.filter(o => o.id !== id);
  localStorage.setItem('outboundOrders', JSON.stringify(filteredOrders));
}; 