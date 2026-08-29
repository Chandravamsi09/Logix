import { z } from 'zod';
import { VehicleType, VehicleStatus, ShipmentStatus } from '@nexus/common';

export const CreateVehicleSchema = z.object({
  tenantId: z.string().uuid(),
  vehicleNumber: z.string().min(2).max(50),
  vin: z.string().min(10).max(50),
  type: z.nativeEnum(VehicleType),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(2000),
  maxPayloadKg: z.number().positive()
});

export type CreateVehicleDTO = z.infer<typeof CreateVehicleSchema>;

export const CreateShipmentSchema = z.object({
  tenantId: z.string().uuid(),
  orderId: z.string().uuid(),
  originWarehouseId: z.string().uuid(),
  destinationAddress: z.object({
    streetLine1: z.string().min(3),
    city: z.string().min(2),
    stateOrProvince: z.string().min(2),
    postalCode: z.string().min(2),
    countryCode: z.string().length(2),
    contactName: z.string().min(2),
    contactPhone: z.string().min(5)
  }),
  assignedVehicleId: z.string().uuid().optional(),
  assignedDriverId: z.string().uuid().optional()
});

export type CreateShipmentDTO = z.infer<typeof CreateShipmentSchema>;

export const RecordTelemetrySchema = z.object({
  vehicleId: z.string().uuid(),
  shipmentId: z.string().uuid().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speedKmh: z.number().nonnegative().optional(),
  heading: z.number().min(0).max(360).optional()
});

export type RecordTelemetryDTO = z.infer<typeof RecordTelemetrySchema>;

export const SubmitPODSchema = z.object({
  recipientName: z.string().min(2),
  signatureUrl: z.string().optional(),
  photoUrl: z.string().optional(),
  notes: z.string().optional()
});

export type SubmitPODDTO = z.infer<typeof SubmitPODSchema>;
