import { UserRole } from './enums';

export interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  email: string;
  roles: UserRole[];
  permissions: string[];
  sessionId?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Money {
  amount: number; // Stored in minor currency units (cents)
  currency: string; // ISO 4217, e.g. USD, EUR, GBP
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  heading?: number;
  speedKmh?: number;
  timestamp: string;
}

export interface Address {
  streetLine1: string;
  streetLine2?: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  countryCode: string; // ISO 3166-1 alpha-2
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  instructions?: string;
}

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptimeSeconds: number;
  timestamp: string;
  database: 'connected' | 'disconnected';
  redis: 'connected' | 'disconnected';
  memoryUsageMb: number;
}
