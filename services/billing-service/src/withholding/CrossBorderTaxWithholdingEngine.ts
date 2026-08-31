/**
 * FATCA / W-8BEN-E Cross-Border Commercial Withholding Tax Engine
 * Computes statutory tax withholding treaties between US and global vendor domiciles.
 */

export interface ITaxTreatyProfile {
  countryIso: string;
  hasDoubleTaxationTreaty: boolean;
  statutoryRoyaltyWithholdingPct: number;
  statutoryServicesWithholdingPct: number;
  statutoryDividendWithholdingPct: number;
  requiresFormW8Ben: boolean;
}

export class CrossBorderTaxWithholdingEngine {
  private readonly treaties = new Map<string, ITaxTreatyProfile>();

  constructor() {
    this.treaties.set('CA', { countryIso: 'CA', hasDoubleTaxationTreaty: true, statutoryRoyaltyWithholdingPct: 0.0, statutoryServicesWithholdingPct: 0.0, statutoryDividendWithholdingPct: 15.0, requiresFormW8Ben: true });
    this.treaties.set('GB', { countryIso: 'GB', hasDoubleTaxationTreaty: true, statutoryRoyaltyWithholdingPct: 0.0, statutoryServicesWithholdingPct: 0.0, statutoryDividendWithholdingPct: 15.0, requiresFormW8Ben: true });
    this.treaties.set('DE', { countryIso: 'DE', hasDoubleTaxationTreaty: true, statutoryRoyaltyWithholdingPct: 0.0, statutoryServicesWithholdingPct: 0.0, statutoryDividendWithholdingPct: 15.0, requiresFormW8Ben: true });
    this.treaties.set('IN', { countryIso: 'IN', hasDoubleTaxationTreaty: true, statutoryRoyaltyWithholdingPct: 15.0, statutoryServicesWithholdingPct: 10.0, statutoryDividendWithholdingPct: 25.0, requiresFormW8Ben: true });
    this.treaties.set('BR', { countryIso: 'BR', hasDoubleTaxationTreaty: false, statutoryRoyaltyWithholdingPct: 30.0, statutoryServicesWithholdingPct: 30.0, statutoryDividendWithholdingPct: 30.0, requiresFormW8Ben: true });
  }

  public calculateWithholding(vendorCountryIso: string, invoiceAmountUSD: number, incomeCategory: 'SERVICES' | 'ROYALTIES' | 'DIVIDENDS'): { withholdingTaxRatePct: number; withholdingAmountUSD: number; netPayoutAmountUSD: number } {
    const treaty = this.treaties.get(vendorCountryIso.toUpperCase()) || {
      countryIso: vendorCountryIso,
      hasDoubleTaxationTreaty: false,
      statutoryRoyaltyWithholdingPct: 30.0,
      statutoryServicesWithholdingPct: 30.0,
      statutoryDividendWithholdingPct: 30.0,
      requiresFormW8Ben: true
    };

    let rate = treaty.statutoryServicesWithholdingPct;
    if (incomeCategory === 'ROYALTIES') rate = treaty.statutoryRoyaltyWithholdingPct;
    else if (incomeCategory === 'DIVIDENDS') rate = treaty.statutoryDividendWithholdingPct;

    const withholdingAmountUSD = +(invoiceAmountUSD * (rate / 100)).toFixed(2);
    const netPayoutAmountUSD = +(invoiceAmountUSD - withholdingAmountUSD).toFixed(2);

    return {
      withholdingTaxRatePct: rate,
      withholdingAmountUSD,
      netPayoutAmountUSD
    };
  }
}
