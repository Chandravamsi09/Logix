import { BillingRepository } from '../repositories/inMemoryBillingRepositories';
import { JournalEntryLine, JournalTransactionEntity } from '../models/entities';
import { UnbalancedLedgerException, CryptoUtils, Logger } from '@nexus/common';
import { v4 as uuidv4 } from 'uuid';

export class DoubleEntryLedgerService {
  private readonly logger = new Logger('DoubleEntryLedgerService');

  constructor(private readonly billingRepo: BillingRepository) {}

  async postJournalEntry(
    tenantId: string,
    referenceType: 'ORDER' | 'INVOICE' | 'PAYMENT' | 'ADJUSTMENT',
    referenceId: string,
    description: string,
    lines: Array<{ accountId: string; accountName: string; debitCents: number; creditCents: number; description: string }>
  ): Promise<JournalTransactionEntity> {
    let totalDebits = 0;
    let totalCredits = 0;

    const formattedLines: JournalEntryLine[] = lines.map(line => {
      totalDebits += line.debitCents;
      totalCredits += line.creditCents;
      return {
        id: uuidv4(),
        accountId: line.accountId,
        accountName: line.accountName,
        debitCents: line.debitCents,
        creditCents: line.creditCents,
        description: line.description
      };
    });

    // Enforce fundamental accounting equation: Total Debits must strictly equal Total Credits
    if (totalDebits !== totalCredits) {
      this.logger.error(`Double-entry ledger invariant violated: Debits (${totalDebits}) != Credits (${totalCredits})`);
      throw new UnbalancedLedgerException(totalDebits, totalCredits);
    }

    const txNumber = `TXN-${Date.now().toString(36).toUpperCase()}-${CryptoUtils.generateRandomToken(2).toUpperCase()}`;

    return this.billingRepo.recordJournalTransaction({
      tenantId,
      transactionNumber: txNumber,
      referenceType,
      referenceId,
      description,
      totalAmountCents: totalDebits,
      lines: formattedLines,
      postedAt: new Date()
    });
  }
}
