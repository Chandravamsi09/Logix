import { NotificationChannel, NotificationPriority } from '@nexus/common';

export interface NotificationTemplateEntity {
  id: string;
  templateCode: string;
  name: string;
  channel: NotificationChannel;
  subjectTemplate: string;
  bodyTemplate: string;
  isActive: boolean;
  createdAt: Date;
}

export interface NotificationEntity {
  id: string;
  tenantId: string;
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  subject: string;
  body: string;
  isRead: boolean;
  deliveredAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface WebhookSubscriptionEntity {
  id: string;
  tenantId: string;
  targetUrl: string;
  secretKey: string;
  subscribedEvents: string[];
  isActive: boolean;
  createdAt: Date;
}
