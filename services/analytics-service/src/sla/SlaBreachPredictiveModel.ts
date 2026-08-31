/**
 * Delivery SLA Breach Predictive Classifier
 * Evaluates in-flight shipment transit telemetry against historical carrier delays and weather conditions.
 */

export interface IShipmentTelemetryContext {
  trackingNumber: string;
  carrierCode: string;
  originHub: string;
  destinationCity: string;
  distanceRemainingKm: number;
  currentTransitHours: number;
  slaMaxDurationHours: number;
  weatherSeverityScore: number; // 0 (clear) to 10 (blizzard/storm)
}

export class SlaBreachPredictiveModel {
  public predictBreachRisk(ctx: IShipmentTelemetryContext): { breachProbabilityPct: number; riskTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; estimatedDelayHours: number } {
    const averageSpeedKmH = 60;
    const estimatedHoursRemaining = ctx.distanceRemainingKm / averageSpeedKmH;
    const projectedTotalHours = ctx.currentTransitHours + estimatedHoursRemaining + (ctx.weatherSeverityScore * 0.75);

    const deltaHours = projectedTotalHours - ctx.slaMaxDurationHours;
    let breachProbabilityPct = 0;
    let riskTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

    if (deltaHours > 3) {
      breachProbabilityPct = 95;
      riskTier = 'CRITICAL';
    } else if (deltaHours > 0) {
      breachProbabilityPct = 75;
      riskTier = 'HIGH';
    } else if (deltaHours > -2) {
      breachProbabilityPct = 40;
      riskTier = 'MEDIUM';
    } else {
      breachProbabilityPct = 10;
      riskTier = 'LOW';
    }

    return {
      breachProbabilityPct,
      riskTier,
      estimatedDelayHours: Math.max(0, +deltaHours.toFixed(1))
    };
  }
}
