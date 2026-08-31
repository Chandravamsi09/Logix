/**
 * Customer Commercial Credit Underwriting & Risk Scoring Engine
 * Computes maximum trade credit allowances using Dun & Bradstreet PAYDEX scores and payment history.
 */

export interface ICustomerCreditProfile {
  customerId: string;
  companyLegalName: string;
  paydexScore: number; // 0 to 100
  annualRevenueUSD: number;
  yearsInBusiness: number;
  pastDueInvoiceCount: number;
  averageDaysToPay: number;
  existingCreditLimitUSD: number;
  currentOutstandingBalanceUSD: number;
}

export class CustomerCreditLimitUnderwritingEngine {
  public evaluateCreditLimit(profile: ICustomerCreditProfile): { recommendedCreditLimitUSD: number; creditRiskGrade: 'AAA' | 'AA' | 'A' | 'BBB' | 'HIGH_RISK'; approved: boolean } {
    let score = profile.paydexScore * 0.40;
    score += Math.min(25, profile.yearsInBusiness * 2.5);
    score += profile.pastDueInvoiceCount === 0 ? 20 : Math.max(0, 20 - profile.pastDueInvoiceCount * 5);
    score += profile.averageDaysToPay <= 30 ? 15 : Math.max(0, 15 - (profile.averageDaysToPay - 30));

    let riskGrade: 'AAA' | 'AA' | 'A' | 'BBB' | 'HIGH_RISK' = 'HIGH_RISK';
    let multiplier = 0.02;

    if (score >= 85) {
      riskGrade = 'AAA';
      multiplier = 0.08;
    } else if (score >= 70) {
      riskGrade = 'AA';
      multiplier = 0.05;
    } else if (score >= 55) {
      riskGrade = 'A';
      multiplier = 0.03;
    } else if (score >= 40) {
      riskGrade = 'BBB';
      multiplier = 0.015;
    }

    const calculatedLimit = +(profile.annualRevenueUSD * multiplier).toFixed(0);
    const recommendedLimit = Math.min(1000000, Math.max(10000, calculatedLimit));

    return {
      recommendedCreditLimitUSD: recommendedLimit,
      creditRiskGrade: riskGrade,
      approved: riskGrade !== 'HIGH_RISK'
    };
  }
}
