import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  Check,
  ChevronRight,
  Brain,
  Quote,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Bookmark,
  Calendar,
  AlertCircle,
  Clock
} from 'lucide-react';
import { JournalEntry, AIMemory, UserWrittenLifeSection, LifeIntelligenceSectionKey, AskJournalCitation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface LifeIntelCoreCardsProps {
  entries: JournalEntry[];
  memories: AIMemory[];
  onOpenEntry?: (entryId: string) => void;
  onSaveMemory?: (memoryText: string, category?: string) => Promise<void> | void;
}

interface CoreCardConfig {
  key: LifeIntelligenceSectionKey;
  title: string;
  subtitle: string;
  placeholder: string;
  iconColor: string;
  badge: string;
}

const CARDS_CONFIG: CoreCardConfig[] = [
  {
    key: 'whatMattersToMe',
    title: 'What Matters to Me',
    subtitle: 'Your core values, primary priorities, and non-negotiables',
    placeholder: 'Write what truly matters to you in your life, relationships, and work right now...',
    iconColor: '#76B900',
    badge: 'Core Values'
  },
  {
    key: 'whatEnergizesMe',
    title: 'What Energizes Me',
    subtitle: 'Activities, conversations, and states that generate genuine enthusiasm and flow',
    placeholder: 'Write what gives you energy, excites you, or makes you feel most alive...',
    iconColor: '#F4B400',
    badge: 'Energy Givers'
  },
  {
    key: 'whatDrainsMe',
    title: 'What Drains Me',
    subtitle: 'Friction points, repetitive distractions, and cognitive overload triggers',
    placeholder: 'Write what drains your mental energy, exhausts your patience, or creates friction...',
    iconColor: '#E91E63',
    badge: 'Friction & Drains'
  },
  {
    key: 'recurringPatterns',
    title: 'My Recurring Patterns',
    subtitle: 'Habits, emotional loops, and behavioral tendencies you have noticed in yourself',
    placeholder: 'Write any recurring patterns or habits you notice in how you work, react, or live...',
    iconColor: '#9C27B0',
    badge: 'Behavioral Loops'
  },
  {
    key: 'biggestLessons',
    title: 'My Biggest Lessons',
    subtitle: 'Enduring realizations and wisdom crystallized from your experiences',
    placeholder: 'Write the most important lessons or principles life has taught you so far...',
    iconColor: '#00BCD4',
    badge: 'Realizations'
  },
  {
    key: 'whatChangedRecently',
    title: 'What Changed Recently',
    subtitle: 'Shifts in your mindset, priorities, lifestyle, or perspective over the recent months',
    placeholder: 'Write what feels noticeably different about you or your approach lately...',
    iconColor: '#4CAF50',
    badge: 'Evolving Mindset'
  }
];

export const LifeIntelCoreCards: React.FC<LifeIntelCoreCardsProps> = ({
  entries,
  memories,
  onOpenEntry,
  onSaveMemory
}) => {
  const { user } = useAuth();
  const [sections, setSections] = useState<Record<LifeIntelligenceSectionKey, UserWrittenLifeSection>>({
    whatMattersToMe: { id: 'whatMattersToMe', userId: user?.uid || '', sectionKey: 'whatMattersToMe', userText: '', updatedAt: '' },
    whatEnergizesMe: { id: 'whatEnergizesMe', userId: user?.uid || '', sectionKey: 'whatEnergizesMe', userText: '', updatedAt: '' },
    whatDrainsMe: { id: 'whatDrainsMe', userId: user?.uid || '', sectionKey: 'whatDrainsMe', userText: '', updatedAt: '' },
    recurringPatterns: { id: 'recurringPatterns', userId: user?.uid || '', sectionKey: 'recurringPatterns', userText: '', updatedAt: '' },
    biggestLessons: { id: 'biggestLessons', userId: user?.uid || '', sectionKey: 'biggestLessons', userText: '', updatedAt: '' },
    whatChangedRecently: { id: 'whatChangedRecently', userId: user?.uid || '', sectionKey: 'whatChangedRecently', userText: '', updatedAt: '' }
  });

  const [activeCardKey, setActiveCardKey] = useState<LifeIntelligenceSectionKey>('whatMattersToMe');
  const [isReflecting, setIsReflecting] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [savedMemoryId, setSavedMemoryId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved sections from Firestore / localStorage
  useEffect(() => {
    if (!user?.uid) return;

    const loadSections = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'life_intel', 'core_sections');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setSections((prev) => ({ ...prev, ...data }));
        } else {
          // Check localStorage fallback
          const local = localStorage.getItem(`reflectai_life_core_${user.uid}`);
          if (local) {
            setSections(JSON.parse(local));
          }
        }
      } catch (err) {
        console.warn('Could not read from Firestore, checking localStorage:', err);
        const local = localStorage.getItem(`reflectai_life_core_${user.uid}`);
        if (local) {
          try {
            setSections(JSON.parse(local));
          } catch {}
        }
      }
    };

    loadSections();
  }, [user?.uid]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTextChange = (key: LifeIntelligenceSectionKey, text: string) => {
    setSections((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        userText: text,
        updatedAt: new Date().toISOString()
      }
    }));
  };

  const handleSaveText = async (key: LifeIntelligenceSectionKey) => {
    if (!user?.uid) return;
    setIsSaving((prev) => ({ ...prev, [key]: true }));

    const updated = {
      ...sections[key],
      userText: sections[key].userText,
      updatedAt: new Date().toISOString()
    };

    const newSections = { ...sections, [key]: updated };
    setSections(newSections);

    try {
      localStorage.setItem(`reflectai_life_core_${user.uid}`, JSON.stringify(newSections));
      const docRef = doc(db, 'users', user.uid, 'life_intel', 'core_sections');
      await setDoc(docRef, newSections, { merge: true });
      showToast('Reflection notes saved securely.');
    } catch (err) {
      console.error('Save error:', err);
      showToast('Saved locally.');
    } finally {
      setIsSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleReflectWithGemini = async (key: LifeIntelligenceSectionKey) => {
    setIsReflecting((prev) => ({ ...prev, [key]: true }));

    try {
      const res = await fetch('/api/ai/life-intelligence/reflect-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionKey: key,
          userText: sections[key].userText,
          entries,
          memories,
          personaId: 'balanced'
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      const updatedSection: UserWrittenLifeSection = {
        ...sections[key],
        whatINotice: data.whatINotice,
        aiObservation: data.whatYourJournalSuggests,
        evidence: data.supportingEvidence || [],
        questionToConsider: data.questionToConsider,
        possibleNextStep: data.possibleNextStep,
        suggestedMemory: data.suggestedMemory,
        lastReflectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const newSections = { ...sections, [key]: updatedSection };
      setSections(newSections);

      if (user?.uid) {
        localStorage.setItem(`reflectai_life_core_${user.uid}`, JSON.stringify(newSections));
        try {
          const docRef = doc(db, 'users', user.uid, 'life_intel', 'core_sections');
          await setDoc(docRef, newSections, { merge: true });
        } catch {}
      }

      showToast('Gemini reflection synthesized with journal evidence.');
    } catch (err: any) {
      console.error('Reflection error:', err);
      showToast('Could not complete reflection. Please try again.');
    } finally {
      setIsReflecting((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleRememberThis = async (key: LifeIntelligenceSectionKey, statement: string) => {
    if (!statement || !statement.trim()) return;
    try {
      if (onSaveMemory) {
        await onSaveMemory(statement.trim(), 'Mindset');
      }
      setSavedMemoryId(key);
      showToast('Remembered! Stored permanently in your AI Memory Vault.');
      setTimeout(() => setSavedMemoryId(null), 3000);
    } catch (err) {
      showToast('Could not save to Memory Vault.');
    }
  };

  const activeConfig = CARDS_CONFIG.find((c) => c.key === activeCardKey) || CARDS_CONFIG[0];
  const activeSection = sections[activeCardKey];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#1F2428] border border-[#76B900] text-white rounded-xl shadow-xl animate-fade-in text-sm font-medium">
          <Sparkles className="w-4 h-4 text-[#76B900]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Intro Header */}
      <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#76B900]/10 text-[#76B900] border border-[#76B900]/20">
                Personal Understanding Engine
              </span>
              <span className="text-xs text-neutral-500 font-mono">User-Controlled Knowledge</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Life Intelligence Core
            </h2>
            <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Understand what drives you, what drains you, and how your mindset is evolving. Write your thoughts, ask Gemini to surface evidence from your authentic journal entries, and choose which insights to preserve as personal memories.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-neutral-400 bg-[#181B1E] px-3 py-1.5 rounded-lg border border-[#1F2428]">
              {entries.length} Entries Analyzed
            </span>
          </div>
        </div>
      </div>

      {/* 6 Core Cards Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CARDS_CONFIG.map((cfg) => {
          const isSelected = activeCardKey === cfg.key;
          const section = sections[cfg.key];
          const hasReflection = !!section.aiObservation || !!section.whatINotice;
          const hasUserText = !!section.userText && section.userText.trim().length > 0;

          return (
            <button
              key={cfg.key}
              onClick={() => setActiveCardKey(cfg.key)}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[108px] ${
                isSelected
                  ? 'bg-[#181B1E] border-[#76B900] shadow-[0_0_15px_rgba(118,185,0,0.15)] ring-1 ring-[#76B900]/50'
                  : 'bg-[#121517] border-[#1F2428] hover:border-neutral-700 hover:bg-[#16181B]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cfg.iconColor }}
                  />
                  {hasReflection && (
                    <span className="flex items-center gap-1 text-[10px] text-[#76B900] font-bold bg-[#76B900]/10 px-1.5 py-0.5 rounded">
                      <Sparkles className="w-2.5 h-2.5" />
                      Reflected
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-white line-clamp-1 leading-snug">
                  {cfg.title}
                </h4>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                <span>{hasUserText ? 'Drafted' : 'Empty'}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-[#76B900] translate-x-0.5' : 'text-neutral-600'}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Section Interactive Workspace */}
      <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Active Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1F2428]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activeConfig.iconColor }}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                {activeConfig.badge}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">{activeConfig.title}</h3>
            <p className="text-xs sm:text-sm text-neutral-400">{activeConfig.subtitle}</p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleSaveText(activeCardKey)}
              disabled={isSaving[activeCardKey]}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181B1E] hover:bg-[#22272B] text-neutral-200 hover:text-white border border-[#1F2428] text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-neutral-400" />
              <span>{isSaving[activeCardKey] ? 'Saving...' : 'Save Draft'}</span>
            </button>

            <button
              onClick={() => handleReflectWithGemini(activeCardKey)}
              disabled={isReflecting[activeCardKey]}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black text-xs font-bold shadow-[0_0_15px_rgba(118,185,0,0.2)] transition-all active:scale-95 disabled:opacity-50"
            >
              {isReflecting[activeCardKey] ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-black" />
                  <span>Reflect with Gemini</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* User Written Input Block */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <label className="font-semibold flex items-center gap-1.5 text-neutral-300">
              <span>My Authentic Reflection</span>
              <span className="text-[11px] text-neutral-500 font-normal">(User-authored thoughts)</span>
            </label>
            {activeSection.updatedAt && (
              <span className="text-[11px] text-neutral-500 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated {new Date(activeSection.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <textarea
            value={activeSection.userText}
            onChange={(e) => handleTextChange(activeCardKey, e.target.value)}
            placeholder={activeConfig.placeholder}
            rows={4}
            className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#76B900] focus:ring-1 focus:ring-[#76B900] rounded-xl p-4 text-sm text-neutral-200 placeholder-neutral-600 resize-none transition-all outline-none leading-relaxed font-sans"
          />
        </div>

        {/* Gemini Grounded Synthesis Output */}
        {isReflecting[activeCardKey] && (
          <div className="p-8 rounded-2xl bg-[#0B0D0E] border border-[#1F2428] flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
            <Brain className="w-8 h-8 text-[#76B900] animate-bounce" />
            <h4 className="text-sm font-bold text-white">Analyzing Journal Corpus with Gemini...</h4>
            <p className="text-xs text-neutral-500 max-w-md">
              Cross-referencing your written thoughts with authentic journal entries to surface recurring patterns and supporting evidence.
            </p>
          </div>
        )}

        {!isReflecting[activeCardKey] && (activeSection.whatINotice || activeSection.aiObservation) && (
          <div className="space-y-5 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#76B900] font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Gemini Grounded Perspective
              </h4>
              {activeSection.lastReflectedAt && (
                <span className="text-[11px] text-neutral-500 font-mono">
                  Synthesized {new Date(activeSection.lastReflectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            {/* What I Notice */}
            {activeSection.whatINotice && (
              <div className="p-4 rounded-xl bg-[#0B0D0E] border border-[#1F2428] space-y-1.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-[#76B900]" />
                  <span>What I Notice</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-serif italic">
                  "{activeSection.whatINotice}"
                </p>
              </div>
            )}

            {/* What Your Journal Suggests */}
            {activeSection.aiObservation && (
              <div className="p-4 rounded-xl bg-[#0B0D0E] border border-[#1F2428] space-y-1.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Quote className="w-3.5 h-3.5 text-[#00BCD4]" />
                  <span>What Your Journal Suggests</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {activeSection.aiObservation}
                </p>
              </div>
            )}

            {/* Supporting Evidence Citations */}
            {activeSection.evidence && activeSection.evidence.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-neutral-400 font-mono uppercase tracking-wider">
                  Supporting Journal Evidence ({activeSection.evidence.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeSection.evidence.map((ev, idx) => (
                    <div
                      key={idx}
                      onClick={() => ev.entryId && onOpenEntry && onOpenEntry(ev.entryId)}
                      className="p-3 rounded-xl bg-[#0B0D0E] border border-[#1F2428] hover:border-neutral-600 transition-colors text-left space-y-1 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                        <span className="text-neutral-400 font-medium group-hover:text-[#76B900] line-clamp-1">
                          {ev.title || 'Journal Entry'}
                        </span>
                        <span>{ev.date}</span>
                      </div>
                      <p className="text-xs text-neutral-400 line-clamp-2 italic">
                        "{ev.excerpt}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Question to Consider & Possible Next Step */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSection.questionToConsider && (
                <div className="p-4 rounded-xl bg-[#16191C] border border-[#1F2428] space-y-1.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-[#F4B400]" />
                    <span>Question to Consider</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 italic">
                    {activeSection.questionToConsider}
                  </p>
                </div>
              )}

              {activeSection.possibleNextStep && (
                <div className="p-4 rounded-xl bg-[#16191C] border border-[#1F2428] space-y-1.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-[#76B900]" />
                    <span>Possible Next Step</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300">
                    {activeSection.possibleNextStep}
                  </p>
                </div>
              )}
            </div>

            {/* User-Controlled "Remember this" Confirmation */}
            {activeSection.suggestedMemory && (
              <div className="p-4 rounded-xl bg-[#181B1E] border border-[#76B900]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#76B900]">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>User-Controlled Memory Candidate</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-200 font-medium">
                    "{activeSection.suggestedMemory}"
                  </p>
                </div>
                <button
                  onClick={() => handleRememberThis(activeCardKey, activeSection.suggestedMemory || '')}
                  disabled={savedMemoryId === activeCardKey}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    savedMemoryId === activeCardKey
                      ? 'bg-[#76B900] text-black'
                      : 'bg-[#76B900]/20 hover:bg-[#76B900]/30 text-[#76B900] border border-[#76B900]/40'
                  }`}
                >
                  {savedMemoryId === activeCardKey ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Remembered!</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Remember This Statement</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {!isReflecting[activeCardKey] && !activeSection.whatINotice && !activeSection.aiObservation && (
          <div className="p-6 rounded-xl bg-[#0B0D0E] border border-[#1F2428] text-center space-y-2">
            <p className="text-xs sm:text-sm text-neutral-400">
              Click <strong className="text-white">"Reflect with Gemini"</strong> to cross-reference your thoughts with your journal corpus and uncover evidence-backed patterns.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
