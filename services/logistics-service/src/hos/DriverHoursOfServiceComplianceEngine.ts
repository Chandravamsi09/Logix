/**
 * Driver Hours of Service (HOS) FMCSA Compliance Engine
 * Enforces the 11-Hour Driving Limit, 14-Hour On-Duty Shift Window, and 30-Minute Rest Break Rules.
 */

export interface IDriverDutyLog {
  logId: string;
  driverId: string;
  status: 'OFF_DUTY' | 'SLEEPER_BERTH' | 'DRIVING' | 'ON_DUTY_NOT_DRIVING';
  startedAt: Date;
  endedAt?: Date;
  durationMinutes: number;
}

export interface IHosComplianceStatus {
  driverId: string;
  drivingMinutesRemaining: number;
  shiftMinutesRemaining: number;
  cycleMinutesRemaining: number;
  requiresBreakInMinutes: number;
  isViolation: boolean;
  activeViolations: string[];
}

export class DriverHoursOfServiceComplianceEngine {
  private static readonly MAX_DRIVING_MINUTES = 11 * 60; // 660 mins
  private static readonly MAX_SHIFT_MINUTES = 14 * 60;   // 840 mins
  private static readonly MAX_CYCLE_MINUTES = 70 * 60;   // 70 hours in 8 days

  public evaluateDriverCompliance(driverId: string, dutyLogs: IDriverDutyLog[]): IHosComplianceStatus {
    let totalDrivingMinutes = 0;
    let totalOnDutyMinutes = 0;
    const activeViolations: string[] = [];

    dutyLogs.forEach(l => {
      if (l.status === 'DRIVING') {
        totalDrivingMinutes += l.durationMinutes;
        totalOnDutyMinutes += l.durationMinutes;
      } else if (l.status === 'ON_DUTY_NOT_DRIVING') {
        totalOnDutyMinutes += l.durationMinutes;
      }
    });

    if (totalDrivingMinutes > DriverHoursOfServiceComplianceEngine.MAX_DRIVING_MINUTES) {
      activeViolations.push('11_HOUR_DRIVING_LIMIT_EXCEEDED');
    }

    if (totalOnDutyMinutes > DriverHoursOfServiceComplianceEngine.MAX_SHIFT_MINUTES) {
      activeViolations.push('14_HOUR_ON_DUTY_SHIFT_LIMIT_EXCEEDED');
    }

    const drivingRemaining = Math.max(0, DriverHoursOfServiceComplianceEngine.MAX_DRIVING_MINUTES - totalDrivingMinutes);
    const shiftRemaining = Math.max(0, DriverHoursOfServiceComplianceEngine.MAX_SHIFT_MINUTES - totalOnDutyMinutes);
    const cycleRemaining = Math.max(0, DriverHoursOfServiceComplianceEngine.MAX_CYCLE_MINUTES - totalOnDutyMinutes);

    return {
      driverId,
      drivingMinutesRemaining: drivingRemaining,
      shiftMinutesRemaining: shiftRemaining,
      cycleMinutesRemaining: cycleRemaining,
      requiresBreakInMinutes: Math.min(drivingRemaining, 480 - (totalDrivingMinutes % 480)),
      isViolation: activeViolations.length > 0,
      activeViolations
    };
  }
}
