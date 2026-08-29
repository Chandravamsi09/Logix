import { IDomainEntity_orders_12, DomainEntity_orders_12 } from '../entities/DomainEntity_12';
import { CreateDomainDTO_orders_12, QueryDomainFilterDTO_orders_12 } from '../dto/DomainDTO_12';
import { v4 as uuidv4 } from 'uuid';

export interface IDomainRepository_orders_12 {
  create(dto: CreateDomainDTO_orders_12): Promise<DomainEntity_orders_12>;
  findById(id: string): Promise<DomainEntity_orders_12 | null>;
  findByCode(code: string, tenantId: string): Promise<DomainEntity_orders_12 | null>;
  query(filter: QueryDomainFilterDTO_orders_12): Promise<{ items: DomainEntity_orders_12[]; total: number }>;
  update(id: string, updates: Partial<IDomainEntity_orders_12>): Promise<DomainEntity_orders_12 | null>;
  delete(id: string): Promise<boolean>;
}

export class InMemoryDomainRepository_orders_12 implements IDomainRepository_orders_12 {
  private readonly store = new Map<string, DomainEntity_orders_12>();

  async create(dto: CreateDomainDTO_orders_12): Promise<DomainEntity_orders_12> {
    const entity = new DomainEntity_orders_12({
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

  async findById(id: string): Promise<DomainEntity_orders_12 | null> {
    return this.store.get(id) || null;
  }

  async findByCode(code: string, tenantId: string): Promise<DomainEntity_orders_12 | null> {
    for (const ent of this.store.values()) {
      if (ent.code === code && ent.tenantId === tenantId) {
        return ent;
      }
    }
    return null;
  }

  async query(filter: QueryDomainFilterDTO_orders_12): Promise<{ items: DomainEntity_orders_12[]; total: number }> {
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

  async update(id: string, updates: Partial<IDomainEntity_orders_12>): Promise<DomainEntity_orders_12 | null> {
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
