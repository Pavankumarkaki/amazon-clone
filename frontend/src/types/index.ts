export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: string;
  url: string;
  sort_order: number;
}

export interface ProductCard {
  id: string;
  title: string;
  brand: string;
  price_cents: number;
  mrp_cents: number | null;
  discount_percentage: number;
  rating: number;
  reviews_count: number;
  currency: string;
  stock: number;
  category: Category;
  images: ProductImage[];
}

export interface ProductDetail extends ProductCard {
  description: string;
  specs: Record<string, string>;
  features: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface CartItem {
  id?: string;
  productId: string;
  title: string;
  priceCents: number;
  quantity: number;
  imageUrl?: string;
  currency?: string;
  stock?: number;
}

export interface ServerCartItem {
  id: string;
  product_id: string;
  title: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
  image_url?: string;
  stock: number;
  currency: string;
}

export interface ServerCart {
  id: string;
  items: ServerCartItem[];
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
}

export interface CartLineItem {
  product_id: string;
  title: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
  image_url?: string;
  stock: number;
}

export interface CartValidateResponse {
  items: CartLineItem[];
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
}

export interface ShippingAddress {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price_cents: number;
}

export interface Order {
  id: string;
  total_cents: number;
  status: string;
  shipping_address: ShippingAddress;
  created_at: string;
  items: OrderItem[];
}

export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  product: ProductCard;
}

export function serverCartToLocalItems(cart: ServerCart): CartItem[] {
  return cart.items.map((item) => ({
    id: item.id,
    productId: item.product_id,
    title: item.title,
    priceCents: item.unit_price_cents,
    quantity: item.quantity,
    imageUrl: item.image_url,
    currency: item.currency || "INR",
    stock: item.stock,
  }));
}
