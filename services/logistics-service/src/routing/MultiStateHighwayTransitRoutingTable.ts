export interface IHighwayCorridorSegment {
  corridorId: string;
  originState: string;
  destinationState: string;
  interstateHighwayCode: string;
  distanceMiles: number;
  averageTransitHours: number;
  tollFeeUSD: number;
  dieselFuelConsumptionGallons: number;
  co2EmissionsKg: number;
  speedLimitMph: number;
  weightLimitGrossLbs: number;
}

export class MultiStateHighwayTransitRoutingTable {
  private readonly corridors = new Map<string, IHighwayCorridorSegment>();

  constructor() {
    this.seedCorridors();
  }

  private seedCorridors(): void {
    const states = ['CA', 'NV', 'AZ', 'UT', 'CO', 'NM', 'TX', 'OK', 'KS', 'MO', 'IL', 'IN', 'OH', 'PA', 'NY', 'NJ', 'GA', 'FL', 'NC', 'VA'];
    
    for (let i = 0; i < states.length - 1; i++) {
      const orig = states[i];
      const dest = states[i + 1];
      const corridorId = `CORRIDOR_${orig}_${dest}`;
      const distance = 250 + (i * 35);
      const hours = +(distance / 58).toFixed(1);
      const toll = (i % 3 === 0) ? +(distance * 0.12).toFixed(2) : 0;
      const fuel = +(distance / 6.5).toFixed(1);
      const co2 = +(fuel * 10.18).toFixed(1);

      this.corridors.set(corridorId, {
        corridorId,
        originState: orig,
        destinationState: dest,
        interstateHighwayCode: (i % 2 === 0) ? 'I-80' : 'I-40',
        distanceMiles: distance,
        averageTransitHours: hours,
        tollFeeUSD: toll,
        dieselFuelConsumptionGallons: fuel,
        co2EmissionsKg: co2,
        speedLimitMph: 65,
        weightLimitGrossLbs: 80000
      });
    }
  }

  public getCorridor(orig: string, dest: string): IHighwayCorridorSegment | null {
    const id = `CORRIDOR_${orig}_${dest}`;
    return this.corridors.get(id) || null;
  }

  public calculateRoute(routeStates: string[]): { totalDistanceMiles: number; totalHours: number; totalTollsUSD: number; totalCo2Kg: number } {
    let dist = 0, hrs = 0, tolls = 0, co2 = 0;

    for (let i = 0; i < routeStates.length - 1; i++) {
      const c = this.getCorridor(routeStates[i], routeStates[i + 1]);
      if (c) {
        dist += c.distanceMiles;
        hrs += c.averageTransitHours;
        tolls += c.tollFeeUSD;
        co2 += c.co2EmissionsKg;
      } else {
        dist += 300;
        hrs += 5.2;
        co2 += 450;
      }
    }

    return {
      totalDistanceMiles: dist,
      totalHours: +hrs.toFixed(1),
      totalTollsUSD: +tolls.toFixed(2),
      totalCo2Kg: +co2.toFixed(1)
    };
  }
}
