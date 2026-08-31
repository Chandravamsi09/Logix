/**
 * Warehouse Inbound/Outbound Dock Door Appointment Scheduler
 * Manages carrier time-slot bookings, detention prevention buffers, and door equipment compatibility (dock levelers, cold-tunnels).
 */

export interface IDockDoor {
  doorId: string;
  doorNumber: string;
  warehouseId: string;
  doorType: 'INBOUND_UNLOAD' | 'OUTBOUND_LOAD' | 'DUAL_PURPOSE';
  hasColdTunnelSeal: boolean;
  maxTrailerLengthFeet: number;
  isOperational: boolean;
}

export interface IAppointmentSlot {
  appointmentId: string;
  doorId: string;
  carrierCode: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  actualArrival?: Date;
  actualDeparture?: Date;
  status: 'BOOKED' | 'CHECKED_IN' | 'AT_DOCK' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
}

export class AutomatedDockDoorAppointmentScheduler {
  private readonly doors = new Map<string, IDockDoor>();
  private readonly appointments = new Map<string, IAppointmentSlot>();

  public registerDoor(door: IDockDoor): void {
    this.doors.set(door.doorId, { ...door });
  }

  public bookAppointment(
    warehouseId: string,
    carrierCode: string,
    doorType: IDockDoor['doorType'],
    startTime: Date,
    durationMinutes: number = 60,
    requiresColdSeal: boolean = false
  ): IAppointmentSlot {
    const eligibleDoors = Array.from(this.doors.values()).filter(d => 
      d.warehouseId === warehouseId &&
      d.isOperational &&
      (d.doorType === doorType || d.doorType === 'DUAL_PURPOSE') &&
      (!requiresColdSeal || d.hasColdTunnelSeal)
    );

    if (!eligibleDoors.length) {
      throw new Error('No eligible dock doors found matching the requested facility criteria');
    }

    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    // Find conflict-free door
    for (const door of eligibleDoors) {
      const hasConflict = Array.from(this.appointments.values()).some(app => 
        app.doorId === door.doorId &&
        app.status !== 'CANCELLED' &&
        ((startTime >= app.scheduledStart && startTime < app.scheduledEnd) ||
         (endTime > app.scheduledStart && endTime <= app.scheduledEnd))
      );

      if (!hasConflict) {
        const appointmentId = 'DOCK-APT-' + Date.now().toString(36).toUpperCase();
        const slot: IAppointmentSlot = {
          appointmentId,
          doorId: door.doorId,
          carrierCode,
          scheduledStart: startTime,
          scheduledEnd: endTime,
          status: 'BOOKED'
        };
        this.appointments.set(appointmentId, slot);
        return slot;
      }
    }

    throw new Error('All eligible dock doors are fully booked for the requested time window');
  }
}
