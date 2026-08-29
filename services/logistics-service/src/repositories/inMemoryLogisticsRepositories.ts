import { VehicleEntity, DriverEntity, ShipmentEntity, TelemetryLogEntity } from '../models/entities';
import { VehicleStatus, ShipmentStatus } from '@nexus/common';
import { v4 as uuidv4 } from 'uuid';

export class LogisticsRepository {
  private vehicles = new Map<string, VehicleEntity>();
  private drivers = new Map<string, DriverEntity>();
  private shipments = new Map<string, ShipmentEntity>();
  private telemetry: TelemetryLogEntity[] = [];

  async createVehicle(veh: Omit<VehicleEntity, 'id' | 'createdAt'>): Promise<VehicleEntity> {
    const entity: VehicleEntity = {
      ...veh,
      id: uuidv4(),
      createdAt: new Date()
    };
    this.vehicles.set(entity.id, entity);
    return entity;
  }

  async listVehicles(tenantId: string): Promise<VehicleEntity[]> {
    return Array.from(this.vehicles.values()).filter(v => v.tenantId === tenantId);
  }

  async findVehicleById(id: string): Promise<VehicleEntity | null> {
    return this.vehicles.get(id) || null;
  }

  async updateVehicleTelemetry(id: string, lat: number, lon: number): Promise<void> {
    const v = this.vehicles.get(id);
    if (v) {
      v.currentLatitude = lat;
      v.currentLongitude = lon;
      v.lastTelemetryAt = new Date();
      v.status = VehicleStatus.EN_ROUTE;
    }
  }

  async createShipment(shipment: Omit<ShipmentEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShipmentEntity> {
    const entity: ShipmentEntity = {
      ...shipment,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.shipments.set(entity.id, entity);
    return entity;
  }

  async findShipmentById(id: string): Promise<ShipmentEntity | null> {
    return this.shipments.get(id) || null;
  }

  async findShipmentByTracking(trackingNumber: string): Promise<ShipmentEntity | null> {
    for (const s of this.shipments.values()) {
      if (s.trackingNumber === trackingNumber) return s;
    }
    return null;
  }

  async listShipments(tenantId: string): Promise<ShipmentEntity[]> {
    return Array.from(this.shipments.values()).filter(s => s.tenantId === tenantId);
  }

  async updateShipment(id: string, updates: Partial<ShipmentEntity>): Promise<ShipmentEntity | null> {
    const existing = this.shipments.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.shipments.set(id, updated);
    return updated;
  }

  async recordTelemetry(log: Omit<TelemetryLogEntity, 'id' | 'createdAt'>): Promise<TelemetryLogEntity> {
    const entity: TelemetryLogEntity = {
      ...log,
      id: uuidv4(),
      createdAt: new Date()
    };
    this.telemetry.push(entity);
    return entity;
  }
}
