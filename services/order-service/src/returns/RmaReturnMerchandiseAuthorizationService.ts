/**
 * Return Merchandise Authorization (RMA) & Reverse Logistics Engine
 */

export interface IRmaRequest {
  rmaNumber: string;
  originalOrderId: string;
  tenantId: string;
  customerReason: 'DAMAGED_IN_TRANSIT' | 'WRONG_ITEM_RECEIVED' | 'DEFECTIVE_PRODUCT' | 'BUYER_REMORSE';
  returnItems: Array<{ sku: string; quantity: number; returnCondition: 'UNOPENED' | 'OPENED' | 'DAMAGED' }>;
  trackingNumber?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'IN_TRANSIT' | 'INSPECTED' | 'REFUND_PROCESSED' | 'REJECTED';
  refundAmountUSD: number;
  restockingFeeUSD: number;
  createdAt: Date;
}

export class RmaReturnMerchandiseAuthorizationService {
  private readonly rmaStore = new Map<string, IRmaRequest>();

  public createRmaRequest(
    originalOrderId: string,
    tenantId: string,
    customerReason: IRmaRequest['customerReason'],
    returnItems: IRmaRequest['returnItems'],
    itemPriceMap: Map<string, number>
  ): IRmaRequest {
    const rmaNumber = 'RMA-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
    
    let grossRefund = 0;
    returnItems.forEach(i => {
      const unitPrice = itemPriceMap.get(i.sku) || 50.0;
      grossRefund += unitPrice * i.quantity;
    });

    let restockingFee = 0;
    if (customerReason === 'BUYER_REMORSE') {
      restockingFee = +(grossRefund * 0.15).toFixed(2); // 15% restocking fee
    }

    const rma: IRmaRequest = {
      rmaNumber,
      originalOrderId,
      tenantId,
      customerReason,
      returnItems,
      status: 'PENDING_APPROVAL',
      refundAmountUSD: +(grossRefund - restockingFee).toFixed(2),
      restockingFeeUSD: restockingFee,
      createdAt: new Date()
    };

    this.rmaStore.set(rmaNumber, rma);
    return rma;
  }

  public approveRma(rmaNumber: string, returnCarrierTracking: string): IRmaRequest {
    const rma = this.rmaStore.get(rmaNumber);
    if (!rma) throw new Error('RMA record not found');

    rma.status = 'APPROVED';
    rma.trackingNumber = returnCarrierTracking;
    return rma;
  }

  public processReturnInspection(rmaNumber: string, inspectionPassed: boolean): IRmaRequest {
    const rma = this.rmaStore.get(rmaNumber);
    if (!rma) throw new Error('RMA record not found');

    if (inspectionPassed) {
      rma.status = 'REFUND_PROCESSED';
    } else {
      rma.status = 'REJECTED';
    }
    return rma;
  }
}
