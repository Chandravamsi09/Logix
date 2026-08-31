/**
 * Lot and Batch Expiration Date Tracker (FIFO / FEFO Enforcer)
 * Enforces First-Expired-First-Out (FEFO) warehouse picking rules for perishable and regulated goods.
 */

export interface ILotBatchRecord {
  lotNumber: string;
  sku: string;
  warehouseId: string;
  manufactureDate: Date;
  expirationDate: Date;
  quantityOnHand: number;
  quarantineStatus: 'RELEASED' | 'QUARANTINED' | 'EXPIRED';
}

export class LotBatchExpirationTracker {
  private readonly lots = new Map<string, ILotBatchRecord>();

  public registerLot(lot: ILotBatchRecord): void {
    this.lots.set(lot.lotNumber, { ...lot });
  }

  public getNextFefoAllocation(sku: string, warehouseId: string, requestedQuantity: number): Array<{ lotNumber: string; allocateQuantity: number }> {
    const matchingLots = Array.from(this.lots.values())
      .filter(l => l.sku === sku && l.warehouseId === warehouseId && l.quarantineStatus === 'RELEASED' && l.expirationDate > new Date() && l.quantityOnHand > 0)
      .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime()); // Ascending expiration

    const allocations: Array<{ lotNumber: string; allocateQuantity: number }> = [];
    let remaining = requestedQuantity;

    for (const lot of matchingLots) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, lot.quantityOnHand);
      allocations.push({ lotNumber: lot.lotNumber, allocateQuantity: take });
      remaining -= take;
    }

    return allocations;
  }
}
