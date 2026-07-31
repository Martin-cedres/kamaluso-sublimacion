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
