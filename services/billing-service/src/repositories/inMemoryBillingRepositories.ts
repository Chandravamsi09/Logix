import { ChartOfAccountEntity, JournalTransactionEntity, InvoiceEntity, PaymentTransactionEntity } from '../models/entities';
import { AccountType } from '@nexus/common';
import { v4 as uuidv4 } from 'uuid';

export class BillingRepository {
  private accounts = new Map<string, ChartOfAccountEntity>();
  private journals: JournalTransactionEntity[] = [];
  private invoices = new Map<string, InvoiceEntity>();
  private payments = new Map<string, PaymentTransactionEntity>();

  constructor() {
    this.seedDefaultAccounts('global-tenant');
  }

  seedDefaultAccounts(tenantId: string) {
    const defaultAccounts = [
      { num: '1010', name: 'Cash and Cash Equivalents', type: AccountType.ASSET_CASH },
      { num: '1200', name: 'Accounts Receivable', type: AccountType.ASSET_RECEIVABLES },
      { num: '1300', name: 'Inventory Asset', type: AccountType.ASSET_INVENTORY },
      { num: '2010', name: 'Accounts Payable', type: AccountType.LIABILITY_PAYABLES },
      { num: '4010', name: 'Supply Chain Fulfillment Revenue', type: AccountType.REVENUE_FULFILLMENT },
      { num: '5010', name: 'Cost of Goods Sold (COGS)', type: AccountType.EXPENSE_COGS }
    ];

    for (const acc of defaultAccounts) {
      const id = uuidv4();
      this.accounts.set(id, {
        id,
        tenantId,
        accountNumber: acc.num,
        name: acc.name,
        type: acc.type,
        currency: 'USD',
        balanceCents: 0,
        isActive: true,
        createdAt: new Date()
      });
    }
  }

  async listAccounts(tenantId: string): Promise<ChartOfAccountEntity[]> {
    return Array.from(this.accounts.values()).filter(a => a.tenantId === tenantId || a.tenantId === 'global-tenant');
  }

  async recordJournalTransaction(tx: Omit<JournalTransactionEntity, 'id'>): Promise<JournalTransactionEntity> {
    const entity: JournalTransactionEntity = {
      ...tx,
      id: uuidv4()
    };
    this.journals.push(entity);
    return entity;
  }

  async listJournals(tenantId: string): Promise<JournalTransactionEntity[]> {
    return this.journals.filter(j => j.tenantId === tenantId);
  }

  async createInvoice(inv: Omit<InvoiceEntity, 'id' | 'createdAt'>): Promise<InvoiceEntity> {
    const entity: InvoiceEntity = {
      ...inv,
      id: uuidv4(),
      createdAt: new Date()
    };
    this.invoices.set(entity.id, entity);
    return entity;
  }

  async findInvoiceById(id: string): Promise<InvoiceEntity | null> {
    return this.invoices.get(id) || null;
  }

  async listInvoices(tenantId: string): Promise<InvoiceEntity[]> {
    return Array.from(this.invoices.values()).filter(i => i.tenantId === tenantId);
  }

  async recordPayment(pay: Omit<PaymentTransactionEntity, 'id' | 'createdAt'>): Promise<PaymentTransactionEntity> {
    const entity: PaymentTransactionEntity = {
      ...pay,
      id: uuidv4(),
      createdAt: new Date()
    };
    this.payments.set(entity.id, entity);
    return entity;
  }
}
