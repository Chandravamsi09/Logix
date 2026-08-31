/**
 * Multi-Gateway Escrow Settlement & Payment Split Engine
 * Manages marketplace payment splits between 3PL carriers, warehouse hubs, and platform fees.
 */

export interface IPaymentSplitContext {
  orderId: string;
  grossAmountUSD: number;
  platformFeePct: number;
  carrierPayoutUSD: number;
  warehouseFulfillmentFeeUSD: number;
}

export class MultiGatewayEscrowSettlementEngine {
  public calculatePayoutSplits(ctx: IPaymentSplitContext): { platformRevenueUSD: number; merchantNetPayoutUSD: number; carrierPayoutUSD: number; warehouseFeeUSD: number } {
    const platformFee = +(ctx.grossAmountUSD * (ctx.platformFeePct / 100)).toFixed(2);
    const totalDeductions = platformFee + ctx.carrierPayoutUSD + ctx.warehouseFulfillmentFeeUSD;
    const merchantNet = +(ctx.grossAmountUSD - totalDeductions).toFixed(2);

    return {
      platformRevenueUSD: platformFee,
      merchantNetPayoutUSD: Math.max(0, merchantNet),
      carrierPayoutUSD: ctx.carrierPayoutUSD,
      warehouseFeeUSD: ctx.warehouseFulfillmentFeeUSD
    };
  }
}
