import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AnalyticsRepository } from './repositories/inMemoryAnalyticsRepositories';
import { AnalyticsService } from './services/analyticsService';
import { AnalyticsController } from './controllers/analyticsController';
import { BaseDomainException, Logger, ServiceHealth } from '@nexus/common';

const logger = new Logger('AnalyticsService');

export const createAnalyticsApp = (): express.Application => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const repo = new AnalyticsRepository();
  const service = new AnalyticsService(repo);
  const controller = new AnalyticsController(service);

  // Health
  app.get('/health', (_req: Request, res: Response) => {
    const health: ServiceHealth = {
      service: 'analytics-service',
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

  // Endpoints
  app.get('/api/v1/analytics/dashboard', controller.getDashboard);
  app.get('/api/v1/analytics/export', controller.exportReport);

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
    logger.error('Unhandled Exception in Analytics Service', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ANALYTICS_ERROR', message: 'Internal server error.' }
    });
  });

  return app;
};
