import { WarehouseZoneType, StockMovementType } from '@nexus/common';

export interface ProductEntity {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  unitOfMeasure: string;
  dimensionsCm: { length: number; width: number; height: number };
  weightKg: number;
  unitCostCents: number;
  retailPriceCents: number;
  barcode: string;
  reorderThreshold: number;
  reorderQuantity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WarehouseEntity {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  address: {
    streetLine1: string;
    city: string;
    stateOrProvince: string;
    postalCode: string;
    countryCode: string;
  };
  totalAreaSqFt: number;
  maxPalletCapacity: number;
  isActive: boolean;
  createdAt: Date;
}

export interface BinLocationEntity {
  id: string;
  warehouseId: string;
  tenantId: string;
  zone: WarehouseZoneType;
  aisle: string;
  rack: string;
  shelf: string;
  binCode: string; // e.g. A-02-3-B
  maxVolumeCm3: number;
  maxWeightKg: number;
  isOccupied: boolean;
}

export interface StockLevelEntity {
  id: string;
  tenantId: string;
  warehouseId: string;
  binLocationId: string;
  sku: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number; // Computed: onHand - reserved
  batchNumber?: string;
  expiryDate?: Date;
  updatedAt: Date;
}

export interface StockReservationEntity {
  id: string;
  tenantId: string;
  orderId: string;
  warehouseId: string;
  sku: string;
  reservedQty: number;
  binLocationId: string;
  status: 'ACTIVE' | 'FULFILLED' | 'RELEASED' | 'EXPIRED';
  expiresAt: Date;
  createdAt: Date;
}

export interface StockAuditMovementEntity {
  id: string;
  tenantId: string;
  warehouseId: string;
  sku: string;
  movementType: StockMovementType;
  quantityDelta: number;
  referenceId?: string; // OrderId, POId, TransferId
  performedByUserId: string;
  notes?: string;
  createdAt: Date;
}
