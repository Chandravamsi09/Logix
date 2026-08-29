import { OrderRepository, SagaRepository } from '../repositories/inMemoryOrderRepositories';
import { OrderSagaOrchestrator } from './sagaOrchestrator';
import { CreateOrderDTO, CancelOrderDTO } from '../dto/order.dto';
import { CryptoUtils, OrderStatus, NotFoundException, ConflictException } from '@nexus/common';
import { v4 as uuidv4 } from 'uuid';

export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly sagaOrchestrator: OrderSagaOrchestrator
  ) {}

  async createOrder(dto: CreateOrderDTO) {
    let subtotalCents = 0;
    const items = dto.items.map(item => {
      const lineTotal = item.quantity * item.unitPriceCents;
      subtotalCents += lineTotal;
      return {
        id: uuidv4(),
        orderId: '',
        sku: item.sku,
        productName: item.productName,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        totalPriceCents: lineTotal
      };
    });

    const taxCents = Math.round(subtotalCents * 0.08); // 8% sales tax
    const shippingCents = 1500; // $15.00 flat rate shipping
    const totalCents = subtotalCents + taxCents + shippingCents;
    const orderNumber = CryptoUtils.generateOrderNumber();

    const order = await this.orderRepo.create({
      tenantId: dto.tenantId,
      orderNumber,
      customerId: dto.customerId,
      customerEmail: dto.customerEmail,
      warehouseId: dto.warehouseId,
      status: OrderStatus.PENDING_VALIDATION,
      priority: dto.priority,
      items,
      subtotalCents,
      taxCents,
      shippingCents,
      totalAmount: { amount: totalCents, currency: 'USD' },
      shippingAddress: dto.shippingAddress,
      billingAddress: dto.billingAddress,
      notes: dto.notes
    });

    // Launch distributed Saga asynchronous workflow
    this.sagaOrchestrator.startOrderSaga(order.id, dto.tenantId).catch(() => {});

    return order;
  }

  async getOrder(id: string) {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new NotFoundException('Order', id);
    }
    return order;
  }

  async listOrders(tenantId: string) {
    return this.orderRepo.listByTenant(tenantId);
  }

  async cancelOrder(id: string, dto: CancelOrderDTO) {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new NotFoundException('Order', id);
    }

    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
      throw new ConflictException(`Cannot cancel order in status '${order.status}'.`);
    }

    return this.orderRepo.update(id, {
      status: OrderStatus.CANCELLED,
      cancellationReason: dto.reason
    });
  }
}
