import { Logger } from '@nexus/common';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private successCount = 0;

  constructor(
    public readonly serviceName: string,
    private readonly failureThreshold = 5,
    private readonly recoveryTimeoutMs = 30000,
    private readonly halfOpenSuccessThreshold = 3,
    private readonly logger = new Logger(`CircuitBreaker:${serviceName}`)
  ) {}

  public canPass(): boolean {
    const now = Date.now();
    if (this.state === CircuitState.OPEN) {
      if (now - this.lastFailureTime > this.recoveryTimeoutMs) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        this.logger.info(`Circuit transitioned to HALF_OPEN for service: ${this.serviceName}`);
        return true;
      }
      return false;
    }
    return true;
  }

  public recordSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount += 1;
      if (this.successCount >= this.halfOpenSuccessThreshold) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.logger.info(`Circuit fully restored to CLOSED for service: ${this.serviceName}`);
      }
    } else {
      this.failureCount = 0;
    }
  }

  public recordFailure(): void {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();
    if (this.state === CircuitState.HALF_OPEN || this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.logger.warn(`Circuit tripped to OPEN for service: ${this.serviceName}`, {
        failureCount: this.failureCount
      });
    }
  }

  public getState(): CircuitState {
    return this.state;
  }
}
