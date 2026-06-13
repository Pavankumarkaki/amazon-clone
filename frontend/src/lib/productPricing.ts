import type { ProductCard, ProductDetail } from "@/types";

export interface ProductPricing {
  currentCents: number;
  mrpCents: number;
  discountPercent: number;
  savingsCents: number;
  hasDeal: boolean;
}

function hashProductId(productId: string): number {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = productId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getProductPricing(product: ProductCard | ProductDetail): ProductPricing {
  const currentCents = product.price_cents;
  const mrpCents = product.mrp_cents ?? Math.round(currentCents / 0.85);
  const discountPercent =
    product.discount_percentage > 0
      ? product.discount_percentage
      : mrpCents > currentCents
        ? Math.round(((mrpCents - currentCents) / mrpCents) * 100)
        : 0;
  const savingsCents = Math.max(0, mrpCents - currentCents);
  const hasDeal = product.discount_percentage >= 15 || discountPercent >= 15;

  return {
    currentCents,
    mrpCents,
    discountPercent,
    savingsCents,
    hasDeal,
  };
}

export function getProductRating(product: ProductCard | ProductDetail): { rating: number; count: number } {
  if (product.rating > 0 || product.reviews_count > 0) {
    return { rating: Number(product.rating), count: product.reviews_count };
  }
  const hash = hashProductId(product.id);
  return {
    rating: 3.5 + (hash % 15) / 10,
    count: 500 + (hash % 9500),
  };
}

export function getStarDistribution(rating: number): { stars: number; percent: number }[] {
  const weights = [5, 4, 3, 2, 1].map((stars) => Math.max(0, 6 - Math.abs(stars - rating) * 2));
  const total = weights.reduce((sum, weight) => sum + weight, 0) || 1;

  return [5, 4, 3, 2, 1].map((stars, index) => ({
    stars,
    percent: Math.round((weights[index] / total) * 100),
  }));
}

export function getAboutBullets(product: ProductDetail): string[] {
  if (product.features?.length) {
    return product.features;
  }

  const sentences = product.description
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  return sentences.length > 0 ? sentences.slice(0, 6) : [product.description];
}

export function getProductBrand(product: ProductCard | ProductDetail): string {
  if ("specs" in product) {
    return product.brand || product.specs?.Brand || product.specs?.brand || product.category.name;
  }
  return product.brand || product.category.name;
}

export function getPurchaseCount(product: ProductCard | ProductDetail): string {
  const count = product.reviews_count || 500 + (hashProductId(product.id) % 9500);
  if (count >= 1000) {
    return `${Math.floor(count / 100) / 10}K+ bought in past month`;
  }
  return `${count}+ bought in past month`;
}

export function getEmiAmount(priceCents: number, months = 6): number {
  return Math.round(priceCents / months);
}
