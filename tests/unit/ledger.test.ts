import { BillingRepository } from '../../services/billing-service/src/repositories/inMemoryBillingRepositories';
import { DoubleEntryLedgerService } from '../../services/billing-service/src/services/doubleEntryLedgerService';
import { BillingService } from '../../services/billing-service/src/services/billingService';
import { UnbalancedLedgerException } from '@nexus/common';
import { v4 as uuidv4 } from 'uuid';

describe('Financial Double-Entry Ledger Test Suite', () => {
  let billingRepo: BillingRepository;
  let ledgerService: DoubleEntryLedgerService;
  let billingService: BillingService;
  const tenantId = uuidv4();

  beforeEach(() => {
    billingRepo = new BillingRepository();
    billingRepo.seedDefaultAccounts(tenantId);
    ledgerService = new DoubleEntryLedgerService(billingRepo);
    billingService = new BillingService(billingRepo, ledgerService);
  });

  test('TC-07: Double-entry ledger must enforce debit-credit equality (Debits == Credits)', async () => {
    const accounts = await billingRepo.listAccounts(tenantId);
    const cashAcc = accounts[0];
    const revAcc = accounts[1];

    const tx = await ledgerService.postJournalEntry(
      tenantId,
      'PAYMENT',
      uuidv4(),
      'Balanced Customer Payment',
      [
        { accountId: cashAcc.id, accountName: cashAcc.name, debitCents: 5000, creditCents: 0, description: 'Debit Cash' },
        { accountId: revAcc.id, accountName: revAcc.name, debitCents: 0, creditCents: 5000, description: 'Credit Revenue' }
      ]
    );

    expect(tx).toBeDefined();
    expect(tx.totalAmountCents).toBe(5000);
  });

  test('TC-08: Unbalanced ledger entries must throw UnbalancedLedgerException and reject posting', async () => {
    const accounts = await billingRepo.listAccounts(tenantId);
    const cashAcc = accounts[0];
    const revAcc = accounts[1];

    await expect(ledgerService.postJournalEntry(
      tenantId,
      'ADJUSTMENT',
      uuidv4(),
      'Unbalanced Fraudulent Entry',
      [
        { accountId: cashAcc.id, accountName: cashAcc.name, debitCents: 5000, creditCents: 0, description: 'Debit Cash' },
        { accountId: revAcc.id, accountName: revAcc.name, debitCents: 0, creditCents: 4500, description: 'Credit Revenue Mismatch' }
      ]
    )).rejects.toThrow(UnbalancedLedgerException);
  });
});
