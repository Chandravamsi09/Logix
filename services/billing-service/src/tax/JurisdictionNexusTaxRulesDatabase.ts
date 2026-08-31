/**
 * US Multistate Economic & Physical Nexus Tax Database
 * Manages destination-based and origin-based sales tax sourcing rules, marketplace facilitator laws, and statutory thresholds.
 */

export interface IStateNexusRule {
  stateIso: string;
  stateName: string;
  sourcingRule: 'DESTINATION_BASED' | 'ORIGIN_BASED';
  annualSalesThresholdUSD: number;
  transactionCountThreshold: number;
  hasMarketplaceFacilitatorLaw: boolean;
  localTaxJurisdictionsCount: number;
  standardCombinedRatePct: number;
}

export class JurisdictionNexusTaxRulesDatabase {
  private readonly states = new Map<string, IStateNexusRule>();

  constructor() {
    this.seedStateTaxMatrix();
  }

  private seedStateTaxMatrix(): void {
    const matrix: IStateNexusRule[] = [
      { stateIso: 'AL', stateName: 'Alabama', sourcingRule: 'DESTINATION_BASED', annualSalesThresholdUSD: 250000, transactionCountThreshold: 0, hasMarketplaceFacilitatorLaw: true, localTaxJurisdictionsCount: 340, standardCombinedRatePct: 9.24 },
      { stateIso: 'AK', stateName: 'Alaska', sourcingRule: 'DESTINATION_BASED', annualSalesThresholdUSD: 100000, transactionCountThreshold: 200, hasMarketplaceFacilitatorLaw: true, localTaxJurisdictionsCount: 110, standardCombinedRatePct: 1.76 },
      { stateIso: 'AZ', stateName: 'Arizona', sourcingRule: 'DESTINATION_BASED', annualSalesThresholdUSD: 100000, transactionCountThreshold: 0, hasMarketplaceFacilitatorLaw: true, localTaxJurisdictionsCount: 95, standardCombinedRatePct: 8.40 },
      { stateIso: 'AR', stateName: 'Arkansas', sourcingRule: 'DESTINATION_BASED', annualSalesThresholdUSD: 100000, transactionCountThreshold: 200, hasMarketplaceFacilitatorLaw: true, localTaxJurisdictionsCount: 220, standardCombinedRatePct: 9.47 },
      { stateIso: 'CA', stateName: 'California', sourcingRule: 'DESTINATION_BASED', annualSalesThresholdUSD: 500000, transactionCountThreshold: 0, hasMarketplaceFacilitatorLaw: true, localTaxJurisdictionsCount: 480, standardCombinedRatePct: 8.85 },
      { stateIso: 'CO', stateName: 'Colorado', sourcingRule: 'DESTINATION_BASED', annualSalesThresholdUSD: 100000, transactionCountThreshold: 0, hasMarketplaceFacilitatorLaw: true, localTaxJurisdictionsCount: 300, standardCombinedRatePct: 7.77 },
      { stateIso: 'FL', stateName: 'Florida', sourcingRule: 'DESTINATION_BASED', annualSalesThresholdUSD: 100000, transactionCountThreshold: 0, hasMarketplaceFacilitatorLaw: true, localTaxJurisdictionsCount: 67, standardCombinedRatePct: 7.02 },
      { stateIso: 'GA', stateName: 'Georgia', sourcingRule: 'DESTINATION_BASED', annualSalesThresholdUSD: 100000, transactionCountThreshold: 200, hasMarketplaceFacilitatorLaw: true, localTaxJurisdictionsCount: 159, standardCombinedRatePct: 7.37 },
      { stateIso: 'IL', stateName: 'Illinois', sourcingRule: 'ORIGIN_BASED', annualSalesThresholdUSD: 100000, transactionCountThreshold: 200, hasMarketplaceFacilitatorLaw: true, localTaxJurisdictionsCount: 1200, standardCombinedRatePct: 8.81 },
      { stateIso: 'NY', stateName: 'New York', sourcingRule: 'DESTINATION_BASED', annualSalesThresholdUSD: 500000, transactionCountThreshold: 100, hasMarketplaceFacilitatorLaw: true, localTaxJurisdictionsCount: 85, standardCombinedRatePct: 8.52 },
      { stateIso: 'TX', stateName: 'Texas', sourcingRule: 'ORIGIN_BASED', annualSalesThresholdUSD: 500000, transactionCountThreshold: 0, hasMarketplaceFacilitatorLaw: true, localTaxJurisdictionsCount: 1500, standardCombinedRatePct: 8.20 },
      { stateIso: 'WA', stateName: 'Washington', sourcingRule: 'DESTINATION_BASED', annualSalesThresholdUSD: 100000, transactionCountThreshold: 0, hasMarketplaceFacilitatorLaw: true, localTaxJurisdictionsCount: 320, standardCombinedRatePct: 9.29 }
    ];

    matrix.forEach(rule => this.states.set(rule.stateIso, rule));
  }

  public checkNexusTriggered(stateIso: string, rollingAnnualSalesUSD: number, rollingTransactionsCount: number): boolean {
    const rule = this.states.get(stateIso.toUpperCase());
    if (!rule) return false;

    if (rollingAnnualSalesUSD >= rule.annualSalesThresholdUSD) return true;
    if (rule.transactionCountThreshold > 0 && rollingTransactionsCount >= rule.transactionCountThreshold) return true;

    return false;
  }

  public getTaxRule(stateIso: string): IStateNexusRule | null {
    return this.states.get(stateIso.toUpperCase()) || null;
  }
}
