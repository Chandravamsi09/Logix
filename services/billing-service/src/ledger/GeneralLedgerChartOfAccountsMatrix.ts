export interface IAccountDefinition {
  accountNumber: string;
  accountName: string;
  accountCategory: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  normalBalance: 'DEBIT' | 'CREDIT';
  currencyCode: string;
  currentBalanceUSD: number;
  isSubLedgerEnabled: boolean;
  taxReportingCode: string;
}

export class GeneralLedgerChartOfAccountsMatrix {
  private readonly accounts = new Map<string, IAccountDefinition>();

  constructor() {
    this.seedChartOfAccounts();
  }

  private seedChartOfAccounts(): void {
    const standardAccounts: IAccountDefinition[] = [
      { accountNumber: '1010', accountName: 'Operating Cash in Bank', accountCategory: 'ASSET', normalBalance: 'DEBIT', currencyCode: 'USD', currentBalanceUSD: 1450000.0, isSubLedgerEnabled: true, taxReportingCode: 'CASH_EQ' },
      { accountNumber: '1100', accountName: 'Trade Accounts Receivable', accountCategory: 'ASSET', normalBalance: 'DEBIT', currencyCode: 'USD', currentBalanceUSD: 850000.0, isSubLedgerEnabled: true, taxReportingCode: 'AR_TRADE' },
      { accountNumber: '1200', accountName: 'Merchandise Inventory Stock', accountCategory: 'ASSET', normalBalance: 'DEBIT', currencyCode: 'USD', currentBalanceUSD: 3200000.0, isSubLedgerEnabled: true, taxReportingCode: 'INV_FINISHED' },
      { accountNumber: '1300', accountName: 'Prepaid Expenses & Insurance', accountCategory: 'ASSET', normalBalance: 'DEBIT', currencyCode: 'USD', currentBalanceUSD: 120000.0, isSubLedgerEnabled: false, taxReportingCode: 'PREPAID' },
      { accountNumber: '1500', accountName: 'Warehouse Machinery & Fleet Equipment', accountCategory: 'ASSET', normalBalance: 'DEBIT', currencyCode: 'USD', currentBalanceUSD: 4500000.0, isSubLedgerEnabled: true, taxReportingCode: 'PPE_FLEET' },
      { accountNumber: '1600', accountName: 'Accumulated Depreciation - Fleet', accountCategory: 'ASSET', normalBalance: 'CREDIT', currencyCode: 'USD', currentBalanceUSD: -850000.0, isSubLedgerEnabled: true, taxReportingCode: 'ACC_DEPR' },
      { accountNumber: '2010', accountName: 'Accounts Payable - Vendors', accountCategory: 'LIABILITY', normalBalance: 'CREDIT', currencyCode: 'USD', currentBalanceUSD: 620000.0, isSubLedgerEnabled: true, taxReportingCode: 'AP_TRADE' },
      { accountNumber: '2100', accountName: 'Accrued Payroll & Driver Benefits', accountCategory: 'LIABILITY', normalBalance: 'CREDIT', currencyCode: 'USD', currentBalanceUSD: 180000.0, isSubLedgerEnabled: false, taxReportingCode: 'PAYROLL_LIAB' },
      { accountNumber: '2200', accountName: 'Sales Tax Payable to Jurisdictions', accountCategory: 'LIABILITY', normalBalance: 'CREDIT', currencyCode: 'USD', currentBalanceUSD: 95000.0, isSubLedgerEnabled: true, taxReportingCode: 'TAX_PAYABLE' },
      { accountNumber: '2500', accountName: 'Commercial Equipment Term Loan', accountCategory: 'LIABILITY', normalBalance: 'CREDIT', currencyCode: 'USD', currentBalanceUSD: 2100000.0, isSubLedgerEnabled: false, taxReportingCode: 'LT_DEBT' },
      { accountNumber: '3010', accountName: 'Common Share Capital', accountCategory: 'EQUITY', normalBalance: 'CREDIT', currencyCode: 'USD', currentBalanceUSD: 3000000.0, isSubLedgerEnabled: false, taxReportingCode: 'EQUITY_CAP' },
      { accountNumber: '3100', accountName: 'Retained Earnings Cumulative', accountCategory: 'EQUITY', normalBalance: 'CREDIT', currencyCode: 'USD', currentBalanceUSD: 3425000.0, isSubLedgerEnabled: false, taxReportingCode: 'RET_EARN' },
      { accountNumber: '4010', accountName: 'Gross Freight Logistics Revenue', accountCategory: 'REVENUE', normalBalance: 'CREDIT', currencyCode: 'USD', currentBalanceUSD: 5800000.0, isSubLedgerEnabled: true, taxReportingCode: 'REV_FREIGHT' },
      { accountNumber: '4020', accountName: 'Warehouse Storage & Handling Revenue', accountCategory: 'REVENUE', normalBalance: 'CREDIT', currencyCode: 'USD', currentBalanceUSD: 2100000.0, isSubLedgerEnabled: true, taxReportingCode: 'REV_STORAGE' },
      { accountNumber: '5010', accountName: 'Cost of Goods Sold - Fuel & Tolls', accountCategory: 'EXPENSE', normalBalance: 'DEBIT', currencyCode: 'USD', currentBalanceUSD: 1450000.0, isSubLedgerEnabled: true, taxReportingCode: 'COGS_FUEL' },
      { accountNumber: '5020', accountName: 'Cost of Goods Sold - Direct Labor', accountCategory: 'EXPENSE', normalBalance: 'DEBIT', currencyCode: 'USD', currentBalanceUSD: 1850000.0, isSubLedgerEnabled: true, taxReportingCode: 'COGS_LABOR' },
      { accountNumber: '6010', accountName: 'Software Cloud Infrastructure Expenses', accountCategory: 'EXPENSE', normalBalance: 'DEBIT', currencyCode: 'USD', currentBalanceUSD: 240000.0, isSubLedgerEnabled: false, taxReportingCode: 'OPEX_CLOUD' },
      { accountNumber: '6020', accountName: 'General Facility Administrative Overhead', accountCategory: 'EXPENSE', normalBalance: 'DEBIT', currencyCode: 'USD', currentBalanceUSD: 310000.0, isSubLedgerEnabled: false, taxReportingCode: 'OPEX_GNA' }
    ];

    standardAccounts.forEach(acc => this.accounts.set(acc.accountNumber, acc));
  }

  public postJournalEntry(debitAccount: string, creditAccount: string, amountUSD: number): boolean {
    const debit = this.accounts.get(debitAccount);
    const credit = this.accounts.get(creditAccount);
    if (!debit || !credit) return false;

    if (debit.normalBalance === 'DEBIT') {
      debit.currentBalanceUSD += amountUSD;
    } else {
      debit.currentBalanceUSD -= amountUSD;
    }

    if (credit.normalBalance === 'CREDIT') {
      credit.currentBalanceUSD += amountUSD;
    } else {
      credit.currentBalanceUSD -= amountUSD;
    }

    return true;
  }

  public verifyTrialBalance(): { isBalanced: boolean; totalDebitsUSD: number; totalCreditsUSD: number; differenceUSD: number } {
    let debits = 0, credits = 0;

    for (const acc of this.accounts.values()) {
      if (acc.normalBalance === 'DEBIT') {
        debits += acc.currentBalanceUSD;
      } else {
        credits += acc.currentBalanceUSD;
      }
    }

    const diff = Math.abs(debits - credits);
    return {
      isBalanced: diff < 0.01,
      totalDebitsUSD: +debits.toFixed(2),
      totalCreditsUSD: +credits.toFixed(2),
      differenceUSD: +diff.toFixed(2)
    };
  }
}
