import { AccountType, InvoiceStatus, PaymentMethodType, PaymentStatus, Money } from '@nexus/common';

export interface ChartOfAccountEntity {
  id: string;
  tenantId: string;
  accountNumber: string;
  name: string;
  type: AccountType;
  currency: string;
  balanceCents: number;
  isActive: boolean;
  createdAt: Date;
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountName: string;
  debitCents: number;
  creditCents: number;
  description: string;
}

export interface JournalTransactionEntity {
  id: string;
  tenantId: string;
  transactionNumber: string;
  referenceType: 'ORDER' | 'INVOICE' | 'PAYMENT' | 'ADJUSTMENT';
  referenceId: string;
  description: string;
  totalAmountCents: number;
  lines: JournalEntryLine[];
  postedAt: Date;
}

export interface InvoiceLineItemEntity {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
}

export interface InvoiceEntity {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  orderId: string;
  customerId: string;
  status: InvoiceStatus;
  lines: InvoiceLineItemEntity[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  amountPaidCents: number;
  amountDueCents: number;
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
}

export interface PaymentTransactionEntity {
  id: string;
  tenantId: string;
  invoiceId: string;
  orderId: string;
  amount: Money;
  paymentMethod: PaymentMethodType;
  status: PaymentStatus;
  gatewayTransactionRef: string;
  errorMessage?: string;
  createdAt: Date;
}
