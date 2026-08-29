import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { LogisticsRepository } from './repositories/inMemoryLogisticsRepositories';
import { LogisticsService } from './services/logisticsService';
import { LogisticsController } from './controllers/logisticsController';
import { BaseDomainException, Logger, ServiceHealth } from '@nexus/common';

const logger = new Logger('LogisticsService');

export const createLogisticsApp = (): express.Application => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const repo = new LogisticsRepository();
  const service = new LogisticsService(repo);
  const controller = new LogisticsController(service);

  // Health
  app.get('/health', (_req: Request, res: Response) => {
    const health: ServiceHealth = {
      service: 'logistics-service',
      status: 'healthy',
      version: '1.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: 'connected',
      redis: 'connected',
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    };
    res.status(200).json(health);
  });

  // Routes
  app.post('/api/v1/logistics/vehicles', controller.createVehicle);
  app.get('/api/v1/logistics/vehicles', controller.listVehicles);
  app.post('/api/v1/logistics/shipments', controller.createShipment);
  app.get('/api/v1/logistics/shipments', controller.listShipments);
  app.get('/api/v1/logistics/shipments/:id', controller.getShipment);
  app.get('/api/v1/logistics/track/:trackingNumber', controller.trackShipment);
  app.post('/api/v1/logistics/telemetry', controller.recordTelemetry);
  app.post('/api/v1/logistics/shipments/:id/pod', controller.submitPOD);

  // Error Handler
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof BaseDomainException) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
          details: err.details
        }
      });
    }
    logger.error('Unhandled Exception in Logistics Service', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_LOGISTICS_ERROR', message: 'Internal server error.' }
    });
  });

  return app;
};
