export type NotificationProviderType = 'in_app' | 'email' | 'slack' | 'discord';

export type NotificationEventType =
  | 'weekly_summary_ready'
  | 'monthly_summary_ready'
  | 'journal_goal_completed'
  | 'selected_tag_detected'
  | 'insight_generated';

export type NotificationPayloadLevel = 'minimal' | 'summary' | 'detailed';

export interface NotificationPayload {
  title: string;
  summary?: string;
  deepLink?: string;
  category?: string;
  tag?: string;
  timestamp?: string;
  detailedExcerpt?: string;
  stats?: {
    entryCount?: number;
    streakDays?: number;
    dominantMood?: string;
    sentimentScore?: number;
  };
}

export interface NotificationEvent {
  id: string;
  provider: NotificationProviderType;
  eventType: NotificationEventType;
  userId: string;
  notificationId: string;
  payload: NotificationPayload;
  createdAt: string;
}

export interface NotificationDispatchResult {
  success: boolean;
  deliveryId?: string;
  provider: NotificationProviderType;
  eventType: NotificationEventType;
  status: 'DELIVERED' | 'SIMULATED' | 'FAILED' | 'RATE_LIMITED';
  dispatchedAt: string;
  latencyMs?: number;
  error?: string;
}

export interface IntegrationConfig {
  id: string;
  userId: string;
  provider: 'email' | 'slack' | 'discord';
  status: 'connected' | 'disconnected' | 'pending';
  connectedAt?: string;
  lastUsedAt?: string;
  workspaceName?: string;
  channelName?: string;
  emailAddress?: string;
  webhookUrlSnippet?: string;
  webhookUrl?: string; // Client-side configuration during setup, never stored in public docs
  payloadLevel: NotificationPayloadLevel;
  enabledEvents: NotificationEventType[];
  triggerTag?: string;
}

export interface NotificationAuditLog {
  id: string;
  userId: string;
  provider: NotificationProviderType;
  eventType: NotificationEventType;
  status: 'SUCCESS' | 'FAILURE' | 'RATE_LIMITED' | 'RETRYING';
  createdAt: string;
  completedAt?: string;
  errorCode?: string;
  errorMessage?: string;
  latencyMs?: number;
}
