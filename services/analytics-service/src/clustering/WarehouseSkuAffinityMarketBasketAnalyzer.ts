/**
 * Association Rule Mining (Apriori Algorithm) & SKU Affinity Co-Occurrence Engine
 * Detects frequent itemsets to optimize warehouse cross-docking and co-located shelving.
 */

export interface IOrderBasket {
  orderId: string;
  skuList: string[];
}

export interface ISkuAssociationRule {
  antecedentSku: string;
  consequentSku: string;
  supportPct: number;
  confidencePct: number;
  liftRatio: number;
}

export class WarehouseSkuAffinityMarketBasketAnalyzer {
  public mineAssociationRules(baskets: IOrderBasket[], minSupportPct: number = 2.0, minConfidencePct: number = 30.0): ISkuAssociationRule[] {
    const totalBaskets = baskets.length;
    if (!totalBaskets) return [];

    const singleItemCounts = new Map<string, number>();
    const pairCounts = new Map<string, number>();

    baskets.forEach(b => {
      const uniqueSkus = Array.from(new Set(b.skuList));
      uniqueSkus.forEach(s => singleItemCounts.set(s, (singleItemCounts.get(s) || 0) + 1));

      for (let i = 0; i < uniqueSkus.length; i++) {
        for (let j = i + 1; j < uniqueSkus.length; j++) {
          const pairKey = [uniqueSkus[i], uniqueSkus[j]].sort().join('::');
          pairCounts.set(pairKey, (pairCounts.get(pairKey) || 0) + 1);
        }
      }
    });

    const rules: ISkuAssociationRule[] = [];

    for (const [pairKey, count] of pairCounts.entries()) {
      const [skuA, skuB] = pairKey.split('::');
      const support = (count / totalBaskets) * 100;

      if (support >= minSupportPct) {
        const countA = singleItemCounts.get(skuA) || 1;
        const countB = singleItemCounts.get(skuB) || 1;

        const confAtoB = (count / countA) * 100;
        const liftAtoB = +((confAtoB / ((countB / totalBaskets) * 100))).toFixed(2);

        if (confAtoB >= minConfidencePct) {
          rules.push({
            antecedentSku: skuA,
            consequentSku: skuB,
            supportPct: +support.toFixed(2),
            confidencePct: +confAtoB.toFixed(2),
            liftRatio: liftAtoB
          });
        }
      }
    }

    return rules.sort((a, b) => b.liftRatio - a.liftRatio);
  }
}
