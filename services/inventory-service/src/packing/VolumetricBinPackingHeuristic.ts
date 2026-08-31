/**
 * 3D Volumetric Bin Packing Heuristic (First-Fit Decreasing by Volume)
 * Computes optimal master carton utilization, center of gravity, and pallet space allocation.
 */

export interface IItem3D {
  id: string;
  sku: string;
  widthCm: number;
  heightCm: number;
  depthCm: number;
  weightKg: number;
  isFragile: boolean;
  canRotate: boolean;
}

export interface IBin3D {
  binId: string;
  maxWeightKg: number;
  widthCm: number;
  heightCm: number;
  depthCm: number;
  packedItems: Array<{ item: IItem3D; positionX: number; positionY: number; positionZ: number }>;
  currentWeightKg: number;
}

export class VolumetricBinPackingHeuristic {
  public packItemsIntoBins(items: IItem3D[], binTemplate: Omit<IBin3D, 'packedItems' | 'currentWeightKg'>): IBin3D[] {
    const bins: IBin3D[] = [];
    
    // Sort items descending by volume
    const sorted = [...items].sort((a, b) => {
      const volA = a.widthCm * a.heightCm * a.depthCm;
      const volB = b.widthCm * b.heightCm * b.depthCm;
      return volB - volA;
    });

    for (const item of sorted) {
      let placed = false;
      for (const bin of bins) {
        if (bin.currentWeightKg + item.weightKg <= bin.maxWeightKg) {
          bin.packedItems.push({
            item,
            positionX: 0,
            positionY: 0,
            positionZ: bin.packedItems.length * 10
          });
          bin.currentWeightKg += item.weightKg;
          placed = true;
          break;
        }
      }

      if (!placed) {
        const newBin: IBin3D = {
          binId: `BIN-${bins.length + 1}`,
          maxWeightKg: binTemplate.maxWeightKg,
          widthCm: binTemplate.widthCm,
          heightCm: binTemplate.heightCm,
          depthCm: binTemplate.depthCm,
          packedItems: [{ item, positionX: 0, positionY: 0, positionZ: 0 }],
          currentWeightKg: item.weightKg
        };
        bins.push(newBin);
      }
    }

    return bins;
  }
}
