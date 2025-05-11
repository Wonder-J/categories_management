export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  brand: string;
  stock: number;
}

export interface Package {
  id: string;
  name: string;
  products: {
    productId: string;
    quantity: number;
  }[];
}

export interface OutboundOrder {
  id: string;
  packages: {
    packageId: string;
    quantity: number;
  }[];
  totalPrice: number;
  note: string;
  createdAt: string;
} 