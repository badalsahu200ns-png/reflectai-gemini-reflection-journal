import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Sparkles,
  Bell,
  Sun,
  Moon,
  Monitor,
  Flame,
  ShieldCheck,
  LogOut,
  Brain,
  Check,
  ChevronRight,
  Send,
  Lock,
  Compass,
  HeartHandshake,
  HelpCircle,
  Minimize2,
  GitMerge,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { AIPersonaId } from '../types';
import { AI_PERSONAS } from '../utils/personas';

interface SettingsViewProps {
  onOpenPrivacyCenter: () => void;
  onOpenSecurityInspector: () => void;
  onOpenReminderModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenPrivacyCenter,
  onOpenSecurityInspector,
  onOpenReminderModal
}) => {
  const { user, signOut } = useAuth();
  const { mode, isDark, setMode } = useTheme();

  const [selectedPersona, setSelectedPersona] = useState<AIPersonaId>(() => {
    try {
      if (typeof window !== 'undefined' && user?.uid) {
        const saved = localStorage.getItem(`reflectai_persona_${user.uid}`);
        if (saved) return saved as AIPersonaId;
      }
    } catch {}
    return 'balanced';
  });

  const [reflectionLength, setReflectionLength] = useState<'concise' | 'balanced' | 'deep'>('balanced');
  
  const [isMemoryEnabled, setIsMemoryEnabled] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && user?.uid) {
        const saved = localStorage.getItem(`reflectai_ai_memory_enabled_${user.uid}`);
        if (saved !== null) return saved === 'true';
      }
    } catch {}
    return true;
  });

  const [isGamificationEnabled, setIsGamificationEnabled] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && user?.uid) {
        const saved = localStorage.getItem(`reflectai_gamification_enabled_${user.uid}`);
        if (saved !== null) return saved === 'true';
      }
    } catch {}
    return true;
  });

  const [reminderTime, setReminderTime] = useState<string>('20:00');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const handleSelectPersona = (pId: AIPersonaId) => {
    setSelectedPersona(pId);
    if (user?.uid) {
      localStorage.setItem(`reflectai_persona_${user.uid}`, pId);
    }
    flashSuccess('Persona updated');
  };

  const handleToggleMemory = (enabled: boolean) => {
    setIsMemoryEnabled(enabled);
    if (user?.uid) {
      localStorage.setItem(`reflectai_ai_memory_enabled_${user.uid}`, String(enabled));
    }
    flashSuccess(enabled ? 'AI Memory enabled' : 'AI Memory paused');
  };

  const handleToggleGamification = (enabled: boolean) => {
    setIsGamificationEnabled(enabled);
    if (user?.uid) {
      localStorage.setItem(`reflectai_gamification_enabled_${user.uid}`, String(enabled));
    }
    flashSuccess(enabled ? 'Streak display enabled' : 'Streak display hidden');
  };

  const flashSuccess = (msg: string) => {
    setSaveSuccessMessage(msg);
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn" id="settings-view-container">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <SettingsIcon className="w-5 h-5" />
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight text-neutral-900 dark:text-white">
              Settings & Preferences
            </h1>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Configure your AI reflection companion, appearance, reminders, and data privacy.
          </p>
        </div>

        {saveSuccessMessage && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold animate-pulse">
            <Check className="w-3.5 h-3.5" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* 1. Account Section */}
      <section
        className={`p-6 rounded-2xl border transition-all shadow-xs ${
          isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200'
        }`}
        id="section-settings-account"
      >
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" />
          Account & Authentication
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-12 h-12 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                {user?.displayName || 'ReflectAI User'}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {user?.email || 'Authenticated via Google'}
              </p>
              <span className="inline-block mt-1 text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                Google SSO Verified
              </span>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20 transition-colors"
            id="btn-settings-signout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </section>

      {/* 2. Reflection Persona & AI Voice Settings */}
      <section
        className={`p-6 rounded-2xl border transition-all shadow-xs space-y-5 ${
          isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200'
        }`}
        id="section-settings-ai-persona"
      >
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            AI Reflection Style & Tone
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Choose how Gemini provides guidance, inquiry, and emotional resonance for your entries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {AI_PERSONAS.map((persona) => {
            const isSelected = selectedPersona === persona.id;
            return (
              <div
                key={persona.id}
                onClick={() => handleSelectPersona(persona.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 text-neutral-900 dark:text-white shadow-xs'
                    : isDark
                    ? 'bg-neutral-950/40 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                    : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300 text-neutral-700'
                }`}
                id={`card-persona-${persona.id}`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      {persona.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                    {persona.tagline}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {persona.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Memory Control */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                Long-Term AI Personal Memory
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              When enabled, ReflectAI securely retrieves relevant context from your past entries to connect patterns over time.
            </p>
          </div>

          <button
            onClick={() => handleToggleMemory(!isMemoryEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
              isMemoryEnabled ? 'bg-indigo-600' : 'bg-neutral-300 dark:bg-neutral-700'
            }`}
            id="toggle-settings-ai-memory"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isMemoryEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>

      {/* 3. Appearance & Theme Settings */}
      <section
        className={`p-6 rounded-2xl border transition-all shadow-xs space-y-4 ${
          isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200'
        }`}
        id="section-settings-appearance"
      >
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Sun className="w-4 h-4 text-indigo-500" />
          Appearance & Theme
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'dark' as ThemeMode, label: 'Dark Mode', icon: Moon },
            { id: 'light' as ThemeMode, label: 'Light Mode', icon: Sun },
            { id: 'system' as ThemeMode, label: 'System', icon: Monitor }
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = mode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setMode(item.id)}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-600 text-indigo-700 dark:text-indigo-300'
                    : isDark
                    ? 'bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:text-white'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:text-neutral-900'
                }`}
                id={`btn-theme-${item.id}`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Gamification & Streak Setting */}
      <section
        className={`p-6 rounded-2xl border transition-all shadow-xs ${
          isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200'
        }`}
        id="section-settings-gamification"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                Reflection Streak Counter
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Display mindful daily reflection streak in the sidebar. You can turn this off for zero-pressure journaling.
            </p>
          </div>

          <button
            onClick={() => handleToggleGamification(!isGamificationEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
              isGamificationEnabled ? 'bg-indigo-600' : 'bg-neutral-300 dark:bg-neutral-700'
            }`}
            id="toggle-settings-gamification"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isGamificationEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>

      {/* 5. Notifications & External Integrations */}
      <section
        className={`p-6 rounded-2xl border transition-all shadow-xs space-y-4 ${
          isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200'
        }`}
        id="section-settings-reminders"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
                Notifications & External Integrations
              </h2>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Configure Slack channels, Discord webhooks, email digests, and gentle daily in-app reminders.
            </p>
          </div>

          <button
            onClick={onOpenReminderModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 transition-colors"
            id="btn-settings-configure-reminders"
          >
            <span>Configure Integrations</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div
            onClick={onOpenReminderModal}
            className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 cursor-pointer hover:border-emerald-500/50 transition-all flex items-center justify-between"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Slack Webhook
              </span>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">#reflections alerts</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          </div>

          <div
            onClick={onOpenReminderModal}
            className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 cursor-pointer hover:border-indigo-500/50 transition-all flex items-center justify-between"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                Discord Embeds
              </span>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Weekly milestones</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          </div>

          <div
            onClick={onOpenReminderModal}
            className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 cursor-pointer hover:border-purple-500/50 transition-all flex items-center justify-between"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                Email Digests
              </span>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Daily/weekly summaries</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          </div>
        </div>
      </section>

      {/* 6. Privacy & Security Links */}
      <section
        className={`p-6 rounded-2xl border transition-all shadow-xs space-y-3 ${
          isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200'
        }`}
        id="section-settings-privacy-link"
      >
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          Privacy, Export & Security Audit
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={onOpenPrivacyCenter}
            className="p-4 rounded-xl border text-left flex items-center justify-between bg-neutral-50 dark:bg-neutral-950/40 border-neutral-200 dark:border-neutral-800 hover:border-indigo-500 transition-all"
            id="btn-settings-open-privacy-center"
          >
            <div>
              <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                Privacy Center & Export
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Download your entries as JSON/CSV or manage AI memories.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>

          <button
            onClick={onOpenSecurityInspector}
            className="p-4 rounded-xl border text-left flex items-center justify-between bg-neutral-50 dark:bg-neutral-950/40 border-neutral-200 dark:border-neutral-800 hover:border-indigo-500 transition-all"
            id="btn-settings-open-security-inspector"
          >
            <div>
              <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                Security & Cloud Rules Inspector
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Inspect owner-bound Firestore security rules and LLM defenses.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      </section>
    </div>
  );
};
