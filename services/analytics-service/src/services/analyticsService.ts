import { AnalyticsRepository } from '../repositories/inMemoryAnalyticsRepositories';

export class AnalyticsService {
  constructor(private readonly analyticsRepo: AnalyticsRepository) {}

  async getExecutiveDashboard(tenantId: string) {
    const summaries = await this.analyticsRepo.getExecutiveSummaries(tenantId);
    const latest = summaries[summaries.length - 1] || {
      totalOrdersCount: 0,
      totalRevenueCents: 0,
      averageOrderValueCents: 0,
      onTimeDeliveryRatePercent: 98.5,
      activeFleetUtilizationPercent: 88.0
    };

    const historical = summaries.slice(-7);

    return {
      currentKPIs: {
        totalOrders: latest.totalOrdersCount,
        totalRevenue: {
          amount: latest.totalRevenueCents,
          currency: 'USD'
        },
        averageOrderValue: {
          amount: latest.averageOrderValueCents,
          currency: 'USD'
        },
        onTimeDeliveryRate: latest.onTimeDeliveryRatePercent,
        fleetUtilizationRate: latest.activeFleetUtilizationPercent
      },
      trends: historical.map(h => ({
        date: h.reportDate,
        orders: h.totalOrdersCount,
        revenueCents: h.totalRevenueCents,
        onTimeDeliveryRate: h.onTimeDeliveryRatePercent
      }))
    };
  }

  async exportReport(tenantId: string, format: 'json' | 'csv') {
    const summaries = await this.analyticsRepo.getExecutiveSummaries(tenantId);
    if (format === 'json') {
      return { data: summaries, format: 'json' };
    }

    // CSV format output
    const headers = 'ReportDate,TotalOrders,TotalRevenueUSD,AverageOrderValueUSD,OnTimeDeliveryPercent,FleetUtilizationPercent\n';
    const rows = summaries.map(s => 
      `${s.reportDate},${s.totalOrdersCount},${(s.totalRevenueCents / 100).toFixed(2)},${(s.averageOrderValueCents / 100).toFixed(2)},${s.onTimeDeliveryRatePercent}%,${s.activeFleetUtilizationPercent}%`
    ).join('\n');

    return { data: headers + rows, format: 'csv' };
  }
}
