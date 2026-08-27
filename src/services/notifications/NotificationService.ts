import {
  NotificationProviderType,
  NotificationEventType,
  NotificationPayload,
  NotificationDispatchResult,
  IntegrationConfig,
  NotificationAuditLog
} from './types';
import { NotificationProvider } from './NotificationProvider';
import { InAppNotificationProvider } from './InAppNotificationProvider';
import { EmailNotificationProvider } from './EmailNotificationProvider';
import { SlackNotificationProvider } from './SlackNotificationProvider';
import { DiscordNotificationProvider } from './DiscordNotificationProvider';
import { db } from '../../firebase/config';
import { doc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

export class NotificationService {
  private static instance: NotificationService;
  private providers: Map<NotificationProviderType, NotificationProvider> = new Map();

  private constructor() {
    this.registerProvider(new InAppNotificationProvider());
    this.registerProvider(new EmailNotificationProvider());
    this.registerProvider(new SlackNotificationProvider());
    this.registerProvider(new DiscordNotificationProvider());
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public registerProvider(provider: NotificationProvider): void {
    this.providers.set(provider.providerType, provider);
  }

  public getProvider(type: NotificationProviderType): NotificationProvider | undefined {
    return this.providers.get(type);
  }

  /**
   * Dispatches a notification across all enabled and subscribed providers.
   * Journal creation / updates will NEVER fail even if notifications encounter issues.
   */
  public async dispatchNotification(
    userId: string,
    eventType: NotificationEventType,
    payload: NotificationPayload,
    integrations?: IntegrationConfig[]
  ): Promise<NotificationDispatchResult[]> {
    const results: NotificationDispatchResult[] = [];

    // Always dispatch in-app notification first
    const inAppProvider = this.providers.get('in_app');
    if (inAppProvider) {
      try {
        const inAppRes = await inAppProvider.send(userId, eventType, payload);
        results.push(inAppRes);
        this.logDeliveryResult(userId, inAppRes).catch(() => {});
      } catch (err: any) {
        console.warn('[NotificationService] In-App delivery warning:', err);
      }
    }

    // Retrieve integrations from Firestore if not supplied
    let userIntegrations = integrations;
    if (!userIntegrations && userId && db) {
      try {
        const intSnap = await getDocs(collection(db, 'users', userId, 'integrations'));
        userIntegrations = [];
        intSnap.forEach((docSnap) => {
          userIntegrations!.push(docSnap.data() as IntegrationConfig);
        });
      } catch (e) {
        console.warn('[NotificationService] Could not fetch integrations from Firestore:', e);
        userIntegrations = [];
      }
    }

    // Now dispatch to external connected providers
    for (const config of userIntegrations || []) {
      if (config.status !== 'connected') continue;

      const provider = this.providers.get(config.provider);
      if (!provider) continue;

      // Check event trigger
      if (!config.enabledEvents.includes(eventType)) continue;

      // If event is 'selected_tag_detected', verify matching tag
      if (eventType === 'selected_tag_detected') {
        const configuredTag = (config.triggerTag || '').toLowerCase().trim();
        const payloadTag = (payload.tag || '').toLowerCase().trim();
        if (configuredTag && payloadTag && !payloadTag.includes(configuredTag)) {
          continue;
        }
      }

      // Non-blocking dispatch
      try {
        const res = await provider.send(userId, eventType, payload, config);
        results.push(res);
        this.logDeliveryResult(userId, res).catch(() => {});
      } catch (dispatchErr: any) {
        const failedResult: NotificationDispatchResult = {
          success: false,
          provider: config.provider,
          eventType,
          status: 'FAILED',
          dispatchedAt: new Date().toISOString(),
          error: dispatchErr?.message || 'External dispatch failed'
        };
        results.push(failedResult);
        this.logDeliveryResult(userId, failedResult).catch(() => {});
      }
    }

    return results;
  }

  /**
   * Send a safe test notification with non-sensitive placeholder content.
   */
  public async sendTestNotification(
    userId: string,
    providerType: NotificationProviderType,
    targetInfo?: { email?: string; webhookUrl?: string },
    config?: IntegrationConfig
  ): Promise<NotificationDispatchResult> {
    const provider = this.providers.get(providerType);
    if (!provider) {
      return {
        success: false,
        provider: providerType,
        eventType: 'weekly_summary_ready',
        status: 'FAILED',
        dispatchedAt: new Date().toISOString(),
        error: `Provider ${providerType} is not registered.`
      };
    }

    const result = await provider.sendTest(userId, targetInfo, config);
    this.logDeliveryResult(userId, result).catch(() => {});
    return result;
  }

  /**
   * Persists delivery audit log to Firestore asynchronously without sensitive content.
   */
  private async logDeliveryResult(
    userId: string,
    result: NotificationDispatchResult
  ): Promise<void> {
    if (!userId || !db) return;
    try {
      const logId = `notif-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const logRef = doc(db, 'users', userId, 'notificationLogs', logId);
      
      const logData: NotificationAuditLog = {
        id: logId,
        userId,
        provider: result.provider,
        eventType: result.eventType,
        status: result.success ? 'SUCCESS' : 'FAILURE',
        createdAt: result.dispatchedAt,
        completedAt: new Date().toISOString(),
        errorCode: result.error ? result.status : undefined,
        errorMessage: result.error,
        latencyMs: result.latencyMs
      };

      await setDoc(logRef, logData);
    } catch (logErr) {
      console.warn('[NotificationService] Failed to write notification audit log:', logErr);
    }
  }
}

export const notificationService = NotificationService.getInstance();
