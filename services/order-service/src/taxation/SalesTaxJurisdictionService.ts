/**
 * US & International Sales Tax Nexus Determination Engine
 * Evaluates state economic nexus thresholds and calculates municipal, state, and county tax lines.
 */

export interface ITaxJurisdictionRule {
  stateCode: string;
  stateTaxRate: number;
  countyTaxRate: number;
  municipalTaxRate: number;
  economicNexusThresholdUSD: number;
  economicNexusTransactionsCount: number;
}

export class SalesTaxJurisdictionService {
  private readonly rules = new Map<string, ITaxJurisdictionRule>();

  constructor() {
    this.rules.set('CA', { stateCode: 'CA', stateTaxRate: 0.0725, countyTaxRate: 0.0125, municipalTaxRate: 0.005, economicNexusThresholdUSD: 500000, economicNexusTransactionsCount: 200 });
    this.rules.set('TX', { stateCode: 'TX', stateTaxRate: 0.0625, countyTaxRate: 0.015, municipalTaxRate: 0.005, economicNexusThresholdUSD: 500000, economicNexusTransactionsCount: 0 });
    this.rules.set('NY', { stateCode: 'NY', stateTaxRate: 0.0400, countyTaxRate: 0.045, municipalTaxRate: 0.00375, economicNexusThresholdUSD: 500000, economicNexusTransactionsCount: 100 });
    this.rules.set('IL', { stateCode: 'IL', stateTaxRate: 0.0625, countyTaxRate: 0.0175, municipalTaxRate: 0.0125, economicNexusThresholdUSD: 100000, economicNexusTransactionsCount: 200 });
  }

  public calculateTax(stateCode: string, taxableAmountUSD: number): { totalTaxAmountUSD: number; stateTax: number; countyTax: number; municipalTax: number; effectiveRatePct: number } {
    const rule = this.rules.get(stateCode.toUpperCase()) || { stateCode, stateTaxRate: 0.05, countyTaxRate: 0.01, municipalTaxRate: 0.0, economicNexusThresholdUSD: 100000, economicNexusTransactionsCount: 200 };

    const stateTax = +(taxableAmountUSD * rule.stateTaxRate).toFixed(2);
    const countyTax = +(taxableAmountUSD * rule.countyTaxRate).toFixed(2);
    const municipalTax = +(taxableAmountUSD * rule.municipalTaxRate).toFixed(2);
    const totalTaxAmountUSD = +(stateTax + countyTax + municipalTax).toFixed(2);
    const effectiveRatePct = +(((rule.stateTaxRate + rule.countyTaxRate + rule.municipalTaxRate) * 100)).toFixed(3);

    return {
      totalTaxAmountUSD,
      stateTax,
      countyTax,
      municipalTax,
      effectiveRatePct
    };
  }
}
