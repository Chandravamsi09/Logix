import { DailyExecutiveSummaryEntity, MetricSnapshotEntity } from '../models/entities';
import { v4 as uuidv4 } from 'uuid';

export class AnalyticsRepository {
  private summaries: DailyExecutiveSummaryEntity[] = [];
  private metrics: MetricSnapshotEntity[] = [];

  constructor() {
    this.seedHistoricalData('global-tenant');
  }

  seedHistoricalData(tenantId: string) {
    const today = new Date();
    for (let i = 14; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().slice(0, 10);
      const orders = Math.floor(150 + Math.random() * 80);
      const revenue = orders * Math.floor(8500 + Math.random() * 3000);
      this.summaries.push({
        id: uuidv4(),
        tenantId,
        reportDate: dateStr,
        totalOrdersCount: orders,
        totalRevenueCents: revenue,
        averageOrderValueCents: Math.round(revenue / orders),
        onTimeDeliveryRatePercent: +(95 + Math.random() * 4).toFixed(2),
        inventoryTurnoverRate: +(4.2 + Math.random() * 0.8).toFixed(2),
        activeFleetUtilizationPercent: +(82 + Math.random() * 12).toFixed(2),
        createdAt: d
      });
    }
  }

  async getExecutiveSummaries(tenantId: string): Promise<DailyExecutiveSummaryEntity[]> {
    return this.summaries.filter(s => s.tenantId === tenantId || s.tenantId === 'global-tenant');
  }

  async recordMetric(m: Omit<MetricSnapshotEntity, 'id'>): Promise<MetricSnapshotEntity> {
    const entity: MetricSnapshotEntity = {
      ...m,
      id: uuidv4()
    };
    this.metrics.push(entity);
    return entity;
  }
}
