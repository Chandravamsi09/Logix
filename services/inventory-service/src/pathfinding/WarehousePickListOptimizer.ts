/**
 * Warehouse Multi-Zone Pick-List Traversal Optimizer
 * Generates optimal serpentine pick-paths through aisles, racks, and shelf tiers to minimize warehouse picker travel time.
 */

export interface IPickItemLocation {
  sku: string;
  quantity: number;
  aisle: number;
  bay: number;
  shelfTier: number;
  weightKg: number;
}

export class WarehousePickListOptimizer {
  public optimizePickPath(items: IPickItemLocation[]): IPickItemLocation[] {
    // Group by aisle
    const aisleMap = new Map<number, IPickItemLocation[]>();
    items.forEach(item => {
      if (!aisleMap.has(item.aisle)) aisleMap.set(item.aisle, []);
      aisleMap.get(item.aisle)!.push(item);
    });

    const sortedAisles = Array.from(aisleMap.keys()).sort((a, b) => a - b);
    const optimizedPath: IPickItemLocation[] = [];

    sortedAisles.forEach((aisle, idx) => {
      const aisleItems = aisleMap.get(aisle)!;
      // Serpentine traversal: even aisles ascending bays, odd aisles descending bays
      if (idx % 2 === 0) {
        aisleItems.sort((a, b) => a.bay - b.bay || a.shelfTier - b.shelfTier);
      } else {
        aisleItems.sort((a, b) => b.bay - a.bay || a.shelfTier - b.shelfTier);
      }
      optimizedPath.push(...aisleItems);
    });

    return optimizedPath;
  }
}
