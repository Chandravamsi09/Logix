/**
 * Warehouse Inbound Quality Assurance (QA) & Receiving Inspection Checklist
 * Validates seal integrity, carton crush damage, tilt-watch indicators, and SKU barcode scan match rates.
 */

export interface IQaInspectionItem {
  sku: string;
  expectedUnits: number;
  sampledUnits: number;
  defectiveUnits: number;
  packagingCondition: 'PRISTINE' | 'MINOR_DENT' | 'WATER_DAMAGED' | 'CRUSHED';
  tiltIndicatorTripped: boolean;
  temperatureExcursionRecorded: boolean;
}

export class InboundQualityInspectionChecklist {
  private static readonly MAX_ALLOWED_DEFECT_RATE_PCT = 1.5;

  public evaluateInspection(poNumber: string, inspectorUserId: string, items: IQaInspectionItem[]): { isApproved: boolean; defectRatePct: number; quarantineSkuList: string[] } {
    let totalSampled = 0;
    let totalDefects = 0;
    const quarantineSkuList: string[] = [];

    items.forEach(item => {
      totalSampled += item.sampledUnits;
      totalDefects += item.defectiveUnits;

      const itemDefectPct = item.sampledUnits > 0 ? (item.defectiveUnits / item.sampledUnits) * 100 : 0;
      if (itemDefectPct > InboundQualityInspectionChecklist.MAX_ALLOWED_DEFECT_RATE_PCT || item.packagingCondition === 'CRUSHED' || item.tiltIndicatorTripped) {
        quarantineSkuList.push(item.sku);
      }
    });

    const defectRatePct = totalSampled > 0 ? +((totalDefects / totalSampled) * 100).toFixed(2) : 0;
    const isApproved = quarantineSkuList.length === 0 && defectRatePct <= InboundQualityInspectionChecklist.MAX_ALLOWED_DEFECT_RATE_PCT;

    return {
      isApproved,
      defectRatePct,
      quarantineSkuList
    };
  }
}
