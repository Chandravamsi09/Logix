/**
 * Reefer Container Multi-Zone Temperature Excursion Alert Engine
 * Ingests live continuous datalogger telematics and triggers escalation workflows for cold-chain deviations.
 */

export interface IReeferSensorReading {
  telematicsId: string;
  shipmentId: string;
  compartmentZone: 'ZONE_A_FROZEN' | 'ZONE_B_CHILLED' | 'ZONE_C_AMBIENT';
  temperatureCelsius: number;
  humidityPercentage: number;
  compressorState: 'RUNNING' | 'DEFROST' | 'OFF' | 'FAULT';
  timestamp: Date;
}

export class ReeferRefrigeratedCargoTemperatureAlertEngine {
  private readonly zoneThresholds = {
    ZONE_A_FROZEN: { min: -25.0, max: -18.0 },
    ZONE_B_CHILLED: { min: 2.0, max: 8.0 },
    ZONE_C_AMBIENT: { min: 15.0, max: 25.0 }
  };

  public evaluateReading(reading: IReeferSensorReading): { isAlertTriggered: boolean; severity: 'NORMAL' | 'WARNING' | 'CRITICAL'; deviationCelsius: number } {
    const limits = this.zoneThresholds[reading.compartmentZone];
    if (!limits) return { isAlertTriggered: false, severity: 'NORMAL', deviationCelsius: 0 };

    let deviation = 0;
    if (reading.temperatureCelsius > limits.max) {
      deviation = +(reading.temperatureCelsius - limits.max).toFixed(2);
    } else if (reading.temperatureCelsius < limits.min) {
      deviation = +(limits.min - reading.temperatureCelsius).toFixed(2);
    }

    if (deviation >= 5.0 || reading.compressorState === 'FAULT') {
      return { isAlertTriggered: true, severity: 'CRITICAL', deviationCelsius: deviation };
    } else if (deviation > 0) {
      return { isAlertTriggered: true, severity: 'WARNING', deviationCelsius: deviation };
    }

    return { isAlertTriggered: false, severity: 'NORMAL', deviationCelsius: 0 };
  }
}
