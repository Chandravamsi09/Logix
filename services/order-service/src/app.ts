import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { OrderRepository, SagaRepository } from './repositories/inMemoryOrderRepositories';
import { OrderSagaOrchestrator } from './services/sagaOrchestrator';
import { OrderService } from './services/orderService';
import { OrderController } from './controllers/orderController';
import { BaseDomainException, Logger, ServiceHealth } from '@nexus/common';

const logger = new Logger('OrderService');

export const createOrderApp = (): express.Application => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const orderRepo = new OrderRepository();
  const sagaRepo = new SagaRepository();
  const sagaOrchestrator = new OrderSagaOrchestrator(sagaRepo, orderRepo);
  const orderService = new OrderService(orderRepo, sagaOrchestrator);
  const orderController = new OrderController(orderService);

  // Health
  app.get('/health', (_req: Request, res: Response) => {
    const health: ServiceHealth = {
      service: 'order-service',
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
  app.post('/api/v1/orders', orderController.createOrder);
  app.get('/api/v1/orders', orderController.listOrders);
  app.get('/api/v1/orders/:id', orderController.getOrder);
  app.post('/api/v1/orders/:id/cancel', orderController.cancelOrder);

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
    logger.error('Unhandled Exception in Order Service', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ORDER_ERROR', message: 'Internal server error.' }
    });
  });

  return app;
};
