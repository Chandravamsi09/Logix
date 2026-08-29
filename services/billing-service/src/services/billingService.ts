import { BillingRepository } from '../repositories/inMemoryBillingRepositories';
import { DoubleEntryLedgerService } from './doubleEntryLedgerService';
import { CreateInvoiceDTO, ProcessPaymentDTO } from '../dto/billing.dto';
import { CryptoUtils, InvoiceStatus, PaymentStatus, NotFoundException, Logger } from '@nexus/common';
import { v4 as uuidv4 } from 'uuid';

export class BillingService {
  private readonly logger = new Logger('BillingService');

  constructor(
    private readonly billingRepo: BillingRepository,
    private readonly ledgerService: DoubleEntryLedgerService
  ) {}

  async createInvoice(dto: CreateInvoiceDTO) {
    const totalCents = dto.subtotalCents + dto.taxCents;
    const invoiceNumber = CryptoUtils.generateInvoiceNumber();
    const dueDate = new Date(Date.now() + dto.dueDateDays * 24 * 60 * 60 * 1000);

    const lines = dto.items.map(i => ({
      id: uuidv4(),
      description: i.description,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents,
      totalCents: i.quantity * i.unitPriceCents
    }));

    const invoice = await this.billingRepo.createInvoice({
      tenantId: dto.tenantId,
      invoiceNumber,
      orderId: dto.orderId,
      customerId: dto.customerId,
      status: InvoiceStatus.ISSUED,
      lines,
      subtotalCents: dto.subtotalCents,
      taxCents: dto.taxCents,
      totalCents,
      amountPaidCents: 0,
      amountDueCents: totalCents,
      dueDate
    });

    // Record AR posting in general ledger
    const accounts = await this.billingRepo.listAccounts(dto.tenantId);
    const arAccount = accounts.find(a => a.accountNumber === '1200') || accounts[0];
    const revAccount = accounts.find(a => a.accountNumber === '4010') || accounts[1];

    await this.ledgerService.postJournalEntry(
      dto.tenantId,
      'INVOICE',
      invoice.id,
      `Invoice ${invoiceNumber} issued for Order ${dto.orderId}`,
      [
        { accountId: arAccount.id, accountName: arAccount.name, debitCents: totalCents, creditCents: 0, description: 'Accounts Receivable Debit' },
        { accountId: revAccount.id, accountName: revAccount.name, debitCents: 0, creditCents: totalCents, description: 'Fulfillment Revenue Credit' }
      ]
    );

    return invoice;
  }

  async processPayment(dto: ProcessPaymentDTO) {
    const invoice = await this.billingRepo.findInvoiceById(dto.invoiceId);
    if (!invoice) {
      throw new NotFoundException('Invoice', dto.invoiceId);
    }

    const gatewayRef = `PAY-${Date.now().toString(36).toUpperCase()}-${CryptoUtils.generateRandomToken(4).toUpperCase()}`;

    const payment = await this.billingRepo.recordPayment({
      tenantId: dto.tenantId,
      invoiceId: dto.invoiceId,
      orderId: dto.orderId,
      amount: { amount: dto.amountCents, currency: dto.currency },
      paymentMethod: dto.paymentMethod,
      status: PaymentStatus.CAPTURED,
      gatewayTransactionRef: gatewayRef
    });

    invoice.amountPaidCents += dto.amountCents;
    invoice.amountDueCents = Math.max(0, invoice.totalCents - invoice.amountPaidCents);
    if (invoice.amountDueCents === 0) {
      invoice.status = InvoiceStatus.PAID;
      invoice.paidAt = new Date();
    } else {
      invoice.status = InvoiceStatus.PARTIALLY_PAID;
    }

    // Record Cash Receipt in general ledger
    const accounts = await this.billingRepo.listAccounts(dto.tenantId);
    const cashAccount = accounts.find(a => a.accountNumber === '1010') || accounts[0];
    const arAccount = accounts.find(a => a.accountNumber === '1200') || accounts[1];

    await this.ledgerService.postJournalEntry(
      dto.tenantId,
      'PAYMENT',
      payment.id,
      `Payment captured for Invoice ${invoice.invoiceNumber}`,
      [
        { accountId: cashAccount.id, accountName: cashAccount.name, debitCents: dto.amountCents, creditCents: 0, description: 'Cash Inflow Debit' },
        { accountId: arAccount.id, accountName: arAccount.name, debitCents: 0, creditCents: dto.amountCents, description: 'Accounts Receivable Credit' }
      ]
    );

    return { payment, invoice };
  }

  async listInvoices(tenantId: string) {
    return this.billingRepo.listInvoices(tenantId);
  }

  async listLedger(tenantId: string) {
    return this.billingRepo.listJournals(tenantId);
  }

  async listAccounts(tenantId: string) {
    return this.billingRepo.listAccounts(tenantId);
  }
}
