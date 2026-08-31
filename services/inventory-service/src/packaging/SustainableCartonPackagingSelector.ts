/**
 * Eco-Friendly Right-Size Carton Packaging & Void-Fill Optimizer
 * Minimizes dimensional dimensional weight (DIM weight) penalties and carbon emissions by selecting minimal carton volume.
 */

export interface ICartonSize {
  cartonCode: string;
  innerLengthCm: number;
  innerWidthCm: number;
  innerHeightCm: number;
  maxPayloadWeightKg: number;
  tareWeightKg: number;
  materialEcoRating: 'FSC_100_RECYCLED' | 'KRAFT_STANDARD' | 'CORRUGATED_HEAVY_DUTY';
}

export class SustainableCartonPackagingSelector {
  private readonly cartons: ICartonSize[] = [
    { cartonCode: 'BOX-S1', innerLengthCm: 20, innerWidthCm: 15, innerHeightCm: 10, maxPayloadWeightKg: 5, tareWeightKg: 0.15, materialEcoRating: 'FSC_100_RECYCLED' },
    { cartonCode: 'BOX-M1', innerLengthCm: 35, innerWidthCm: 25, innerHeightCm: 20, maxPayloadWeightKg: 15, tareWeightKg: 0.35, materialEcoRating: 'FSC_100_RECYCLED' },
    { cartonCode: 'BOX-L1', innerLengthCm: 50, innerWidthCm: 40, innerHeightCm: 35, maxPayloadWeightKg: 30, tareWeightKg: 0.65, materialEcoRating: 'FSC_100_RECYCLED' },
    { cartonCode: 'BOX-XL1', innerLengthCm: 70, innerWidthCm: 55, innerHeightCm: 45, maxPayloadWeightKg: 50, tareWeightKg: 1.10, materialEcoRating: 'CORRUGATED_HEAVY_DUTY' }
  ];

  public selectOptimalCarton(
    totalItemVolumeCm3: number,
    maxDimensionCm: number,
    totalWeightKg: number
  ): { selectedCarton: ICartonSize; voidFillVolumeCm3: number; cartonUtilizationPct: number } {
    const eligible = this.cartons.filter(c => 
      c.maxPayloadWeightKg >= totalWeightKg &&
      Math.max(c.innerLengthCm, c.innerWidthCm, c.innerHeightCm) >= maxDimensionCm &&
      (c.innerLengthCm * c.innerWidthCm * c.innerHeightCm) >= totalItemVolumeCm3
    );

    if (!eligible.length) {
      const largest = this.cartons[this.cartons.length - 1];
      const vol = largest.innerLengthCm * largest.innerWidthCm * largest.innerHeightCm;
      return {
        selectedCarton: largest,
        voidFillVolumeCm3: Math.max(0, vol - totalItemVolumeCm3),
        cartonUtilizationPct: +((totalItemVolumeCm3 / vol) * 100).toFixed(1)
      };
    }

    // Select smallest valid carton by volume
    eligible.sort((a, b) => 
      (a.innerLengthCm * a.innerWidthCm * a.innerHeightCm) - (b.innerLengthCm * b.innerWidthCm * b.innerHeightCm)
    );

    const chosen = eligible[0];
    const chosenVol = chosen.innerLengthCm * chosen.innerWidthCm * chosen.innerHeightCm;
    const voidFill = Math.max(0, chosenVol - totalItemVolumeCm3);
    const utilization = +((totalItemVolumeCm3 / chosenVol) * 100).toFixed(1);

    return {
      selectedCarton: chosen,
      voidFillVolumeCm3: voidFill,
      cartonUtilizationPct: utilization
    };
  }
}
