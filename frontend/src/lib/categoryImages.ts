const CATEGORY_IMAGE_FALLBACKS: Record<string, string> = {
  electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop&auto=format",
  mobiles: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop&auto=format",
  computers: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop&auto=format",
  fashion: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop&auto=format",
  "home-kitchen": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop&auto=format",
  books: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=200&fit=crop&auto=format",
  beauty: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop&auto=format",
  sports: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&auto=format",
  toys: "https://images.unsplash.com/photo-1566576912321-d58ddd7a2088?w=200&h=200&fit=crop&auto=format",
  appliances: "https://images.unsplash.com/photo-1626806819282-2c1dc7633fc8?w=200&h=200&fit=crop&auto=format",
};

const DEFAULT_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&auto=format";

export function getCategoryImage(slug: string, productImage?: string): string {
  if (productImage && !productImage.toLowerCase().includes("thumbnail")) {
    return productImage;
  }
  return CATEGORY_IMAGE_FALLBACKS[slug] ?? DEFAULT_CATEGORY_IMAGE;
}
