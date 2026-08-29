import { UserRole, TenantTier } from '@nexus/common';

export interface UserEntity {
  id: string;
  tenantId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  permissions: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  failedLoginAttempts: number;
  lockedUntil?: Date | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantEntity {
  id: string;
  name: string;
  slug: string;
  tier: TenantTier;
  maxUsers: number;
  maxWarehouses: number;
  isActive: boolean;
  settings: {
    allowSelfRegistration: boolean;
    requireMfa: boolean;
    sessionTimeoutMinutes: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshTokenEntity {
  id: string;
  userId: string;
  tenantId: string;
  tokenHash: string;
  expiresAt: Date;
  isRevoked: boolean;
  deviceInfo?: string;
  ipAddress?: string;
  createdAt: Date;
}

export interface AuditLogEntity {
  id: string;
  tenantId: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}
