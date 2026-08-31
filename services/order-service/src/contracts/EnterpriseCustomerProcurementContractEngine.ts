/**
 * Enterprise B2B Customer Procurement Contract & Margin Guard Engine
 * Handles enterprise SLAs, volume discount commitments, penalty rebates, and minimum order quantities.
 */

export interface IProcurementContract {
  contractId: string;
  tenantId: string;
  customerOrganizationId: string;
  effectiveFrom: Date;
  expiresAt: Date;
  minimumAnnualCommitmentUSD: number;
  currentAnnualSpendUSD: number;
  paymentTermsDays: number;
  slaOnTimeDeliveryTargetPct: number;
  lateDeliveryPenaltyRatePct: number;
  preferredCarrierList: string[];
  tieredPricingRules: Array<{
    skuCategory: string;
    minimumQuantity: number;
    discountPercentage: number;
  }>;
}

export class EnterpriseCustomerProcurementContractEngine {
  private readonly contracts = new Map<string, IProcurementContract>();

  public registerContract(contract: IProcurementContract): void {
    this.contracts.set(contract.contractId, { ...contract });
  }

  public evaluateOrderAgainstContract(
    contractId: string,
    orderTotalUSD: number,
    itemQuantitiesByCategory: Map<string, number>
  ): { appliedDiscountsUSD: number; netTotalUSD: number; eligibleForSlaPenalty: boolean } {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      return { appliedDiscountsUSD: 0, netTotalUSD: orderTotalUSD, eligibleForSlaPenalty: false };
    }

    let totalDiscountUSD = 0;

    for (const [category, qty] of itemQuantitiesByCategory.entries()) {
      const applicableRule = contract.tieredPricingRules
        .filter(r => r.skuCategory === category && qty >= r.minimumQuantity)
        .sort((a, b) => b.discountPercentage - a.discountPercentage)[0];

      if (applicableRule) {
        const estimatedCategorySpend = (orderTotalUSD / itemQuantitiesByCategory.size);
        const discount = +(estimatedCategorySpend * (applicableRule.discountPercentage / 100)).toFixed(2);
        totalDiscountUSD += discount;
      }
    }

    const netTotalUSD = +(orderTotalUSD - totalDiscountUSD).toFixed(2);
    contract.currentAnnualSpendUSD += netTotalUSD;

    return {
      appliedDiscountsUSD: totalDiscountUSD,
      netTotalUSD,
      eligibleForSlaPenalty: contract.currentAnnualSpendUSD >= contract.minimumAnnualCommitmentUSD * 0.5
    };
  }

  public calculateAnnualRebate(contractId: string): { rebateAmountUSD: number; message: string } {
    const contract = this.contracts.get(contractId);
    if (!contract) throw new Error('Contract not found');

    if (contract.currentAnnualSpendUSD >= contract.minimumAnnualCommitmentUSD) {
      const surplus = contract.currentAnnualSpendUSD - contract.minimumAnnualCommitmentUSD;
      const rebate = +(surplus * 0.035).toFixed(2); // 3.5% growth rebate
      return { rebateAmountUSD: rebate, message: 'Tier commitment achieved: 3.5% growth rebate awarded' };
    }

    return { rebateAmountUSD: 0, message: 'Commitment threshold not yet met' };
  }
}
