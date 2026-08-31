/**
 * Omnichannel Alert & Notification Routing Engine
 * Dynamically resolves recipient contact channel (Push -> SMS -> Email -> Webhook) based on alert priority and delivery receipts.
 */

export interface INotificationPayload {
  notificationId: string;
  recipientUserId: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  title: string;
  body: string;
  metadata: Record<string, any>;
}

export class OmnichannelRoutingStrategy {
  public determinePrimaryChannel(payload: INotificationPayload): 'WEBSOCKET' | 'PUSH' | 'SMS' | 'EMAIL' {
    if (payload.priority === 'CRITICAL') {
      return 'SMS';
    }
    if (payload.priority === 'HIGH') {
      return 'PUSH';
    }
    if (payload.priority === 'NORMAL') {
      return 'WEBSOCKET';
    }
    return 'EMAIL';
  }
}
