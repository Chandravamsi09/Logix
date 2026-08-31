/**
 * Global Harmonized Tariff Schedule (HTS / WCO HS) Code Database
 * Classifies multi-modal international freight consignments with duty rates, chapter classifications, and export control ratings (ECCN).
 */

export interface IHtsClassificationRecord {
  htsCode: string;
  chapterNumber: number;
  headingNumber: string;
  subheadingNumber: string;
  descriptionText: string;
  generalDutyRatePct: number;
  specialDutyTradeAgreementPct: number;
  eccnExportControlRating?: string;
  requiresExportLicense: boolean;
}

export class HarmonizedTariffScheduleDatabase {
  private readonly codes = new Map<string, IHtsClassificationRecord>();

  constructor() {
    this.initializeHtsRegistry();
  }

  private initializeHtsRegistry(): void {
    const entries: IHtsClassificationRecord[] = [
      { htsCode: '8471.30.0100', chapterNumber: 84, headingNumber: '8471', subheadingNumber: '8471.30', descriptionText: 'Portable automatic data processing machines, weighing not more than 10 kg', generalDutyRatePct: 0.0, specialDutyTradeAgreementPct: 0.0, eccnExportControlRating: '5A002', requiresExportLicense: false },
      { htsCode: '8504.40.9580', chapterNumber: 85, headingNumber: '8504', subheadingNumber: '8504.40', descriptionText: 'Static converters, power supplies for automatic data processing machines', generalDutyRatePct: 1.5, specialDutyTradeAgreementPct: 0.0, eccnExportControlRating: 'EAR99', requiresExportLicense: false },
      { htsCode: '8708.29.5060', chapterNumber: 87, headingNumber: '8708', subheadingNumber: '8708.29', descriptionText: 'Parts and accessories of the motor vehicles of headings 8701 to 8705', generalDutyRatePct: 2.5, specialDutyTradeAgreementPct: 0.0, eccnExportControlRating: 'EAR99', requiresExportLicense: false },
      { htsCode: '9013.80.9000', chapterNumber: 90, headingNumber: '9013', subheadingNumber: '9013.80', descriptionText: 'Liquid crystal devices, not constituting articles provided for more specifically in other headings', generalDutyRatePct: 4.5, specialDutyTradeAgreementPct: 0.0, eccnExportControlRating: '6A005', requiresExportLicense: true }
    ];

    entries.forEach(e => this.codes.set(e.htsCode, e));
  }

  public lookupHtsCode(code: string): IHtsClassificationRecord | null {
    return this.codes.get(code) || null;
  }

  public searchByKeyword(keyword: string): IHtsClassificationRecord[] {
    const lower = keyword.toLowerCase();
    return Array.from(this.codes.values()).filter(c => c.descriptionText.toLowerCase().includes(lower) || c.htsCode.includes(lower));
  }
}
