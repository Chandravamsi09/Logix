import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService';

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || (req.query.tenantId as string) || 'global-tenant';
      const result = await this.analyticsService.getExecutiveDashboard(tenantId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  exportReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || (req.query.tenantId as string) || 'global-tenant';
      const format = (req.query.format as 'json' | 'csv') || 'json';
      const report = await this.analyticsService.exportReport(tenantId, format);
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="logix-executive-report.csv"');
        res.status(200).send(report.data);
        return;
      }
      
      res.status(200).json({ success: true, data: report.data });
    } catch (err) {
      next(err);
    }
  };
}
