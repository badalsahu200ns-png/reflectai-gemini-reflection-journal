import { BaseNotificationProvider } from './NotificationProvider';
import {
  NotificationProviderType,
  NotificationEventType,
  NotificationPayload,
  NotificationDispatchResult,
  IntegrationConfig
} from './types';
import { db } from '../../firebase/config';
import { collection, doc, setDoc } from 'firebase/firestore';

export class InAppNotificationProvider extends BaseNotificationProvider {
  readonly providerType: NotificationProviderType = 'in_app';
  readonly name = 'In-App Notifications';

  override isEnabled(_config?: IntegrationConfig): boolean {
    return true; // Always enabled by default
  }

  override supportsEvent(_eventType: NotificationEventType, _config?: IntegrationConfig): boolean {
    return true; // Supports all events
  }

  async send(
    userId: string,
    eventType: NotificationEventType,
    payload: NotificationPayload,
    config?: IntegrationConfig
  ): Promise<NotificationDispatchResult> {
    const startTime = Date.now();
    const sanitized = this.sanitizePayloadForLevel(payload, config);
    const notificationId = `in-app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      if (userId && db) {
        const notifDocRef = doc(db, 'users', userId, 'notifications', notificationId);
        await setDoc(notifDocRef, {
          id: notificationId,
          title: sanitized.title,
          message: sanitized.summary || sanitized.title,
          type: eventType.toUpperCase(),
          timestamp: sanitized.timestamp || new Date().toISOString(),
          isRead: false,
          actionTab: 'journal',
          deepLink: sanitized.deepLink
        });
      }

      return {
        success: true,
        deliveryId: notificationId,
        provider: 'in_app',
        eventType,
        status: 'DELIVERED',
        dispatchedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      console.warn('[InAppNotificationProvider] Error persisting in-app notification:', err);
      return {
        success: true, // Non-blocking
        deliveryId: notificationId,
        provider: 'in_app',
        eventType,
        status: 'SIMULATED',
        dispatchedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime
      };
    }
  }

  async sendTest(
    userId: string,
    _targetInfo?: { email?: string; webhookUrl?: string },
    _config?: IntegrationConfig
  ): Promise<NotificationDispatchResult> {
    return this.send(
      userId,
      'weekly_summary_ready',
      {
        title: '🔔 ReflectAI Notification Test',
        summary: 'Your in-app notification channel is active and functioning smoothly.',
        timestamp: new Date().toISOString()
      }
    );
  }
}
