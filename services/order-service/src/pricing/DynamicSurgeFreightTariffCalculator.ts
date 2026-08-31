/**
 * Peak Season & Extreme Weather Dynamic Freight Surge Tariff Calculator
 */

export interface ISurgeFreightContext {
  originState: string;
  destState: string;
  baseRateUSD: number;
  isPeakQ4HolidaySeason: boolean;
  weatherWarningSeverity: number; // 0 to 5
  dieselNationalAveragePriceUSD: number;
}

export class DynamicSurgeFreightTariffCalculator {
  public calculateFinalRate(ctx: ISurgeFreightContext): { finalRateUSD: number; peakSurchargeUSD: number; weatherSurchargeUSD: number; fuelSurchargeUSD: number } {
    let peakFee = 0;
    if (ctx.isPeakQ4HolidaySeason) {
      peakFee = +(ctx.baseRateUSD * 0.18).toFixed(2); // 18% peak season surcharge
    }

    let weatherFee = 0;
    if (ctx.weatherWarningSeverity >= 3) {
      weatherFee = +(ctx.baseRateUSD * (ctx.weatherWarningSeverity * 0.05)).toFixed(2);
    }

    // Baseline diesel pegged at $3.80/gal
    const dieselDiff = Math.max(0, ctx.dieselNationalAveragePriceUSD - 3.80);
    const fuelFee = +(ctx.baseRateUSD * (dieselDiff * 0.06)).toFixed(2);

    const finalRate = +(ctx.baseRateUSD + peakFee + weatherFee + fuelFee).toFixed(2);

    return {
      finalRateUSD: finalRate,
      peakSurchargeUSD: peakFee,
      weatherSurchargeUSD: weatherFee,
      fuelSurchargeUSD: fuelFee
    };
  }
}
