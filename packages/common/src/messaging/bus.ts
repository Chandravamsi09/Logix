import { CloudEventEnvelope } from '../contracts/events';
import { Logger } from '../utils/logger';

export type EventHandler<T = any> = (event: CloudEventEnvelope<T>) => Promise<void>;

export interface IEventBus {
  publish<T>(event: CloudEventEnvelope<T>): Promise<void>;
  subscribe<T>(eventType: string, handler: EventHandler<T>): Promise<void>;
  unsubscribe(eventType: string, handler: EventHandler): Promise<void>;
}

export class InMemoryEventBus implements IEventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>();
  private readonly logger = new Logger('InMemoryEventBus');

  async publish<T>(event: CloudEventEnvelope<T>): Promise<void> {
    this.logger.debug(`Publishing event: ${event.type}`, { eventId: event.id, correlationId: event.correlationId });
    const listeners = this.handlers.get(event.type);
    if (!listeners || listeners.size === 0) {
      return;
    }

    const promises = Array.from(listeners).map(async handler => {
      try {
        await handler(event);
      } catch (err) {
        this.logger.error(`Handler failed for event ${event.type}`, err, { eventId: event.id });
      }
    });

    await Promise.all(promises);
  }

  async subscribe<T>(eventType: string, handler: EventHandler<T>): Promise<void> {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler as EventHandler);
    this.logger.debug(`Subscribed handler to event: ${eventType}`);
  }

  async unsubscribe(eventType: string, handler: EventHandler): Promise<void> {
    const listeners = this.handlers.get(eventType);
    if (listeners) {
      listeners.delete(handler);
    }
  }
}
