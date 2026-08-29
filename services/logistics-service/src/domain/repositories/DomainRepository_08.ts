import { IDomainEntity_fleet_08, DomainEntity_fleet_08 } from '../entities/DomainEntity_08';
import { CreateDomainDTO_fleet_08, QueryDomainFilterDTO_fleet_08 } from '../dto/DomainDTO_08';
import { v4 as uuidv4 } from 'uuid';

export interface IDomainRepository_fleet_08 {
  create(dto: CreateDomainDTO_fleet_08): Promise<DomainEntity_fleet_08>;
  findById(id: string): Promise<DomainEntity_fleet_08 | null>;
  findByCode(code: string, tenantId: string): Promise<DomainEntity_fleet_08 | null>;
  query(filter: QueryDomainFilterDTO_fleet_08): Promise<{ items: DomainEntity_fleet_08[]; total: number }>;
  update(id: string, updates: Partial<IDomainEntity_fleet_08>): Promise<DomainEntity_fleet_08 | null>;
  delete(id: string): Promise<boolean>;
}

export class InMemoryDomainRepository_fleet_08 implements IDomainRepository_fleet_08 {
  private readonly store = new Map<string, DomainEntity_fleet_08>();

  async create(dto: CreateDomainDTO_fleet_08): Promise<DomainEntity_fleet_08> {
    const entity = new DomainEntity_fleet_08({
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

  async findById(id: string): Promise<DomainEntity_fleet_08 | null> {
    return this.store.get(id) || null;
  }

  async findByCode(code: string, tenantId: string): Promise<DomainEntity_fleet_08 | null> {
    for (const ent of this.store.values()) {
      if (ent.code === code && ent.tenantId === tenantId) {
        return ent;
      }
    }
    return null;
  }

  async query(filter: QueryDomainFilterDTO_fleet_08): Promise<{ items: DomainEntity_fleet_08[]; total: number }> {
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

  async update(id: string, updates: Partial<IDomainEntity_fleet_08>): Promise<DomainEntity_fleet_08 | null> {
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
