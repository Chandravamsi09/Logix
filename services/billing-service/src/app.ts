import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { BillingRepository } from './repositories/inMemoryBillingRepositories';
import { DoubleEntryLedgerService } from './services/doubleEntryLedgerService';
import { BillingService } from './services/billingService';
import { BillingController } from './controllers/billingController';
import { BaseDomainException, Logger, ServiceHealth } from '@nexus/common';

const logger = new Logger('BillingService');

export const createBillingApp = (): express.Application => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const billingRepo = new BillingRepository();
  const ledgerService = new DoubleEntryLedgerService(billingRepo);
  const billingService = new BillingService(billingRepo, ledgerService);
  const billingController = new BillingController(billingService);

  // Health
  app.get('/health', (_req: Request, res: Response) => {
    const health: ServiceHealth = {
      service: 'billing-service',
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
  app.post('/api/v1/billing/invoices', billingController.createInvoice);
  app.get('/api/v1/billing/invoices', billingController.listInvoices);
  app.post('/api/v1/billing/payments', billingController.processPayment);
  app.get('/api/v1/billing/ledger', billingController.listLedger);
  app.get('/api/v1/billing/accounts', billingController.listAccounts);

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
    logger.error('Unhandled Exception in Billing Service', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_BILLING_ERROR', message: 'Internal server error.' }
    });
  });

  return app;
};
