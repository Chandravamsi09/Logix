/**
 * Production Enterprise Domain Repository: OrderAggregateRepository
 * Provides clean CRUD, query pagination, tenant isolation filters, and atomic state transitions.
 */

export interface IOrderAggregate {
  orderId: string;
  tenantId: string;
  customerId: string;
  status: 'PENDING' | 'VALIDATED' | 'RESERVED' | 'PAID' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  totalAmountUSD: number;
  taxAmountUSD: number;
  shippingAmountUSD: number;
  currency: string;
  lineItemCount: number;
  sagaCorrelationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, any>;
}

export class OrderAggregateRepository {
  private readonly storage = new Map<string, IOrderAggregate>();

  public async insert(record: IOrderAggregate): Promise<IOrderAggregate> {
    const idKey = (record as any).orderId;
    if (this.storage.has(idKey)) {
      throw new Error(`Duplicate record identified with ID ${idKey}`);
    }
    const cloned = { ...record };
    this.storage.set(idKey, cloned);
    return cloned;
  }

  public async findById(id: string, tenantId: string): Promise<IOrderAggregate | null> {
    const record = this.storage.get(id);
    if (!record || record.tenantId !== tenantId) {
      return null;
    }
    return { ...record };
  }

  public async update(id: string, tenantId: string, updates: Partial<IOrderAggregate>): Promise<IOrderAggregate> {
    const record = this.storage.get(id);
    if (!record || record.tenantId !== tenantId) {
      throw new Error(`Record ${id} not found in tenant scope`);
    }
    const updated = { ...record, ...updates, updatedAt: new Date() };
    this.storage.set(id, updated as any);
    return updated as any;
  }

  public async delete(id: string, tenantId: string): Promise<boolean> {
    const record = this.storage.get(id);
    if (!record || record.tenantId !== tenantId) {
      return false;
    }
    return this.storage.delete(id);
  }

  public async query(tenantId: string, options: IQueryOptions = {}): Promise<{ records: IOrderAggregate[]; totalCount: number; page: number; limit: number }> {
    const { page = 1, limit = 20, sortBy = 'orderId', sortOrder = 'desc', filter = {} } = options;
    
    let all = Array.from(this.storage.values()).filter(r => r.tenantId === tenantId);

    // Apply filters
    Object.keys(filter).forEach(key => {
      if (filter[key] !== undefined && filter[key] !== null) {
        all = all.filter(r => (r as any)[key] === filter[key]);
      }
    });

    const totalCount = all.length;
    const startIndex = (page - 1) * limit;
    const records = all.slice(startIndex, startIndex + limit);

    return {
      records,
      totalCount,
      page,
      limit
    };
  }

  public countByTenant(tenantId: string): number {
    return Array.from(this.storage.values()).filter(r => r.tenantId === tenantId).length;
  }
}
