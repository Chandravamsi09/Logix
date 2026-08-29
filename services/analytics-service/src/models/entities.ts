export interface DailyExecutiveSummaryEntity {
  id: string;
  tenantId: string;
  reportDate: string; // YYYY-MM-DD
  totalOrdersCount: number;
  totalRevenueCents: number;
  averageOrderValueCents: number;
  onTimeDeliveryRatePercent: number;
  inventoryTurnoverRate: number;
  activeFleetUtilizationPercent: number;
  createdAt: Date;
}

export interface MetricSnapshotEntity {
  id: string;
  tenantId: string;
  metricName: string;
  metricValue: number;
  unit: string;
  dimensions: Record<string, string>;
  recordedAt: Date;
}
