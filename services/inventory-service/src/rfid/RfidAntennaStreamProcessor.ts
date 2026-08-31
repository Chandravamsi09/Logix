/**
 * UHF RFID Antenna Stream Processor
 * Ingests high-frequency EPC Gen2 tag scans from warehouse portal antennas with debouncing.
 */

export interface IRfidTagRead {
  epcCode: string;
  antennaId: string;
  warehouseId: string;
  portalZone: 'INBOUND_DOCK' | 'PICK_FACE' | 'PACK_STATION' | 'OUTBOUND_STAGING';
  rssiSignalDbm: number;
  readTimestamp: Date;
}

export class RfidAntennaStreamProcessor {
  private readonly tagDebounceWindowMs = 2500;
  private readonly lastSeenTags = new Map<string, Date>();
  private readonly locationIndex = new Map<string, string>();

  public processTagScan(read: IRfidTagRead): { isAccepted: boolean; previousZone?: string; newZone: string } {
    const lastSeen = this.lastSeenTags.get(read.epcCode);
    const now = read.readTimestamp;

    if (lastSeen && (now.getTime() - lastSeen.getTime()) < this.tagDebounceWindowMs) {
      return { isAccepted: false, newZone: read.portalZone };
    }

    this.lastSeenTags.set(read.epcCode, now);
    const previousZone = this.locationIndex.get(read.epcCode);
    this.locationIndex.set(read.epcCode, read.portalZone);

    return {
      isAccepted: true,
      previousZone,
      newZone: read.portalZone
    };
  }

  public getTagLocation(epcCode: string): string | null {
    return this.locationIndex.get(epcCode) || null;
  }
}
