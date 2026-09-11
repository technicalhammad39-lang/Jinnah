import { Product, ProductVariant } from "@/data/products";

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface StockInfo {
  stock: number;
  status: StockStatus;
  label: string;
  badgeClass: string;
  isAvailable: boolean;
  threshold: number;
  isVariant: boolean;
  matchedVariant: ProductVariant | null;
}

/**
 * Extracts a normalized numeric stock value for a variant.
 */
export function getVariantStock(variant: ProductVariant | any): number {
  if (!variant) return 0;
  const raw = variant.stockQuantity ?? variant.stock ?? variant.quantity;
  const num = typeof raw === "number" ? raw : Number(raw || 0);
  return isNaN(num) ? 0 : Math.max(0, Math.floor(num));
}

/**
 * Finds a specific variant matching the customer's selected color and size.
 * If both color and size are specified, finds the exact variant.
 * If only one is specified, prefers an in-stock variant if available.
 */
export function findMatchingVariant(
  product: Product,
  selectedColor?: string | null,
  selectedSize?: string | null
): ProductVariant | null {
  if (!product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
    return null;
  }

  const cleanColor = selectedColor?.trim().toLowerCase();
  const cleanSize = selectedSize?.trim().toLowerCase();

  // 1. Exact match on both color and size (for detail view variant evaluation)
  if (cleanColor && cleanSize) {
    const exact = product.variants.find((v) => {
      const vColor = v.color?.trim().toLowerCase();
      const vSize = v.size?.trim().toLowerCase();
      return vColor === cleanColor && vSize === cleanSize;
    });
    if (exact) return exact;
  }

  // 2. If only color provided, match on color (prefer in-stock variant)
  if (cleanColor && !cleanSize) {
    const colorMatches = product.variants.filter((v) => {
      const vColor = v.color?.trim().toLowerCase();
      return vColor === cleanColor;
    });
    if (colorMatches.length > 0) {
      const inStock = colorMatches.find((v) => getVariantStock(v) > 0);
      return inStock || colorMatches[0];
    }
  }

  // 3. If only size provided, match on size (prefer in-stock variant)
  if (cleanSize && !cleanColor) {
    const sizeMatches = product.variants.filter((v) => {
      const vSize = v.size?.trim().toLowerCase();
      return vSize === cleanSize;
    });
    if (sizeMatches.length > 0) {
      const inStock = sizeMatches.find((v) => getVariantStock(v) > 0);
      return inStock || sizeMatches[0];
    }
  }

  return null;
}

/**
 * Calculates the total available stock for a product, factoring in variant sums if variants exist.
 */
export function calculateTotalStock(product: Product): number {
  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + getVariantStock(v), 0);
  }
  const raw = product.stockQuantity ?? (product as any).stock ?? (product as any).quantity;
  const num = typeof raw === "number" ? raw : Number(raw || 0);
  return isNaN(num) ? 0 : Math.max(0, Math.floor(num));
}

/**
 * Resolves overall stock status for product cards and search listings.
 * A product card is ONLY marked 'out_of_stock' if ALL variants are out of stock.
 * As long as at least one variant is available, the card remains in stock.
 */
export function getProductCardStock(
  product: Product | null | undefined,
  thresholdOverride?: number
): StockInfo {
  if (!product) {
    return {
      stock: 0,
      status: "out_of_stock",
      label: "OUT OF STOCK",
      badgeClass: "bg-red-500/10 text-red-600 border border-red-200",
      isAvailable: false,
      threshold: DEFAULT_LOW_STOCK_THRESHOLD,
      isVariant: false,
      matchedVariant: null,
    };
  }

  const threshold =
    thresholdOverride !== undefined
      ? thresholdOverride
      : typeof product.lowStockThreshold === "number"
      ? product.lowStockThreshold
      : DEFAULT_LOW_STOCK_THRESHOLD;

  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    const totalVariantStock = calculateTotalStock(product);
    const hasAnyInStock = product.variants.some((v) => getVariantStock(v) > 0);

    // Card shows OUT OF STOCK only when ALL variants are finished
    if (!hasAnyInStock || totalVariantStock <= 0) {
      return {
        stock: 0,
        status: "out_of_stock",
        label: "OUT OF STOCK",
        badgeClass: "bg-red-500/10 text-red-600 border border-red-200",
        isAvailable: false,
        threshold,
        isVariant: false,
        matchedVariant: null,
      };
    }

    // Card shows LOW STOCK only when overall remaining inventory across all variants is low
    if (totalVariantStock <= threshold) {
      return {
        stock: totalVariantStock,
        status: "low_stock",
        label: `Only ${totalVariantStock} Left`,
        badgeClass: "bg-amber-500/10 text-amber-600 border border-amber-200",
        isAvailable: true,
        threshold,
        isVariant: false,
        matchedVariant: null,
      };
    }

    return {
      stock: totalVariantStock,
      status: "in_stock",
      label: "IN STOCK",
      badgeClass: "bg-emerald-500/10 text-emerald-600 border border-emerald-200",
      isAvailable: true,
      threshold,
      isVariant: false,
      matchedVariant: null,
    };
  }

  // Standard product without variants
  const stock = calculateTotalStock(product);

  if (stock <= 0) {
    return {
      stock: 0,
      status: "out_of_stock",
      label: "OUT OF STOCK",
      badgeClass: "bg-red-500/10 text-red-600 border border-red-200",
      isAvailable: false,
      threshold,
      isVariant: false,
      matchedVariant: null,
    };
  }

  if (stock <= threshold) {
    return {
      stock,
      status: "low_stock",
      label: `Only ${stock} Left`,
      badgeClass: "bg-amber-500/10 text-amber-600 border border-amber-200",
      isAvailable: true,
      threshold,
      isVariant: false,
      matchedVariant: null,
    };
  }

  return {
    stock,
    status: "in_stock",
    label: "IN STOCK",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border border-emerald-200",
    isAvailable: true,
    threshold,
    isVariant: false,
    matchedVariant: null,
  };
}

/**
 * Comprehensive stock resolution engine.
 * Resolves stock quantity, low-stock alerts, and out-of-stock states for products and specific variants.
 */
export function getStockInfo(
  product: Product | null | undefined,
  selectedColor?: string | null,
  selectedSize?: string | null,
  thresholdOverride?: number
): StockInfo {
  if (!product) {
    return {
      stock: 0,
      status: "out_of_stock",
      label: "OUT OF STOCK",
      badgeClass: "bg-red-500/10 text-red-600 border border-red-200",
      isAvailable: false,
      threshold: DEFAULT_LOW_STOCK_THRESHOLD,
      isVariant: false,
      matchedVariant: null,
    };
  }

  // If neither color nor size is specified, evaluate overall product availability
  if (!selectedColor && !selectedSize) {
    return getProductCardStock(product, thresholdOverride);
  }

  const threshold =
    thresholdOverride !== undefined
      ? thresholdOverride
      : typeof product.lowStockThreshold === "number"
      ? product.lowStockThreshold
      : DEFAULT_LOW_STOCK_THRESHOLD;

  const matchedVariant = findMatchingVariant(product, selectedColor, selectedSize);

  let stock: number;
  let isVariant = false;

  if (matchedVariant) {
    stock = getVariantStock(matchedVariant);
    isVariant = true;
  } else if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    // If variants exist but no specific selection matches, check total stock
    stock = calculateTotalStock(product);
  } else {
    // Standard product stock
    stock = calculateTotalStock(product);
  }

  // Ensure non-negative in memory calculations
  stock = Math.max(0, Math.floor(stock));

  if (stock <= 0) {
    return {
      stock: 0,
      status: "out_of_stock",
      label: "OUT OF STOCK",
      badgeClass: "bg-red-500/10 text-red-600 border border-red-200",
      isAvailable: false,
      threshold,
      isVariant,
      matchedVariant,
    };
  }

  if (stock <= threshold) {
    return {
      stock,
      status: "low_stock",
      label: `Only ${stock} Left`,
      badgeClass: "bg-amber-500/10 text-amber-600 border border-amber-200",
      isAvailable: true,
      threshold,
      isVariant,
      matchedVariant,
    };
  }

  return {
    stock,
    status: "in_stock",
    label: "IN STOCK",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border border-emerald-200",
    isAvailable: true,
    threshold,
    isVariant,
    matchedVariant,
  };
}
