import { ShipmentStatus, VehicleType, VehicleStatus, Address, GeoLocation } from '@nexus/common';

export interface VehicleEntity {
  id: string;
  tenantId: string;
  vehicleNumber: string;
  vin: string;
  type: VehicleType;
  status: VehicleStatus;
  make: string;
  model: string;
  year: number;
  maxPayloadKg: number;
  currentLatitude?: number;
  currentLongitude?: number;
  lastTelemetryAt?: Date;
  createdAt: Date;
}

export interface DriverEntity {
  id: string;
  tenantId: string;
  userId: string;
  driverLicenseNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  isAvailable: boolean;
  assignedVehicleId?: string;
  createdAt: Date;
}

export interface RouteWaypointEntity {
  id: string;
  shipmentId: string;
  sequenceOrder: number;
  locationName: string;
  latitude: number;
  longitude: number;
  status: 'PENDING' | 'ARRIVED' | 'DEPARTED';
  estimatedArrival?: Date;
  actualArrival?: Date;
}

export interface ShipmentEntity {
  id: string;
  tenantId: string;
  orderId: string;
  trackingNumber: string;
  status: ShipmentStatus;
  originWarehouseId: string;
  destinationAddress: Address;
  assignedVehicleId?: string;
  assignedDriverId?: string;
  waypoints: RouteWaypointEntity[];
  dispatchedAt?: Date;
  deliveredAt?: Date;
  proofOfDelivery?: {
    signatureUrl?: string;
    photoUrl?: string;
    recipientName: string;
    signedAt: Date;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TelemetryLogEntity {
  id: string;
  vehicleId: string;
  shipmentId?: string;
  location: GeoLocation;
  engineTemperatureC?: number;
  fuelLevelPercent?: number;
  createdAt: Date;
}
