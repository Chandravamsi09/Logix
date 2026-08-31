/**
 * US DOT FMCSA CFR 49 Commercial Hazardous Materials Transport Inspector
 * Validates shipping papers, placard placement requirements, emergency response guide (ERG) numbers, and driver CDL Hazmat endorsements (H/X).
 */

export interface IHazmatCargoItem {
  unNumber: string; // e.g. UN1203 for Gasoline
  properShippingName: string;
  hazardClassNumber: string; // e.g. 3
  packingGroup: 'I' | 'II' | 'III';
  grossWeightLbs: number;
  isReportableQuantity: boolean;
  ergGuidePageNumber: number;
}

export interface IDriverHazmatCredentials {
  driverId: string;
  licenseNumber: string;
  endorsements: string[]; // e.g. ['H', 'N', 'T', 'X']
  twicCardVerified: boolean;
  medicalCardExpiresAt: Date;
  hazmatTrainingExpiresAt: Date;
}

export class DotHazardousTransportInspector {
  public evaluateTransportCompliance(
    items: IHazmatCargoItem[],
    driver: IDriverHazmatCredentials,
    vehicleHasPlacards: boolean
  ): { isAllowedToDispatch: boolean; violations: string[]; requiredPlacardNames: string[] } {
    const violations: string[] = [];
    const requiredPlacardNames: string[] = [];

    const totalWeightLbs = items.reduce((acc, curr) => acc + curr.grossWeightLbs, 0);

    // Check driver qualifications
    const hasHazmatEndorsement = driver.endorsements.includes('H') || driver.endorsements.includes('X');
    if (!hasHazmatEndorsement) {
      violations.push('Driver lacks required H or X Hazmat endorsement on CDL');
    }

    if (driver.hazmatTrainingExpiresAt < new Date()) {
      violations.push('Driver recurrent DOT hazardous materials security training has expired');
    }

    if (driver.medicalCardExpiresAt < new Date()) {
      violations.push('Driver DOT physical medical examiner certificate is expired');
    }

    // Placarding rules (CFR 49 Section 172.504 Table 2: 1,001+ lbs requires placards)
    if (totalWeightLbs >= 1001) {
      items.forEach(i => {
        const placard = `CLASS_${i.hazardClassNumber}_PLACARD`;
        if (!requiredPlacardNames.includes(placard)) {
          requiredPlacardNames.push(placard);
        }
      });

      if (!vehicleHasPlacards) {
        violations.push('Vehicle lacks mandatory DOT placards for aggregate hazardous payload >= 1,001 lbs');
      }
    }

    return {
      isAllowedToDispatch: violations.length === 0,
      violations,
      requiredPlacardNames
    };
  }
}
