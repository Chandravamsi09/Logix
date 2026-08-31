/**
 * General Ledger Accounting Closing Period & Fiscal Year Manager
 * Controls soft/hard accounting month-end closes, retained earnings roll-overs, and journal locking.
 */

export interface IFiscalPeriod {
  periodId: string;
  fiscalYear: number;
  fiscalMonth: number;
  startDate: Date;
  endDate: Date;
  isClosed: boolean;
  closedByUserId?: string;
  closingJournalEntryId?: string;
}

export class GeneralLedgerClosingPeriodManager {
  private readonly periods = new Map<string, IFiscalPeriod>();

  public createFiscalYear(year: number): IFiscalPeriod[] {
    const created: IFiscalPeriod[] = [];
    for (let m = 1; m <= 12; m++) {
      const periodId = `FY${year}-M${m.toString().padStart(2, '0')}`;
      const startDate = new Date(year, m - 1, 1);
      const endDate = new Date(year, m, 0, 23, 59, 59);

      const period: IFiscalPeriod = {
        periodId,
        fiscalYear: year,
        fiscalMonth: m,
        startDate,
        endDate,
        isClosed: false
      };

      this.periods.set(periodId, period);
      created.push(period);
    }
    return created;
  }

  public closePeriod(periodId: string, actorUserId: string, closingEntryId: string): IFiscalPeriod {
    const period = this.periods.get(periodId);
    if (!period) throw new Error(`Fiscal period ${periodId} does not exist`);
    if (period.isClosed) throw new Error(`Fiscal period ${periodId} is already locked and closed`);

    period.isClosed = true;
    period.closedByUserId = actorUserId;
    period.closingJournalEntryId = closingEntryId;
    return period;
  }

  public isDatePostingAllowed(postingDate: Date): boolean {
    const y = postingDate.getFullYear();
    const m = postingDate.getMonth() + 1;
    const periodId = `FY${y}-M${m.toString().padStart(2, '0')}`;
    const period = this.periods.get(periodId);
    return !period || !period.isClosed;
  }
}
