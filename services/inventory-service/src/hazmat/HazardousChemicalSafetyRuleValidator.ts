/**
 * OSHA / DOT Hazardous Materials (HAZMAT) Segregation & Compatibility Matrix Validator
 * Prevents co-storage of incompatible chemical classes in warehouse bays (e.g. Flammable liquids and Oxidizers).
 */

export type HazmatClass = 'CLASS_1_EXPLOSIVES' | 'CLASS_2_GASES' | 'CLASS_3_FLAMMABLE_LIQUIDS' | 'CLASS_4_FLAMMABLE_SOLIDS' | 'CLASS_5_OXIDIZERS' | 'CLASS_6_POISONS' | 'CLASS_7_RADIOACTIVE' | 'CLASS_8_CORROSIVES' | 'CLASS_9_MISC';

export interface IHazmatStorageRule {
  classA: HazmatClass;
  classB: HazmatClass;
  isAllowedInSameBay: boolean;
  requiredSeparationDistanceMeters: number;
  fireSuppressionType: 'WATER_SPRINKLER' | 'FOAM' | 'DRY_CHEMICAL' | 'CO2';
}

export class HazardousChemicalSafetyRuleValidator {
  private readonly rules: IHazmatStorageRule[] = [];

  constructor() {
    this.initializeMatrix();
  }

  private initializeMatrix(): void {
    this.rules.push({
      classA: 'CLASS_3_FLAMMABLE_LIQUIDS',
      classB: 'CLASS_5_OXIDIZERS',
      isAllowedInSameBay: false,
      requiredSeparationDistanceMeters: 15.0,
      fireSuppressionType: 'FOAM'
    });

    this.rules.push({
      classA: 'CLASS_8_CORROSIVES',
      classB: 'CLASS_3_FLAMMABLE_LIQUIDS',
      isAllowedInSameBay: false,
      requiredSeparationDistanceMeters: 8.0,
      fireSuppressionType: 'DRY_CHEMICAL'
    });

    this.rules.push({
      classA: 'CLASS_4_FLAMMABLE_SOLIDS',
      classB: 'CLASS_5_OXIDIZERS',
      isAllowedInSameBay: false,
      requiredSeparationDistanceMeters: 12.0,
      fireSuppressionType: 'FOAM'
    });
  }

  public validateBayPlacement(classNewItem: HazmatClass, existingClassesInBay: HazmatClass[]): { isCompliant: boolean; violations: string[]; requiredSeparationMeters: number } {
    const violations: string[] = [];
    let maxSeparationMeters = 0;

    for (const existing of existingClassesInBay) {
      const conflict = this.rules.find(r => 
        (r.classA === classNewItem && r.classB === existing) ||
        (r.classA === existing && r.classB === classNewItem)
      );

      if (conflict && !conflict.isAllowedInSameBay) {
        violations.push(`Incompatible storage: ${classNewItem} cannot be stored with ${existing}`);
        maxSeparationMeters = Math.max(maxSeparationMeters, conflict.requiredSeparationDistanceMeters);
      }
    }

    return {
      isCompliant: violations.length === 0,
      violations,
      requiredSeparationMeters: maxSeparationMeters
    };
  }
}
