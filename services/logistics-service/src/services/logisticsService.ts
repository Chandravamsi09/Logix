import { LogisticsRepository } from '../repositories/inMemoryLogisticsRepositories';
import { CreateVehicleDTO, CreateShipmentDTO, RecordTelemetryDTO, SubmitPODDTO } from '../dto/logistics.dto';
import { CryptoUtils, ShipmentStatus, VehicleStatus, NotFoundException, Logger } from '@nexus/common';
import { v4 as uuidv4 } from 'uuid';

export class LogisticsService {
  private readonly logger = new Logger('LogisticsService');

  constructor(private readonly logisticsRepo: LogisticsRepository) {}

  async createVehicle(dto: CreateVehicleDTO) {
    return this.logisticsRepo.createVehicle({
      ...dto,
      status: VehicleStatus.AVAILABLE
    });
  }

  async createShipment(dto: CreateShipmentDTO) {
    const trackingNumber = CryptoUtils.generateTrackingNumber('LOGIX');
    const waypoints = [
      {
        id: uuidv4(),
        shipmentId: '',
        sequenceOrder: 1,
        locationName: 'Origin Logistics Hub',
        latitude: 37.7749,
        longitude: -122.4194,
        status: 'DEPARTED' as const,
        actualArrival: new Date()
      },
      {
        id: uuidv4(),
        shipmentId: '',
        sequenceOrder: 2,
        locationName: `Destination: ${dto.destinationAddress.city}`,
        latitude: 37.3382,
        longitude: -121.8863,
        status: 'PENDING' as const,
        estimatedArrival: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hrs
      }
    ];

    const shipment = await this.logisticsRepo.createShipment({
      tenantId: dto.tenantId,
      orderId: dto.orderId,
      trackingNumber,
      status: ShipmentStatus.DISPATCHED,
      originWarehouseId: dto.originWarehouseId,
      destinationAddress: dto.destinationAddress,
      assignedVehicleId: dto.assignedVehicleId,
      assignedDriverId: dto.assignedDriverId,
      waypoints,
      dispatchedAt: new Date()
    });

    this.logger.info(`Shipment ${shipment.id} dispatched with tracking ${trackingNumber}`);
    return shipment;
  }

  async recordTelemetry(dto: RecordTelemetryDTO) {
    await this.logisticsRepo.updateVehicleTelemetry(dto.vehicleId, dto.latitude, dto.longitude);
    return this.logisticsRepo.recordTelemetry({
      vehicleId: dto.vehicleId,
      shipmentId: dto.shipmentId,
      location: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        speedKmh: dto.speedKmh || 65,
        heading: dto.heading || 180,
        timestamp: new Date().toISOString()
      }
    });
  }

  async submitProofOfDelivery(shipmentId: string, dto: SubmitPODDTO) {
    const shipment = await this.logisticsRepo.findShipmentById(shipmentId);
    if (!shipment) {
      throw new NotFoundException('Shipment', shipmentId);
    }

    return this.logisticsRepo.updateShipment(shipmentId, {
      status: ShipmentStatus.DELIVERED,
      deliveredAt: new Date(),
      proofOfDelivery: {
        recipientName: dto.recipientName,
        signatureUrl: dto.signatureUrl,
        photoUrl: dto.photoUrl,
        notes: dto.notes,
        signedAt: new Date()
      }
    });
  }

  async getShipment(id: string) {
    const shipment = await this.logisticsRepo.findShipmentById(id);
    if (!shipment) throw new NotFoundException('Shipment', id);
    return shipment;
  }

  async trackShipment(trackingNumber: string) {
    const shipment = await this.logisticsRepo.findShipmentByTracking(trackingNumber);
    if (!shipment) throw new NotFoundException('Shipment with tracking number', trackingNumber);
    return shipment;
  }

  async listShipments(tenantId: string) {
    return this.logisticsRepo.listShipments(tenantId);
  }

  async listVehicles(tenantId: string) {
    return this.logisticsRepo.listVehicles(tenantId);
  }
}
