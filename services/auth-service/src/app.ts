import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { UserRepository, TenantRepository, AuditLogRepository } from './repositories/inMemoryRepositories';
import { AuthService } from './services/authService';
import { AuthController } from './controllers/authController';
import { BaseDomainException, Logger, ServiceHealth } from '@nexus/common';

const logger = new Logger('AuthService');

export const createAuthApp = (): express.Application => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Instantiate Repositories and Services
  const userRepo = new UserRepository();
  const tenantRepo = new TenantRepository();
  const auditRepo = new AuditLogRepository();
  const authService = new AuthService(userRepo, tenantRepo, auditRepo);
  const authController = new AuthController(authService);

  // Health endpoint
  app.get('/health', (_req: Request, res: Response) => {
    const health: ServiceHealth = {
      service: 'auth-service',
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

  // Auth Routes
  app.post('/api/v1/auth/register', authController.register);
  app.post('/api/v1/auth/login', authController.login);
  app.post('/api/v1/auth/tenants', authController.createTenant);

  // Global Error Handler
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
    logger.error('Unhandled Exception in Auth Service', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_AUTH_ERROR', message: 'Internal server error.' }
    });
  });

  return app;
};
