import { LogisticsRepository } from '../../services/logistics-service/src/repositories/inMemoryLogisticsRepositories';
import { LogisticsService } from '../../services/logistics-service/src/services/logisticsService';
import { VehicleType, VehicleStatus, ShipmentStatus } from '@nexus/common';
import { v4 as uuidv4 } from 'uuid';

describe('Fleet Telemetry & Dispatch Integration Test Suite', () => {
  let logisticsRepo: LogisticsRepository;
  let logisticsService: LogisticsService;
  const tenantId = uuidv4();

  beforeEach(() => {
    logisticsRepo = new LogisticsRepository();
    logisticsService = new LogisticsService(logisticsRepo);
  });

  test('TC-11: Fleet shipment creation, GPS telemetry recording, and POD delivery workflow', async () => {
    // 1. Register vehicle
    const vehicle = await logisticsService.createVehicle({
      tenantId,
      vehicleNumber: 'FLEET-TRUCK-88',
      vin: '1HD1KAE18FB889922',
      type: VehicleType.BOX_TRUCK_26FT,
      make: 'Freightliner',
      model: 'M2-106',
      year: 2024,
      maxPayloadKg: 12000
    });
    expect(vehicle.status).toBe(VehicleStatus.AVAILABLE);

    // 2. Dispatch shipment
    const orderId = uuidv4();
    const shipment = await logisticsService.createShipment({
      tenantId,
      orderId,
      originWarehouseId: uuidv4(),
      destinationAddress: {
        streetLine1: '742 Evergreen Terrace',
        city: 'Springfield',
        stateOrProvince: 'OR',
        postalCode: '97477',
        countryCode: 'US',
        contactName: 'Homer S.',
        contactPhone: '5557334'
      },
      assignedVehicleId: vehicle.id
    });
    expect(shipment.status).toBe(ShipmentStatus.DISPATCHED);
    expect(shipment.trackingNumber).toMatch(/^LOGIX-/);

    // 3. Record Telemetry Ping
    const telemetry = await logisticsService.recordTelemetry({
      vehicleId: vehicle.id,
      shipmentId: shipment.id,
      latitude: 44.0462,
      longitude: -123.0220,
      speedKmh: 75,
      heading: 270
    });
    expect(telemetry.location.latitude).toBe(44.0462);

    // 4. Submit Proof of Delivery (POD)
    const delivered = await logisticsService.submitProofOfDelivery(shipment.id, {
      recipientName: 'Homer Simpson',
      signatureUrl: 'https://cdn.logix.io/signatures/pod-882.png',
      notes: 'Delivered to front porch securely'
    });
    expect(delivered!.status).toBe(ShipmentStatus.DELIVERED);
    expect(delivered!.proofOfDelivery?.recipientName).toBe('Homer Simpson');
  });
});
