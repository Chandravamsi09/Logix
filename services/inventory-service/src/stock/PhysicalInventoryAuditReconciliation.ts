/**
 * Physical Inventory Stock Count & Discrepancy Variance Reconciliation
 * Matches physical cycle counts against digital perpetual inventory ledgers and calculates book-to-physical variance.
 */

export interface IInventoryDiscrepancyRecord {
  sku: string;
  warehouseId: string;
  binLocation: string;
  perpetualBookQuantity: number;
  physicalCountedQuantity: number;
  varianceUnits: number;
  variancePct: number;
  unitCostUSD: number;
  financialImpactUSD: number;
  requiresSupervisorSignoff: boolean;
}

export class PhysicalInventoryAuditReconciliation {
  public reconcileAuditCounts(
    bookInventory: Map<string, { qty: number; unitCost: number }>,
    physicalCounts: Array<{ sku: string; warehouseId: string; bin: string; count: number }>
  ): { itemsAudited: number; totalDiscrepancies: number; netFinancialVarianceUSD: number; records: IInventoryDiscrepancyRecord[] } {
    const records: IInventoryDiscrepancyRecord[] = [];
    let netFinancialVariance = 0;

    physicalCounts.forEach(pc => {
      const book = bookInventory.get(pc.sku) || { qty: 0, unitCost: 25.0 };
      const variance = pc.count - book.qty;
      const variancePct = book.qty > 0 ? +((variance / book.qty) * 100).toFixed(1) : 0;
      const financialImpact = +(variance * book.unitCost).toFixed(2);
      netFinancialVariance += financialImpact;

      records.push({
        sku: pc.sku,
        warehouseId: pc.warehouseId,
        binLocation: pc.bin,
        perpetualBookQuantity: book.qty,
        physicalCountedQuantity: pc.count,
        varianceUnits: variance,
        variancePct,
        unitCostUSD: book.unitCost,
        financialImpactUSD: financialImpact,
        requiresSupervisorSignoff: Math.abs(financialImpact) > 500 || Math.abs(variancePct) > 10
      });
    });

    return {
      itemsAudited: physicalCounts.length,
      totalDiscrepancies: records.filter(r => r.varianceUnits !== 0).length,
      netFinancialVarianceUSD: +netFinancialVariance.toFixed(2),
      records
    };
  }
}
