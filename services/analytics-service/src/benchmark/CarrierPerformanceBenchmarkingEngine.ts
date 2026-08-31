/**
 * Carrier Service Level Agreement (SLA) & Freight Benchmark Engine
 * Evaluates transit time variance, claims ratio per 1,000 miles, and invoice billing accuracy.
 */

export interface ICarrierBenchmarkRecord {
  carrierCode: string;
  carrierName: string;
  totalShipmentsSampled: number;
  onTimeDeliveryRatePct: number;
  averageTransitDelayHours: number;
  freightDamageClaimRatePer1kPct: number;
  invoiceAccuracyRatePct: number;
  overallBenchmarkScore: number; // 0 to 100
}

export class CarrierPerformanceBenchmarkingEngine {
  public computeCarrierScore(record: Omit<ICarrierBenchmarkRecord, 'overallBenchmarkScore'>): ICarrierBenchmarkRecord {
    const onTimeScore = record.onTimeDeliveryRatePct * 0.45;
    const delayDeduction = Math.min(25, record.averageTransitDelayHours * 3.5);
    const damageDeduction = Math.min(20, record.freightDamageClaimRatePer1kPct * 15);
    const accuracyScore = record.invoiceAccuracyRatePct * 0.25;

    const rawScore = onTimeScore + accuracyScore + 30 - delayDeduction - damageDeduction;
    const overallBenchmarkScore = Math.max(0, Math.min(100, +rawScore.toFixed(1)));

    return {
      ...record,
      overallBenchmarkScore
    };
  }
}
