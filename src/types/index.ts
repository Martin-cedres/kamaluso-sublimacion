export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparativePrice?: number;
  currency: string;
  category: string;
  images: string[];
  inStock: boolean;
  badge?: string;
  catalogVersion?: number;
  hasPromoKit?: boolean;
  variants?: {
    name: string;
    options: string[];
  }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions?: Record<string, string>;
}

export type OrderStatus = "pendiente" | "pago_confirmado" | "en_preparacion" | "despachado" | "cancelado";

export interface OrderCustomer {
  name: string;
  phone: string;
  email?: string;
  department: string;
  city: string;
  address: string;
}

export interface Order {
  id: string;
  createdAt: string;
  customer: OrderCustomer;
  items: CartItem[];
  totalPrice: number;
  finalTotal: number;
  paymentMethodId: string;
  paymentMethodName: string;
  shippingMethodName: string;
  status: OrderStatus;
}

