import { IDomainEntity_orders_10, DomainEntity_orders_10 } from '../entities/DomainEntity_10';
import { CreateDomainDTO_orders_10, QueryDomainFilterDTO_orders_10 } from '../dto/DomainDTO_10';
import { v4 as uuidv4 } from 'uuid';

export interface IDomainRepository_orders_10 {
  create(dto: CreateDomainDTO_orders_10): Promise<DomainEntity_orders_10>;
  findById(id: string): Promise<DomainEntity_orders_10 | null>;
  findByCode(code: string, tenantId: string): Promise<DomainEntity_orders_10 | null>;
  query(filter: QueryDomainFilterDTO_orders_10): Promise<{ items: DomainEntity_orders_10[]; total: number }>;
  update(id: string, updates: Partial<IDomainEntity_orders_10>): Promise<DomainEntity_orders_10 | null>;
  delete(id: string): Promise<boolean>;
}

export class InMemoryDomainRepository_orders_10 implements IDomainRepository_orders_10 {
  private readonly store = new Map<string, DomainEntity_orders_10>();

  async create(dto: CreateDomainDTO_orders_10): Promise<DomainEntity_orders_10> {
    const entity = new DomainEntity_orders_10({
      ...dto,
      id: uuidv4(),
      operationalStatus: 'ACTIVE',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.store.set(entity.id, entity);
    return entity;
  }

  async findById(id: string): Promise<DomainEntity_orders_10 | null> {
    return this.store.get(id) || null;
  }

  async findByCode(code: string, tenantId: string): Promise<DomainEntity_orders_10 | null> {
    for (const ent of this.store.values()) {
      if (ent.code === code && ent.tenantId === tenantId) {
        return ent;
      }
    }
    return null;
  }

  async query(filter: QueryDomainFilterDTO_orders_10): Promise<{ items: DomainEntity_orders_10[]; total: number }> {
    let result = Array.from(this.store.values());

    if (filter.tenantId) {
      result = result.filter(r => r.tenantId === filter.tenantId);
    }
    if (filter.operationalStatus) {
      result = result.filter(r => r.operationalStatus === filter.operationalStatus);
    }
    if (filter.minPriority !== undefined) {
      result = result.filter(r => r.priorityScore >= filter.minPriority!);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(r => r.displayName.toLowerCase().includes(q) || r.code.toLowerCase().includes(q));
    }

    const total = result.length;
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const items = result.slice((page - 1) * limit, page * limit);

    return { items, total };
  }

  async update(id: string, updates: Partial<IDomainEntity_orders_10>): Promise<DomainEntity_orders_10 | null> {
    const existing = this.store.get(id);
    if (!existing) return null;

    Object.assign(existing, updates);
    existing.version += 1;
    existing.updatedAt = new Date();
    this.store.set(id, existing);
    return existing;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
