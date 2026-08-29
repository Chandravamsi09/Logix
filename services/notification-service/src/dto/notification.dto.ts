import { z } from 'zod';
import { NotificationChannel, NotificationPriority } from '@nexus/common';

export const SendNotificationSchema = z.object({
  tenantId: z.string().uuid(),
  recipientId: z.string().uuid(),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional(),
  channel: z.nativeEnum(NotificationChannel).default(NotificationChannel.IN_APP),
  priority: z.nativeEnum(NotificationPriority).default(NotificationPriority.NORMAL),
  subject: z.string().min(1).max(200),
  body: z.string().min(1),
  metadata: z.record(z.any()).optional()
});

export type SendNotificationDTO = z.infer<typeof SendNotificationSchema>;

export const CreateWebhookSchema = z.object({
  tenantId: z.string().uuid(),
  targetUrl: z.string().url(),
  subscribedEvents: z.array(z.string()).min(1)
});

export type CreateWebhookDTO = z.infer<typeof CreateWebhookSchema>;
