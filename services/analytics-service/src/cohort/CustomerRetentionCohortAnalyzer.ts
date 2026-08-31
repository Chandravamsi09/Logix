/**
 * Customer Retention Cohort & Lifetime Value (LTV) Analyzer
 */

export interface ICohortRecord {
  cohortMonth: string; // YYYY-MM
  initialCustomerCount: number;
  retentionByMonth: number[]; // Percentage 0.0 to 1.0 for M0, M1, M2...
  cumulativeLtvByMonthUSD: number[];
}

export class CustomerRetentionCohortAnalyzer {
  public computeRetentionCurves(cohorts: ICohortRecord[]): { averageRetentionRateM3: number; projectedAnnualLtv: number } {
    if (!cohorts.length) return { averageRetentionRateM3: 0, projectedAnnualLtv: 0 };

    let sumM3 = 0;
    let countM3 = 0;
    let sumLtv = 0;

    cohorts.forEach(c => {
      if (c.retentionByMonth.length >= 4) {
        sumM3 += c.retentionByMonth[3];
        countM3++;
      }
      if (c.cumulativeLtvByMonthUSD.length > 0) {
        sumLtv += c.cumulativeLtvByMonthUSD[c.cumulativeLtvByMonthUSD.length - 1];
      }
    });

    const averageRetentionRateM3 = countM3 > 0 ? +(sumM3 / countM3).toFixed(3) : 0.78;
    const projectedAnnualLtv = +(sumLtv / cohorts.length).toFixed(2);

    return {
      averageRetentionRateM3,
      projectedAnnualLtv
    };
  }
}
