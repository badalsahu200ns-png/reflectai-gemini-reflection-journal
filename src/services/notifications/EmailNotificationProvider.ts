import { BaseNotificationProvider } from './NotificationProvider';
import {
  NotificationProviderType,
  NotificationEventType,
  NotificationPayload,
  NotificationDispatchResult,
  IntegrationConfig
} from './types';

export class EmailNotificationProvider extends BaseNotificationProvider {
  readonly providerType: NotificationProviderType = 'email';
  readonly name = 'Email Notification Service';

  async send(
    userId: string,
    eventType: NotificationEventType,
    payload: NotificationPayload,
    config?: IntegrationConfig
  ): Promise<NotificationDispatchResult> {
    const startTime = Date.now();
    const sanitized = this.sanitizePayloadForLevel(payload, config);
    const emailTarget = config?.emailAddress;

    if (!emailTarget) {
      return {
        success: false,
        provider: 'email',
        eventType,
        status: 'FAILED',
        dispatchedAt: new Date().toISOString(),
        error: 'No recipient email configured for Email provider.'
      };
    }

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          provider: 'email',
          eventType,
          notificationId: `notif-${Date.now()}`,
          target: { email: emailTarget },
          payload: sanitized
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to dispatch email notification');
      }

      return {
        success: true,
        deliveryId: data.deliveryId || `email-${Date.now()}`,
        provider: 'email',
        eventType,
        status: data.status || 'DELIVERED',
        dispatchedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      console.error('[EmailNotificationProvider] Send failure:', err);
      return {
        success: false,
        provider: 'email',
        eventType,
        status: 'FAILED',
        dispatchedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
        error: err?.message || 'Email delivery failed'
      };
    }
  }

  async sendTest(
    userId: string,
    targetInfo?: { email?: string; webhookUrl?: string },
    _config?: IntegrationConfig
  ): Promise<NotificationDispatchResult> {
    const startTime = Date.now();
    const email = targetInfo?.email || _config?.emailAddress;

    if (!email) {
      return {
        success: false,
        provider: 'email',
        eventType: 'weekly_summary_ready',
        status: 'FAILED',
        dispatchedAt: new Date().toISOString(),
        error: 'Please provide a valid recipient email address.'
      };
    }

    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          provider: 'email',
          target: { email }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Test email dispatch failed');
      }

      return {
        success: true,
        deliveryId: data.deliveryId,
        provider: 'email',
        eventType: 'weekly_summary_ready',
        status: 'DELIVERED',
        dispatchedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'email',
        eventType: 'weekly_summary_ready',
        status: 'FAILED',
        dispatchedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
        error: err?.message || 'Failed to dispatch test email'
      };
    }
  }
}
