import { OrderStatus, OrderPriority, Address, Money, SagaStatus } from '@nexus/common';

export interface OrderItemEntity {
  id: string;
  orderId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
}

export interface OrderEntity {
  id: string;
  tenantId: string;
  orderNumber: string;
  customerId: string;
  customerEmail: string;
  warehouseId: string;
  status: OrderStatus;
  priority: OrderPriority;
  items: OrderItemEntity[];
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  totalAmount: Money;
  shippingAddress: Address;
  billingAddress: Address;
  notes?: string;
  cancellationReason?: string;
  sagaInstanceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SagaStepRecord {
  stepName: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'COMPENSATED';
  payload?: Record<string, any>;
  error?: string;
  executedAt?: Date;
}

export interface SagaInstanceEntity {
  id: string;
  orderId: string;
  tenantId: string;
  status: SagaStatus;
  currentStep: string;
  steps: SagaStepRecord[];
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OutboxEventEntity {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
}
