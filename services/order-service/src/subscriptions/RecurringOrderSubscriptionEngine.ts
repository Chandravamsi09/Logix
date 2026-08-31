/**
 * Recurring Replenishment Subscription Management Engine
 * Handles automated recurring replenishment schedules, billing cycles, and out-of-stock substitutions.
 */

export interface ISubscriptionSchedule {
  subscriptionId: string;
  customerId: string;
  tenantId: string;
  frequency: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  nextBillingDate: Date;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  items: Array<{ sku: string; quantity: number; unitPriceUSD: number }>;
  shippingAddressId: string;
  paymentMethodId: string;
}

export class RecurringOrderSubscriptionEngine {
  private readonly subscriptions = new Map<string, ISubscriptionSchedule>();

  public createSubscription(schedule: Omit<ISubscriptionSchedule, 'subscriptionId' | 'status'>): ISubscriptionSchedule {
    const subscriptionId = 'SUB-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
    const sub: ISubscriptionSchedule = {
      ...schedule,
      subscriptionId,
      status: 'ACTIVE'
    };

    this.subscriptions.set(subscriptionId, sub);
    return sub;
  }

  public calculateNextExecutionDate(currentDate: Date, frequency: ISubscriptionSchedule['frequency']): Date {
    const next = new Date(currentDate);
    if (frequency === 'WEEKLY') {
      next.setDate(next.getDate() + 7);
    } else if (frequency === 'BI_WEEKLY') {
      next.setDate(next.getDate() + 14);
    } else if (frequency === 'MONTHLY') {
      next.setMonth(next.getMonth() + 1);
    } else if (frequency === 'QUARTERLY') {
      next.setMonth(next.getMonth() + 3);
    }
    return next;
  }

  public getDueSubscriptions(now: Date = new Date()): ISubscriptionSchedule[] {
    return Array.from(this.subscriptions.values()).filter(s => s.status === 'ACTIVE' && s.nextBillingDate <= now);
  }
}
