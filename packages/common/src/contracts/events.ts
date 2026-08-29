import { v4 as uuidv4 } from 'uuid';
import { OrderStatus, ShipmentStatus, PaymentStatus } from '../types/enums';
import { Money, Address } from '../types/common';

export interface CloudEventEnvelope<T = any> {
  specversion: '1.0';
  id: string;
  source: string;
  type: string;
  subject?: string;
  time: string;
  datacontenttype: 'application/json';
  tenantId: string;
  correlationId: string;
  data: T;
}

export function createCloudEvent<T>(
  type: string,
  source: string,
  data: T,
  tenantId: string,
  correlationId: string,
  subject?: string
): CloudEventEnvelope<T> {
  return {
    specversion: '1.0',
    id: uuidv4(),
    source,
    type,
    subject,
    time: new Date().toISOString(),
    datacontenttype: 'application/json',
    tenantId,
    correlationId,
    data
  };
}

// Domain Event Types
export const EventTypes = {
  // Auth Events
  USER_REGISTERED: 'logix.auth.user.registered.v1',
  USER_LOGGED_IN: 'logix.auth.user.logged_in.v1',
  ROLE_ASSIGNED: 'logix.auth.user.role_assigned.v1',
  TENANT_CREATED: 'logix.auth.tenant.created.v1',

  // Order Events
  ORDER_CREATED: 'logix.order.created.v1',
  ORDER_VALIDATED: 'logix.order.validated.v1',
  ORDER_CANCELLED: 'logix.order.cancelled.v1',
  ORDER_COMPLETED: 'logix.order.completed.v1',

  // Inventory Events
  INVENTORY_RESERVED: 'logix.inventory.reserved.v1',
  INVENTORY_RESERVATION_FAILED: 'logix.inventory.reservation_failed.v1',
  INVENTORY_RELEASED: 'logix.inventory.released.v1',
  STOCK_DEPLETED: 'logix.inventory.stock_depleted.v1',
  REORDER_THRESHOLD_REACHED: 'logix.inventory.reorder_threshold.v1',

  // Billing & Payment Events
  INVOICE_GENERATED: 'logix.billing.invoice.generated.v1',
  PAYMENT_REQUESTED: 'logix.billing.payment.requested.v1',
  PAYMENT_SUCCEEDED: 'logix.billing.payment.succeeded.v1',
  PAYMENT_FAILED: 'logix.billing.payment.failed.v1',
  LEDGER_POSTED: 'logix.billing.ledger.posted.v1',

  // Logistics & Fleet Events
  SHIPMENT_DISPATCH_REQUESTED: 'logix.logistics.shipment.dispatch_requested.v1',
  SHIPMENT_DISPATCHED: 'logix.logistics.shipment.dispatched.v1',
  SHIPMENT_WAYPOINT_REACHED: 'logix.logistics.shipment.waypoint_reached.v1',
  SHIPMENT_DELIVERED: 'logix.logistics.shipment.delivered.v1',
  FLEET_TELEMETRY_RECORDED: 'logix.logistics.fleet.telemetry.v1',

  // Notification Events
  NOTIFICATION_DISPATCHED: 'logix.notification.dispatched.v1',
  ALERT_TRIGGERED: 'logix.notification.alert.triggered.v1'
} as const;

// Event Payload Interfaces
export interface OrderCreatedPayload {
  orderId: string;
  orderNumber: string;
  customerId: string;
  items: Array<{ sku: string; quantity: number; unitPriceCents: number }>;
  totalAmount: Money;
  shippingAddress: Address;
  billingAddress: Address;
}

export interface InventoryReservedPayload {
  orderId: string;
  reservationId: string;
  warehouseId: string;
  items: Array<{ sku: string; reservedQty: number; binLocationId: string }>;
}

export interface PaymentProcessedPayload {
  paymentId: string;
  orderId: string;
  amount: Money;
  status: PaymentStatus;
  gatewayTransactionReference: string;
  processedAt: string;
}

export interface ShipmentDispatchedPayload {
  shipmentId: string;
  orderId: string;
  trackingNumber: string;
  carrierId: string;
  vehicleId: string;
  driverId: string;
  estimatedDeliveryTime: string;
}

export interface ShipmentDeliveredPayload {
  shipmentId: string;
  orderId: string;
  deliveredAt: string;
  recipientSignatureUrl?: string;
  proofOfDeliveryNotes?: string;
}
