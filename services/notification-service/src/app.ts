import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { NotificationRepository } from './repositories/inMemoryNotificationRepositories';
import { NotificationService } from './services/notificationService';
import { NotificationController } from './controllers/notificationController';
import { BaseDomainException, Logger, ServiceHealth } from '@nexus/common';

const logger = new Logger('NotificationService');

export const createNotificationApp = (): express.Application => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const repo = new NotificationRepository();
  const service = new NotificationService(repo);
  const controller = new NotificationController(service);

  // Health
  app.get('/health', (_req: Request, res: Response) => {
    const health: ServiceHealth = {
      service: 'notification-service',
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
  app.post('/api/v1/notifications/send', controller.send);
  app.get('/api/v1/notifications/mine', controller.listMyNotifications);
  app.post('/api/v1/notifications/:id/read', controller.markRead);
  app.post('/api/v1/notifications/webhooks', controller.createWebhook);
  app.get('/api/v1/notifications/webhooks', controller.listWebhooks);

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
    logger.error('Unhandled Exception in Notification Service', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_NOTIFICATION_ERROR', message: 'Internal server error.' }
    });
  });

  return app;
};
