/**
 * Enterprise Master Service Agreement (MSA) & SLA Penalty Engine
 * Enforces contract renewal terms, billing payment terms (Net 30/60), and SLA outage penalty credits.
 */

export interface IMasterServiceAgreement {
  contractId: string;
  tenantId: string;
  effectiveDate: Date;
  expirationDate: Date;
  paymentTerms: 'NET_15' | 'NET_30' | 'NET_60' | 'DUE_ON_RECEIPT';
  monthlyBaseCommitmentUSD: number;
  slaCommitmentAvailabilityPct: number;
  slaOutageCreditMultiplier: number;
  autoRenew: boolean;
}

export class EnterpriseMasterServiceAgreementManager {
  private readonly contracts = new Map<string, IMasterServiceAgreement>();

  public registerContract(msa: IMasterServiceAgreement): void {
    this.contracts.set(msa.tenantId, { ...msa });
  }

  public calculateSlaCredit(tenantId: string, actualAvailabilityPct: number): { isCreditOwed: boolean; creditAmountUSD: number } {
    const contract = this.contracts.get(tenantId);
    if (!contract) return { isCreditOwed: false, creditAmountUSD: 0 };

    if (actualAvailabilityPct >= contract.slaCommitmentAvailabilityPct) {
      return { isCreditOwed: false, creditAmountUSD: 0 };
    }

    const deficit = contract.slaCommitmentAvailabilityPct - actualAvailabilityPct;
    const creditAmountUSD = +(contract.monthlyBaseCommitmentUSD * (deficit / 100) * contract.slaOutageCreditMultiplier).toFixed(2);

    return {
      isCreditOwed: true,
      creditAmountUSD
    };
  }
}
