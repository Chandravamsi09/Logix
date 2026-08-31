/**
 * GLEC (Global Logistics Emissions Council) GHG Protocol Scope 1 & 3 Carbon Calculator
 * Computes Well-to-Wheel (WTW) CO2e emissions across diesel, CNG, and electric commercial freight.
 */

export interface IFreightTripEnergyContext {
  shipmentId: string;
  powertrainType: 'DIESEL_EURO_6' | 'CNG' | 'BATTERY_ELECTRIC' | 'HYDROGEN_FUEL_CELL';
  cargoWeightTonnes: number;
  totalDistanceKm: number;
  emptyBackhaulKm: number;
  averageSpeedKmh: number;
}

export class FleetCarbonFootprintCalculator {
  // Emissions factors in grams CO2e per tonne-km
  private static readonly EMISSIONS_FACTORS = {
    DIESEL_EURO_6: 62.5,
    CNG: 48.2,
    BATTERY_ELECTRIC: 12.8,
    HYDROGEN_FUEL_CELL: 5.4
  };

  public calculateTripEmissions(ctx: IFreightTripEnergyContext): { totalEmissionsKgCo2e: number; emissionsPerTonneKmGrams: number; treeOffsetEquivalents: number } {
    const factor = FleetCarbonFootprintCalculator.EMISSIONS_FACTORS[ctx.powertrainType] || 62.5;
    const effectiveTonneKm = (ctx.cargoWeightTonnes * ctx.totalDistanceKm) + (ctx.emptyBackhaulKm * 0.25 * ctx.cargoWeightTonnes);

    const totalEmissionsKgCo2e = +((effectiveTonneKm * factor) / 1000).toFixed(2);
    const emissionsPerTonneKmGrams = factor;
    const treeOffsetEquivalents = Math.ceil(totalEmissionsKgCo2e / 22.0); // 1 mature tree absorbs ~22kg CO2/year

    return {
      totalEmissionsKgCo2e,
      emissionsPerTonneKmGrams,
      treeOffsetEquivalents
    };
  }
}
