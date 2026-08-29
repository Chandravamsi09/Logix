import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import proxy from 'express-http-proxy';
import { correlationIdMiddleware } from './middleware/correlationId';
import { rateLimiter } from './middleware/rateLimiter';
import { authenticateJwt } from './middleware/jwtValidator';
import { gatewayErrorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/healthRoutes';
import { gatewayConfig } from './config';
import { Logger } from '@nexus/common';

const logger = new Logger('APIGateway');

export const createGatewayApp = (): express.Application => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: gatewayConfig.CORS_ORIGINS, credentials: true }));
  app.use(compression());
  app.use(correlationIdMiddleware);
  app.use(rateLimiter.middleware());

  // Health and telemetry endpoints
  app.use('/health', healthRouter);

  // Auth Service Ingress (Public & Protected routes handled upstream)
  app.use('/api/v1/auth', proxy(gatewayConfig.AUTH_SERVICE_URL, {
    proxyReqPathResolver: req => `/api/v1/auth${req.url}`
  }));

  // Order Management Service
  app.use('/api/v1/orders', authenticateJwt(), proxy(gatewayConfig.ORDER_SERVICE_URL, {
    proxyReqPathResolver: req => `/api/v1/orders${req.url}`
  }));

  // Warehouse & Inventory Service
  app.use('/api/v1/inventory', authenticateJwt(), proxy(gatewayConfig.INVENTORY_SERVICE_URL, {
    proxyReqPathResolver: req => `/api/v1/inventory${req.url}`
  }));

  // Fleet & Logistics Service
  app.use('/api/v1/logistics', authenticateJwt(), proxy(gatewayConfig.LOGISTICS_SERVICE_URL, {
    proxyReqPathResolver: req => `/api/v1/logistics${req.url}`
  }));

  // Billing & Ledger Service
  app.use('/api/v1/billing', authenticateJwt(), proxy(gatewayConfig.BILLING_SERVICE_URL, {
    proxyReqPathResolver: req => `/api/v1/billing${req.url}`
  }));

  // Notification Service
  app.use('/api/v1/notifications', authenticateJwt(), proxy(gatewayConfig.NOTIFICATION_SERVICE_URL, {
    proxyReqPathResolver: req => `/api/v1/notifications${req.url}`
  }));

  // Analytics & Reporting Service
  app.use('/api/v1/analytics', authenticateJwt(), proxy(gatewayConfig.ANALYTICS_SERVICE_URL, {
    proxyReqPathResolver: req => `/api/v1/analytics${req.url}`
  }));

  app.use(gatewayErrorHandler);

  return app;
};
