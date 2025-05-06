// Exportação de todos os componentes de e-commerce para facilitar a importação

// Seções de página
export { default as ProductCarousel } from './ProductCarousel';
export { default as TestimonialSection } from './TestimonialSection';
export { default as NewsletterSection } from './NewsletterSection';
export { default as StoreFooter } from './StoreFooter';
export { default as FeatureGrid } from './FeatureGrid';
export { default as PromotionalBanner } from './PromotionalBanner';
export { default as FeaturedCategories } from './FeaturedCategories';

// Componentes de checkout/pagamento
export { default as CheckoutPaypal } from './CheckoutPaypal';
export { default as PaymentSection } from './PaymentSection';

// Interfaces comuns
export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  salePrice?: string;
  images: string[];
  slug: string;
  categories?: Category[];
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
  inStock?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface Review {
  id: number;
  productId: number;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
}

export interface CartItem {
  id: number;
  productId: number;
  variantId?: number;
  quantity: number;
  product: Product;
  price: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}
