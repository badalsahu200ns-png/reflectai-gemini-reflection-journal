import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Mail,
  MessageSquare,
  X,
  Check,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Flame,
  Clock,
  Sparkles
} from 'lucide-react';
import { NotificationSettings } from '../types';
import { logAuditEvent } from '../utils/auditLogger';
import { useAuth } from '../context/AuthContext';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('reflectai_notification_settings');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return {
      dailyReminderEnabled: true,
      dailyReminderTime: '20:00',
      weeklyDigestEmailEnabled: true,
      digestEmail: user?.email || 'user@example.com',
      slackWebhookUrl: '',
      slackEnabled: false,
      discordWebhookUrl: '',
      discordEnabled: false,
      notifyOnStreakMilestone: true,
      notifyOnWeeklySummary: true
    };
  });

  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [isSendingSlackTest, setIsSendingSlackTest] = useState(false);
  const [isSendingDiscordTest, setIsSendingDiscordTest] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('reflectai_notification_settings', JSON.stringify(settings));
      }
    } catch {}
    setStatusMessage({ type: 'success', text: 'Notification preferences saved successfully!' });
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleSendTestEmail = async () => {
    if (!settings.digestEmail) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setIsSendingTestEmail(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/notifications/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: settings.digestEmail,
          type: 'WEEKLY_DIGEST',
          data: { entryCount: 7, sentimentScore: 88 }
        })
      });

      if (!res.ok) throw new Error('Email dispatch failed');
      const data = await res.json();
      setStatusMessage({ type: 'success', text: `Test email digest sent to ${settings.digestEmail}!` });

      await logAuditEvent({
        userId: user?.uid || 'anon',
        userEmail: user?.email,
        action: 'EMAIL_NOTIFICATION_DISPATCHED',
        category: 'NOTIFICATION',
        resource: `Mailer::${settings.digestEmail}`,
        status: 'SUCCESS',
        details: 'Simulated daily/weekly digest verified.'
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to dispatch email.' });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleSendSlackTest = async () => {
    if (!settings.slackWebhookUrl) {
      setStatusMessage({ type: 'error', text: 'Please provide a Slack Webhook URL.' });
      return;
    }

    setIsSendingSlackTest(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/notifications/dispatch-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: settings.slackWebhookUrl,
          service: 'slack',
          eventType: 'Streak Milestone Unlocked 🔥',
          payload: {
            userName: user?.displayName || 'Mindful User',
            streak: 7,
            mood: 'Grateful',
            summary: 'User achieved the 7-Day Mindfulness Philosopher badge!'
          }
        })
      });

      if (!res.ok) throw new Error('Slack dispatch failed');
      setStatusMessage({ type: 'success', text: 'Slack milestone alert dispatched successfully!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Slack dispatch failed.' });
    } finally {
      setIsSendingSlackTest(false);
    }
  };

  const handleSendDiscordTest = async () => {
    if (!settings.discordWebhookUrl) {
      setStatusMessage({ type: 'error', text: 'Please provide a Discord Webhook URL.' });
      return;
    }

    setIsSendingDiscordTest(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/notifications/dispatch-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: settings.discordWebhookUrl,
          service: 'discord',
          eventType: 'Weekly AI Summary Generated ✨',
          payload: {
            userName: user?.displayName || 'Mindful User',
            streak: 7,
            mood: 'Thoughtful',
            category: 'Weekly Synthesis',
            summary: 'Your weekly mindfulness synthesis is ready in the ReflectAI dashboard.'
          }
        })
      });

      if (!res.ok) throw new Error('Discord dispatch failed');
      setStatusMessage({ type: 'success', text: 'Discord test card sent successfully!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Discord dispatch failed.' });
    } finally {
      setIsSendingDiscordTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 text-white space-y-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Notifications & Webhook Integrations</h3>
              <p className="text-xs text-neutral-400">Configure email reminders, Slack channels & Discord webhooks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                : 'bg-red-950/40 border-red-800/50 text-red-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Email Reminders Section */}
        <div className="space-y-3 bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Mail className="w-4 h-4 text-purple-400" />
              <span>Email Digest & Reflection Reminders</span>
            </div>
            <button
              onClick={handleSendTestEmail}
              disabled={isSendingTestEmail}
              className="text-[11px] text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
            >
              {isSendingTestEmail ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              <span>Send Test Email</span>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <label className="block text-neutral-400 mb-1">Recipient Email</label>
              <input
                type="email"
                value={settings.digestEmail}
                onChange={(e) => setSettings({ ...settings, digestEmail: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-neutral-300">Daily Reflection Reminder</span>
              <input
                type="checkbox"
                checked={settings.dailyReminderEnabled}
                onChange={(e) => setSettings({ ...settings, dailyReminderEnabled: e.target.checked })}
                className="rounded accent-purple-600"
              />
            </div>

            {settings.dailyReminderEnabled && (
              <div className="flex items-center justify-between pl-4 text-neutral-400">
                <span>Reminder Time</span>
                <input
                  type="time"
                  value={settings.dailyReminderTime}
                  onChange={(e) => setSettings({ ...settings, dailyReminderTime: e.target.value })}
                  className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-xs text-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Slack Webhook Section */}
        <div className="space-y-3 bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Slack Incoming Webhook</span>
            </div>
            <button
              onClick={handleSendSlackTest}
              disabled={isSendingSlackTest}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              {isSendingSlackTest ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              <span>Test Slack Alert</span>
            </button>
          </div>

          <div>
            <label className="block text-neutral-400 text-xs mb-1">Slack Webhook URL</label>
            <input
              type="url"
              value={settings.slackWebhookUrl}
              onChange={(e) => setSettings({ ...settings, slackWebhookUrl: e.target.value })}
              placeholder="https://hooks.slack.com/services/..."
              className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 text-xs font-mono"
            />
          </div>
        </div>

        {/* Discord Webhook Section */}
        <div className="space-y-3 bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Discord Incoming Webhook</span>
            </div>
            <button
              onClick={handleSendDiscordTest}
              disabled={isSendingDiscordTest}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              {isSendingDiscordTest ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              <span>Test Discord Card</span>
            </button>
          </div>

          <div>
            <label className="block text-neutral-400 text-xs mb-1">Discord Webhook URL</label>
            <input
              type="url"
              value={settings.discordWebhookUrl}
              onChange={(e) => setSettings({ ...settings, discordWebhookUrl: e.target.value })}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 text-xs font-mono"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-neutral-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow"
          >
            <Check className="w-3.5 h-3.5" />
            Save Preferences
          </button>
        </div>
      </motion.div>
    </div>
  );
};
