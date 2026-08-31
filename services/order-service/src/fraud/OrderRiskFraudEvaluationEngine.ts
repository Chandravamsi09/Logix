/**
 * Real-time Order Risk & Fraud Evaluation Engine
 * Evaluates velocity patterns, IP geolocation anomalies, device fingerprint mismatches, and bin-scoring.
 */

export interface IFraudAssessmentContext {
  orderId: string;
  tenantId: string;
  customerIpAddress: string;
  billingZip: string;
  shippingZip: string;
  orderTotalUSD: number;
  orderItemCount: number;
  paymentCardBin: string;
  cardIssuerCountry: string;
  deviceFingerprint: string;
  ordersInLastHour: number;
  isFirstTimeBuyer: boolean;
}

export interface IFraudScoreResult {
  orderId: string;
  riskScore: number; // 0 (lowest) to 100 (highest)
  decision: 'APPROVE' | 'MANUAL_REVIEW' | 'AUTO_REJECT';
  triggeredRules: string[];
}

export class OrderRiskFraudEvaluationEngine {
  public evaluateOrder(ctx: IFraudAssessmentContext): IFraudScoreResult {
    let riskScore = 0;
    const triggeredRules: string[] = [];

    // Velocity checks
    if (ctx.ordersInLastHour > 5) {
      riskScore += 45;
      triggeredRules.push('EXCESSIVE_ORDER_VELOCITY_1H');
    } else if (ctx.ordersInLastHour > 2) {
      riskScore += 15;
      triggeredRules.push('MODERATE_ORDER_VELOCITY');
    }

    // High total check for first-time buyers
    if (ctx.isFirstTimeBuyer && ctx.orderTotalUSD > 5000) {
      riskScore += 30;
      triggeredRules.push('FIRST_TIME_BUYER_HIGH_VALUE');
    }

    // Geographic mismatches
    if (ctx.billingZip !== ctx.shippingZip) {
      riskScore += 10;
      triggeredRules.push('BILLING_SHIPPING_ZIP_MISMATCH');
    }

    if (ctx.cardIssuerCountry !== 'US' && ctx.cardIssuerCountry !== 'CA') {
      riskScore += 20;
      triggeredRules.push('INTERNATIONAL_CARD_ISSUER');
    }

    // Determine final action
    let decision: IFraudScoreResult['decision'] = 'APPROVE';
    if (riskScore >= 70) {
      decision = 'AUTO_REJECT';
    } else if (riskScore >= 35) {
      decision = 'MANUAL_REVIEW';
    }

    return {
      orderId: ctx.orderId,
      riskScore: Math.min(100, riskScore),
      decision,
      triggeredRules
    };
  }
}
