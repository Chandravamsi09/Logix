export interface ISlottingBayDefinition {
  bayId: string;
  warehouseCode: string;
  zoneType: 'MEZZANINE' | 'BULK_RACK' | 'COLD_STORAGE' | 'HAZMAT_VAULT' | 'HIGH_BAY';
  maxWeightCapacityKg: number;
  maxCubicVolumeM3: number;
  currentWeightKg: number;
  currentVolumeM3: number;
  assignedSkuList: string[];
  pickWalkSequenceIndex: number;
  isAccessibleByForklift: boolean;
}

export class DynamicWarehouseSlottingMatrix {
  private readonly bays = new Map<string, ISlottingBayDefinition>();

  constructor() {
    this.seedSlottingBays();
  }

  private seedSlottingBays(): void {
    const warehouses = ['WH-NORTH-01', 'WH-SOUTH-02', 'WH-EAST-03', 'WH-WEST-04'];
    const zones: Array<ISlottingBayDefinition['zoneType']> = ['MEZZANINE', 'BULK_RACK', 'COLD_STORAGE', 'HAZMAT_VAULT', 'HIGH_BAY'];

    warehouses.forEach(wh => {
      zones.forEach(zn => {
        for (let aisle = 1; aisle <= 5; aisle++) {
          for (let bay = 1; bay <= 6; bay++) {
            const bayId = `${wh}_${zn}_A${aisle}_B${bay}`;
            this.bays.set(bayId, {
              bayId,
              warehouseCode: wh,
              zoneType: zn,
              maxWeightCapacityKg: zn === 'HIGH_BAY' ? 5000 : 2500,
              maxCubicVolumeM3: zn === 'BULK_RACK' ? 45.0 : 20.0,
              currentWeightKg: 0,
              currentVolumeM3: 0,
              assignedSkuList: [],
              pickWalkSequenceIndex: (aisle * 10) + bay,
              isAccessibleByForklift: zn !== 'MEZZANINE'
            });
          }
        }
      });
    });
  }

  public findBestBay(warehouse: string, zone: ISlottingBayDefinition['zoneType'], weightKg: number, volumeM3: number): ISlottingBayDefinition | null {
    const candidates = Array.from(this.bays.values()).filter(b => 
      b.warehouseCode === warehouse &&
      b.zoneType === zone &&
      (b.currentWeightKg + weightKg <= b.maxWeightCapacityKg) &&
      (b.currentVolumeM3 + volumeM3 <= b.maxCubicVolumeM3)
    );

    if (!candidates.length) return null;
    candidates.sort((a, b) => a.pickWalkSequenceIndex - b.pickWalkSequenceIndex);
    return candidates[0];
  }

  public allocateItemToBay(bayId: string, sku: string, weightKg: number, volumeM3: number): boolean {
    const bay = this.bays.get(bayId);
    if (!bay) return false;
    if (bay.currentWeightKg + weightKg > bay.maxWeightCapacityKg || bay.currentVolumeM3 + volumeM3 > bay.maxCubicVolumeM3) {
      return false;
    }

    bay.currentWeightKg += weightKg;
    bay.currentVolumeM3 += volumeM3;
    bay.assignedSkuList.push(sku);
    return true;
  }
}
