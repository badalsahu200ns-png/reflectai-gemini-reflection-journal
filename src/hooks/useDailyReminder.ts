import { useState, useEffect, useCallback } from 'react';

export interface ReminderSettings {
  enabled: boolean;
  time: string; // "HH:MM" 24hr format, e.g. "20:30"
  prompt: string;
  sound: boolean;
}

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: false,
  time: '20:00',
  prompt: 'Take 3 minutes to capture what stood out to you today.',
  sound: true
};

export function useDailyReminder(userId?: string) {
  const [settings, setSettings] = useState<ReminderSettings>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`reflectai_reminder_settings_${userId || 'default'}`);
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  // Save settings on update
  const saveSettings = useCallback((newSettings: Partial<ReminderSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(`reflectai_reminder_settings_${userId || 'default'}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [userId]);

  // Request browser permission
  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        saveSettings({ enabled: true });
        return true;
      }
      return false;
    } catch (e) {
      console.error('Notification permission error:', e);
      return false;
    }
  };

  // Test Notification
  const sendTestNotification = () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      new Notification('✨ ReflectAI Daily Reminder Test', {
        body: settings.prompt || 'Your daily reflection time is set! Let your mind unwind.',
        icon: '/favicon.ico',
        tag: 'reflectai-reminder-test'
      });
    } catch (e) {
      console.error('Test notification failed:', e);
    }
  };

  // Check every minute if it's reminder time
  useEffect(() => {
    if (!settings.enabled || permission !== 'granted') return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayDateKey = now.toISOString().slice(0, 10);

      const lastNotifiedDate = localStorage.getItem(`reflectai_last_notified_${userId || 'default'}`);

      if (currentTimeStr === settings.time && lastNotifiedDate !== todayDateKey) {
        try {
          new Notification('🌙 Time for Your Daily Reflection', {
            body: settings.prompt || 'Take 3 minutes to unwind and reflect with ReflectAI.',
            icon: '/favicon.ico',
            tag: 'reflectai-daily-reminder'
          });
          localStorage.setItem(`reflectai_last_notified_${userId || 'default'}`, todayDateKey);
        } catch (e) {
          console.error('Error sending scheduled daily reminder:', e);
        }
      }
    }, 30000); // check every 30 seconds

    return () => clearInterval(interval);
  }, [settings, permission, userId]);

  return {
    settings,
    permission,
    isSupported,
    saveSettings,
    requestPermission,
    sendTestNotification
  };
}
