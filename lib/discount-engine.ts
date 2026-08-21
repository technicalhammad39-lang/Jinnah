export interface Discount {
  id: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  scope: 'product' | 'selected_products' | 'all_products';
  productIds?: string[];
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  createdAt: any;
  updatedAt: any;
}

export interface PricingSnapshot {
  originalPrice: number;
  discountType: 'percentage' | 'fixed' | null;
  discountValue: number;
  discountAmount: number;
  finalPrice: number;
  hasDiscount: boolean;
  appliedDiscountId?: string;
}

/**
 * Calculates the final price of a product by applying the best eligible discount.
 * Does not mutate original price.
 */
export function calculateProductPrice(
  productPrice: number, // Base price of the product
  productId: string,
  activeDiscounts: Discount[]
): PricingSnapshot {
  const now = new Date();
  
  // 1. Filter out inactive / expired / unstarted discounts
  const validDiscounts = activeDiscounts.filter(d => {
    if (!d.isActive) return false;
    if (d.startsAt && new Date(d.startsAt) > now) return false;
    if (d.endsAt && new Date(d.endsAt) < now) return false;
    return true;
  });

  // 2. Find eligible discounts for THIS product
  const eligibleDiscounts = validDiscounts.filter(d => {
    if (d.scope === 'all_products') return true;
    if (d.scope === 'product' || d.scope === 'selected_products') {
      return d.productIds?.includes(productId);
    }
    return false;
  });

  if (eligibleDiscounts.length === 0) {
    return {
      originalPrice: productPrice,
      discountType: null,
      discountValue: 0,
      discountAmount: 0,
      finalPrice: productPrice,
      hasDiscount: false,
    };
  }

  // 3. Priority resolution
  // Priority: 1. product, 2. selected_products, 3. all_products
  const getPriorityScore = (scope: string) => {
    if (scope === 'product') return 3;
    if (scope === 'selected_products') return 2;
    if (scope === 'all_products') return 1;
    return 0;
  };

  eligibleDiscounts.sort((a, b) => {
    const scoreA = getPriorityScore(a.scope);
    const scoreB = getPriorityScore(b.scope);
    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Higher score first
    }
    
    // If same scope priority, calculate which gives a better discount amount
    const amtA = calculateDiscountAmount(productPrice, a);
    const amtB = calculateDiscountAmount(productPrice, b);
    if (amtA !== amtB) {
       return amtB - amtA;
    }
    
    // If same discount amount, prefer newer
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  const selectedDiscount = eligibleDiscounts[0];
  let discountAmount = calculateDiscountAmount(productPrice, selectedDiscount);
  
  // Safeguards
  if (discountAmount > productPrice) {
    discountAmount = productPrice;
  }
  if (discountAmount < 0 || isNaN(discountAmount)) {
    discountAmount = 0;
  }

  const finalPrice = productPrice - discountAmount;

  return {
    originalPrice: productPrice,
    discountType: selectedDiscount.type,
    discountValue: selectedDiscount.value,
    discountAmount: Math.round(discountAmount),
    finalPrice: Math.round(finalPrice),
    hasDiscount: true,
    appliedDiscountId: selectedDiscount.id
  };
}

function calculateDiscountAmount(price: number, discount: Discount): number {
  if (discount.type === 'percentage') {
    const val = Math.min(Math.max(discount.value, 0), 100);
    return (price * val) / 100;
  } else if (discount.type === 'fixed') {
    return Math.max(discount.value, 0);
  }
  return 0;
}
