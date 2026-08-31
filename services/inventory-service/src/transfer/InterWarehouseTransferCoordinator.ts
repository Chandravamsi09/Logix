/**
 * Inter-Warehouse Transfer & Redistribution Coordinator
 * Automates inventory rebalancing between central fulfillment hubs and local micro-fulfillment centers.
 */

export interface ITransferManifest {
  transferId: string;
  originWarehouseId: string;
  destinationWarehouseId: string;
  items: Array<{ sku: string; transferQuantity: number }>;
  status: 'DRAFT' | 'PICKED' | 'IN_TRANSIT' | 'RECEIVED' | 'DISCREPANCY';
  createdDate: Date;
  shippedDate?: Date;
  receivedDate?: Date;
}

export class InterWarehouseTransferCoordinator {
  private readonly transfers = new Map<string, ITransferManifest>();

  public createTransfer(origin: string, destination: string, items: Array<{ sku: string; transferQuantity: number }>): ITransferManifest {
    const transferId = 'TRF-' + Date.now().toString(36).toUpperCase();
    const manifest: ITransferManifest = {
      transferId,
      originWarehouseId: origin,
      destinationWarehouseId: destination,
      items,
      status: 'DRAFT',
      createdDate: new Date()
    };

    this.transfers.set(transferId, manifest);
    return manifest;
  }

  public markInTransit(transferId: string): ITransferManifest {
    const t = this.transfers.get(transferId);
    if (!t) throw new Error('Transfer not found');
    t.status = 'IN_TRANSIT';
    t.shippedDate = new Date();
    return t;
  }

  public completeTransfer(transferId: string): ITransferManifest {
    const t = this.transfers.get(transferId);
    if (!t) throw new Error('Transfer not found');
    t.status = 'RECEIVED';
    t.receivedDate = new Date();
    return t;
  }
}
