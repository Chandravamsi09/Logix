/**
 * Dynamic Multi-Carrier Rate & SLA Selection Matrix
 * Evaluates contract tariffs, carrier reliability ratings, lane transit times, and vehicle capacity.
 */

export interface ICarrierContract {
  carrierCode: string;
  carrierName: string;
  baseRatePerMileUSD: number;
  minimumFreightChargeUSD: number;
  fuelSurchargeIndexPct: number;
  historicalOnTimeDeliveryPct: number;
  supportsColdChain: boolean;
  supportsHazmat: boolean;
}

export class DynamicCarrierSelectionEngine {
  private readonly carrierContracts = new Map<string, ICarrierContract>();

  constructor() {
    this.registerContract({
      carrierCode: 'FEDEX_FREIGHT',
      carrierName: 'FedEx Freight Priority',
      baseRatePerMileUSD: 3.20,
      minimumFreightChargeUSD: 150.0,
      fuelSurchargeIndexPct: 14.5,
      historicalOnTimeDeliveryPct: 97.4,
      supportsColdChain: true,
      supportsHazmat: true
    });

    this.registerContract({
      carrierCode: 'OLD_DOMINION',
      carrierName: 'Old Dominion Freight Line',
      baseRatePerMileUSD: 2.85,
      minimumFreightChargeUSD: 125.0,
      fuelSurchargeIndexPct: 13.0,
      historicalOnTimeDeliveryPct: 98.8,
      supportsColdChain: false,
      supportsHazmat: true
    });

    this.registerContract({
      carrierCode: 'ESTES_EXPRESS',
      carrierName: 'Estes Express Lines',
      baseRatePerMileUSD: 2.65,
      minimumFreightChargeUSD: 110.0,
      fuelSurchargeIndexPct: 12.5,
      historicalOnTimeDeliveryPct: 94.2,
      supportsColdChain: false,
      supportsHazmat: false
    });
  }

  public registerContract(contract: ICarrierContract): void {
    this.carrierContracts.set(contract.carrierCode, contract);
  }

  public selectOptimalCarrier(
    distanceMiles: number,
    requiresColdChain: boolean,
    requiresHazmat: boolean,
    prioritizeSpeedOverCost: boolean
  ): { selectedCarrier: ICarrierContract; totalEstimatedCostUSD: number; score: number } {
    const eligible = Array.from(this.carrierContracts.values()).filter(c => {
      if (requiresColdChain && !c.supportsColdChain) return false;
      if (requiresHazmat && !c.supportsHazmat) return false;
      return true;
    });

    if (!eligible.length) {
      throw new Error('No eligible carriers match the requested freight constraints');
    }

    let bestCarrier = eligible[0];
    let bestScore = -Infinity;
    let bestCost = 0;

    for (const c of eligible) {
      const rawFreight = Math.max(c.minimumFreightChargeUSD, distanceMiles * c.baseRatePerMileUSD);
      const fuelFee = rawFreight * (c.fuelSurchargeIndexPct / 100);
      const totalCost = +(rawFreight + fuelFee).toFixed(2);

      let score = (c.historicalOnTimeDeliveryPct * 2) - (totalCost / 20);
      if (prioritizeSpeedOverCost) {
        score += c.historicalOnTimeDeliveryPct * 1.5;
      }

      if (score > bestScore) {
        bestScore = score;
        bestCarrier = c;
        bestCost = totalCost;
      }
    }

    return {
      selectedCarrier: bestCarrier,
      totalEstimatedCostUSD: bestCost,
      score: +bestScore.toFixed(2)
    };
  }
}
