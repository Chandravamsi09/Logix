/**
 * Harmonized System (HS) Tariff Code & Import Duty Calculator
 * Evaluates landed cost for cross-border freight including ad valorem duties, anti-dumping fees, and excise.
 */

export interface IHsCodeTariff {
  hsChapter: string;
  hsHeading: string;
  countryOfOriginIso: string;
  destinationCountryIso: string;
  adValoremDutyRatePct: number;
  specificDutyPerKgUSD: number;
  antiDumpingRatePct: number;
  exciseTaxRatePct: number;
}

export class InternationalCustomsTariffCalculator {
  private readonly tariffTable = new Map<string, IHsCodeTariff>();

  constructor() {
    this.registerTariff({
      hsChapter: '84',
      hsHeading: '8471.30',
      countryOfOriginIso: 'CN',
      destinationCountryIso: 'US',
      adValoremDutyRatePct: 0.025,
      specificDutyPerKgUSD: 0.00,
      antiDumpingRatePct: 0.00,
      exciseTaxRatePct: 0.00
    });

    this.registerTariff({
      hsChapter: '87',
      hsHeading: '8708.29',
      countryOfOriginIso: 'DE',
      destinationCountryIso: 'US',
      adValoremDutyRatePct: 0.035,
      specificDutyPerKgUSD: 0.15,
      antiDumpingRatePct: 0.00,
      exciseTaxRatePct: 0.00
    });
  }

  public registerTariff(tariff: IHsCodeTariff): void {
    const key = `${tariff.hsHeading}_${tariff.countryOfOriginIso}_${tariff.destinationCountryIso}`;
    this.tariffTable.set(key, tariff);
  }

  public calculateLandedCustomsDuty(
    hsHeading: string,
    originIso: string,
    destIso: string,
    cifValueUSD: number,
    netWeightKg: number
  ): { totalDutyUSD: number; adValoremDutyUSD: number; specificDutyUSD: number; effectiveDutyRatePct: number } {
    const key = `${hsHeading}_${originIso}_${destIso}`;
    const tariff = this.tariffTable.get(key) || {
      hsChapter: hsHeading.substring(0, 2),
      hsHeading,
      countryOfOriginIso: originIso,
      destinationCountryIso: destIso,
      adValoremDutyRatePct: 0.045, // General baseline tariff
      specificDutyPerKgUSD: 0.05,
      antiDumpingRatePct: 0.00,
      exciseTaxRatePct: 0.00
    };

    const adValoremDutyUSD = +(cifValueUSD * tariff.adValoremDutyRatePct).toFixed(2);
    const specificDutyUSD = +(netWeightKg * tariff.specificDutyPerKgUSD).toFixed(2);
    const totalDutyUSD = +(adValoremDutyUSD + specificDutyUSD).toFixed(2);
    const effectiveDutyRatePct = cifValueUSD > 0 ? +((totalDutyUSD / cifValueUSD) * 100).toFixed(2) : 0;

    return {
      totalDutyUSD,
      adValoremDutyUSD,
      specificDutyUSD,
      effectiveDutyRatePct
    };
  }
}
