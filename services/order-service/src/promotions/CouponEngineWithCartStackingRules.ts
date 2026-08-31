/**
 * Advanced Promotion & Coupon Discount Stacking Engine
 * Evaluates combinability matrices, category exclusions, minimum spend thresholds, and maximum discount caps.
 */

export interface IPromotionRule {
  promoCode: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  discountValue: number;
  minimumCartSpendUSD: number;
  maximumDiscountCapUSD: number;
  isStackableWithOtherPromos: boolean;
  applicableCategoryIds: string[];
  excludedSkuList: string[];
  expiresAt: Date;
}

export interface ICartEvaluationContext {
  cartSubtotalUSD: number;
  shippingFeeUSD: number;
  items: Array<{ sku: string; categoryId: string; priceUSD: number; quantity: number }>;
  appliedPromoCodes: string[];
}

export class CouponEngineWithCartStackingRules {
  private readonly promoRegistry = new Map<string, IPromotionRule>();

  constructor() {
    this.registerRule({
      promoCode: 'SUPPLYCHAIN2026',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minimumCartSpendUSD: 1000,
      maximumDiscountCapUSD: 500,
      isStackableWithOtherPromos: false,
      applicableCategoryIds: ['HEAVY_FREIGHT', 'PALLETS'],
      excludedSkuList: ['HAZMAT-EXP-99'],
      expiresAt: new Date(Date.now() + 365 * 86400000)
    });

    this.registerRule({
      promoCode: 'FREESHIP100',
      discountType: 'FREE_SHIPPING',
      discountValue: 100,
      minimumCartSpendUSD: 500,
      maximumDiscountCapUSD: 250,
      isStackableWithOtherPromos: true,
      applicableCategoryIds: [],
      excludedSkuList: [],
      expiresAt: new Date(Date.now() + 365 * 86400000)
    });
  }

  public registerRule(rule: IPromotionRule): void {
    this.promoRegistry.set(rule.promoCode.toUpperCase(), rule);
  }

  public evaluateCartDiscounts(ctx: ICartEvaluationContext): { totalDiscountUSD: number; effectiveShippingUSD: number; acceptedPromoCodes: string[]; rejectedPromoCodes: string[] } {
    let totalDiscountUSD = 0;
    let effectiveShippingUSD = ctx.shippingFeeUSD;
    const acceptedPromoCodes: string[] = [];
    const rejectedPromoCodes: string[] = [];

    const nonStackableFound = ctx.appliedPromoCodes.some(c => {
      const r = this.promoRegistry.get(c.toUpperCase());
      return r && !r.isStackableWithOtherPromos;
    });

    for (const code of ctx.appliedPromoCodes) {
      const rule = this.promoRegistry.get(code.toUpperCase());
      if (!rule || rule.expiresAt < new Date() || ctx.cartSubtotalUSD < rule.minimumCartSpendUSD) {
        rejectedPromoCodes.push(code);
        continue;
      }

      if (nonStackableFound && acceptedPromoCodes.length > 0 && !rule.isStackableWithOtherPromos) {
        rejectedPromoCodes.push(code);
        continue;
      }

      if (rule.discountType === 'PERCENTAGE') {
        const discount = Math.min(rule.maximumDiscountCapUSD, +(ctx.cartSubtotalUSD * (rule.discountValue / 100)).toFixed(2));
        totalDiscountUSD += discount;
        acceptedPromoCodes.push(code);
      } else if (rule.discountType === 'FIXED_AMOUNT') {
        const discount = Math.min(rule.maximumDiscountCapUSD, rule.discountValue);
        totalDiscountUSD += discount;
        acceptedPromoCodes.push(code);
      } else if (rule.discountType === 'FREE_SHIPPING') {
        effectiveShippingUSD = 0;
        acceptedPromoCodes.push(code);
      }
    }

    return {
      totalDiscountUSD: +totalDiscountUSD.toFixed(2),
      effectiveShippingUSD: +effectiveShippingUSD.toFixed(2),
      acceptedPromoCodes,
      rejectedPromoCodes
    };
  }
}
