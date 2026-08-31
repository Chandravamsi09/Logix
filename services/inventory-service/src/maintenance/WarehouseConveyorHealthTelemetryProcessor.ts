/**
 * Warehouse Automated Sorter & Roller Conveyor Predictive Maintenance Telemetry Processor
 * Ingests vibration FFT frequencies, motor winding thermistors, and belt tension strain gauge readings.
 */

export interface IConveyorTelemetryReading {
  conveyorLineId: string;
  motorVibrationRmsMmS: number;
  motorTemperatureCelsius: number;
  beltTensionNewtons: number;
  packageTroughputPerMinute: number;
  timestamp: Date;
}

export class WarehouseConveyorHealthTelemetryProcessor {
  public analyzeHealth(reading: IConveyorTelemetryReading): { healthIndexPct: number; riskLevel: 'NOMINAL' | 'ELEVATED' | 'IMMINENT_FAILURE'; alertReasons: string[] } {
    const alertReasons: string[] = [];
    let score = 100;

    // ISO 10816 Vibration Severity Standards
    if (reading.motorVibrationRmsMmS > 7.1) {
      score -= 50;
      alertReasons.push('Severe motor bearing vibration anomaly: RMS > 7.1 mm/s');
    } else if (reading.motorVibrationRmsMmS > 4.5) {
      score -= 25;
      alertReasons.push('Elevated motor vibration: RMS > 4.5 mm/s');
    }

    if (reading.motorTemperatureCelsius > 85.0) {
      score -= 35;
      alertReasons.push('Motor stator thermal overload: Temp > 85°C');
    }

    if (reading.beltTensionNewtons < 1200) {
      score -= 20;
      alertReasons.push('Conveyor drive belt slippage risk: Tension < 1200 N');
    }

    const healthIndexPct = Math.max(0, score);
    let riskLevel: 'NOMINAL' | 'ELEVATED' | 'IMMINENT_FAILURE' = 'NOMINAL';
    if (healthIndexPct < 40) riskLevel = 'IMMINENT_FAILURE';
    else if (healthIndexPct < 75) riskLevel = 'ELEVATED';

    return {
      healthIndexPct,
      riskLevel,
      alertReasons
    };
  }
}
