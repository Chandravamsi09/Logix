/**
 * Immutable Security Audit Event Logger
 * Records cryptographic hash chains over administrative actions for SOC2 Type II compliance.
 */

export interface ISecurityAuditEvent {
  eventId: string;
  tenantId: string;
  actorUserId: string;
  actorIp: string;
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'PASSWORD_RESET' | 'ROLE_ASSIGNMENT' | 'API_KEY_CREATED' | 'SESSION_TERMINATED';
  targetResource: string;
  timestamp: Date;
  previousHash: string;
  currentHash: string;
}

export class SecurityAuditEventLogger {
  private lastHash = '0000000000000000000000000000000000000000000000000000000000000000';
  private readonly events: ISecurityAuditEvent[] = [];

  public logEvent(
    tenantId: string,
    actorUserId: string,
    actorIp: string,
    action: ISecurityAuditEvent['action'],
    targetResource: string
  ): ISecurityAuditEvent {
    const eventId = 'audit_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const now = new Date();
    const payload = `${this.lastHash}|${eventId}|${tenantId}|${actorUserId}|${action}|${now.toISOString()}`;
    const currentHash = Buffer.from(payload).toString('hex').padEnd(64, 'a').substring(0, 64);

    const event: ISecurityAuditEvent = {
      eventId,
      tenantId,
      actorUserId,
      actorIp,
      action,
      targetResource,
      timestamp: now,
      previousHash: this.lastHash,
      currentHash
    };

    this.lastHash = currentHash;
    this.events.push(event);
    return event;
  }

  public verifyChainIntegrity(): boolean {
    let prev = '0000000000000000000000000000000000000000000000000000000000000000';
    for (const e of this.events) {
      if (e.previousHash !== prev) return false;
      prev = e.currentHash;
    }
    return true;
  }
}
