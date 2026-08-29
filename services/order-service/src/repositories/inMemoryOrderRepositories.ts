import { OrderEntity, SagaInstanceEntity, OutboxEventEntity } from '../models/entities';
import { v4 as uuidv4 } from 'uuid';

export class OrderRepository {
  private orders = new Map<string, OrderEntity>();

  async create(order: Omit<OrderEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderEntity> {
    const entity: OrderEntity = {
      ...order,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.set(entity.id, entity);
    return entity;
  }

  async findById(id: string): Promise<OrderEntity | null> {
    return this.orders.get(id) || null;
  }

  async update(id: string, updates: Partial<OrderEntity>): Promise<OrderEntity | null> {
    const existing = this.orders.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.orders.set(id, updated);
    return updated;
  }

  async listByTenant(tenantId: string): Promise<OrderEntity[]> {
    return Array.from(this.orders.values()).filter(o => o.tenantId === tenantId);
  }
}

export class SagaRepository {
  private sagas = new Map<string, SagaInstanceEntity>();

  async create(saga: Omit<SagaInstanceEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<SagaInstanceEntity> {
    const entity: SagaInstanceEntity = {
      ...saga,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.sagas.set(entity.id, entity);
    return entity;
  }

  async findById(id: string): Promise<SagaInstanceEntity | null> {
    return this.sagas.get(id) || null;
  }

  async update(id: string, updates: Partial<SagaInstanceEntity>): Promise<SagaInstanceEntity | null> {
    const existing = this.sagas.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.sagas.set(id, updated);
    return updated;
  }
}
