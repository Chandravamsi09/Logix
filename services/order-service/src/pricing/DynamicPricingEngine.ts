/**
 * Dynamic Pricing, Tiered Discounts, and Freight Surcharge Calculation Engine
 */

export interface IPricingContext {
  orderId: string;
  tenantId: string;
  customerTier: 'STANDARD' | 'SILVER' | 'GOLD' | 'PLATINUM';
  items: Array<{
    sku: string;
    unitPriceUSD: number;
    quantity: number;
    weightKg: number;
    volumeM3: number;
  }>;
  shippingOriginZip: string;
  shippingDestZip: string;
  requestedServiceLevel: 'STANDARD' | 'EXPRESS' | 'OVERNIGHT';
  appliedPromoCodes: string[];
}

export interface IPricingResult {
  baseItemsSubtotal: number;
  volumeDiscountAmount: number;
  tierDiscountAmount: number;
  promoDiscountAmount: number;
  freightSurchargeAmount: number;
  fuelSurchargeAmount: number;
  estimatedTaxAmount: number;
  finalTotalAmount: number;
  currency: string;
}

export class DynamicPricingEngine {
  public calculateOrderPricing(ctx: IPricingContext): IPricingResult {
    let baseItemsSubtotal = 0;
    let totalWeightKg = 0;

    ctx.items.forEach(item => {
      baseItemsSubtotal += item.unitPriceUSD * item.quantity;
      totalWeightKg += item.weightKg * item.quantity;
    });

    // Tier Discounts
    let tierDiscountPct = 0;
    if (ctx.customerTier === 'PLATINUM') tierDiscountPct = 0.15;
    else if (ctx.customerTier === 'GOLD') tierDiscountPct = 0.10;
    else if (ctx.customerTier === 'SILVER') tierDiscountPct = 0.05;

    const tierDiscountAmount = +(baseItemsSubtotal * tierDiscountPct).toFixed(2);

    // Volume Discounts
    let volumeDiscountAmount = 0;
    if (baseItemsSubtotal > 10000) volumeDiscountAmount = +(baseItemsSubtotal * 0.08).toFixed(2);
    else if (baseItemsSubtotal > 5000) volumeDiscountAmount = +(baseItemsSubtotal * 0.04).toFixed(2);

    // Freight & Service Level
    let freightMultiplier = 1.0;
    if (ctx.requestedServiceLevel === 'OVERNIGHT') freightMultiplier = 2.5;
    else if (ctx.requestedServiceLevel === 'EXPRESS') freightMultiplier = 1.6;

    const freightSurchargeAmount = +(totalWeightKg * 2.85 * freightMultiplier).toFixed(2);
    const fuelSurchargeAmount = +(freightSurchargeAmount * 0.12).toFixed(2);

    const taxableAmount = Math.max(0, baseItemsSubtotal - tierDiscountAmount - volumeDiscountAmount);
    const estimatedTaxAmount = +(taxableAmount * 0.0825).toFixed(2); // 8.25% average tax

    const finalTotalAmount = +(taxableAmount + freightSurchargeAmount + fuelSurchargeAmount + estimatedTaxAmount).toFixed(2);

    return {
      baseItemsSubtotal,
      volumeDiscountAmount,
      tierDiscountAmount,
      promoDiscountAmount: 0,
      freightSurchargeAmount,
      fuelSurchargeAmount,
      estimatedTaxAmount,
      finalTotalAmount,
      currency: 'USD'
    };
  }
}
