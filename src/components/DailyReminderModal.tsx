import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Send,
  Volume2
} from 'lucide-react';
import { useDailyReminder } from '../hooks/useDailyReminder';
import { useAuth } from '../context/AuthContext';

interface DailyReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyReminderModal: React.FC<DailyReminderModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const {
    settings,
    permission,
    isSupported,
    saveSettings,
    requestPermission,
    sendTestNotification
  } = useDailyReminder(user?.uid);

  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const handleToggleEnable = async () => {
    if (!settings.enabled) {
      if (permission !== 'granted') {
        const granted = await requestPermission();
        if (granted) {
          saveSettings({ enabled: true });
        }
      } else {
        saveSettings({ enabled: true });
      }
    } else {
      saveSettings({ enabled: false });
    }
  };

  const handleTest = () => {
    sendTestNotification();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
      onClick={onClose}
      id="daily-reminder-modal-overlay"
    >
      <div
        className="bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-2xl p-6 space-y-6 shadow-2xl text-neutral-100"
        onClick={(e) => e.stopPropagation()}
        id="daily-reminder-modal-card"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Daily Journaling Reminder</h3>
              <p className="text-[11px] text-neutral-400">
                Browser notifications to keep your reflection streak alive.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Support Check */}
        {!isSupported ? (
          <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-800/70 text-amber-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Browser notifications are not supported in your current browser environment.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Permission Status */}
            <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
              <div className="text-xs space-y-0.5">
                <div className="font-semibold text-neutral-200">Browser Permission</div>
                <div className="text-[11px] text-neutral-400">
                  Status:{' '}
                  <span
                    className={`font-semibold capitalize ${
                      permission === 'granted'
                        ? 'text-emerald-400'
                        : permission === 'denied'
                        ? 'text-red-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {permission}
                  </span>
                </div>
              </div>
              {permission !== 'granted' && (
                <button
                  type="button"
                  onClick={requestPermission}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-xs"
                >
                  Enable Permissions
                </button>
              )}
            </div>

            {/* Toggle Enable */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-neutral-200">Activate Daily Alarm</div>
                <div className="text-[11px] text-neutral-400">Receive a gentle nudge every day at chosen time</div>
              </div>
              <button
                type="button"
                onClick={handleToggleEnable}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.enabled ? 'bg-purple-600' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    settings.enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Time Picker */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                Reminder Time
              </label>
              <input
                type="time"
                value={settings.time}
                onChange={(e) => saveSettings({ time: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
              />
            </div>

            {/* Custom Prompt Message */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Custom Reminder Text
              </label>
              <input
                type="text"
                value={settings.prompt}
                onChange={(e) => saveSettings({ prompt: e.target.value })}
                placeholder="e.g. Take 3 minutes to unwind and reflect..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Test Notification Trigger */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTest}
                disabled={permission !== 'granted'}
                className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 border border-neutral-800 text-xs font-semibold text-neutral-200 hover:text-white flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                {testSent ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Notification Sent!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-purple-400" />
                    <span>Send Test Notification Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
