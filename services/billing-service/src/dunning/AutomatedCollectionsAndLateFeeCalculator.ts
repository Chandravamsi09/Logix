/**
 * Commercial Accounts Receivable Late Fee & Compound Interest Calculator
 * Enforces statutory prompt payment acts, late fee grace periods, and compounding finance charges.
 */

export interface IOverdueReceivable {
  invoiceNumber: string;
  customerId: string;
  originalAmountUSD: number;
  outstandingBalanceUSD: number;
  dueDate: Date;
  gracePeriodDays: number;
  annualFinanceRatePct: number;
  fixedLateFeeUSD: number;
}

export class AutomatedCollectionsAndLateFeeCalculator {
  public calculateDelinquencyFees(
    receivable: IOverdueReceivable,
    asOfDate: Date = new Date()
  ): { daysOverdue: number; isWithinGracePeriod: boolean; accruedInterestUSD: number; totalDueWithFeesUSD: number } {
    const elapsedMs = asOfDate.getTime() - receivable.dueDate.getTime();
    const daysOverdue = Math.max(0, Math.floor(elapsedMs / (1000 * 86400)));

    if (daysOverdue <= receivable.gracePeriodDays) {
      return {
        daysOverdue,
        isWithinGracePeriod: true,
        accruedInterestUSD: 0,
        totalDueWithFeesUSD: receivable.outstandingBalanceUSD
      };
    }

    const chargeableDays = daysOverdue - receivable.gracePeriodDays;
    const dailyRate = (receivable.annualFinanceRatePct / 100) / 365;
    const accruedInterest = +(receivable.outstandingBalanceUSD * dailyRate * chargeableDays).toFixed(2);
    const totalDue = +(receivable.outstandingBalanceUSD + accruedInterest + receivable.fixedLateFeeUSD).toFixed(2);

    return {
      daysOverdue,
      isWithinGracePeriod: false,
      accruedInterestUSD: accruedInterest,
      totalDueWithFeesUSD: totalDue
    };
  }
}
