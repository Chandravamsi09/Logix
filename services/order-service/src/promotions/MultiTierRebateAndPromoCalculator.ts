/**
 * Multi-Tiered Manufacturer Rebate & Volume Promotion Calculation Engine
 */

export interface IRebateTierRule {
  rebateId: string;
  manufacturerCode: string;
  eligibleCategory: string;
  minGrossSpendUSD: number;
  rebatePercentage: number;
  instantDeductionAllowed: boolean;
  effectiveFrom: Date;
  effectiveUntil: Date;
}

export class MultiTierRebateAndPromoCalculator {
  private readonly rebateRules = new Map<string, IRebateTierRule[]>();

  public registerRule(rule: IRebateTierRule): void {
    const list = this.rebateRules.get(rule.manufacturerCode) || [];
    list.push(rule);
    this.rebateRules.set(rule.manufacturerCode, list);
  }

  public calculateRebate(
    manufacturerCode: string,
    category: string,
    spendAmountUSD: number
  ): { rebateAmountUSD: number; appliedRatePct: number; isInstantDeduction: boolean } {
    const rules = this.rebateRules.get(manufacturerCode) || [];
    const matching = rules
      .filter(r => r.eligibleCategory === category && spendAmountUSD >= r.minGrossSpendUSD && new Date() >= r.effectiveFrom && new Date() <= r.effectiveUntil)
      .sort((a, b) => b.rebatePercentage - a.rebatePercentage)[0];

    if (!matching) {
      return { rebateAmountUSD: 0, appliedRatePct: 0, isInstantDeduction: false };
    }

    const rebateAmountUSD = +(spendAmountUSD * (matching.rebatePercentage / 100)).toFixed(2);
    return {
      rebateAmountUSD,
      appliedRatePct: matching.rebatePercentage,
      isInstantDeduction: matching.instantDeductionAllowed
    };
  }
}
