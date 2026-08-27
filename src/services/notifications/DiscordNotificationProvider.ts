import { BaseNotificationProvider } from './NotificationProvider';
import {
  NotificationProviderType,
  NotificationEventType,
  NotificationPayload,
  NotificationDispatchResult,
  IntegrationConfig
} from './types';

export class DiscordNotificationProvider extends BaseNotificationProvider {
  readonly providerType: NotificationProviderType = 'discord';
  readonly name = 'Discord Integration';

  async send(
    userId: string,
    eventType: NotificationEventType,
    payload: NotificationPayload,
    config?: IntegrationConfig
  ): Promise<NotificationDispatchResult> {
    const startTime = Date.now();
    const sanitized = this.sanitizePayloadForLevel(payload, config);
    const webhookUrl = config?.webhookUrl;

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          provider: 'discord',
          eventType,
          notificationId: `discord-${Date.now()}`,
          target: { webhookUrl },
          channelName: config?.channelName,
          payload: sanitized
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to dispatch Discord notification');
      }

      return {
        success: true,
        deliveryId: data.deliveryId || `discord-${Date.now()}`,
        provider: 'discord',
        eventType,
        status: data.status || 'DELIVERED',
        dispatchedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      console.error('[DiscordNotificationProvider] Send failure:', err);
      return {
        success: false,
        provider: 'discord',
        eventType,
        status: 'FAILED',
        dispatchedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
        error: err?.message || 'Discord delivery failed'
      };
    }
  }

  async sendTest(
    userId: string,
    targetInfo?: { email?: string; webhookUrl?: string },
    config?: IntegrationConfig
  ): Promise<NotificationDispatchResult> {
    const startTime = Date.now();
    const webhookUrl = targetInfo?.webhookUrl || config?.webhookUrl;

    if (!webhookUrl) {
      return {
        success: false,
        provider: 'discord',
        eventType: 'weekly_summary_ready',
        status: 'FAILED',
        dispatchedAt: new Date().toISOString(),
        error: 'Please provide a valid Discord Webhook URL.'
      };
    }

    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          provider: 'discord',
          target: { webhookUrl },
          channelName: config?.channelName || '#reflections'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Test Discord webhook dispatch failed');
      }

      return {
        success: true,
        deliveryId: data.deliveryId,
        provider: 'discord',
        eventType: 'weekly_summary_ready',
        status: 'DELIVERED',
        dispatchedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'discord',
        eventType: 'weekly_summary_ready',
        status: 'FAILED',
        dispatchedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
        error: err?.message || 'Failed to dispatch Discord test'
      };
    }
  }
}
