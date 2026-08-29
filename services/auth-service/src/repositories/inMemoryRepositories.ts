import { UserEntity, TenantEntity, RefreshTokenEntity, AuditLogEntity } from '../models/entities';
import { UserRole, TenantTier } from '@nexus/common';
import { v4 as uuidv4 } from 'uuid';

export class UserRepository {
  private users = new Map<string, UserEntity>();

  async findById(id: string): Promise<UserEntity | null> {
    return this.users.get(id) || null;
  }

  async findByEmailAndTenant(email: string, tenantId: string): Promise<UserEntity | null> {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase() && user.tenantId === tenantId) {
        return user;
      }
    }
    return null;
  }

  async create(user: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
    const entity: UserEntity = {
      ...user,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(entity.id, entity);
    return entity;
  }

  async update(id: string, updates: Partial<UserEntity>): Promise<UserEntity | null> {
    const existing = this.users.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async listByTenant(tenantId: string): Promise<UserEntity[]> {
    return Array.from(this.users.values()).filter(u => u.tenantId === tenantId);
  }
}

export class TenantRepository {
  private tenants = new Map<string, TenantEntity>();

  async findById(id: string): Promise<TenantEntity | null> {
    return this.tenants.get(id) || null;
  }

  async findBySlug(slug: string): Promise<TenantEntity | null> {
    for (const t of this.tenants.values()) {
      if (t.slug === slug) return t;
    }
    return null;
  }

  async create(tenant: Omit<TenantEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<TenantEntity> {
    const entity: TenantEntity = {
      ...tenant,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tenants.set(entity.id, entity);
    return entity;
  }

  async listAll(): Promise<TenantEntity[]> {
    return Array.from(this.tenants.values());
  }
}

export class AuditLogRepository {
  private logs: AuditLogEntity[] = [];

  async record(log: Omit<AuditLogEntity, 'id' | 'createdAt'>): Promise<AuditLogEntity> {
    const entry: AuditLogEntity = {
      ...log,
      id: uuidv4(),
      createdAt: new Date()
    };
    this.logs.push(entry);
    return entry;
  }

  async listByTenant(tenantId: string, limit = 50): Promise<AuditLogEntity[]> {
    return this.logs.filter(l => l.tenantId === tenantId).slice(-limit);
  }
}
