/**
 * Less-Than-Truckload (LTL) to Full-Truckload (FTL) Multi-Stop Consolidation Matrix
 * Consolidates smaller pallet shipments sharing transit lanes into single trailer dispatches.
 */

export interface ILtlConsolidationCandidate {
  shipmentId: string;
  originZip: string;
  destinationZip: string;
  palletCount: number;
  weightLbs: number;
  maxDeliveryDate: Date;
}

export class DynamicFreightConsolidationMatrix {
  public consolidateLtlShipments(candidates: ILtlConsolidationCandidate[]): Array<{ consolidatedTruckId: string; shipmentIds: string[]; totalPallets: number; totalWeightLbs: number }> {
    const consolidated: Array<{ consolidatedTruckId: string; shipmentIds: string[]; totalPallets: number; totalWeightLbs: number }> = [];

    const MAX_PALLETS = 26; // 53ft trailer
    const MAX_WEIGHT_LBS = 45000;

    let currentTruck: { consolidatedTruckId: string; shipmentIds: string[]; totalPallets: number; totalWeightLbs: number } | null = null;

    candidates.forEach((cand, idx) => {
      if (!currentTruck || (currentTruck.totalPallets + cand.palletCount > MAX_PALLETS) || (currentTruck.totalWeightLbs + cand.weightLbs > MAX_WEIGHT_LBS)) {
        currentTruck = {
          consolidatedTruckId: 'FTL-' + (consolidated.length + 1).toString().padStart(3, '0'),
          shipmentIds: [cand.shipmentId],
          totalPallets: cand.palletCount,
          totalWeightLbs: cand.weightLbs
        };
        consolidated.push(currentTruck);
      } else {
        currentTruck.shipmentIds.push(cand.shipmentId);
        currentTruck.totalPallets += cand.palletCount;
        currentTruck.totalWeightLbs += cand.weightLbs;
      }
    });

    return consolidated;
  }
}
