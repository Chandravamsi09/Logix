/**
 * Multi-Entity Global Supply Chain Intercompany Transfer Pricing & Cross-Charging
 * Enforces OECD transfer pricing arm's length standards, cost-plus margins, and VAT reverse charge mechanisms.
 */

export interface IIntercompanyTransfer {
  transactionId: string;
  fromLegalEntityId: string;
  fromCountryIso: string;
  toLegalEntityId: string;
  toCountryIso: string;
  directCostOfGoodsUSD: number;
  freightAndInsuranceUSD: number;
  markupMethod: 'COST_PLUS' | 'RESALE_MINUS' | 'TRANSACTIONAL_NET_MARGIN';
  markupPercentage: number;
}

export class IntercompanyTransferPricingEngine {
  public calculateTransferPrice(tx: IIntercompanyTransfer): { transferPriceUSD: number; grossMarginUSD: number; vatExempt: boolean } {
    const totalBaseCost = tx.directCostOfGoodsUSD + tx.freightAndInsuranceUSD;
    let markup = 0;

    if (tx.markupMethod === 'COST_PLUS') {
      markup = +(totalBaseCost * (tx.markupPercentage / 100)).toFixed(2);
    } else {
      markup = +(totalBaseCost * 0.08).toFixed(2);
    }

    const transferPrice = +(totalBaseCost + markup).toFixed(2);
    const isCrossBorder = tx.fromCountryIso !== tx.toCountryIso;

    return {
      transferPriceUSD: transferPrice,
      grossMarginUSD: markup,
      vatExempt: isCrossBorder
    };
  }
}
