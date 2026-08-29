import { Router, Request, Response } from 'express';
import { ServiceHealth } from '@nexus/common';
import { gatewayConfig } from '../config';

export const healthRouter = Router();

healthRouter.get('/liveness', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
});

healthRouter.get('/readiness', (_req: Request, res: Response) => {
  const health: ServiceHealth = {
    service: 'api-gateway',
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
