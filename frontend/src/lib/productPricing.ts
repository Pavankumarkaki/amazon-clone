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

export function getProductPricing(productId: string, priceCents: number): ProductPricing {
  const hash = hashProductId(productId);
  const discountPercent = 10 + (hash % 21);
  const mrpCents = Math.round(priceCents / (1 - discountPercent / 100));
  const savingsCents = mrpCents - priceCents;
  const hasDeal = discountPercent >= 15;

  return {
    currentCents: priceCents,
    mrpCents,
    discountPercent,
    savingsCents,
    hasDeal,
  };
}

export function getPurchaseCount(productId: string): string {
  const hash = hashProductId(productId);
  const count = 500 + (hash % 9500);
  if (count >= 1000) {
    return `${Math.floor(count / 100) / 10}K+ bought in past month`;
  }
  return `${count}+ bought in past month`;
}

export function getEmiAmount(priceCents: number, months = 6): number {
  return Math.round(priceCents / months);
}
