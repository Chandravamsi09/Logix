/**
 * Exhaustive CloudEvents Specification Registry for Logix Enterprise Mesh.
 */

export interface BaseDomainEventMetadata {
  eventId: string;
  timestamp: string;
  tenantId: string;
  correlationId: string;
  causationId?: string;
  sourceService: string;
  schemaVersion: string;
}

export interface InventoryMovementEventPayload {
  movementId: string;
  warehouseId: string;
  sku: string;
  quantity: number;
  movementType: string;
  sourceBin?: string;
  destinationBin?: string;
  operatorUserId: string;
}

export interface OrderStateChangedEventPayload {
  orderId: string;
  orderNumber: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  reason?: string;
  timestamp: string;
}

export interface ShipmentTelemetryPingPayload {
  vehicleId: string;
  shipmentId: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  heading: number;
  batteryLevelPercent?: number;
  ambientTemperatureC?: number;
}

export interface LedgerPostingEventPayload {
  transactionId: string;
  transactionNumber: string;
  referenceType: string;
  referenceId: string;
  totalDebitsCents: number;
  totalCreditsCents: number;
  postedByUserId: string;
}

export interface AlertTriggeredEventPayload {
  alertId: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'FATAL';
  category: 'INVENTORY_DEPLETION' | 'FLEET_DELAY' | 'PAYMENT_FRAUD' | 'SYSTEM_DEGRADATION';
  message: string;
  affectedEntityId: string;
  affectedEntityType: string;
}
