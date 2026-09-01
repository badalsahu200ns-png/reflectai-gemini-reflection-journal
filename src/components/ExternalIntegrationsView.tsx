import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  MessageSquare,
  Bell,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Send,
  Loader2,
  Lock,
  Trash2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Flame,
  Check,
  X,
  Info,
  Layers,
  Sliders,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  IntegrationConfig,
  NotificationEventType,
  NotificationPayloadLevel,
  NotificationAuditLog
} from '../services/notifications/types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationService } from '../services/notifications/NotificationService';
import { db } from '../firebase/config';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

interface ExternalIntegrationsViewProps {
  onClose?: () => void;
  isModal?: boolean;
}

const EVENT_OPTIONS: { id: NotificationEventType; label: string; description: string; icon: any }[] = [
  {
    id: 'weekly_summary_ready',
    label: 'Weekly AI Digest Ready',
    description: 'Triggered when your weekly synthesized reflection is compiled by Gemini.',
    icon: Sparkles
  },
  {
    id: 'monthly_summary_ready',
    label: 'Monthly Growth Synthesis',
    description: 'Triggered at the end of each month when long-term intentions are reviewed.',
    icon: Layers
  },
  {
    id: 'journal_goal_completed',
    label: 'Goal & Streak Milestone',
    description: 'Triggered when completing reflection streaks (3, 7, 30 days) or mindful targets.',
    icon: Flame
  },
  {
    id: 'selected_tag_detected',
    label: 'Selected Tag Trigger',
    description: 'Triggered only when saving entries containing a custom tag (e.g. #goal, #breakthrough).',
    icon: Sliders
  },
  {
    id: 'insight_generated',
    label: 'Recurring Pattern Identified',
    description: 'Triggered when ReflectAI identifies a notable behavioral or emotional pattern.',
    icon: Bell
  }
];

export const ExternalIntegrationsView: React.FC<ExternalIntegrationsViewProps> = ({
  onClose,
  isModal = false
}) => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Integrations state for Email, Slack, Discord
  const [integrations, setIntegrations] = useState<{
    email: IntegrationConfig;
    slack: IntegrationConfig;
    discord: IntegrationConfig;
  }>(() => {
    // Defaults with privacy-first minimal payload
    return {
      email: {
        id: 'email-integration',
        userId: user?.uid || 'anon',
        provider: 'email',
        status: 'connected',
        emailAddress: user?.email || '',
        payloadLevel: 'minimal',
        enabledEvents: ['weekly_summary_ready', 'monthly_summary_ready']
      },
      slack: {
        id: 'slack-integration',
        userId: user?.uid || 'anon',
        provider: 'slack',
        status: 'disconnected',
        workspaceName: '',
        channelName: '#reflections',
        webhookUrl: '',
        payloadLevel: 'minimal',
        enabledEvents: ['weekly_summary_ready', 'journal_goal_completed'],
        triggerTag: 'milestone'
      },
      discord: {
        id: 'discord-integration',
        userId: user?.uid || 'anon',
        provider: 'discord',
        status: 'disconnected',
        channelName: '#reflections',
        webhookUrl: '',
        payloadLevel: 'minimal',
        enabledEvents: ['weekly_summary_ready'],
        triggerTag: 'goal'
      }
    };
  });

  const [recentLogs, setRecentLogs] = useState<NotificationAuditLog[]>([]);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync saved integrations from Firestore
  useEffect(() => {
    if (!user?.uid || !db) return;

    const intRef = collection(db, 'users', user.uid, 'integrations');
    const unsub = onSnapshot(intRef, (snapshot) => {
      const fetched: Record<string, IntegrationConfig> = {};
      snapshot.forEach((d) => {
        const data = d.data() as IntegrationConfig;
        if (data.provider) {
          fetched[data.provider] = data;
        }
      });

      if (Object.keys(fetched).length > 0) {
        setIntegrations((prev) => ({
          email: fetched.email || prev.email,
          slack: fetched.slack || prev.slack,
          discord: fetched.discord || prev.discord
        }));
      }
    });

    return () => unsub();
  }, [user?.uid]);

  // Sync notification delivery audit logs from Firestore
  useEffect(() => {
    if (!user?.uid || !db) return;

    try {
      const logsRef = collection(db, 'users', user.uid, 'notificationLogs');
      const q = query(logsRef, orderBy('createdAt', 'desc'), limit(5));
      const unsub = onSnapshot(q, (snapshot) => {
        const logs: NotificationAuditLog[] = [];
        snapshot.forEach((docSnap) => {
          logs.push(docSnap.data() as NotificationAuditLog);
        });
        setRecentLogs(logs);
      });

      return () => unsub();
    } catch (e) {
      console.warn('Could not attach notification logs listener:', e);
    }
  }, [user?.uid]);

  const flashMessage = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleSaveIntegration = async (provider: 'email' | 'slack' | 'discord') => {
    if (!user?.uid) return;
    setConnectingProvider(provider);

    const config = integrations[provider];
    try {
      // Connect / save metadata
      const res = await fetch('/api/notifications/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          webhookUrl: config.webhookUrl,
          emailAddress: config.emailAddress,
          workspaceName: config.workspaceName,
          channelName: config.channelName,
          payloadLevel: config.payloadLevel,
          enabledEvents: config.enabledEvents
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Connection failed');

      const updatedConfig: IntegrationConfig = {
        ...config,
        status: 'connected',
        connectedAt: data.connectedAt || new Date().toISOString(),
        webhookUrlSnippet: data.webhookUrlSnippet || config.webhookUrlSnippet
      };

      setIntegrations((prev) => ({ ...prev, [provider]: updatedConfig }));

      if (db) {
        const intDocRef = doc(db, 'users', user.uid, 'integrations', `${provider}-integration`);
        await setDoc(intDocRef, {
          id: `${provider}-integration`,
          userId: user.uid,
          provider,
          status: 'connected',
          connectedAt: updatedConfig.connectedAt,
          workspaceName: updatedConfig.workspaceName || null,
          channelName: updatedConfig.channelName || null,
          emailAddress: updatedConfig.emailAddress || null,
          webhookUrlSnippet: updatedConfig.webhookUrlSnippet || null,
          payloadLevel: updatedConfig.payloadLevel,
          enabledEvents: updatedConfig.enabledEvents,
          triggerTag: updatedConfig.triggerTag || null
        });
      }

      flashMessage('success', `${provider.toUpperCase()} integration connected & saved securely.`);
    } catch (err: any) {
      flashMessage('error', err?.message || `Failed to connect ${provider}`);
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleDisconnect = async (provider: 'email' | 'slack' | 'discord') => {
    if (!user?.uid) return;
    try {
      await fetch('/api/notifications/integrations/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });

      const updatedConfig: IntegrationConfig = {
        ...integrations[provider],
        status: 'disconnected',
        webhookUrl: '',
        webhookUrlSnippet: undefined
      };

      setIntegrations((prev) => ({ ...prev, [provider]: updatedConfig }));

      if (db) {
        const intDocRef = doc(db, 'users', user.uid, 'integrations', `${provider}-integration`);
        await deleteDoc(intDocRef);
      }

      flashMessage('success', `${provider.toUpperCase()} disconnected. No notifications will be dispatched.`);
    } catch (err: any) {
      flashMessage('error', err?.message || 'Failed to disconnect integration');
    }
  };

  const handleTestNotification = async (provider: 'email' | 'slack' | 'discord') => {
    setTestingProvider(provider);
    const config = integrations[provider];

    try {
      const targetInfo = {
        email: config.emailAddress,
        webhookUrl: config.webhookUrl
      };

      const result = await notificationService.sendTestNotification(
        user?.uid || 'anon',
        provider,
        targetInfo,
        config
      );

      if (result.success) {
        flashMessage(
          'success',
          `Safe test message dispatched to ${provider.toUpperCase()}. (Verified zero private journal exposure).`
        );
      } else {
        throw new Error(result.error || 'Test delivery failed');
      }
    } catch (err: any) {
      flashMessage('error', err?.message || `Test failed for ${provider}`);
    } finally {
      setTestingProvider(null);
    }
  };

  const handleToggleEvent = (
    provider: 'email' | 'slack' | 'discord',
    event: NotificationEventType
  ) => {
    setIntegrations((prev) => {
      const current = prev[provider].enabledEvents || [];
      const updatedEvents = current.includes(event)
        ? current.filter((e) => e !== event)
        : [...current, event];

      return {
        ...prev,
        [provider]: {
          ...prev[provider],
          enabledEvents: updatedEvents
        }
      };
    });
  };

  const handleSetPayloadLevel = (
    provider: 'email' | 'slack' | 'discord',
    level: NotificationPayloadLevel
  ) => {
    setIntegrations((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        payloadLevel: level
      }
    }));
  };

  return (
    <div
      className={`space-y-6 ${
        isModal ? 'p-1' : 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn'
      }`}
      id="external-integrations-view"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Bell className="w-5 h-5" />
            <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-white">
              External Notifications & Webhook Integrations
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
            Connect private webhooks and email digests to receive gentle reminders, weekly summaries, and milestone alerts.
            ReflectAI enforces privacy-first minimal payloads by default.
          </p>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status Feedback Toast */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs transition-all shadow-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Privacy Architecture Banner */}
      <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2.5 text-xs">
        <div className="flex items-center gap-2 font-semibold text-white">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Zero-Leakage Privacy Architecture</span>
        </div>
        <p className="text-neutral-400 leading-relaxed text-[11px]">
          1. <strong>Minimal Default Payloads</strong>: Notifications never transmit raw journal entries to Slack, Discord, or Email unless explicitly customized.
          <br />
          2. <strong>Server-Proxied Dispatch</strong>: Webhook URLs and tokens are processed strictly via secure server routes.
          <br />
          3. <strong>Immediate Revocation</strong>: Disconnecting instantly clears delivery routes from Cloud Firestore.
        </p>
      </div>

      {/* Integration Cards */}
      <div className="space-y-5">
        {/* 1. EMAIL DIGEST PROVIDER */}
        <div
          className="p-5 sm:p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-white space-y-4 shadow-sm"
          id="integration-card-email"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Email Digest & Reminders</h3>
                  <span
                    className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                      integrations.email.status === 'connected'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                        : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                    }`}
                  >
                    {integrations.email.status === 'connected' ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">Receive gentle evening reminders or weekly AI retrospectives.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTestNotification('email')}
                disabled={testingProvider === 'email' || !integrations.email.emailAddress}
                className="px-3 py-1.5 rounded-xl border border-neutral-700 hover:bg-neutral-800 disabled:opacity-40 text-xs text-neutral-300 font-medium flex items-center gap-1.5 transition-colors"
                id="btn-test-email"
              >
                {testingProvider === 'email' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-purple-400" />}
                <span>Send Safe Test</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="block text-neutral-400 font-medium">Recipient Email Address</label>
              <input
                type="email"
                value={integrations.email.emailAddress || ''}
                onChange={(e) =>
                  setIntegrations((prev) => ({
                    ...prev,
                    email: { ...prev.email, emailAddress: e.target.value }
                  }))
                }
                placeholder="you@domain.com"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-neutral-400 font-medium">Notification Content Detail Level</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['minimal', 'summary', 'detailed'] as NotificationPayloadLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleSetPayloadLevel('email', lvl)}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium capitalize transition-all ${
                      integrations.email.payloadLevel === lvl
                        ? 'bg-purple-950/60 border-purple-600 text-purple-300'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trigger Event Checkboxes */}
          <div className="space-y-2 pt-2">
            <label className="block text-neutral-400 text-xs font-medium">Dispatched Events</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EVENT_OPTIONS.map((opt) => {
                const isChecked = integrations.email.enabledEvents.includes(opt.id);
                const Icon = opt.icon;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleToggleEvent('email', opt.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-colors ${
                      isChecked
                        ? 'bg-purple-950/30 border-purple-800/80 text-white'
                        : 'bg-neutral-950/40 border-neutral-800/60 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border ${
                        isChecked ? 'bg-purple-600 border-purple-600 text-white' : 'border-neutral-700'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-white">{opt.label}</p>
                      <p className="text-[10px] text-neutral-400 leading-tight">{opt.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => handleSaveIntegration('email')}
              disabled={connectingProvider === 'email'}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
            >
              {connectingProvider === 'email' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save Email Configuration</span>
            </button>
          </div>
        </div>

        {/* 2. SLACK WEBHOOK PROVIDER */}
        <div
          className="p-5 sm:p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-white space-y-4 shadow-sm"
          id="integration-card-slack"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Slack Incoming Webhook</h3>
                  <span
                    className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                      integrations.slack.status === 'connected'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                        : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                    }`}
                  >
                    {integrations.slack.status === 'connected' ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">Post milestone alerts and weekly syntheses into a private Slack channel.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {integrations.slack.status === 'connected' && (
                <button
                  type="button"
                  onClick={() => handleDisconnect('slack')}
                  className="px-3 py-1.5 rounded-xl border border-rose-900/50 hover:bg-rose-950/40 text-rose-400 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleTestNotification('slack')}
                disabled={testingProvider === 'slack' || (!integrations.slack.webhookUrl && !integrations.slack.webhookUrlSnippet)}
                className="px-3 py-1.5 rounded-xl border border-neutral-700 hover:bg-neutral-800 disabled:opacity-40 text-xs text-neutral-300 font-medium flex items-center gap-1.5 transition-colors"
                id="btn-test-slack"
              >
                {testingProvider === 'slack' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-emerald-400" />}
                <span>Test Slack Webhook</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-neutral-400 font-medium">Slack Webhook URL</label>
              <input
                type="url"
                value={integrations.slack.webhookUrl || ''}
                onChange={(e) =>
                  setIntegrations((prev) => ({
                    ...prev,
                    slack: { ...prev.slack, webhookUrl: e.target.value }
                  }))
                }
                placeholder={integrations.slack.webhookUrlSnippet || 'https://hooks.slack.com/services/T00/B00/XXXX'}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-neutral-400 font-medium">Channel Name (Display)</label>
              <input
                type="text"
                value={integrations.slack.channelName || ''}
                onChange={(e) =>
                  setIntegrations((prev) => ({
                    ...prev,
                    slack: { ...prev.slack, channelName: e.target.value }
                  }))
                }
                placeholder="#mindfulness"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-neutral-400 font-medium">Notification Content Detail Level</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['minimal', 'summary', 'detailed'] as NotificationPayloadLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleSetPayloadLevel('slack', lvl)}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium capitalize transition-all ${
                      integrations.slack.payloadLevel === lvl
                        ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trigger Event Checkboxes */}
          <div className="space-y-2 pt-2">
            <label className="block text-neutral-400 text-xs font-medium">Dispatched Events</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EVENT_OPTIONS.map((opt) => {
                const isChecked = integrations.slack.enabledEvents.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleToggleEvent('slack', opt.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-colors ${
                      isChecked
                        ? 'bg-emerald-950/30 border-emerald-800/80 text-white'
                        : 'bg-neutral-950/40 border-neutral-800/60 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border ${
                        isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-neutral-700'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-white">{opt.label}</p>
                      <p className="text-[10px] text-neutral-400 leading-tight">{opt.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {integrations.slack.payloadLevel === 'detailed' && (
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 flex items-center gap-2 text-amber-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Detailed mode may include excerpts from your reflections in Slack.</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => handleSaveIntegration('slack')}
              disabled={connectingProvider === 'slack'}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
            >
              {connectingProvider === 'slack' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save Slack Integration</span>
            </button>
          </div>
        </div>

        {/* 3. DISCORD WEBHOOK PROVIDER */}
        <div
          className="p-5 sm:p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-white space-y-4 shadow-sm"
          id="integration-card-discord"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Discord Incoming Webhook</h3>
                  <span
                    className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                      integrations.discord.status === 'connected'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                        : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                    }`}
                  >
                    {integrations.discord.status === 'connected' ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">Send formatted markdown embeds into a private Discord channel or server.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {integrations.discord.status === 'connected' && (
                <button
                  type="button"
                  onClick={() => handleDisconnect('discord')}
                  className="px-3 py-1.5 rounded-xl border border-rose-900/50 hover:bg-rose-950/40 text-rose-400 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleTestNotification('discord')}
                disabled={testingProvider === 'discord' || (!integrations.discord.webhookUrl && !integrations.discord.webhookUrlSnippet)}
                className="px-3 py-1.5 rounded-xl border border-neutral-700 hover:bg-neutral-800 disabled:opacity-40 text-xs text-neutral-300 font-medium flex items-center gap-1.5 transition-colors"
                id="btn-test-discord"
              >
                {testingProvider === 'discord' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-indigo-400" />}
                <span>Test Discord Card</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-neutral-400 font-medium">Discord Webhook URL</label>
              <input
                type="url"
                value={integrations.discord.webhookUrl || ''}
                onChange={(e) =>
                  setIntegrations((prev) => ({
                    ...prev,
                    discord: { ...prev.discord, webhookUrl: e.target.value }
                  }))
                }
                placeholder={integrations.discord.webhookUrlSnippet || 'https://discord.com/api/webhooks/...'}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-neutral-400 font-medium">Channel Name (Display)</label>
              <input
                type="text"
                value={integrations.discord.channelName || ''}
                onChange={(e) =>
                  setIntegrations((prev) => ({
                    ...prev,
                    discord: { ...prev.discord, channelName: e.target.value }
                  }))
                }
                placeholder="#reflections"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-neutral-400 font-medium">Notification Content Detail Level</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['minimal', 'summary', 'detailed'] as NotificationPayloadLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleSetPayloadLevel('discord', lvl)}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium capitalize transition-all ${
                      integrations.discord.payloadLevel === lvl
                        ? 'bg-indigo-950/60 border-indigo-600 text-indigo-300'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trigger Event Checkboxes */}
          <div className="space-y-2 pt-2">
            <label className="block text-neutral-400 text-xs font-medium">Dispatched Events</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EVENT_OPTIONS.map((opt) => {
                const isChecked = integrations.discord.enabledEvents.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleToggleEvent('discord', opt.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-colors ${
                      isChecked
                        ? 'bg-indigo-950/30 border-indigo-800/80 text-white'
                        : 'bg-neutral-950/40 border-neutral-800/60 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border ${
                        isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-neutral-700'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-white">{opt.label}</p>
                      <p className="text-[10px] text-neutral-400 leading-tight">{opt.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => handleSaveIntegration('discord')}
              disabled={connectingProvider === 'discord'}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
            >
              {connectingProvider === 'discord' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save Discord Integration</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Delivery Audit Log */}
      {recentLogs.length > 0 && (
        <div className="p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Recent Dispatch Audit Trail
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">Immutable Firestore Logs</span>
          </div>

          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      log.status === 'SUCCESS' ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}
                  />
                  <span className="font-semibold uppercase text-white font-mono text-[11px]">
                    {log.provider}
                  </span>
                  <span className="text-neutral-400">•</span>
                  <span className="text-neutral-300">{log.eventType}</span>
                </div>

                <div className="flex items-center gap-3 text-neutral-500 text-[11px]">
                  {log.latencyMs && <span>{log.latencyMs}ms</span>}
                  <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
