import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Moon,
  Volume2,
  CheckCircle2,
  Trash2,
  Plus,
  Shield,
  RotateCcw,
  Sparkles,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';
import { AppNotification } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export interface LocalNotificationSchedule {
  id: string;
  userId: string;
  title: string;
  type: string;
  time: string;
  daysOfWeek: number[];
  enabled: boolean;
}

interface NotificationsViewProps {
  notifications?: AppNotification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
  onOpenReminderModal?: () => void;
  onNavigateTab?: (tab: string, entryId?: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onOpenReminderModal,
  onNavigateTab
}) => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState<'center' | 'schedules' | 'preferences'>('center');

  // Custom Schedules State
  const [schedules, setSchedules] = useState<LocalNotificationSchedule[]>([
    {
      id: 'sched-1',
      userId: user?.uid || 'anonymous',
      title: 'Morning Mindful Reflection',
      type: 'daily_reflection',
      time: '08:30',
      daysOfWeek: [1, 2, 3, 4, 5],
      enabled: true
    },
    {
      id: 'sched-2',
      userId: user?.uid || 'anonymous',
      title: 'Evening Gratitude & Check-In',
      type: 'daily_reflection',
      time: '21:00',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      enabled: true
    },
    {
      id: 'sched-3',
      userId: user?.uid || 'anonymous',
      title: 'Every 5 Days Memory Resurfacing',
      type: 'resurfacing',
      time: '14:00',
      daysOfWeek: [0, 5],
      enabled: true
    },
    {
      id: 'sched-4',
      userId: user?.uid || 'anonymous',
      title: 'Sunday Weekly Review',
      type: 'weekly_review',
      time: '18:00',
      daysOfWeek: [0],
      enabled: true
    }
  ]);

  // Preferences State
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false);

  // Local Notifications State fallback if empty
  const [notifList, setNotifList] = useState<AppNotification[]>(() => {
    if (notifications.length > 0) return notifications;
    return [
      {
        id: 'n-1',
        title: 'Five Days Ago Memory Ready',
        message: 'You wrote about "Sunrise Reflection by the Lake". Tap to see how your mindset evolved.',
        type: 'MEMORY_INSIGHT',
        isRead: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        actionTab: 'memories'
      },
      {
        id: 'n-2',
        title: 'Growth Goal Milestone Achieved!',
        message: 'You completed 7 consecutive days of Mindful Morning Meditation.',
        type: 'STREAK',
        isRead: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        actionTab: 'growth'
      },
      {
        id: 'n-3',
        title: 'Evening Reflection Reminder',
        message: 'Take 2 minutes to log your daily check-in and gratitude.',
        type: 'REMINDER',
        isRead: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        actionTab: 'journal'
      }
    ];
  });

  const handleToggleSchedule = (id: string) => {
    setSchedules(
      schedules.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleMarkAllRead = () => {
    setNotifList(notifList.map((n) => ({ ...n, isRead: true })));
    if (onMarkAllAsRead) onMarkAllAsRead();
    else if (onClearAll) onClearAll();
  };

  const handleToggleRead = (id: string, item: AppNotification) => {
    setNotifList(
      notifList.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    if (onMarkAsRead) onMarkAsRead(id);
    if (item.actionTab && onNavigateTab) {
      onNavigateTab(item.actionTab, item.actionEntryId);
    }
  };

  const handleDeleteNotif = (id: string) => {
    setNotifList(notifList.filter((n) => n.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn" id="notifications-view">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#76B900]/15 flex items-center justify-center text-[#76B900]">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-white">
              Notifications & Gentle Prompts
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Custom reflection schedules, quiet hours, delivery preferences, and audit history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenReminderModal && (
            <button
              onClick={onOpenReminderModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#76B900] hover:bg-[#68a300] text-black text-xs font-bold transition-all"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Configure Integrations</span>
            </button>
          )}
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-all shrink-0"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
        </div>
      </header>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#111416] border border-neutral-800">
        {[
          { id: 'center', label: 'Notification Center', icon: Bell },
          { id: 'schedules', label: 'Reflection Schedules', icon: Clock },
          { id: 'preferences', label: 'Quiet Hours & Sound', icon: Moon }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#76B900] text-black shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. NOTIFICATION CENTER TAB */}
      {/* ========================================================================= */}
      {activeTab === 'center' && (
        <div className="space-y-4 animate-fadeIn">
          {notifList.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-neutral-800 bg-[#14171A]">
              <Bell className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
              <p className="text-xs text-neutral-400">You are all caught up. No notifications.</p>
            </div>
          ) : (
            notifList.map((n) => (
              <div
                key={n.id}
                onClick={() => handleToggleRead(n.id, n)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  !n.isRead
                    ? 'bg-[#14171A] border-[#76B900]/40 shadow-sm'
                    : 'bg-[#111416] border-neutral-800 opacity-75'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      n.type === 'MEMORY_INSIGHT'
                        ? 'bg-purple-950 text-purple-400 border border-purple-800/40'
                        : n.type === 'STREAK'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                        : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                    }`}
                  >
                    {n.type === 'MEMORY_INSIGHT' ? (
                      <RotateCcw className="w-4 h-4" />
                    ) : n.type === 'STREAK' ? (
                      <Sparkles className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{n.title}</h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#76B900]" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-neutral-500 font-mono block pt-1">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotif(n.id);
                  }}
                  className="p-1 text-neutral-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REFLECTION SCHEDULES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'schedules' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schedules.map((sched) => (
              <div
                key={sched.id}
                className="p-6 rounded-3xl border border-neutral-800 bg-[#14171A] space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#76B900] bg-[#76B900]/15 px-2.5 py-0.5 rounded-full">
                      {sched.time}
                    </span>
                    <button
                      onClick={() => handleToggleSchedule(sched.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        sched.enabled
                          ? 'bg-[#76B900] text-black'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {sched.enabled ? 'Enabled' : 'Paused'}
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white">{sched.title}</h3>
                  <p className="text-xs text-neutral-400">
                    Active Days: {sched.daysOfWeek.length === 7 ? 'Every Day' : 'Weekdays & Custom'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. QUIET HOURS & PREFERENCES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'preferences' && (
        <div className="p-8 rounded-3xl border border-neutral-800 bg-[#14171A] space-y-6 animate-fadeIn">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Quiet Hours & Sound Preferences</h2>
            <p className="text-xs text-neutral-400">
              Ensure reflective notifications never disturb your sleep, deep focus, or quiet moments.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-[#111416] border border-neutral-800 space-y-2">
                <label className="block text-xs font-bold text-white">Quiet Hours Start</label>
                <input
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0B0D0E] border border-neutral-800 text-xs text-white"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#111416] border border-neutral-800 space-y-2">
                <label className="block text-xs font-bold text-white">Quiet Hours End</label>
                <input
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0B0D0E] border border-neutral-800 text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Mindful Audio Chime</span>
                <span className="text-[11px] text-neutral-400">Play a gentle singing bowl chime on check-ins</span>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  soundEnabled ? 'bg-[#76B900] text-black' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {soundEnabled ? 'Sound On' : 'Muted'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

