/**
 * Multi-Year SaaS Subscription Deferred Revenue Straight-Line Amortization Schedule
 */

export interface ISubscriptionAmortizationEntry {
  periodMonthYear: string; // YYYY-MM
  beginningDeferredBalanceUSD: number;
  recognizedRevenueUSD: number;
  endingDeferredBalanceUSD: number;
}

export class DeferredRevenueAmortizationScheduleEngine {
  public generateStraightLineSchedule(
    contractTotalUSD: number,
    startYear: number,
    startMonth: number,
    durationMonths: number
  ): ISubscriptionAmortizationEntry[] {
    const monthlyRate = +(contractTotalUSD / durationMonths).toFixed(2);
    const schedule: ISubscriptionAmortizationEntry[] = [];
    let currentDeferred = contractTotalUSD;

    for (let m = 0; m < durationMonths; m++) {
      const actualYear = startYear + Math.floor((startMonth - 1 + m) / 12);
      const actualMonth = ((startMonth - 1 + m) % 12) + 1;
      const periodKey = `${actualYear}-${actualMonth.toString().padStart(2, '0')}`;

      const recognized = m === durationMonths - 1 ? currentDeferred : Math.min(currentDeferred, monthlyRate);
      const endBalance = +(currentDeferred - recognized).toFixed(2);

      schedule.push({
        periodMonthYear: periodKey,
        beginningDeferredBalanceUSD: +currentDeferred.toFixed(2),
        recognizedRevenueUSD: +recognized.toFixed(2),
        endingDeferredBalanceUSD: Math.max(0, endBalance)
      });

      currentDeferred = endBalance;
    }

    return schedule;
  }
}
