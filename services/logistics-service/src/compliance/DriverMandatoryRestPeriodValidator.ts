/**
 * FMCSA Mandatory 30-Minute Rest Break & Sleeper Berth Audit Engine
 */

export interface IRestBreakLog {
  breakId: string;
  driverId: string;
  restType: 'OFF_DUTY_MEAL' | 'SLEEPER_BERTH' | 'REST_STOP';
  startTime: Date;
  endTime?: Date;
  durationMinutes: number;
  truckStopGeofenceId?: string;
}

export class DriverMandatoryRestPeriodValidator {
  public validateBreakCompliance(
    continuousDrivingMinutes: number,
    breaks: IRestBreakLog[]
  ): { isCompliant: boolean; qualifyingRestMinutes: number; minutesUntilMandatoryBreak: number } {
    const qualifying = breaks
      .filter(b => b.durationMinutes >= 30)
      .reduce((sum, b) => sum + b.durationMinutes, 0);

    const minutesUntilMandatoryBreak = Math.max(0, 480 - continuousDrivingMinutes);
    const isCompliant = continuousDrivingMinutes <= 480 || qualifying >= 30;

    return {
      isCompliant,
      qualifyingRestMinutes: qualifying,
      minutesUntilMandatoryBreak
    };
  }
}
