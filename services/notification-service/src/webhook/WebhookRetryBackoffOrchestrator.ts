/**
 * Webhook Outbound Delivery & Exponential Jitter Backoff Orchestrator
 */

export interface IWebhookDeliveryAttempt {
  attemptNumber: number;
  scheduledAt: Date;
  responseStatus?: number;
  responseBodySnippet?: string;
  isSuccess: boolean;
}

export class WebhookRetryBackoffOrchestrator {
  public calculateNextRetry(attemptNumber: number): { nextAttemptDate: Date; delaySeconds: number } {
    // Exponential backoff: base 2^attempt * 5s + jitter
    const baseDelay = Math.min(3600, Math.pow(2, attemptNumber) * 5);
    const jitter = Math.floor(Math.random() * 5);
    const totalDelaySeconds = baseDelay + jitter;

    const nextAttemptDate = new Date(Date.now() + (totalDelaySeconds * 1000));
    return {
      nextAttemptDate,
      delaySeconds: totalDelaySeconds
    };
  }
}
