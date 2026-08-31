/**
 * Event-Driven Architecture Outbox & Domain Event Handler: inventory-service
 * Bin replenishment, SKU allocations and scrap events
 */

export interface IInventoryStockMovementEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  tenantId: string;
  schemaVersion: number;
  occurredAt: Date;
  payload: Record<string, any>;
  correlationId: string;
  causationId?: string;
}

export interface IOutboxMessage {
  messageId: string;
  destinationTopic: string;
  partitionKey: string;
  eventPayload: IInventoryStockMovementEvent;
  status: 'PENDING' | 'PUBLISHED' | 'DEAD_LETTER';
  retryCount: number;
  lastAttemptAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

export class InventoryStockMovementEventOutboxHandler {
  private readonly outboxQueue: IOutboxMessage[] = [];
  private readonly subscribers = new Map<string, Array<(event: IInventoryStockMovementEvent) => Promise<void>>>();

  public queueEvent(topic: string, event: IInventoryStockMovementEvent): IOutboxMessage {
    const message: IOutboxMessage = {
      messageId: 'msg_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      destinationTopic: topic,
      partitionKey: event.tenantId,
      eventPayload: event,
      status: 'PENDING',
      retryCount: 0,
      createdAt: new Date()
    };

    this.outboxQueue.push(message);
    return message;
  }

  public subscribe(eventType: string, handler: (event: IInventoryStockMovementEvent) => Promise<void>): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(handler);
  }

  public async flushOutbox(batchSize = 50): Promise<{ processedCount: number; failureCount: number }> {
    const pending = this.outboxQueue.filter(m => m.status === 'PENDING').slice(0, batchSize);
    let processedCount = 0;
    let failureCount = 0;

    for (const msg of pending) {
      try {
        const handlers = this.subscribers.get(msg.eventPayload.eventType) || [];
        for (const h of handlers) {
          await h(msg.eventPayload);
        }
        msg.status = 'PUBLISHED';
        msg.lastAttemptAt = new Date();
        processedCount++;
      } catch (err: any) {
        msg.retryCount++;
        msg.lastAttemptAt = new Date();
        msg.errorMessage = err.message || 'Error executing event subscriber';
        if (msg.retryCount >= 5) {
          msg.status = 'DEAD_LETTER';
        }
        failureCount++;
      }
    }

    return { processedCount, failureCount };
  }

  public getPendingCount(): number {
    return this.outboxQueue.filter(m => m.status === 'PENDING').length;
  }

  public getDeadLetterMessages(): IOutboxMessage[] {
    return this.outboxQueue.filter(m => m.status === 'DEAD_LETTER');
  }
}
