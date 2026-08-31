/**
 * Accounts Receivable Aged Debt Aging Bucket Report Compiler
 * Segregates unpaid trade invoices into Current, 1-30, 31-60, 61-90, and 90+ days aging buckets.
 */

export interface IReceivableAgingBucket {
  currentUSD: number;
  days1To30USD: number;
  days31To60USD: number;
  days61To90USD: number;
  days90PlusUSD: number;
  totalReceivablesUSD: number;
  allowanceForDoubtfulAccountsUSD: number;
}

export class AutomatedAgedReceivablesAgingBucketReport {
  public compileAgingBuckets(invoices: Array<{ outstandingAmountUSD: number; daysPastDue: number }>): IReceivableAgingBucket {
    let cur = 0, d30 = 0, d60 = 0, d90 = 0, d90p = 0;

    invoices.forEach(inv => {
      if (inv.daysPastDue <= 0) cur += inv.outstandingAmountUSD;
      else if (inv.daysPastDue <= 30) d30 += inv.outstandingAmountUSD;
      else if (inv.daysPastDue <= 60) d60 += inv.outstandingAmountUSD;
      else if (inv.daysPastDue <= 90) d90 += inv.outstandingAmountUSD;
      else d90p += inv.outstandingAmountUSD;
    });

    const total = cur + d30 + d60 + d90 + d90p;
    // Expected Credit Loss (ECL) under IFRS 9: 1% on Current, 5% on 30d, 15% on 60d, 35% on 90d, 70% on 90+
    const doubtful = (cur * 0.01) + (d30 * 0.05) + (d60 * 0.15) + (d90 * 0.35) + (d90p * 0.70);

    return {
      currentUSD: +cur.toFixed(2),
      days1To30USD: +d30.toFixed(2),
      days31To60USD: +d60.toFixed(2),
      days61To90USD: +d90.toFixed(2),
      days90PlusUSD: +d90p.toFixed(2),
      totalReceivablesUSD: +total.toFixed(2),
      allowanceForDoubtfulAccountsUSD: +doubtful.toFixed(2)
    };
  }
}
