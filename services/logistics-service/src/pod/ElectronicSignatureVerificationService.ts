/**
 * Electronic Proof of Delivery (ePOD) Signature and Photographic Geotag Verification
 */

export interface IPodSubmission {
  trackingNumber: string;
  recipientName: string;
  signatureBase64Png: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  deliveryTimestamp: Date;
  photoUrl?: string;
  deviceImei: string;
}

export class ElectronicSignatureVerificationService {
  private readonly pods = new Map<string, IPodSubmission>();

  public verifyAndStorePod(pod: IPodSubmission, expectedCoords: { lat: number; lon: number }): { isVerified: boolean; distanceDeviationMeters: number } {
    if (!pod.recipientName || !pod.signatureBase64Png) {
      throw new Error('Signature and recipient name are required for ePOD');
    }

    // Compute distance deviation from expected drop-off point
    const R = 6371000; // Meters
    const dLat = (expectedCoords.lat - pod.deliveryLatitude) * Math.PI / 180;
    const dLon = (expectedCoords.lon - pod.deliveryLongitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(pod.deliveryLatitude * Math.PI / 180) * Math.cos(expectedCoords.lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceDeviationMeters = Math.round(R * c);

    const isVerified = distanceDeviationMeters <= 500; // Allow 500m geofence buffer
    this.pods.set(pod.trackingNumber, { ...pod });

    return {
      isVerified,
      distanceDeviationMeters
    };
  }

  public getPod(trackingNumber: string): IPodSubmission | null {
    return this.pods.get(trackingNumber) || null;
  }
}
