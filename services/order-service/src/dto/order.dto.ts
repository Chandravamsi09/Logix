import { z } from 'zod';
import { OrderPriority } from '@nexus/common';

const AddressSchema = z.object({
  streetLine1: z.string().min(3),
  streetLine2: z.string().optional(),
  city: z.string().min(2),
  stateOrProvince: z.string().min(2),
  postalCode: z.string().min(2),
  countryCode: z.string().length(2).toUpperCase(),
  contactName: z.string().min(2),
  contactPhone: z.string().min(5),
  contactEmail: z.string().email().optional(),
  instructions: z.string().optional()
});

export const CreateOrderSchema = z.object({
  tenantId: z.string().uuid(),
  customerId: z.string().uuid(),
  customerEmail: z.string().email(),
  warehouseId: z.string().uuid(),
  priority: z.nativeEnum(OrderPriority).default(OrderPriority.STANDARD),
  items: z.array(z.object({
    sku: z.string().min(3),
    productName: z.string().min(1),
    quantity: z.number().int().positive(),
    unitPriceCents: z.number().int().positive()
  })).min(1, 'Order must contain at least one line item.'),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema,
  notes: z.string().optional()
});

export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>;

export const CancelOrderSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason must be provided.')
});

export type CancelOrderDTO = z.infer<typeof CancelOrderSchema>;
