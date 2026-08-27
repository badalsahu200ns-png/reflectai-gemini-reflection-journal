import { BaseNotificationProvider } from './NotificationProvider';
import {
  NotificationProviderType,
  NotificationEventType,
  NotificationPayload,
  NotificationDispatchResult,
  IntegrationConfig
} from './types';

export class SlackNotificationProvider extends BaseNotificationProvider {
  readonly providerType: NotificationProviderType = 'slack';
  readonly name = 'Slack Integration';

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
          provider: 'slack',
          eventType,
          notificationId: `slack-${Date.now()}`,
          target: { webhookUrl },
          workspaceName: config?.workspaceName,
          channelName: config?.channelName,
          payload: sanitized
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to dispatch Slack notification');
      }

      return {
        success: true,
        deliveryId: data.deliveryId || `slack-${Date.now()}`,
        provider: 'slack',
        eventType,
        status: data.status || 'DELIVERED',
        dispatchedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      console.error('[SlackNotificationProvider] Send failure:', err);
      return {
        success: false,
        provider: 'slack',
        eventType,
        status: 'FAILED',
        dispatchedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
        error: err?.message || 'Slack delivery failed'
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
        provider: 'slack',
        eventType: 'weekly_summary_ready',
        status: 'FAILED',
        dispatchedAt: new Date().toISOString(),
        error: 'Please provide a valid Slack Incoming Webhook URL.'
      };
    }

    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          provider: 'slack',
          target: { webhookUrl },
          workspaceName: config?.workspaceName || 'Slack Workspace',
          channelName: config?.channelName || '#general'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Test Slack message dispatch failed');
      }

      return {
        success: true,
        deliveryId: data.deliveryId,
        provider: 'slack',
        eventType: 'weekly_summary_ready',
        status: 'DELIVERED',
        dispatchedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'slack',
        eventType: 'weekly_summary_ready',
        status: 'FAILED',
        dispatchedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
        error: err?.message || 'Failed to dispatch Slack test'
      };
    }
  }
}
