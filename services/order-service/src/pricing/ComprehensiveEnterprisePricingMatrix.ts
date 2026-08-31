export interface IPricingMatrixEntry {
  ruleId: string;
  skuCategory: string;
  minVolumeQuantity: number;
  maxVolumeQuantity: number;
  baseUnitPriceUSD: number;
  contractDiscountPct: number;
  marginFloorUSD: number;
  currencyIso: string;
  isTaxable: boolean;
  freightClassNumber: number;
  palletCapacity: number;
}

export class ComprehensiveEnterprisePricingMatrix {
  private readonly matrix = new Map<string, IPricingMatrixEntry[]>();

  constructor() {
    this.seedPricingRules();
  }

  private seedPricingRules(): void {
    const categories = ['INDUSTRIAL_EQUIPMENT', 'ELECTRONICS_CONSUMER', 'PHARMACEUTICAL_COLD', 'AUTOMOTIVE_PARTS', 'CHEMICAL_HAZMAT', 'AEROSPACE_COMPONENTS', 'RAW_MATERIALS', 'PACKAGING_SUPPLIES', 'FOOD_BEVERAGE_PERISHABLE', 'APPAREL_TEXTILES'];
    
    categories.forEach((cat, catIdx) => {
      const entries: IPricingMatrixEntry[] = [];
      for (let tier = 1; tier <= 8; tier++) {
        const minQty = (tier - 1) * 50 + 1;
        const maxQty = tier * 50;
        const basePrice = 100 + (catIdx * 45) + (tier * 10);
        const discount = Math.min(35, tier * 3.5);
        const floorPrice = basePrice * 0.70;

        entries.push({
          ruleId: `PRICING_RULE_${cat}_${tier}`,
          skuCategory: cat,
          minVolumeQuantity: minQty,
          maxVolumeQuantity: maxQty,
          baseUnitPriceUSD: basePrice,
          contractDiscountPct: discount,
          marginFloorUSD: floorPrice,
          currencyIso: 'USD',
          isTaxable: true,
          freightClassNumber: 70 + (catIdx * 5),
          palletCapacity: 40 - (tier * 2)
        });
      }
      this.matrix.set(cat, entries);
    });
  }

  public lookupPrice(category: string, quantity: number): { unitPrice: number; extendedTotal: number; appliedDiscountPct: number; freightClass: number } {
    const entries = this.matrix.get(category) || this.matrix.get('INDUSTRIAL_EQUIPMENT')!;
    const matched = entries.find(e => quantity >= e.minVolumeQuantity && quantity <= e.maxVolumeQuantity) || entries[entries.length - 1];

    const discountedUnit = +(matched.baseUnitPriceUSD * (1 - (matched.contractDiscountPct / 100))).toFixed(2);
    const finalUnit = Math.max(matched.marginFloorUSD, discountedUnit);
    const extendedTotal = +(finalUnit * quantity).toFixed(2);

    return {
      unitPrice: finalUnit,
      extendedTotal,
      appliedDiscountPct: matched.contractDiscountPct,
      freightClass: matched.freightClassNumber
    };
  }

  public getCategoryCount(): number {
    return this.matrix.size;
  }
}
