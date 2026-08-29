/**
 * Mathematical Optimization and Geospatial Heuristics Engine
 * Used across Fleet Routing, Volumetric Bin Packing, and Financial Forecasting.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export class MathOptimizationEngine {
  private static readonly EARTH_RADIUS_KM = 6371.0088;

  /**
   * Calculates Great-Circle Haversine distance between two coordinates in kilometers.
   */
  static haversineDistanceKm(coord1: GeoCoordinate, coord2: GeoCoordinate): number {
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLon = this.toRadians(coord2.longitude - coord1.longitude);
    const lat1 = this.toRadians(coord1.latitude);
    const lat2 = this.toRadians(coord2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS_KM * c;
  }

  /**
   * Initial bearing from point 1 to point 2 in degrees (0-360).
   */
  static computeBearingDegrees(from: GeoCoordinate, to: GeoCoordinate): number {
    const lat1 = this.toRadians(from.latitude);
    const lat2 = this.toRadians(to.latitude);
    const dLon = this.toRadians(to.longitude - from.longitude);

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    const initialBearing = Math.atan2(y, x);
    return (this.toDegrees(initialBearing) + 360) % 360;
  }

  /**
   * 2-Opt heuristic for Vehicle Routing Problem (VRP) route optimization.
   */
  static twoOptOptimization(
    route: GeoCoordinate[],
    maxIterations = 500
  ): { optimizedRoute: GeoCoordinate[]; totalDistanceKm: number } {
    if (route.length <= 3) {
      return { optimizedRoute: [...route], totalDistanceKm: this.computeTotalRouteDistanceKm(route) };
    }

    let bestRoute = [...route];
    let bestDistance = this.computeTotalRouteDistanceKm(bestRoute);
    let iterations = 0;
    let improved = true;

    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;

      for (let i = 1; i < bestRoute.length - 2; i++) {
        for (let j = i + 1; j < bestRoute.length - 1; j++) {
          const newRoute = this.twoOptSwap(bestRoute, i, j);
          const newDistance = this.computeTotalRouteDistanceKm(newRoute);

          if (newDistance < bestDistance - 0.001) {
            bestRoute = newRoute;
            bestDistance = newDistance;
            improved = true;
            break;
          }
        }
        if (improved) break;
      }
    }

    return { optimizedRoute: bestRoute, totalDistanceKm: bestDistance };
  }

  private static twoOptSwap(route: GeoCoordinate[], i: number, k: number): GeoCoordinate[] {
    const newRoute: GeoCoordinate[] = [];
    for (let c = 0; c <= i - 1; c++) {
      newRoute.push(route[c]);
    }
    for (let c = k; c >= i; c--) {
      newRoute.push(route[c]);
    }
    for (let c = k + 1; c < route.length; c++) {
      newRoute.push(route[c]);
    }
    return newRoute;
  }

  static computeTotalRouteDistanceKm(route: GeoCoordinate[]): number {
    let total = 0;
    for (let i = 0; i < route.length - 1; i++) {
      total += this.haversineDistanceKm(route[i], route[i + 1]);
    }
    return total;
  }

  /**
   * Volumetric 3D Bin Packing approximation using First Fit Decreasing (FFD).
   */
  static pack3DBins(
    items: Array<{ id: string; lengthCm: number; widthCm: number; heightCm: number; weightKg: number }>,
    binSpecs: { lengthCm: number; widthCm: number; heightCm: number; maxWeightKg: number }
  ): Array<{ binIndex: number; items: typeof items; usedVolumeCm3: number; totalWeightKg: number }> {
    const binVolume = binSpecs.lengthCm * binSpecs.widthCm * binSpecs.heightCm;
    const sortedItems = [...items].sort((a, b) => {
      const volA = a.lengthCm * a.widthCm * a.heightCm;
      const volB = b.lengthCm * b.widthCm * b.heightCm;
      return volB - volA; // Sort descending
    });

    const bins: Array<{ binIndex: number; items: typeof items; usedVolumeCm3: number; totalWeightKg: number }> = [];

    for (const item of sortedItems) {
      const itemVol = item.lengthCm * item.widthCm * item.heightCm;
      let placed = false;

      for (const bin of bins) {
        if (
          bin.usedVolumeCm3 + itemVol <= binVolume * 0.85 && // 85% packing efficiency factor
          bin.totalWeightKg + item.weightKg <= binSpecs.maxWeightKg
        ) {
          bin.items.push(item);
          bin.usedVolumeCm3 += itemVol;
          bin.totalWeightKg += item.weightKg;
          placed = true;
          break;
        }
      }

      if (!placed) {
        bins.push({
          binIndex: bins.length + 1,
          items: [item],
          usedVolumeCm3: itemVol,
          totalWeightKg: item.weightKg
        });
      }
    }

    return bins;
  }

  /**
   * Holt-Winters Exponential Smoothing for inventory demand forecasting.
   */
  static forecastDemand(
    historicalSales: number[],
    forecastPeriods = 7,
    alpha = 0.3,
    beta = 0.1
  ): number[] {
    if (historicalSales.length === 0) return Array(forecastPeriods).fill(0);
    if (historicalSales.length === 1) return Array(forecastPeriods).fill(historicalSales[0]);

    let level = historicalSales[0];
    let trend = historicalSales[1] - historicalSales[0];

    for (let i = 1; i < historicalSales.length; i++) {
      const value = historicalSales[i];
      const prevLevel = level;
      level = alpha * value + (1 - alpha) * (prevLevel + trend);
      trend = beta * (level - prevLevel) + (1 - beta) * trend;
    }

    const forecast: number[] = [];
    for (let m = 1; m <= forecastPeriods; m++) {
      forecast.push(Math.max(0, Math.round(level + m * trend)));
    }
    return forecast;
  }

  private static toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private static toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }
}
