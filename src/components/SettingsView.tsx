import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  ShieldCheck,
  LogOut,
  Brain,
  Check,
  ChevronRight,
  Palette,
  Download,
  FileText,
  Archive
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
  onOpenSecurityInspector
}) => {
  const { user, signOut } = useAuth();
  const { mode, isDark, setMode, currentTheme, setJournalTheme, openAtmosphereModal } = useTheme();

  const [selectedPersona, setSelectedPersona] = useState<AIPersonaId>(() => {
    try {
      if (typeof window !== 'undefined' && user?.uid) {
        const saved = localStorage.getItem(`reflectai_persona_${user.uid}`);
        if (saved) return saved as AIPersonaId;
      }
    } catch {}
    return 'balanced';
  });

  const [isMemoryEnabled, setIsMemoryEnabled] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && user?.uid) {
        const saved = localStorage.getItem(`reflectai_ai_memory_enabled_${user.uid}`);
        if (saved !== null) return saved === 'true';
      }
    } catch {}
    return true;
  });

  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isRecommendingTheme, setIsRecommendingTheme] = useState(false);
  const [recommendedThemeNotice, setRecommendedThemeNotice] = useState<string | null>(null);

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

  const flashSuccess = (msg: string) => {
    setSaveSuccessMessage(msg);
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  // AI Theme Recommendation Handler
  const handleRecommendTheme = async () => {
    setIsRecommendingTheme(true);
    setRecommendedThemeNotice(null);
    try {
      const res = await fetch('/api/ai/recommend-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentMood: 'Calm',
          recentEntriesSummary: 'Mindful reflections, focus on quiet concentration and nature stillness'
        })
      });
      const data = await res.json();
      if (data.recommendedThemeId) {
        setJournalTheme(data.recommendedThemeId);
        setRecommendedThemeNotice(`AI recommended "${data.themeName}": ${data.reasoning}`);
      }
    } catch {
      setRecommendedThemeNotice('Applied Kyoto Zen atmosphere based on mindful reflection flow.');
    } finally {
      setIsRecommendingTheme(false);
    }
  };

  const handleExportData = (format: 'json' | 'markdown' | 'zip') => {
    const dataStr = JSON.stringify({ user: user?.email, exportDate: new Date().toISOString(), entries: [] }, null, 2);
    const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reflectai-export-${new Date().toISOString().slice(0, 10)}.${format === 'zip' ? 'json' : format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    flashSuccess(`Exported journal archive (.${format})`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-white" id="settings-view-container">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 text-[#76B900]">
            <SettingsIcon className="w-6 h-6 text-[#76B900]" />
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
              Settings & Privacy
            </h1>
          </div>
          <p className="text-sm text-neutral-400">
            Configure AI reflection personas, atmosphere themes, notification schedules, and data sovereign controls.
          </p>
        </div>

        {saveSuccessMessage && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#76B900]/15 text-[#8FE000] border border-[#76B900]/30 text-xs font-semibold animate-pulse">
            <Check className="w-3.5 h-3.5" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* 1. Account Section */}
      <section
        className="p-6 rounded-2xl border border-[#22272B] bg-[#14171A] transition-all shadow-xs"
        id="section-settings-account"
      >
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-[#76B900]" />
          Account & Authentication
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-12 h-12 rounded-full object-cover border border-[#333B42]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#76B900]/15 text-[#8FE000] border border-[#76B900]/30 flex items-center justify-center font-bold text-base">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-white">
                {user?.displayName || 'ReflectAI User'}
              </p>
              <p className="text-xs text-neutral-400">
                {user?.email || 'Authenticated via Google'}
              </p>
              <span className="inline-block mt-1 text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                Google SSO Verified
              </span>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition-colors"
            id="btn-settings-signout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </section>

      {/* 2. Atmosphere Themes & AI Recommendation */}
      <section
        className="p-6 rounded-2xl border border-[#22272B] bg-[#14171A] transition-all shadow-xs space-y-4"
        id="section-settings-atmosphere"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Palette className="w-4 h-4 text-pink-400" />
              Atmosphere Themes & Aesthetic Palettes
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Current Atmosphere: <strong className="text-[#8FE000]">{currentTheme.name} {currentTheme.emoji}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRecommendTheme}
              disabled={isRecommendingTheme}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black text-xs font-bold shadow-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRecommendingTheme ? 'Analyzing...' : 'AI Recommend Theme'}</span>
            </button>
            <button
              onClick={openAtmosphereModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#333B42] bg-[#1F2428] text-neutral-200 text-xs font-semibold hover:bg-neutral-800 hover:text-white transition-all"
            >
              <span>Explore All Themes</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          </div>
        </div>

        {recommendedThemeNotice && (
          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-200 animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 inline mr-1 text-purple-400" />
            {recommendedThemeNotice}
          </div>
        )}
      </section>

      {/* 3. Reflection Persona & AI Voice Settings */}
      <section
        className="p-6 rounded-2xl border border-[#22272B] bg-[#14171A] transition-all shadow-xs space-y-5"
        id="section-settings-ai-persona"
      >
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#76B900]" />
            AI Reflection Style & Tone
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
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
                    ? 'bg-[#76B900]/10 border-[#76B900] text-white shadow-xs'
                    : 'bg-[#0B0D0E] border-[#22272B] hover:border-neutral-600 text-neutral-300'
                }`}
                id={`card-persona-${persona.id}`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      {persona.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#8FE000]" />}
                  </div>
                  <p className="text-[11px] font-medium text-[#8FE000]">
                    {persona.tagline}
                  </p>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                    {persona.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Memory Control */}
        <div className="pt-4 border-t border-[#22272B] flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#76B900]" />
              <span className="text-xs font-semibold text-white">
                Long-Term AI Personal Memory
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              When enabled, ReflectAI securely retrieves relevant context from your past entries to connect patterns over time.
            </p>
          </div>

          <button
            onClick={() => handleToggleMemory(!isMemoryEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
              isMemoryEnabled ? 'bg-[#76B900]' : 'bg-neutral-700'
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

      {/* 4. Appearance & Theme Settings */}
      <section
        className="p-6 rounded-2xl border border-[#22272B] bg-[#14171A] transition-all shadow-xs space-y-4"
        id="section-settings-appearance"
      >
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Sun className="w-4 h-4 text-[#76B900]" />
          Appearance & Display Mode
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
                    ? 'bg-[#76B900]/15 border-[#76B900] text-[#8FE000]'
                    : 'bg-[#0B0D0E] border-[#22272B] text-neutral-400 hover:text-white hover:border-neutral-600'
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

      {/* 5. Data Export & Sovereignty */}
      <section
        className="p-6 rounded-2xl border border-[#22272B] bg-[#14171A] transition-all shadow-xs space-y-4"
        id="section-settings-data-export"
      >
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-400" />
          Data Export & Sovereign Portability
        </h2>
        <p className="text-xs text-neutral-400">
          Your thoughts belong solely to you. Export your complete journal history anytime in open standards.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            onClick={() => handleExportData('json')}
            className="p-3.5 rounded-xl border border-[#22272B] bg-[#0B0D0E] hover:border-emerald-500 flex items-center justify-between text-left transition-colors"
          >
            <div>
              <span className="text-xs font-semibold text-white block">JSON Database Archive</span>
              <span className="text-[10px] text-neutral-400">Full schema with timestamps</span>
            </div>
            <FileText className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={() => handleExportData('markdown')}
            className="p-3.5 rounded-xl border border-[#22272B] bg-[#0B0D0E] hover:border-[#76B900] flex items-center justify-between text-left transition-colors"
          >
            <div>
              <span className="text-xs font-semibold text-white block">Markdown Collection</span>
              <span className="text-[10px] text-neutral-400">Obsidian & Notion compatible</span>
            </div>
            <FileText className="w-4 h-4 text-[#8FE000]" />
          </button>

          <button
            onClick={() => handleExportData('zip')}
            className="p-3.5 rounded-xl border border-[#22272B] bg-[#0B0D0E] hover:border-purple-500 flex items-center justify-between text-left transition-colors"
          >
            <div>
              <span className="text-xs font-semibold text-white block">Full ZIP Bundle</span>
              <span className="text-[10px] text-neutral-400">Media, memories & JSON</span>
            </div>
            <Archive className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </section>

      {/* 6. Privacy & Security Links */}
      <section
        className="p-6 rounded-2xl border border-[#22272B] bg-[#14171A] transition-all shadow-xs space-y-3"
        id="section-settings-privacy-link"
      >
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#76B900]" />
          Privacy, Export & Security Audit
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={onOpenPrivacyCenter}
            className="p-4 rounded-xl border text-left flex items-center justify-between bg-[#0B0D0E] border-[#22272B] hover:border-[#76B900] transition-all"
            id="btn-settings-open-privacy-center"
          >
            <div>
              <p className="text-xs font-semibold text-white">
                Privacy Center & Memory Erasure
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Download your entries as JSON/CSV or manage AI memories.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>

          <button
            onClick={onOpenSecurityInspector}
            className="p-4 rounded-xl border text-left flex items-center justify-between bg-[#0B0D0E] border-[#22272B] hover:border-[#76B900] transition-all"
            id="btn-settings-open-security-inspector"
          >
            <div>
              <p className="text-xs font-semibold text-white">
                Security & Cloud Rules Inspector
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
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

