/**
 * Automated Multi-Bank Statement Reconciliation Engine
 * Matches MT940 / CAMT.053 bank statement credit lines with open accounts receivable ledgers.
 */

export interface IBankStatementLine {
  statementLineId: string;
  bankAccountNumber: string;
  bookingDate: Date;
  amountUSD: number;
  narrativeText: string;
  referenceNumber: string;
}

export interface IUnsettledInvoice {
  invoiceId: string;
  customerName: string;
  outstandingBalanceUSD: number;
  dueDate: Date;
}

export class MultiBankStatementReconciliationEngine {
  public reconcileStatements(
    statementLines: IBankStatementLine[],
    openInvoices: IUnsettledInvoice[]
  ): { matchedPairs: Array<{ statementId: string; invoiceId: string; amount: number }>; unmatchedLines: IBankStatementLine[] } {
    const matchedPairs: Array<{ statementId: string; invoiceId: string; amount: number }> = [];
    const unmatchedLines: IBankStatementLine[] = [];

    statementLines.forEach(line => {
      const match = openInvoices.find(inv => 
        inv.outstandingBalanceUSD === line.amountUSD || 
        line.narrativeText.includes(inv.invoiceId) ||
        line.referenceNumber === inv.invoiceId
      );

      if (match) {
        matchedPairs.push({
          statementId: line.statementLineId,
          invoiceId: match.invoiceId,
          amount: line.amountUSD
        });
      } else {
        unmatchedLines.push(line);
      }
    });

    return { matchedPairs, unmatchedLines };
  }
}
