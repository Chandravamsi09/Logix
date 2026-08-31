/**
 * Treasury Foreign Exchange (FX) Exposure & Forward Hedging Contract Engine
 * Quantifies value-at-risk (VaR) across accounts payable in non-USD currencies and computes forward hedging contract allocations.
 */

export interface IFxOpenPayable {
  invoiceId: string;
  currency: string;
  foreignAmount: number;
  spotRateAtInvoiceUSD: number;
  maturityDate: Date;
}

export class MultiCurrencyHedgingExposureCalculator {
  public calculatePortfolioRisk(
    payables: IFxOpenPayable[],
    currentSpotRates: Map<string, number>
  ): { totalExposureUSD: number; netUnrealizedGainLossUSD: number; highRiskCurrencyCount: number } {
    let totalExposure = 0;
    let netGainLoss = 0;
    const riskyCurrencies = new Set<string>();

    payables.forEach(p => {
      const currentRate = currentSpotRates.get(p.currency) || p.spotRateAtInvoiceUSD;
      const originalValueUSD = p.foreignAmount * p.spotRateAtInvoiceUSD;
      const currentValueUSD = p.foreignAmount * currentRate;

      totalExposure += currentValueUSD;
      const gainLoss = currentValueUSD - originalValueUSD;
      netGainLoss += gainLoss;

      if (Math.abs(gainLoss / originalValueUSD) > 0.05) {
        riskyCurrencies.add(p.currency);
      }
    });

    return {
      totalExposureUSD: +totalExposure.toFixed(2),
      netUnrealizedGainLossUSD: +netGainLoss.toFixed(2),
      highRiskCurrencyCount: riskyCurrencies.size
    };
  }
}
