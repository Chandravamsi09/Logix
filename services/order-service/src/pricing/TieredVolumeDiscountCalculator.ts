/**
 * Matrix Bundling & Cross-Category Slicing Discount Calculator
 */

export interface IBundleRule {
  bundleId: string;
  requiredSkuList: string[];
  bundleFixedPriceUSD?: number;
  bundleDiscountPct?: number;
  minimumPurchases: number;
}

export class TieredVolumeDiscountCalculator {
  private readonly bundles: IBundleRule[] = [];

  public registerBundle(rule: IBundleRule): void {
    this.bundles.push(rule);
  }

  public evaluateBundles(items: Array<{ sku: string; priceUSD: number; quantity: number }>): { totalSavedUSD: number; matchedBundles: string[] } {
    const skuQtyMap = new Map<string, number>();
    items.forEach(i => skuQtyMap.set(i.sku, (skuQtyMap.get(i.sku) || 0) + i.quantity));

    let totalSavedUSD = 0;
    const matchedBundles: string[] = [];

    for (const bundle of this.bundles) {
      const isEligible = bundle.requiredSkuList.every(sku => (skuQtyMap.get(sku) || 0) >= bundle.minimumPurchases);
      if (isEligible) {
        matchedBundles.push(bundle.bundleId);
        if (bundle.bundleDiscountPct) {
          const bundleSubtotal = bundle.requiredSkuList.reduce((acc, sku) => {
            const item = items.find(i => i.sku === sku);
            return acc + (item ? item.priceUSD * bundle.minimumPurchases : 0);
          }, 0);
          totalSavedUSD += +(bundleSubtotal * (bundle.bundleDiscountPct / 100)).toFixed(2);
        }
      }
    }

    return { totalSavedUSD, matchedBundles };
  }
}
