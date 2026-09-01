export interface GlobalShippingSettings {
  defaultShippingFee: number;
  defaultDeliveryEstimate: string;
  thresholdEnabled: boolean;
  thresholdAmount: number;
  benefitType: 'free_shipping' | 'discount_fixed' | 'discount_percentage';
  benefitValue: number;
  qrDestinationUrl?: string;
}

export interface CartShippingItem {
  id: string;
  price: number;
  quantity: number;
  shippingType?: 'free' | 'fixed' | 'default' | null;
  shippingFee?: number;
}

export interface ShippingCalculationResult {
  baseShippingFee: number;
  finalShippingFee: number;
  isFreeShipping: boolean;
  thresholdReached: boolean;
  thresholdRemaining: number;
  thresholdProgress: number;
  appliedBenefit: {
    type: 'free_shipping' | 'discount_fixed' | 'discount_percentage';
    value: number; // For free shipping, this is the amount waived. For discount, it's the discount amount.
  } | null;
  hypeMessage: string;
}

/**
 * Centralized Order Shipping & Benefit Calculation
 * 
 * Mixed Cart Rule Documented:
 * 1. The base shipping fee for the order is calculated as the MAXIMUM shipping fee among all items in the cart.
 *    - If a product is 'free', its fee is 0.
 *    - If a product is 'fixed', its fee is its configured `shippingFee`.
 *    - If a product is 'default' (or unset), its fee is the `globalSettings.defaultShippingFee`.
 * 2. If the cart subtotal is >= `thresholdAmount` (and threshold is enabled), the threshold benefit is applied.
 *    - If benefit is 'free_shipping', the `finalShippingFee` becomes 0.
 *    - If benefit is 'discount_fixed' or 'discount_percentage', the shipping fee remains the base fee, 
 *      but `appliedBenefit` will contain the extra discount amount to be subtracted from the total.
 */
export function calculateOrderShipping(
  cartSubtotal: number,
  items: CartShippingItem[],
  globalSettings: GlobalShippingSettings | null
): ShippingCalculationResult {
  
  const defaultSettings: GlobalShippingSettings = {
    defaultShippingFee: 200,
    defaultDeliveryEstimate: "3-5 working days",
    thresholdEnabled: false,
    thresholdAmount: 10000,
    benefitType: 'free_shipping',
    benefitValue: 0
  };

  const settings = globalSettings || defaultSettings;

  // 1. Determine Base Shipping Fee (Maximum of all items)
  let baseShippingFee = 0;

  if (items.length > 0) {
    let maxFee = 0;
    for (const item of items) {
      let itemFee = settings.defaultShippingFee;
      
      if (item.shippingType === 'free') {
        itemFee = 0;
      } else if (item.shippingType === 'fixed' && item.shippingFee !== undefined) {
        itemFee = item.shippingFee;
      }
      
      if (itemFee > maxFee) {
        maxFee = itemFee;
      }
    }
    baseShippingFee = maxFee;
  }

  // 2. Evaluate Threshold Benefit
  let finalShippingFee = baseShippingFee;
  let isFreeShipping = baseShippingFee === 0;
  let thresholdReached = false;
  let thresholdRemaining = settings.thresholdAmount;
  let thresholdProgress = 0;
  let appliedBenefit: ShippingCalculationResult['appliedBenefit'] = null;
  let hypeMessage = "";

  if (settings.thresholdEnabled && settings.thresholdAmount > 0) {
    thresholdRemaining = Math.max(0, settings.thresholdAmount - cartSubtotal);
    thresholdProgress = Math.min(settings.thresholdAmount, cartSubtotal);
    thresholdReached = cartSubtotal >= settings.thresholdAmount;

    if (thresholdReached) {
      if (settings.benefitType === 'free_shipping') {
        finalShippingFee = 0;
        isFreeShipping = true;
        appliedBenefit = { type: 'free_shipping', value: baseShippingFee };
        hypeMessage = "🎉 You've unlocked FREE SHIPPING!";
      } else if (settings.benefitType === 'discount_fixed') {
        appliedBenefit = { type: 'discount_fixed', value: settings.benefitValue };
        hypeMessage = "🎉 You've unlocked your extra discount!";
      } else if (settings.benefitType === 'discount_percentage') {
        const discountVal = (cartSubtotal * settings.benefitValue) / 100;
        appliedBenefit = { type: 'discount_percentage', value: discountVal };
        hypeMessage = "🎉 You've unlocked your extra discount!";
      }
    } else {
      if (items.length > 0) {
        const benefitName = settings.benefitType === 'free_shipping' ? 'FREE SHIPPING' : 'an extra discount';
        hypeMessage = `Add Rs. ${thresholdRemaining.toLocaleString()} more to unlock ${benefitName}.`;
      }
    }
  } else {
    // If threshold disabled, hype message is empty
    hypeMessage = "";
  }

  return {
    baseShippingFee,
    finalShippingFee,
    isFreeShipping,
    thresholdReached,
    thresholdRemaining,
    thresholdProgress,
    appliedBenefit,
    hypeMessage
  };
}
