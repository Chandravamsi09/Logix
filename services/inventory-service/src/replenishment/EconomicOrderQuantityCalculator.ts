/**
 * Economic Order Quantity (EOQ) and Reorder Point (ROP) Calculator
 * Computes optimal replenishment lot sizes balancing inventory holding costs and purchase order setup fees.
 */

export interface IEoqParameters {
  sku: string;
  annualDemandUnits: number;
  fixedOrderCostUSD: number;
  unitCostUSD: number;
  annualCarryingCostRate: number; // e.g. 0.20 for 20%
  leadTimeDays: number;
  safetyStockDays: number;
}

export interface IEoqCalculationResult {
  sku: string;
  optimalEoqUnits: number;
  annualHoldingCostUSD: number;
  annualOrderingCostUSD: number;
  totalAnnualInventoryCostUSD: number;
  reorderPointUnits: number;
  safetyStockUnits: number;
  ordersPerYear: number;
}

export class EconomicOrderQuantityCalculator {
  public calculate(params: IEoqParameters): IEoqCalculationResult {
    const H = params.unitCostUSD * params.annualCarryingCostRate; // Holding cost per unit per year
    const S = params.fixedOrderCostUSD; // Ordering cost per purchase order
    const D = params.annualDemandUnits; // Annual demand in units

    // Wilson EOQ Formula: Q* = sqrt((2 * D * S) / H)
    const optimalEoqUnits = Math.round(Math.sqrt((2 * D * S) / (H || 1)));

    const ordersPerYear = +(D / optimalEoqUnits).toFixed(1);
    const annualOrderingCostUSD = +(ordersPerYear * S).toFixed(2);
    const annualHoldingCostUSD = +((optimalEoqUnits / 2) * H).toFixed(2);
    const totalAnnualInventoryCostUSD = +(annualOrderingCostUSD + annualHoldingCostUSD).toFixed(2);

    const dailyDemand = D / 365;
    const safetyStockUnits = Math.round(dailyDemand * params.safetyStockDays);
    const reorderPointUnits = Math.round((dailyDemand * params.leadTimeDays) + safetyStockUnits);

    return {
      sku: params.sku,
      optimalEoqUnits,
      annualHoldingCostUSD,
      annualOrderingCostUSD,
      totalAnnualInventoryCostUSD,
      reorderPointUnits,
      safetyStockUnits,
      ordersPerYear
    };
  }
}
