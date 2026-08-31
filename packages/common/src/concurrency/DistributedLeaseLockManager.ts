/**
 * Distributed Lease Lock Manager with Fencing Tokens
 * Guarantees mutually exclusive execution for critical distributed transaction orchestrations.
 */

export interface ILeaseLock {
  resourceKey: string;
  ownerId: string;
  fencingToken: number;
  grantedAt: Date;
  expiresAt: Date;
}

export class DistributedLeaseLockManager {
  private readonly locks = new Map<string, ILeaseLock>();
  private globalFencingSequence = 1000;

  public acquireLease(resourceKey: string, ownerId: string, durationMs: number = 5000): { isAcquired: boolean; lock?: ILeaseLock } {
    const now = new Date();
    const existing = this.locks.get(resourceKey);

    if (existing && existing.expiresAt > now && existing.ownerId !== ownerId) {
      return { isAcquired: false };
    }

    this.globalFencingSequence++;
    const lock: ILeaseLock = {
      resourceKey,
      ownerId,
      fencingToken: this.globalFencingSequence,
      grantedAt: now,
      expiresAt: new Date(now.getTime() + durationMs)
    };

    this.locks.set(resourceKey, lock);
    return { isAcquired: true, lock };
  }

  public releaseLease(resourceKey: string, ownerId: string): boolean {
    const existing = this.locks.get(resourceKey);
    if (!existing || existing.ownerId !== ownerId) return false;
    this.locks.delete(resourceKey);
    return true;
  }
}
