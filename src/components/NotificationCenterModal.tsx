import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  Sparkles,
  Calendar,
  Flame,
  Brain,
  Clock,
  ArrowRight,
  Filter
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNavigateToTab?: (tab: string, entryId?: string) => void;
  onTriggerTestReminder?: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNavigateToTab,
  onTriggerTestReminder
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'UNREAD') return !item.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'REMINDER':
        return <Clock className="w-4 h-4 text-[#76B900]" />;
      case 'WEEKLY_SUMMARY':
      case 'MONTHLY_SUMMARY':
        return <Sparkles className="w-4 h-4 text-[#8FE000]" />;
      case 'STREAK':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'MEMORY_INSIGHT':
        return <Brain className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl bg-[#0B0D0E] border border-[#22272B] shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-white overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1F2428] bg-[#0E1012]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#111416] border border-[#76B900]/40 flex items-center justify-center text-[#76B900] shadow-[0_0_12px_rgba(118,185,0,0.2)]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Notifications & Reminders</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#76B900]/20 text-[#8FE000] border border-[#76B900]/40">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                Mindful prompts, synthesized insights, and cadence reminders.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#111416] border border-[#22272B] text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter bar & Actions */}
        <div className="px-5 py-3 border-b border-[#1F2428] bg-[#111416] flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-[#0B0D0E] border border-[#22272B]">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                filter === 'ALL'
                  ? 'bg-[#171A1C] text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                filter === 'UNREAD'
                  ? 'bg-[#171A1C] text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] font-medium text-[#76B900] hover:text-[#8FE000] flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] font-medium text-neutral-400 hover:text-rose-400 flex items-center gap-1 transition-colors pl-2 border-l border-[#22272B]"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#111416] border border-[#22272B] flex items-center justify-center text-neutral-500 mx-auto">
                <Bell className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="text-xs text-neutral-400">
                {filter === 'UNREAD' ? 'No unread notifications.' : 'No notifications yet.'}
              </p>
              {onTriggerTestReminder && (
                <button
                  onClick={onTriggerTestReminder}
                  className="px-3.5 py-1.5 rounded-xl bg-[#171A1C] hover:bg-[#22272B] border border-[#2B3238] text-[11px] font-semibold text-[#76B900] hover:text-[#8FE000] transition-colors inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Send Test Reflection Prompt</span>
                </button>
              )}
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (!item.isRead) onMarkAsRead(item.id);
                  if (item.actionTab && onNavigateToTab) {
                    onNavigateToTab(item.actionTab, item.actionEntryId);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
                  item.isRead
                    ? 'bg-[#111416]/70 border-[#1F2428] opacity-75 hover:opacity-100 hover:border-[#2E353B]'
                    : 'bg-[#14171A] border-[#76B900]/40 hover:border-[#76B900] shadow-[0_0_15px_rgba(118,185,0,0.08)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#0B0D0E] border border-[#22272B] shrink-0 mt-0.5">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-neutral-200 group-hover:text-white truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2 font-sans">
                      {item.message}
                    </p>
                    {item.actionTab && (
                      <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-[#76B900] group-hover:text-[#8FE000]">
                        <span>Open {item.actionTab}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1F2428] bg-[#0E1012] flex items-center justify-between text-xs text-neutral-400">
          <span className="text-[11px]">ReflectAI Mindful Cadence Engine</span>
          {onTriggerTestReminder && (
            <button
              onClick={onTriggerTestReminder}
              className="text-[11px] font-semibold text-[#76B900] hover:text-[#8FE000] transition-colors"
            >
              Test Notification →
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
