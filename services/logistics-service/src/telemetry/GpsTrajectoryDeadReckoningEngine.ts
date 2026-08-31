/**
 * GPS Trajectory Dead Reckoning & Map Matching Engine
 * Reconstructs vehicle position during tunnel / urban canyon GPS signal loss using IMU accelerometer and gyroscope data.
 */

export interface IImuTelemetrySample {
  timestamp: Date;
  accelerationForwardMs2: number;
  yawRateDegreesPerSecond: number;
  wheelSpeedMps: number;
}

export class GpsTrajectoryDeadReckoningEngine {
  public computeDeadReckoningPosition(
    lastKnownFix: { lat: number; lon: number; headingDegrees: number },
    imuSamples: IImuTelemetrySample[],
    deltaTimeSeconds: number
  ): { projectedLat: number; projectedLon: number; projectedHeading: number; confidenceScore: number } {
    let currentLat = lastKnownFix.lat;
    let currentLon = lastKnownFix.lon;
    let currentHeading = lastKnownFix.headingDegrees;

    const METERS_PER_DEGREE_LAT = 111320;

    for (const sample of imuSamples) {
      currentHeading = (currentHeading + (sample.yawRateDegreesPerSecond * deltaTimeSeconds)) % 360;
      const distanceTraveledMeters = sample.wheelSpeedMps * deltaTimeSeconds;

      const headingRad = (currentHeading * Math.PI) / 180;
      const deltaLatMeters = distanceTraveledMeters * Math.cos(headingRad);
      const deltaLonMeters = distanceTraveledMeters * Math.sin(headingRad);

      currentLat += deltaLatMeters / METERS_PER_DEGREE_LAT;
      const metersPerDegreeLon = METERS_PER_DEGREE_LAT * Math.cos((currentLat * Math.PI) / 180);
      currentLon += deltaLonMeters / metersPerDegreeLon;
    }

    const confidenceScore = Math.max(0.2, +(1.0 - (imuSamples.length * 0.05)).toFixed(2));

    return {
      projectedLat: +currentLat.toFixed(6),
      projectedLon: +currentLon.toFixed(6),
      projectedHeading: +currentHeading.toFixed(1),
      confidenceScore
    };
  }
}
