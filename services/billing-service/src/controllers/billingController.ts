import { Request, Response, NextFunction } from 'express';
import { BillingService } from '../services/billingService';
import { ValidationUtils } from '@nexus/common';
import { CreateInvoiceSchema, ProcessPaymentSchema } from '../dto/billing.dto';

export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  createInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || req.body.tenantId;
      const validated = ValidationUtils.validate(CreateInvoiceSchema, { ...req.body, tenantId });
      const invoice = await this.billingService.createInvoice(validated);
      res.status(201).json({ success: true, data: invoice });
    } catch (err) {
      next(err);
    }
  };

  processPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || req.body.tenantId;
      const validated = ValidationUtils.validate(ProcessPaymentSchema, { ...req.body, tenantId });
      const result = await this.billingService.processPayment(validated);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  listInvoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || (req.query.tenantId as string);
      const invoices = await this.billingService.listInvoices(tenantId);
      res.status(200).json({ success: true, data: invoices });
    } catch (err) {
      next(err);
    }
  };

  listLedger = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || (req.query.tenantId as string);
      const journals = await this.billingService.listLedger(tenantId);
      res.status(200).json({ success: true, data: journals });
    } catch (err) {
      next(err);
    }
  };

  listAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || (req.query.tenantId as string);
      const accounts = await this.billingService.listAccounts(tenantId);
      res.status(200).json({ success: true, data: accounts });
    } catch (err) {
      next(err);
    }
  };
}
