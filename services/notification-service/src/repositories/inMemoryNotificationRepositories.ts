import { NotificationEntity, NotificationTemplateEntity, WebhookSubscriptionEntity } from '../models/entities';
import { v4 as uuidv4 } from 'uuid';

export class NotificationRepository {
  private notifications: NotificationEntity[] = [];
  private templates = new Map<string, NotificationTemplateEntity>();
  private webhooks = new Map<string, WebhookSubscriptionEntity>();

  async createNotification(notif: Omit<NotificationEntity, 'id' | 'createdAt'>): Promise<NotificationEntity> {
    const entity: NotificationEntity = {
      ...notif,
      id: uuidv4(),
      createdAt: new Date()
    };
    this.notifications.push(entity);
    return entity;
  }

  async listByUser(userId: string, limit = 50): Promise<NotificationEntity[]> {
    return this.notifications.filter(n => n.recipientId === userId).slice(-limit);
  }

  async markAsRead(id: string): Promise<boolean> {
    const n = this.notifications.find(item => item.id === id);
    if (n) {
      n.isRead = true;
      return true;
    }
    return false;
  }

  async createWebhook(hook: Omit<WebhookSubscriptionEntity, 'id' | 'createdAt'>): Promise<WebhookSubscriptionEntity> {
    const entity: WebhookSubscriptionEntity = {
      ...hook,
      id: uuidv4(),
      createdAt: new Date()
    };
    this.webhooks.set(entity.id, entity);
    return entity;
  }

  async listWebhooks(tenantId: string): Promise<WebhookSubscriptionEntity[]> {
    return Array.from(this.webhooks.values()).filter(w => w.tenantId === tenantId);
  }
}
