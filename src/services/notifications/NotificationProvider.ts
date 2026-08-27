import {
  NotificationProviderType,
  NotificationEventType,
  NotificationPayload,
  NotificationDispatchResult,
  IntegrationConfig
} from './types';

export interface NotificationProvider {
  readonly providerType: NotificationProviderType;
  readonly name: string;

  /**
   * Check if this provider is currently connected / enabled for the given user configuration.
   */
  isEnabled(config?: IntegrationConfig): boolean;

  /**
   * Check if a specific event type is allowed by user preference for this provider.
   */
  supportsEvent(eventType: NotificationEventType, config?: IntegrationConfig): boolean;

  /**
   * Dispatch a notification through this provider.
   */
  send(
    userId: string,
    eventType: NotificationEventType,
    payload: NotificationPayload,
    config?: IntegrationConfig
  ): Promise<NotificationDispatchResult>;

  /**
   * Send a safe test notification with non-sensitive placeholder content.
   */
  sendTest(
    userId: string,
    targetInfo?: { email?: string; webhookUrl?: string },
    config?: IntegrationConfig
  ): Promise<NotificationDispatchResult>;
}

export abstract class BaseNotificationProvider implements NotificationProvider {
  abstract readonly providerType: NotificationProviderType;
  abstract readonly name: string;

  isEnabled(config?: IntegrationConfig): boolean {
    if (!config) return false;
    return config.status === 'connected';
  }

  supportsEvent(eventType: NotificationEventType, config?: IntegrationConfig): boolean {
    if (!config || !this.isEnabled(config)) return false;
    return Array.isArray(config.enabledEvents) && config.enabledEvents.includes(eventType);
  }

  abstract send(
    userId: string,
    eventType: NotificationEventType,
    payload: NotificationPayload,
    config?: IntegrationConfig
  ): Promise<NotificationDispatchResult>;

  abstract sendTest(
    userId: string,
    targetInfo?: { email?: string; webhookUrl?: string },
    config?: IntegrationConfig
  ): Promise<NotificationDispatchResult>;

  /**
   * Sanitizes payload according to the user-selected privacy level.
   */
  protected sanitizePayloadForLevel(
    payload: NotificationPayload,
    config?: IntegrationConfig
  ): NotificationPayload {
    const level = config?.payloadLevel || 'minimal';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://reflectai.app';
    const deepLink = payload.deepLink || `${baseUrl}/#journal`;

    if (level === 'minimal') {
      // Title + event metadata + deep link only
      return {
        title: payload.title,
        deepLink,
        category: payload.category,
        tag: payload.tag,
        timestamp: payload.timestamp || new Date().toISOString()
      };
    }

    if (level === 'summary') {
      // Title + short AI summary + deep link
      return {
        title: payload.title,
        summary: payload.summary || 'Summary available in your private ReflectAI sanctuary.',
        deepLink,
        category: payload.category,
        tag: payload.tag,
        stats: payload.stats,
        timestamp: payload.timestamp || new Date().toISOString()
      };
    }

    // 'detailed' level (only if explicitly enabled with user consent)
    return {
      ...payload,
      deepLink,
      timestamp: payload.timestamp || new Date().toISOString()
    };
  }
}
