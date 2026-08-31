/**
 * Inbound Cross-Docking High-Speed Freight Sorter
 * Directly routes inbound pallets to outbound shipping staging bays bypassing warehouse storage racks.
 */

export interface IInboundPallet {
  palletId: string;
  sku: string;
  quantity: number;
  weightKg: number;
  inboundDockDoor: string;
  receivedTimestamp: Date;
}

export interface IOutboundRequirement {
  orderId: string;
  sku: string;
  requiredQuantity: number;
  outboundDockDoor: string;
  carrierDepartureTime: Date;
}

export class CrossDockingFreightSorter {
  public matchCrossDockOpportunities(
    inboundPallets: IInboundPallet[],
    outboundOrders: IOutboundRequirement[]
  ): Array<{ palletId: string; orderId: string; matchedQuantity: number; directDockTransferDoor: string }> {
    const matches: Array<{ palletId: string; orderId: string; matchedQuantity: number; directDockTransferDoor: string }> = [];

    inboundPallets.forEach(pallet => {
      const neededOrder = outboundOrders.find(o => o.sku === pallet.sku && o.requiredQuantity > 0);
      if (neededOrder) {
        const transferQty = Math.min(pallet.quantity, neededOrder.requiredQuantity);
        neededOrder.requiredQuantity -= transferQty;
        pallet.quantity -= transferQty;

        matches.push({
          palletId: pallet.palletId,
          orderId: neededOrder.orderId,
          matchedQuantity: transferQty,
          directDockTransferDoor: neededOrder.outboundDockDoor
        });
      }
    });

    return matches;
  }
}
