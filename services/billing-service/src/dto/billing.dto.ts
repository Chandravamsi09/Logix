import { z } from 'zod';
import { PaymentMethodType } from '@nexus/common';

export const CreateInvoiceSchema = z.object({
  tenantId: z.string().uuid(),
  orderId: z.string().uuid(),
  customerId: z.string().uuid(),
  subtotalCents: z.number().int().positive(),
  taxCents: z.number().int().nonnegative(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().int().positive(),
    unitPriceCents: z.number().int().positive()
  })).min(1),
  dueDateDays: z.number().int().positive().default(30)
});

export type CreateInvoiceDTO = z.infer<typeof CreateInvoiceSchema>;

export const ProcessPaymentSchema = z.object({
  tenantId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  orderId: z.string().uuid(),
  amountCents: z.number().int().positive(),
  currency: z.string().default('USD'),
  paymentMethod: z.nativeEnum(PaymentMethodType).default(PaymentMethodType.CREDIT_CARD)
});

export type ProcessPaymentDTO = z.infer<typeof ProcessPaymentSchema>;
