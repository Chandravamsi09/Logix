/**
 * US Interstate Highway & Turn-Pike Toll Plaza Fee Calculator
 * Computes electronic transponder tolls (EZPass, SunPass, TxTag) based on axle count and vehicle class.
 */

export interface ITollPlaza {
  plazaId: string;
  highwayName: string;
  latitude: number;
  longitude: number;
  class5AxlesRateUSD: number;
  transponderDiscountPct: number;
}

export class InterstateHighwayTollCostEstimator {
  private readonly plazas = new Map<string, ITollPlaza>();

  constructor() {
    this.plazas.set('NJ_TPK_EX14', { plazaId: 'NJ_TPK_EX14', highwayName: 'New Jersey Turnpike', latitude: 40.6922, longitude: -74.1755, class5AxlesRateUSD: 42.50, transponderDiscountPct: 15.0 });
    this.plazas.set('PA_TPK_VALLEY_FORGE', { plazaId: 'PA_TPK_VALLEY_FORGE', highwayName: 'Pennsylvania Turnpike', latitude: 40.0885, longitude: -75.4055, class5AxlesRateUSD: 36.20, transponderDiscountPct: 10.0 });
    this.plazas.set('OH_TPK_GATE5', { plazaId: 'OH_TPK_GATE5', highwayName: 'Ohio Turnpike', latitude: 41.3412, longitude: -82.1764, class5AxlesRateUSD: 28.75, transponderDiscountPct: 12.5 });
  }

  public calculateRouteTolls(encounteredPlazaIds: string[], hasElectronicTransponder: boolean): { totalTollsUSD: number; breakdown: Array<{ highway: string; feeUSD: number }> } {
    let totalTolls = 0;
    const breakdown: Array<{ highway: string; feeUSD: number }> = [];

    encounteredPlazaIds.forEach(id => {
      const plaza = this.plazas.get(id);
      if (plaza) {
        let fee = plaza.class5AxlesRateUSD;
        if (hasElectronicTransponder) {
          fee = +(fee * (1 - plaza.transponderDiscountPct / 100)).toFixed(2);
        }
        totalTolls += fee;
        breakdown.push({ highway: plaza.highwayName, feeUSD: fee });
      }
    });

    return {
      totalTollsUSD: +totalTolls.toFixed(2),
      breakdown
    };
  }
}
