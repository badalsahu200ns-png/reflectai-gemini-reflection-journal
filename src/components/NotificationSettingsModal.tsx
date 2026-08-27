import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Sparkles,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { NotificationSettings } from '../types';
import { logAuditEvent } from '../utils/auditLogger';
import { useAuth } from '../context/AuthContext';
import { ExternalIntegrationsView } from './ExternalIntegrationsView';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'integrations' | 'reminders';
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'integrations'
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'integrations' | 'reminders'>(defaultTab);

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
      digestEmail: user?.email || '',
      slackWebhookUrl: '',
      slackEnabled: false,
      discordWebhookUrl: '',
      discordEnabled: false,
      notifyOnStreakMilestone: true,
      notifyOnWeeklySummary: true
    };
  });

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveReminders = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('reflectai_notification_settings', JSON.stringify(settings));
      }
    } catch {}
    setStatusMessage({ type: 'success', text: 'Daily reflection reminder preferences saved!' });
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-3xl rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-5 sm:p-6 text-white space-y-5 max-h-[92vh] overflow-y-auto"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Notifications & Integrations</h2>
              <p className="text-xs text-neutral-400">Manage external webhooks (Slack, Discord), email digests & in-app alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('integrations')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'integrations'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>External Integrations (Slack, Discord, Email)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reminders')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'reminders'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Daily Reminders & In-App Pacing</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'integrations' ? (
          <ExternalIntegrationsView isModal={true} onClose={onClose} />
        ) : (
          <div className="space-y-4 text-xs">
            {statusMessage && (
              <div
                className={`p-3 rounded-xl border flex items-center gap-2 ${
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

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Daily Reflection In-App Reminder</h4>
                  <p className="text-neutral-400 text-[11px]">Prompt yourself at your preferred reflection time.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.dailyReminderEnabled}
                  onChange={(e) => setSettings({ ...settings, dailyReminderEnabled: e.target.checked })}
                  className="rounded accent-emerald-600 w-4 h-4"
                />
              </div>

              {settings.dailyReminderEnabled && (
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-300">Preferred Evening Time</span>
                  <input
                    type="time"
                    value={settings.dailyReminderTime}
                    onChange={(e) => setSettings({ ...settings, dailyReminderTime: e.target.value })}
                    className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono text-xs"
                  />
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Milestone & Streak Celebrations</h4>
                  <p className="text-neutral-400 text-[11px]">Show congratulations on 3, 7, 14, 30 day milestones.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyOnStreakMilestone}
                  onChange={(e) => setSettings({ ...settings, notifyOnStreakMilestone: e.target.checked })}
                  className="rounded accent-emerald-600 w-4 h-4"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveReminders}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-all shadow"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Reminder Settings</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
