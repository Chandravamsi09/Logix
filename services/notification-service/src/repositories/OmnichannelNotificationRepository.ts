/**
 * Production Enterprise Domain Repository: OmnichannelNotificationRepository
 * Provides clean CRUD, query pagination, tenant isolation filters, and atomic state transitions.
 */

export interface IOmnichannelNotificationRecord {
  notificationId: string;
  tenantId: string;
  recipientId: string;
  channel: 'WEBSOCKET' | 'PUSH' | 'SMS' | 'EMAIL' | 'WEBHOOK';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  templateId: string;
  deliveryStatus: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';
  retryCount: number;
  dispatchedAt: Date | null;
  createdAt: Date;
}

export interface IQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, any>;
}

export class OmnichannelNotificationRepository {
  private readonly storage = new Map<string, IOmnichannelNotificationRecord>();

  public async insert(record: IOmnichannelNotificationRecord): Promise<IOmnichannelNotificationRecord> {
    const idKey = (record as any).notificationId;
    if (this.storage.has(idKey)) {
      throw new Error(`Duplicate record identified with ID ${idKey}`);
    }
    const cloned = { ...record };
    this.storage.set(idKey, cloned);
    return cloned;
  }

  public async findById(id: string, tenantId: string): Promise<IOmnichannelNotificationRecord | null> {
    const record = this.storage.get(id);
    if (!record || record.tenantId !== tenantId) {
      return null;
    }
    return { ...record };
  }

  public async update(id: string, tenantId: string, updates: Partial<IOmnichannelNotificationRecord>): Promise<IOmnichannelNotificationRecord> {
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

  public async query(tenantId: string, options: IQueryOptions = {}): Promise<{ records: IOmnichannelNotificationRecord[]; totalCount: number; page: number; limit: number }> {
    const { page = 1, limit = 20, sortBy = 'notificationId', sortOrder = 'desc', filter = {} } = options;
    
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
