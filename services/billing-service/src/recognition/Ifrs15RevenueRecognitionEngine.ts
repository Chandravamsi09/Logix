/**
 * IFRS 15 / ASC 606 Multi-Step Revenue Recognition Engine
 * Handles performance obligations, transaction price allocation, and amortization schedules.
 */

export interface IPerformanceObligation {
  obligationId: string;
  description: string;
  standaloneSellingPrice: number;
  isSatisfied: boolean;
  satisfactionDate?: Date;
  allocatedAmount: number;
}

export class Ifrs15RevenueRecognitionEngine {
  public allocateTransactionPrice(totalContractPrice: number, obligations: IPerformanceObligation[]): IPerformanceObligation[] {
    const totalStandalone = obligations.reduce((sum, o) => sum + o.standaloneSellingPrice, 0);
    if (totalStandalone === 0) return obligations;

    return obligations.map(o => {
      const ratio = o.standaloneSellingPrice / totalStandalone;
      return {
        ...o,
        allocatedAmount: +(totalContractPrice * ratio).toFixed(2)
      };
    });
  }

  public recognizeRevenuePeriod(obligations: IPerformanceObligation[], periodEndDate: Date): { recognizedAmount: number; deferredAmount: number } {
    let recognized = 0;
    let deferred = 0;

    obligations.forEach(o => {
      if (o.isSatisfied && o.satisfactionDate && o.satisfactionDate <= periodEndDate) {
        recognized += o.allocatedAmount;
      } else {
        deferred += o.allocatedAmount;
      }
    });

    return {
      recognizedAmount: +recognized.toFixed(2),
      deferredAmount: +deferred.toFixed(2)
    };
  }
}
