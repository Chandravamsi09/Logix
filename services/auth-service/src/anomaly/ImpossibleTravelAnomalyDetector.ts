/**
 * Impossible Travel Geolocation Velocity Anomaly Detector
 * Flags logins where the geographic distance between sequential sessions implies speeds > 900 km/h (commercial flight limit).
 */

export interface IUserLoginLocation {
  userId: string;
  ipAddress: string;
  latitude: number;
  longitude: number;
  cityName: string;
  countryIso: string;
  timestamp: Date;
}

export class ImpossibleTravelAnomalyDetector {
  private readonly userHistory = new Map<string, IUserLoginLocation>();

  public evaluateLogin(login: IUserLoginLocation): { isSuspicious: boolean; impliedSpeedKmh: number; previousCity?: string } {
    const previous = this.userHistory.get(login.userId);
    this.userHistory.set(login.userId, login);

    if (!previous) {
      return { isSuspicious: false, impliedSpeedKmh: 0 };
    }

    const elapsedHours = (login.timestamp.getTime() - previous.timestamp.getTime()) / (1000 * 3600);
    if (elapsedHours <= 0) {
      return { isSuspicious: true, impliedSpeedKmh: 9999, previousCity: previous.cityName };
    }

    const R = 6371; // Earth radius KM
    const dLat = (login.latitude - previous.latitude) * Math.PI / 180;
    const dLon = (login.longitude - previous.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(previous.latitude * Math.PI / 180) * Math.cos(login.latitude * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    const impliedSpeedKmh = +(distanceKm / elapsedHours).toFixed(1);
    const isSuspicious = impliedSpeedKmh > 900 && distanceKm > 300;

    return {
      isSuspicious,
      impliedSpeedKmh,
      previousCity: previous.cityName
    };
  }
}
