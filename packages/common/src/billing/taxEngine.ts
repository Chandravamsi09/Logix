/**
 * International Tax Calculation and Multi-Currency Conversion Engine
 */

export interface TaxJurisdictionRule {
  countryCode: string;
  stateOrRegion?: string;
  standardRatePercent: number;
  reducedRatePercent?: number;
  isOriginBased: boolean;
  taxLabel: string; // e.g. 'VAT', 'GST', 'Sales Tax'
}

export class TaxCalculationEngine {
  private static readonly rules: TaxJurisdictionRule[] = [
    { countryCode: 'US', stateOrRegion: 'CA', standardRatePercent: 7.25, isOriginBased: false, taxLabel: 'CA State Sales Tax' },
    { countryCode: 'US', stateOrRegion: 'NY', standardRatePercent: 8.875, isOriginBased: false, taxLabel: 'NY State & City Tax' },
    { countryCode: 'US', stateOrRegion: 'TX', standardRatePercent: 8.25, isOriginBased: false, taxLabel: 'TX Sales Tax' },
    { countryCode: 'US', stateOrRegion: 'WA', standardRatePercent: 6.5, isOriginBased: false, taxLabel: 'WA State Tax' },
    { countryCode: 'GB', standardRatePercent: 20.0, isOriginBased: true, taxLabel: 'UK Standard VAT' },
    { countryCode: 'DE', standardRatePercent: 19.0, isOriginBased: true, taxLabel: 'German MwSt' },
    { countryCode: 'FR', standardRatePercent: 20.0, isOriginBased: true, taxLabel: 'French TVA' },
    { countryCode: 'SG', standardRatePercent: 9.0, isOriginBased: true, taxLabel: 'Singapore GST' },
    { countryCode: 'IN', standardRatePercent: 18.0, isOriginBased: true, taxLabel: 'India GST' }
  ];

  static calculateTax(
    subtotalCents: number,
    countryCode: string,
    stateOrRegion?: string
  ): { taxCents: number; ratePercent: number; taxLabel: string } {
    const matchedRule = this.rules.find(r => {
      if (r.countryCode !== countryCode.toUpperCase()) return false;
      if (r.stateOrRegion && stateOrRegion) {
        return r.stateOrRegion.toUpperCase() === stateOrRegion.toUpperCase();
      }
      return true;
    }) || {
      countryCode,
      standardRatePercent: 5.0,
      isOriginBased: false,
      taxLabel: 'Standard Default Tax'
    };

    const taxCents = Math.round(subtotalCents * (matchedRule.standardRatePercent / 100));
    return {
      taxCents,
      ratePercent: matchedRule.standardRatePercent,
      taxLabel: matchedRule.taxLabel
    };
  }
}
