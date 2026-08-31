/**
 * Vehicle Engine Wear & Fuel Economy Degradation Carbon Intensity Index
 */

export interface IFleetVehicleTelemetrySummary {
  vehicleId: string;
  engineAgeYears: number;
  odometerMiles: number;
  ratedMpg: number;
  actualMpg: number;
  fuelType: 'DIESEL' | 'DEF_BLENDED' | 'BIODIESEL_B20' | 'CNG';
}

export class FleetCarbonIntensityIndexModel {
  public calculateIntensityIndex(summary: IFleetVehicleTelemetrySummary): { degradationPct: number; excessCo2KgPer1000Miles: number; maintenanceRecommended: boolean } {
    const mpgLoss = Math.max(0, summary.ratedMpg - summary.actualMpg);
    const degradationPct = summary.ratedMpg > 0 ? +((mpgLoss / summary.ratedMpg) * 100).toFixed(1) : 0;

    const ratedGallonsPer1k = 1000 / summary.ratedMpg;
    const actualGallonsPer1k = 1000 / (summary.actualMpg || 1);
    const excessGallons = Math.max(0, actualGallonsPer1k - ratedGallonsPer1k);
    const excessCo2 = +(excessGallons * 10.18).toFixed(2);

    return {
      degradationPct,
      excessCo2KgPer1000Miles: excessCo2,
      maintenanceRecommended: degradationPct > 12.0
    };
  }
}
