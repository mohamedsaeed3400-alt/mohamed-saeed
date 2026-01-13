
export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATIONS = 'OPERATIONS',
  PACKAGING = 'PACKAGING',
  SUPPORT = 'SUPPORT',
  BRAND_OWNER = 'BRAND_OWNER'
}

export enum OrderStatus {
  NEW = 'NEW',
  PACKAGING = 'PACKAGING',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
  EXCHANGE = 'EXCHANGE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  brandId?: string;
  active: boolean;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
  revenue: number;
  orderCount: number;
}

export interface Product {
  id: string;
  brandId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export interface Order {
  id: string;
  brandId: string;
  customerName: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: string[];
  carrier?: string;
  tracking?: string;
}

export interface DashboardStats {
  totalOrders: number;
  pendingPackaging: number;
  shippedToday: number;
  revenue: number;
}
