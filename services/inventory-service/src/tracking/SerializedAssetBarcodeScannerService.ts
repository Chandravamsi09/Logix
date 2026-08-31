/**
 * GS1-128 / DataMatrix High-Throughput 2D Barcode Scanner & Parser Service
 * Extracts GTIN-14, serial numbers, lot codes, expiration dates, and SSCC pallet license plates.
 */

export interface IGs1ParsedBarcode {
  rawBarcode: string;
  gtin14?: string;
  serialNumber?: string;
  lotNumber?: string;
  expirationDate?: string;
  ssccPalletId?: string;
  netWeightKg?: number;
  isValidGs1: boolean;
}

export class SerializedAssetBarcodeScannerService {
  public parseGs1DataMatrix(barcode: string): IGs1ParsedBarcode {
    const clean = barcode.replace(/[()]/g, '');
    const result: IGs1ParsedBarcode = {
      rawBarcode: barcode,
      isValidGs1: false
    };

    // AI (01): GTIN
    const gtinMatch = clean.match(/01(\d{14})/);
    if (gtinMatch) result.gtin14 = gtinMatch[1];

    // AI (21): Serial Number
    const serialMatch = clean.match(/21([A-Za-z0-9]{6,20})/);
    if (serialMatch) result.serialNumber = serialMatch[1];

    // AI (10): Batch / Lot Number
    const lotMatch = clean.match(/10([A-Za-z0-9]{4,15})/);
    if (lotMatch) result.lotNumber = lotMatch[1];

    // AI (17): Expiration Date (YYMMDD)
    const expMatch = clean.match(/17(\d{6})/);
    if (expMatch) result.expirationDate = expMatch[1];

    // AI (00): SSCC Pallet ID
    const ssccMatch = clean.match(/00(\d{18})/);
    if (ssccMatch) result.ssccPalletId = ssccMatch[1];

    result.isValidGs1 = Boolean(result.gtin14 || result.ssccPalletId || result.serialNumber);
    return result;
  }
}
