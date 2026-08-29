import { z } from 'zod';
import { WarehouseZoneType, StockMovementType } from '@nexus/common';

export const CreateProductSchema = z.object({
  tenantId: z.string().uuid(),
  sku: z.string().min(3).max(50).toUpperCase(),
  name: z.string().min(1).max(200),
  description: z.string().default(''),
  category: z.string().min(1).max(100),
  unitOfMeasure: z.string().default('EACH'),
  dimensionsCm: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive()
  }),
  weightKg: z.number().positive(),
  unitCostCents: z.number().int().nonnegative(),
  retailPriceCents: z.number().int().positive(),
  barcode: z.string().min(5).max(100),
  reorderThreshold: z.number().int().nonnegative().default(10),
  reorderQuantity: z.number().int().positive().default(50)
});

export type CreateProductDTO = z.infer<typeof CreateProductSchema>;

export const CreateWarehouseSchema = z.object({
  tenantId: z.string().uuid(),
  code: z.string().min(2).max(20).toUpperCase(),
  name: z.string().min(2).max(150),
  address: z.object({
    streetLine1: z.string().min(3),
    city: z.string().min(2),
    stateOrProvince: z.string().min(2),
    postalCode: z.string().min(2),
    countryCode: z.string().length(2).toUpperCase()
  }),
  totalAreaSqFt: z.number().positive(),
  maxPalletCapacity: z.number().int().positive()
});

export type CreateWarehouseDTO = z.infer<typeof CreateWarehouseSchema>;

export const ReserveStockSchema = z.object({
  tenantId: z.string().uuid(),
  orderId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  items: z.array(z.object({
    sku: z.string().min(3),
    quantity: z.number().int().positive()
  })).min(1)
});

export type ReserveStockDTO = z.infer<typeof ReserveStockSchema>;

export const AdjustStockSchema = z.object({
  tenantId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  binLocationId: z.string().uuid(),
  sku: z.string().min(3),
  movementType: z.nativeEnum(StockMovementType),
  quantityDelta: z.number().int(),
  referenceId: z.string().optional(),
  userId: z.string().uuid(),
  notes: z.string().optional()
});

export type AdjustStockDTO = z.infer<typeof AdjustStockSchema>;
