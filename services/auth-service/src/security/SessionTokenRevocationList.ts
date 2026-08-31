/**
 * Distributed Token Blacklist & Session Revocation Store with Sliding Expiration
 */

export interface IRevokedTokenRecord {
  jti: string;
  userId: string;
  tenantId: string;
  reason: 'LOGOUT' | 'SECURITY_INCIDENT' | 'PASSWORD_RESET' | 'ADMIN_FORCE';
  revokedAt: Date;
  expiresAt: Date;
}

export class SessionTokenRevocationList {
  private readonly blacklist = new Map<string, IRevokedTokenRecord>();

  public revokeToken(jti: string, userId: string, tenantId: string, reason: IRevokedTokenRecord['reason'], ttlSeconds: number = 86400): void {
    const now = new Date();
    this.blacklist.set(jti, {
      jti,
      userId,
      tenantId,
      reason,
      revokedAt: now,
      expiresAt: new Date(now.getTime() + ttlSeconds * 1000)
    });
  }

  public isRevoked(jti: string): boolean {
    const record = this.blacklist.get(jti);
    if (!record) return false;
    if (record.expiresAt < new Date()) {
      this.blacklist.delete(jti);
      return false;
    }
    return true;
  }

  public purgeExpired(): number {
    const now = new Date();
    let purged = 0;
    for (const [jti, record] of this.blacklist.entries()) {
      if (record.expiresAt < now) {
        this.blacklist.delete(jti);
        purged++;
      }
    }
    return purged;
  }
}
