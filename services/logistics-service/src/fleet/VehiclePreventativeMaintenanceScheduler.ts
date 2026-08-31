/**
 * Preventative Commercial Fleet Maintenance & Engine Lifecycle Scheduler
 * Evaluates mileage thresholds, brake wear telemetry, and oil analysis to schedule service intervals.
 */

export interface IVehicleMaintenanceRecord {
  vehicleId: string;
  vin: string;
  currentOdometerKm: number;
  lastOilChangeKm: number;
  lastBrakeServiceKm: number;
  lastTireRotationKm: number;
  engineOperatingHours: number;
  status: 'OPTIMAL' | 'SERVICE_DUE_SOON' | 'SERVICE_OVERDUE' | 'OUT_OF_SERVICE';
}

export interface IMaintenanceTaskRecommendation {
  taskName: string;
  priority: 'ROUTINE' | 'URGENT' | 'SAFETY_CRITICAL';
  estimatedCostUSD: number;
  estimatedDowntimeHours: number;
}

export class VehiclePreventativeMaintenanceScheduler {
  private static readonly OIL_INTERVAL_KM = 25000;
  private static readonly BRAKE_INTERVAL_KM = 60000;
  private static readonly TIRE_INTERVAL_KM = 40000;

  public evaluateVehicleHealth(record: IVehicleMaintenanceRecord): { overallStatus: IVehicleMaintenanceRecord['status']; tasks: IMaintenanceTaskRecommendation[] } {
    const tasks: IMaintenanceTaskRecommendation[] = [];

    const kmSinceOil = record.currentOdometerKm - record.lastOilChangeKm;
    const kmSinceBrake = record.currentOdometerKm - record.lastBrakeServiceKm;
    const kmSinceTire = record.currentOdometerKm - record.lastTireRotationKm;

    if (kmSinceOil >= VehiclePreventativeMaintenanceScheduler.OIL_INTERVAL_KM) {
      tasks.push({
        taskName: 'Heavy Duty Synthetic Engine Oil & Filter Replacement',
        priority: kmSinceOil > VehiclePreventativeMaintenanceScheduler.OIL_INTERVAL_KM + 3000 ? 'URGENT' : 'ROUTINE',
        estimatedCostUSD: 350.0,
        estimatedDowntimeHours: 2.5
      });
    }

    if (kmSinceBrake >= VehiclePreventativeMaintenanceScheduler.BRAKE_INTERVAL_KM) {
      tasks.push({
        taskName: 'Air Brake Lining Inspection & Drum Rotor Measurement',
        priority: 'SAFETY_CRITICAL',
        estimatedCostUSD: 780.0,
        estimatedDowntimeHours: 4.0
      });
    }

    if (kmSinceTire >= VehiclePreventativeMaintenanceScheduler.TIRE_INTERVAL_KM) {
      tasks.push({
        taskName: 'All-Axle Commercial Tire Rotation & Tread Depth Gauge',
        priority: 'ROUTINE',
        estimatedCostUSD: 180.0,
        estimatedDowntimeHours: 1.5
      });
    }

    let overallStatus: IVehicleMaintenanceRecord['status'] = 'OPTIMAL';
    if (tasks.some(t => t.priority === 'SAFETY_CRITICAL')) {
      overallStatus = 'SERVICE_OVERDUE';
    } else if (tasks.length > 0) {
      overallStatus = 'SERVICE_DUE_SOON';
    }

    return { overallStatus, tasks };
  }
}
