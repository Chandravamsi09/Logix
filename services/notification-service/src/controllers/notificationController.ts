import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService';
import { ValidationUtils } from '@nexus/common';
import { SendNotificationSchema, CreateWebhookSchema } from '../dto/notification.dto';

export class NotificationController {
  constructor(private readonly notifService: NotificationService) {}

  send = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || req.body.tenantId;
      const validated = ValidationUtils.validate(SendNotificationSchema, { ...req.body, tenantId });
      const notif = await this.notifService.sendNotification(validated);
      res.status(201).json({ success: true, data: notif });
    } catch (err) {
      next(err);
    }
  };

  listMyNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
      const notifications = await this.notifService.listUserNotifications(userId);
      res.status(200).json({ success: true, data: notifications });
    } catch (err) {
      next(err);
    }
  };

  markRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const success = await this.notifService.markAsRead(req.params.id);
      res.status(200).json({ success });
    } catch (err) {
      next(err);
    }
  };

  createWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || req.body.tenantId;
      const validated = ValidationUtils.validate(CreateWebhookSchema, { ...req.body, tenantId });
      const webhook = await this.notifService.createWebhook(validated);
      res.status(201).json({ success: true, data: webhook });
    } catch (err) {
      next(err);
    }
  };

  listWebhooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req.headers['x-tenant-id'] as string) || (req.query.tenantId as string);
      const webhooks = await this.notifService.listWebhooks(tenantId);
      res.status(200).json({ success: true, data: webhooks });
    } catch (err) {
      next(err);
    }
  };
}
