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
 * Finds a specific variant matching the customer's selected color and size.
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

  return (
    product.variants.find((v) => {
      const vColor = v.color?.trim().toLowerCase();
      const vSize = v.size?.trim().toLowerCase();

      if (cleanColor && cleanSize) {
        return vColor === cleanColor && vSize === cleanSize;
      }
      if (cleanColor && !cleanSize) {
        return vColor === cleanColor;
      }
      if (!cleanColor && cleanSize) {
        return vSize === cleanSize;
      }
      return false;
    }) || null
  );
}

/**
 * Calculates the total available stock for a product, factoring in variant sums if variants exist.
 */
export function calculateTotalStock(product: Product): number {
  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0);
  }
  return typeof product.stockQuantity === "number" ? product.stockQuantity : Number(product.stockQuantity || 0);
}

/**
 * Comprehensive stock resolution engine.
 * Resolves stock quantity, low-stock alerts, and out-of-stock states for products and variants.
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
      label: "Out of Stock",
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

  const matchedVariant = findMatchingVariant(product, selectedColor, selectedSize);

  let stock: number;
  let isVariant = false;

  if (matchedVariant) {
    stock = typeof matchedVariant.stockQuantity === "number" ? matchedVariant.stockQuantity : Number(matchedVariant.stockQuantity || 0);
    isVariant = true;
  } else if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    // If variants exist but no specific selection matches yet, use total variant sum
    stock = calculateTotalStock(product);
  } else {
    // Standard product stock
    stock = typeof product.stockQuantity === "number" ? product.stockQuantity : Number(product.stockQuantity || 0);
  }

  // Ensure non-negative in memory calculations
  stock = Math.max(0, Math.floor(stock));

  if (stock <= 0) {
    return {
      stock: 0,
      status: "out_of_stock",
      label: "Out of Stock",
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
    label: `In Stock (${stock})`,
    badgeClass: "bg-emerald-500/10 text-emerald-600 border border-emerald-200",
    isAvailable: true,
    threshold,
    isVariant,
    matchedVariant,
  };
}
