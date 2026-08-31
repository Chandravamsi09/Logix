/**
 * Multi-Modal (Class 1 Freight Rail & Long-Haul OTR Trucking) Intermodal Route Planner
 * Computes cost vs carbon tradeoffs for rail ramp container drayage vs team-driver road transit.
 */

export interface IIntermodalOption {
  mode: 'TRUCK_ALL_HIGHWAY' | 'INTERMODAL_RAIL_AND_DRAYAGE';
  originDrayageMiles: number;
  railHaulMiles: number;
  destinationDrayageMiles: number;
  totalTransitHours: number;
  totalFreightCostUSD: number;
  co2EmissionsKg: number;
  railRampOriginCode?: string;
  railRampDestCode?: string;
}

export class MultiModalRailAndTruckIntermodalRoutePlanner {
  public planRoute(totalDistanceMiles: number, cargoWeightLbs: number): { highwayOption: IIntermodalOption; railOption: IIntermodalOption; recommendedMode: IIntermodalOption['mode'] } {
    // Highway option
    const highwayCost = +(Math.max(350, totalDistanceMiles * 2.75)).toFixed(2);
    const highwayHours = +((totalDistanceMiles / 55) * 1.3).toFixed(1); // 55 mph + rest breaks
    const highwayCo2 = +(totalDistanceMiles * 1.62).toFixed(1);

    const highwayOption: IIntermodalOption = {
      mode: 'TRUCK_ALL_HIGHWAY',
      originDrayageMiles: 0,
      railHaulMiles: 0,
      destinationDrayageMiles: 0,
      totalTransitHours: highwayHours,
      totalFreightCostUSD: highwayCost,
      co2EmissionsKg: highwayCo2
    };

    // Rail option (viable for distances > 600 miles)
    const originDray = 45;
    const destDray = 60;
    const railMiles = Math.max(0, totalDistanceMiles - originDray - destDray);
    const railCost = +(railMiles * 1.35 + (originDray + destDray) * 3.50 + 180).toFixed(2); // Rail + drayage + lift fees
    const railHours = +((railMiles / 30) + 24).toFixed(1); // Rail 30 mph + 24h ramp dwell
    const railCo2 = +((railMiles * 0.42) + (originDray + destDray) * 1.62).toFixed(1); // 74% less CO2

    const railOption: IIntermodalOption = {
      mode: 'INTERMODAL_RAIL_AND_DRAYAGE',
      originDrayageMiles: originDray,
      railHaulMiles: railMiles,
      destinationDrayageMiles: destDray,
      totalTransitHours: railHours,
      totalFreightCostUSD: railCost,
      co2EmissionsKg: railCo2,
      railRampOriginCode: 'CHI_CORWITH_RAMP',
      railRampDestCode: 'LAX_HOBART_YARD'
    };

    const recommendedMode = totalDistanceMiles >= 750 ? 'INTERMODAL_RAIL_AND_DRAYAGE' : 'TRUCK_ALL_HIGHWAY';

    return {
      highwayOption,
      railOption,
      recommendedMode
    };
  }
}
