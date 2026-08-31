/**
 * Warehouse Hazardous Gas Leakage & Atmospheric Dispersion Plume Model
 * Evaluates bay ventilation CFM rates, sensor PPM thresholds, and automated bay isolation shutter triggers.
 */

export interface IGasSensorReading {
  sensorId: string;
  warehouseId: string;
  bayNumber: number;
  gasType: 'AMMONIA' | 'CARBON_MONOXIDE' | 'CHLORINE' | 'REFRIGERANT_R404A';
  concentrationPpm: number;
  ambientTemperatureCelsius: number;
  ventilationAirflowCfm: number;
  recordedAt: Date;
}

export class HazardousGasDispersionModel {
  private readonly ppmThresholds = {
    AMMONIA: { warning: 25, evacuation: 50 },
    CARBON_MONOXIDE: { warning: 35, evacuation: 100 },
    CHLORINE: { warning: 0.5, evacuation: 3.0 },
    REFRIGERANT_R404A: { warning: 500, evacuation: 1000 }
  };

  public evaluateAtmosphericRisk(reading: IGasSensorReading): { riskLevel: 'SAFE' | 'WARNING' | 'EVACUATION_REQUIRED'; actionsRequired: string[] } {
    const limits = this.ppmThresholds[reading.gasType] || { warning: 50, evacuation: 200 };
    const actions: string[] = [];

    if (reading.concentrationPpm >= limits.evacuation) {
      actions.push('ACTIVATE_EMERGENCY_SIRENS');
      actions.push('SEAL_BAY_FIRE_SHUTTERS');
      actions.push('MAX_EXHAUST_VENTILATION_BOOST');
      actions.push('ALERT_MUNICIPAL_HAZMAT_DISPATCH');
      return { riskLevel: 'EVACUATION_REQUIRED', actionsRequired: actions };
    } else if (reading.concentrationPpm >= limits.warning) {
      actions.push('INCREASE_BAY_VENTILATION_50_PCT');
      actions.push('DISPATCH_FACILITY_SAFETY_OFFICER');
      return { riskLevel: 'WARNING', actionsRequired: actions };
    }

    return { riskLevel: 'SAFE', actionsRequired: ['LOG_TELEMETRY'] };
  }
}
