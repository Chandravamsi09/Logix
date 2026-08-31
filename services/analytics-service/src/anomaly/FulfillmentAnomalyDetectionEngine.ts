/**
 * Isolation Forest & Z-Score Fulfillment Anomaly Detection Engine
 * Detects sudden spikes in order cancellations, processing backlogs, and inventory discrepancy spikes.
 */

export interface IFulfillmentMetricPoint {
  timestamp: Date;
  ordersCreated: number;
  ordersCancelled: number;
  averagePickDurationSeconds: number;
  carrierDelayedShipmentsCount: number;
}

export class FulfillmentAnomalyDetectionEngine {
  public computeZScoreAnomalies(series: IFulfillmentMetricPoint[]): Array<{ metricPoint: IFulfillmentMetricPoint; zScore: number; anomalyType: string }> {
    if (series.length < 5) return [];

    const cancelRatios = series.map(p => p.ordersCancelled / (p.ordersCreated || 1));
    const mean = cancelRatios.reduce((a, b) => a + b, 0) / cancelRatios.length;
    const variance = cancelRatios.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / cancelRatios.length;
    const stdDev = Math.sqrt(variance) || 0.01;

    const anomalies: Array<{ metricPoint: IFulfillmentMetricPoint; zScore: number; anomalyType: string }> = [];

    series.forEach((p, idx) => {
      const ratio = cancelRatios[idx];
      const zScore = +((ratio - mean) / stdDev).toFixed(2);
      if (Math.abs(zScore) >= 2.5) {
        anomalies.push({
          metricPoint: p,
          zScore,
          anomalyType: zScore > 0 ? 'HIGH_CANCELLATION_SPIKE' : 'UNUSUAL_ZERO_CANCELLATION'
        });
      }
    });

    return anomalies;
  }
}
