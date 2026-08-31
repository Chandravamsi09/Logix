/**
 * CFR 49 DOT Non-Radioactive Hazardous Materials (NRHM) Route Exclusion Planner
 * Routes hazardous freight around municipal drinking water reservoirs, tunnels, and dense urban centers.
 */

export interface IRouteCoordinate {
  latitude: number;
  longitude: number;
  segmentName: string;
  isTunnel: boolean;
  isNearDrinkingWaterReservoir: boolean;
}

export class HazardousHazmatRouteAvoidancePlanner {
  public filterRestrictedHazmatSegments(route: IRouteCoordinate[], containsClass1OrClass7: boolean): { isApprovedRoute: boolean; flaggedSegments: string[]; detourRecommended: boolean } {
    const flagged: string[] = [];

    route.forEach(seg => {
      if (seg.isTunnel) {
        flagged.push(`Restricted tunnel transit: ${seg.segmentName}`);
      }
      if (containsClass1OrClass7 && seg.isNearDrinkingWaterReservoir) {
        flagged.push(`Water protection watershed violation: ${seg.segmentName}`);
      }
    });

    return {
      isApprovedRoute: flagged.length === 0,
      flaggedSegments: flagged,
      detourRecommended: flagged.length > 0
    };
  }
}
