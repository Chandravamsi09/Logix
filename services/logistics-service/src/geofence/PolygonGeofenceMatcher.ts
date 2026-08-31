/**
 * Ray-Casting Polygon Geofence Inclusion Engine
 * Detects freight vehicle entry/exit events across delivery zones and terminal perimeters.
 */

export interface IGeofencePolygon {
  zoneId: string;
  zoneName: string;
  vertices: Array<{ lat: number; lon: number }>;
}

export class PolygonGeofenceMatcher {
  public isPointInsidePolygon(point: { lat: number; lon: number }, polygon: IGeofencePolygon): boolean {
    const { lat, lon } = point;
    const vs = polygon.vertices;
    let inside = false;

    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i].lon, yi = vs[i].lat;
      const xj = vs[j].lon, yj = vs[j].lat;

      const intersect = ((yi > lat) !== (yj > lat)) &&
        (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  }
}
