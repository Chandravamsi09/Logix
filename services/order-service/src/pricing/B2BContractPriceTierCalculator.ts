/**
 * B2B Volume Tiered Pricing & Master Customer Contract Engine
 * Evaluates custom contracted rates, volume thresholds, and dynamic margin protection constraints.
 */

export interface IContractPricingRule {
  contractId: string;
  customerId: string;
  sku: string;
  baseContractPriceUSD: number;
  minimumOrderQuantity: number;
  tier1DiscountThreshold: number;
  tier1DiscountPct: number;
  tier2DiscountThreshold: number;
  tier2DiscountPct: number;
  minimumMarginProtectionPct: number;
}

export class B2BContractPriceTierCalculator {
  private readonly rules = new Map<string, IContractPricingRule>();

  public registerPricingRule(rule: IContractPricingRule): void {
    const key = `${rule.customerId}_${rule.sku}`;
    this.rules.set(key, rule);
  }

  public calculateFinalTierPrice(
    customerId: string,
    sku: string,
    quantity: number,
    baseCostOfGoodsUSD: number
  ): { finalUnitPriceUSD: number; totalExtendedPriceUSD: number; appliedDiscountPct: number; marginPct: number } {
    const key = `${customerId}_${sku}`;
    const rule = this.rules.get(key) || {
      contractId: 'STANDARD_COMMERCIAL',
      customerId,
      sku,
      baseContractPriceUSD: baseCostOfGoodsUSD * 1.35,
      minimumOrderQuantity: 1,
      tier1DiscountThreshold: 50,
      tier1DiscountPct: 5.0,
      tier2DiscountThreshold: 200,
      tier2DiscountPct: 12.0,
      minimumMarginProtectionPct: 15.0
    };

    let discountPct = 0;
    if (quantity >= rule.tier2DiscountThreshold) {
      discountPct = rule.tier2DiscountPct;
    } else if (quantity >= rule.tier1DiscountThreshold) {
      discountPct = rule.tier1DiscountPct;
    }

    let unitPrice = +(rule.baseContractPriceUSD * (1 - discountPct / 100)).toFixed(2);
    const minAllowedPrice = +(baseCostOfGoodsUSD * (1 + rule.minimumMarginProtectionPct / 100)).toFixed(2);

    if (unitPrice < minAllowedPrice) {
      unitPrice = minAllowedPrice;
      discountPct = +(((rule.baseContractPriceUSD - unitPrice) / rule.baseContractPriceUSD) * 100).toFixed(1);
    }

    const totalExtended = +(unitPrice * quantity).toFixed(2);
    const marginPct = +(((unitPrice - baseCostOfGoodsUSD) / unitPrice) * 100).toFixed(1);

    return {
      finalUnitPriceUSD: unitPrice,
      totalExtendedPriceUSD: totalExtended,
      appliedDiscountPct: discountPct,
      marginPct
    };
  }
}
