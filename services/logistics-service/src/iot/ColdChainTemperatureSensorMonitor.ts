/**
 * Cold-Chain IoT Temperature & Humidity Telemetry Sensor Engine
 * Monitors refrigerated cargo compartments, detecting threshold excursions and shelf-life degradation.
 */

export interface ITemperatureReading {
  sensorId: string;
  shipmentId: string;
  temperatureCelsius: number;
  relativeHumidityPct: number;
  ambientTemperatureCelsius: number;
  batteryLevelPct: number;
  recordedAt: Date;
}

export interface IColdChainThreshold {
  minTempCelsius: number;
  maxTempCelsius: number;
  maxExcursionMinutes: number;
}

export class ColdChainTemperatureSensorMonitor {
  private readonly excursions = new Map<string, number>();

  public ingestReading(reading: ITemperatureReading, threshold: IColdChainThreshold): { isWithinRange: boolean; alertSeverity?: 'WARNING' | 'CRITICAL' } {
    const isExcursion = reading.temperatureCelsius < threshold.minTempCelsius || reading.temperatureCelsius > threshold.maxTempCelsius;

    if (!isExcursion) {
      this.excursions.delete(reading.shipmentId);
      return { isWithinRange: true };
    }

    const currentExcursionMinutes = (this.excursions.get(reading.shipmentId) || 0) + 5;
    this.excursions.set(reading.shipmentId, currentExcursionMinutes);

    let alertSeverity: 'WARNING' | 'CRITICAL' = 'WARNING';
    if (currentExcursionMinutes >= threshold.maxExcursionMinutes) {
      alertSeverity = 'CRITICAL';
    }

    return {
      isWithinRange: false,
      alertSeverity
    };
  }
}
