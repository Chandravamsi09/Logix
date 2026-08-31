export interface ITenantKpiSnapshot {
  tenantId: string;
  tenantName: string;
  orderFulfillmentSlaPct: number;
  averageDockToStockHours: number;
  fleetMilesPerGallonAvg: number;
  inventoryAccuracyRatePct: number;
  annualRecurringRevenueUSD: number;
  carbonEmissionsTonnesCo2: number;
  daysSalesOutstanding: number;
  activeDriverCount: number;
  activeWarehouseCount: number;
}

export class MultiTenantSupplyChainKpiRollupEngine {
  private readonly snapshots = new Map<string, ITenantKpiSnapshot>();

  constructor() {
    this.seedTenants();
  }

  private seedTenants(): void {
    const tenants: ITenantKpiSnapshot[] = [
      { tenantId: 'TNT-GLOBAL-01', tenantName: 'Apex Global Logistics Corp', orderFulfillmentSlaPct: 98.8, averageDockToStockHours: 2.1, fleetMilesPerGallonAvg: 7.2, inventoryAccuracyRatePct: 99.4, annualRecurringRevenueUSD: 14500000, carbonEmissionsTonnesCo2: 1240.5, daysSalesOutstanding: 28.4, activeDriverCount: 140, activeWarehouseCount: 6 },
      { tenantId: 'TNT-NEXUS-02', tenantName: 'Nexus Freight Distribution Ltd', orderFulfillmentSlaPct: 97.4, averageDockToStockHours: 2.8, fleetMilesPerGallonAvg: 6.8, inventoryAccuracyRatePct: 98.9, annualRecurringRevenueUSD: 8200000, carbonEmissionsTonnesCo2: 890.2, daysSalesOutstanding: 34.1, activeDriverCount: 85, activeWarehouseCount: 4 },
      { tenantId: 'TNT-PACIFIC-03', tenantName: 'Pacific Cold-Chain Logistics LLC', orderFulfillmentSlaPct: 99.2, averageDockToStockHours: 1.5, fleetMilesPerGallonAvg: 6.5, inventoryAccuracyRatePct: 99.8, annualRecurringRevenueUSD: 19800000, carbonEmissionsTonnesCo2: 1850.0, daysSalesOutstanding: 22.8, activeDriverCount: 210, activeWarehouseCount: 8 },
      { tenantId: 'TNT-MIDWEST-04', tenantName: 'Midwest Rapid Express Transport', orderFulfillmentSlaPct: 96.5, averageDockToStockHours: 3.2, fleetMilesPerGallonAvg: 7.0, inventoryAccuracyRatePct: 97.9, annualRecurringRevenueUSD: 5400000, carbonEmissionsTonnesCo2: 620.4, daysSalesOutstanding: 39.5, activeDriverCount: 50, activeWarehouseCount: 2 }
    ];

    tenants.forEach(t => this.snapshots.set(t.tenantId, t));
  }

  public getPlatformAggregates(): { totalArrUSD: number; averageSlaPct: number; totalFleetDrivers: number; totalWarehouses: number; platformHealthScore: number } {
    let totalArr = 0, sumSla = 0, drivers = 0, warehouses = 0;

    for (const t of this.snapshots.values()) {
      totalArr += t.annualRecurringRevenueUSD;
      sumSla += t.orderFulfillmentSlaPct;
      drivers += t.activeDriverCount;
      warehouses += t.activeWarehouseCount;
    }

    const count = this.snapshots.size || 1;
    const avgSla = +(sumSla / count).toFixed(1);

    return {
      totalArrUSD: totalArr,
      averageSlaPct: avgSla,
      totalFleetDrivers: drivers,
      totalWarehouses: warehouses,
      platformHealthScore: Math.round(avgSla * 0.95)
    };
  }
}
