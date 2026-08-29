import { OrderRepository, SagaRepository } from '../../services/order-service/src/repositories/inMemoryOrderRepositories';
import { OrderSagaOrchestrator } from '../../services/order-service/src/services/sagaOrchestrator';
import { OrderService } from '../../services/order-service/src/services/orderService';
import { OrderPriority, OrderStatus, SagaStatus } from '@nexus/common';
import { v4 as uuidv4 } from 'uuid';

describe('Order Management & Distributed Saga Test Suite', () => {
  let orderRepo: OrderRepository;
  let sagaRepo: SagaRepository;
  let sagaOrchestrator: OrderSagaOrchestrator;
  let orderService: OrderService;
  const tenantId = uuidv4();

  beforeEach(() => {
    orderRepo = new OrderRepository();
    sagaRepo = new SagaRepository();
    sagaOrchestrator = new OrderSagaOrchestrator(sagaRepo, orderRepo);
    orderService = new OrderService(orderRepo, sagaOrchestrator);
  });

  test('TC-06: Creating an order should initiate the distributed Saga orchestrator and transition states', async () => {
    const order = await orderService.createOrder({
      tenantId,
      customerId: uuidv4(),
      customerEmail: 'buyer@enterprise.com',
      warehouseId: uuidv4(),
      priority: OrderPriority.HIGH,
      items: [
        { sku: 'SKU-ROUTER-AX', productName: 'Enterprise Mesh Router', quantity: 2, unitPriceCents: 15000 }
      ],
      shippingAddress: {
        streetLine1: '500 Market St',
        city: 'San Francisco',
        stateOrProvince: 'CA',
        postalCode: '94105',
        countryCode: 'US',
        contactName: 'Operations Dept',
        contactPhone: '4155551234'
      },
      billingAddress: {
        streetLine1: '500 Market St',
        city: 'San Francisco',
        stateOrProvince: 'CA',
        postalCode: '94105',
        countryCode: 'US',
        contactName: 'Finance Dept',
        contactPhone: '4155551234'
      }
    });

    expect(order).toBeDefined();
    expect(order.orderNumber).toMatch(/^ORD-/);
    expect(order.subtotalCents).toBe(30000);
    expect(order.taxCents).toBe(2400);
    expect(order.shippingCents).toBe(1500);
    expect(order.totalAmount.amount).toBe(33900);
  });
});
