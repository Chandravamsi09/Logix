/**
 * Adaptive Sliding-Window Circuit Breaker & Fallback Engine
 * Implements Netflix Hystrix / Resilience4j state transitions (CLOSED -> OPEN -> HALF_OPEN).
 */

export interface ICircuitState {
  serviceName: string;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  successCount: number;
  lastStateChangeTimestamp: number;
  nextAttemptAllowedTimestamp: number;
}

export class AdaptiveCircuitBreakerEngine {
  private readonly circuits = new Map<string, ICircuitState>();
  private readonly failureThresholdPct = 50.0;
  private readonly minimumRequestsInWindow = 20;
  private readonly openDurationMs = 15000;

  public getCircuit(serviceName: string): ICircuitState {
    let c = this.circuits.get(serviceName);
    if (!c) {
      c = {
        serviceName,
        state: 'CLOSED',
        failureCount: 0,
        successCount: 0,
        lastStateChangeTimestamp: Date.now(),
        nextAttemptAllowedTimestamp: 0
      };
      this.circuits.set(serviceName, c);
    }
    return c;
  }

  public recordResult(serviceName: string, isSuccess: boolean): void {
    const c = this.getCircuit(serviceName);
    const now = Date.now();

    if (isSuccess) {
      c.successCount++;
      if (c.state === 'HALF_OPEN' && c.successCount >= 5) {
        c.state = 'CLOSED';
        c.failureCount = 0;
        c.successCount = 0;
        c.lastStateChangeTimestamp = now;
      }
    } else {
      c.failureCount++;
      const total = c.successCount + c.failureCount;
      if (total >= this.minimumRequestsInWindow) {
        const failurePct = (c.failureCount / total) * 100;
        if (failurePct >= this.failureThresholdPct) {
          c.state = 'OPEN';
          c.lastStateChangeTimestamp = now;
          c.nextAttemptAllowedTimestamp = now + this.openDurationMs;
        }
      }
    }
  }

  public allowRequest(serviceName: string): boolean {
    const c = this.getCircuit(serviceName);
    const now = Date.now();

    if (c.state === 'CLOSED') return true;
    if (c.state === 'OPEN') {
      if (now >= c.nextAttemptAllowedTimestamp) {
        c.state = 'HALF_OPEN';
        c.lastStateChangeTimestamp = now;
        c.successCount = 0;
        return true;
      }
      return false;
    }
    return true; // HALF_OPEN allows probe requests
  }
}
