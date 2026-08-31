/**
 * Warehouse Aisle Slotting & Fast-Mover Velocity Optimization Engine
 * Calculates item pick velocity (ABC categorization) and dynamically re-slots high-velocity SKUs near packing stations.
 */

export interface ISkuVelocityMetrics {
  sku: string;
  dailyPickFrequency: number;
  averagePickQuantity: number;
  cubeVolumeM3: number;
  weightKg: number;
  currentBinAisle: number;
  currentBinBay: number;
}

export interface ISlottingRecommendation {
  sku: string;
  recommendedVelocityCategory: 'CLASS_A_GOLDEN_ZONE' | 'CLASS_B_MID_AISLE' | 'CLASS_C_SLOW_STORAGE';
  targetAisle: number;
  targetBay: number;
  estimatedTravelTimeReductionPct: number;
}

export class AisleSlottingOptimizationEngine {
  public generateSlottingPlan(metrics: ISkuVelocityMetrics[]): ISlottingRecommendation[] {
    // Sort descending by pick frequency
    const sorted = [...metrics].sort((a, b) => b.dailyPickFrequency - a.dailyPickFrequency);
    const totalItems = sorted.length;
    const classACutoff = Math.floor(totalItems * 0.20); // Top 20%
    const classBCutoff = Math.floor(totalItems * 0.50); // Next 30%

    return sorted.map((item, idx) => {
      if (idx < classACutoff) {
        return {
          sku: item.sku,
          recommendedVelocityCategory: 'CLASS_A_GOLDEN_ZONE',
          targetAisle: 1,
          targetBay: idx + 1,
          estimatedTravelTimeReductionPct: 34.5
        };
      } else if (idx < classBCutoff) {
        return {
          sku: item.sku,
          recommendedVelocityCategory: 'CLASS_B_MID_AISLE',
          targetAisle: 2,
          targetBay: idx - classACutoff + 1,
          estimatedTravelTimeReductionPct: 18.2
        };
      } else {
        return {
          sku: item.sku,
          recommendedVelocityCategory: 'CLASS_C_SLOW_STORAGE',
          targetAisle: 3,
          targetBay: idx - classBCutoff + 1,
          estimatedTravelTimeReductionPct: 4.0
        };
      }
    });
  }
}
