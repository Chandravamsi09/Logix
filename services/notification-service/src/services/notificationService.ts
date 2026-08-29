import { NotificationRepository } from '../repositories/inMemoryNotificationRepositories';
import { SendNotificationDTO, CreateWebhookDTO } from '../dto/notification.dto';
import { CryptoUtils, Logger } from '@nexus/common';

export class NotificationService {
  private readonly logger = new Logger('NotificationService');

  constructor(private readonly notifRepo: NotificationRepository) {}

  async sendNotification(dto: SendNotificationDTO) {
    const notification = await this.notifRepo.createNotification({
      tenantId: dto.tenantId,
      recipientId: dto.recipientId,
      recipientEmail: dto.recipientEmail,
      recipientPhone: dto.recipientPhone,
      channel: dto.channel,
      priority: dto.priority,
      subject: dto.subject,
      body: dto.body,
      isRead: false,
      deliveredAt: new Date(),
      metadata: dto.metadata
    });

    this.logger.info(`Notification ${notification.id} delivered to ${dto.recipientId} via ${dto.channel}`);
    return notification;
  }

  async createWebhook(dto: CreateWebhookDTO) {
    const secretKey = CryptoUtils.generateRandomToken(32);
    return this.notifRepo.createWebhook({
      tenantId: dto.tenantId,
      targetUrl: dto.targetUrl,
      secretKey,
      subscribedEvents: dto.subscribedEvents,
      isActive: true
    });
  }

  async listUserNotifications(userId: string) {
    return this.notifRepo.listByUser(userId);
  }

  async markAsRead(notificationId: string) {
    return this.notifRepo.markAsRead(notificationId);
  }

  async listWebhooks(tenantId: string) {
    return this.notifRepo.listWebhooks(tenantId);
  }
}
