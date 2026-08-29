import { Request, Response, NextFunction } from 'express';
import { LogisticsService } from '../services/logisticsService';
import { ValidationUtils } from '@nexus/common';
import { CreateVehicleSchema, CreateShipmentSchema, RecordTelemetrySchema, SubmitPODSchema } from '../dto/logistics.dto';

export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  createVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || req.body.tenantId;
      const validated = ValidationUtils.validate(CreateVehicleSchema, { ...req.body, tenantId });
      const vehicle = await this.logisticsService.createVehicle(validated);
      res.status(201).json({ success: true, data: vehicle });
    } catch (err) {
      next(err);
    }
  };

  createShipment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || req.body.tenantId;
      const validated = ValidationUtils.validate(CreateShipmentSchema, { ...req.body, tenantId });
      const shipment = await this.logisticsService.createShipment(validated);
      res.status(201).json({ success: true, data: shipment });
    } catch (err) {
      next(err);
    }
  };

  recordTelemetry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = ValidationUtils.validate(RecordTelemetrySchema, req.body);
      const log = await this.logisticsService.recordTelemetry(validated);
      res.status(201).json({ success: true, data: log });
    } catch (err) {
      next(err);
    }
  };

  submitPOD = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = ValidationUtils.validate(SubmitPODSchema, req.body);
      const shipment = await this.logisticsService.submitProofOfDelivery(req.params.id, validated);
      res.status(200).json({ success: true, data: shipment });
    } catch (err) {
      next(err);
    }
  };

  getShipment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const shipment = await this.logisticsService.getShipment(req.params.id);
      res.status(200).json({ success: true, data: shipment });
    } catch (err) {
      next(err);
    }
  };

  trackShipment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const shipment = await this.logisticsService.trackShipment(req.params.trackingNumber);
      res.status(200).json({ success: true, data: shipment });
    } catch (err) {
      next(err);
    }
  };

  listShipments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || (req.query.tenantId as string);
      const shipments = await this.logisticsService.listShipments(tenantId);
      res.status(200).json({ success: true, data: shipments });
    } catch (err) {
      next(err);
    }
  };

  listVehicles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || (req.query.tenantId as string);
      const vehicles = await this.logisticsService.listVehicles(tenantId);
      res.status(200).json({ success: true, data: vehicles });
    } catch (err) {
      next(err);
    }
  };
}
