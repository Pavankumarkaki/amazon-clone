import { useMemo } from "react";
import { useProducts } from "@/hooks/useProducts";

export function useCategoryImages() {
  const { data } = useProducts({ page_size: 100 });

  return useMemo(() => {
    const images: Record<string, string> = {};

    for (const product of data?.items ?? []) {
      const slug = product.category.slug;
      const imageUrl = product.images.find(
        (image) => !image.url.toLowerCase().includes("thumbnail"),
      )?.url;

      if (!images[slug] && imageUrl) {
        images[slug] = imageUrl;
      }
    }

    return images;
  }, [data]);
}
