import crypto from 'crypto';

export class CryptoUtils {
  static generateRandomToken(bytes = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  static generateTrackingNumber(prefix = 'LGX'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}-${timestamp}-${randomSuffix}`;
  }

  static generateOrderNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `ORD-${dateStr}-${rand}`;
  }

  static generateInvoiceNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `INV-${dateStr}-${rand}`;
  }

  static hashSha256(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  static timingSafeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  }
}
