import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  PenTool,
  Mic,
  Camera,
  MapPin,
  Smile,
  ArrowRight,
  Calendar,
  Clock,
  Star,
  ChevronRight,
  TrendingUp,
  Brain,
  Search,
  BookOpen,
  Compass,
  Plus,
  CheckCircle2,
  Sliders,
  Zap,
  Heart,
  Target,
  Flame,
  RotateCcw,
  Video,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';
import { JournalEntry, AIMemory, JournalMood, DailyCheckIn, GrowthGoal } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface HomeViewProps {
  entries: JournalEntry[];
  memories: AIMemory[];
  goals?: GrowthGoal[];
  onStartReflection: (initialText?: string, initialMode?: 'write' | 'voice' | 'photo' | 'mood') => void;
  onOpenEntry: (entryId: string) => void;
  onNavigateTab: (tab: any) => void;
  onToggleFavorite?: (entryId: string, e: React.MouseEvent) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  entries,
  memories,
  goals = [],
  onStartReflection,
  onOpenEntry,
  onNavigateTab,
  onToggleFavorite
}) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [quickThought, setQuickThought] = useState('');
  
  // Daily Check-In State (10-20 sec quick log)
  const [checkInMood, setCheckInMood] = useState<JournalMood>('Calm');
  const [checkInEnergy, setCheckInEnergy] = useState<number>(7);
  const [checkInStress, setCheckInStress] = useState<number>(3);
  const [checkInFocus, setCheckInFocus] = useState<number>(8);
  const [checkInMotivation, setCheckInMotivation] = useState<number>(7);
  const [gratitudeNote, setGratitudeNote] = useState('');
  const [checkInCompleted, setCheckInCompleted] = useState(false);
  const [showCheckInForm, setShowCheckInForm] = useState(true);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.displayName
    ? user.displayName.split(' ')[0]
    : user?.email
    ? user.email.split('@')[0]
    : 'Friend';

  // Recent entries (last 3-4)
  const recentEntries = entries.slice(0, 4);

  // This week's stats
  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 1000);
  const thisWeekEntries = entries.filter((e) => new Date(e.createdAt) >= weekStart);
  
  // Calculate dominant mood & theme
  const moodCounts: Record<string, number> = {};
  thisWeekEntries.forEach((e) => {
    if (e.mood) {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    }
  });
  const dominantMood = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a])[0] || 'Thoughtful';

  // Memory Resurfacing Card ("Five days ago, you wrote about...")
  const getResurfacingMemory = () => {
    if (entries.length === 0) return null;
    const targetDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    // Find entry close to 5 days ago or oldest entry
    const entryFiveDaysAgo = entries.find((e) => {
      const diffDays = Math.abs((now.getTime() - new Date(e.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 4 && diffDays <= 7;
    }) || (entries.length > 2 ? entries[entries.length - 1] : null);

    return entryFiveDaysAgo;
  };

  const resurfacedEntry = getResurfacingMemory();

  // Dynamic empathetic insight heuristic from existing data
  const generateDynamicInsight = () => {
    if (entries.length === 0) {
      return {
        title: 'Welcome to ReflectAI',
        body: 'Your thoughts are private and protected. Start with a short daily check-in to begin establishing your personal reflection baseline.',
        actionLabel: 'Write First Reflection',
        targetTab: 'journal'
      };
    }

    const categories = entries.map((e) => e.category);
    const categoryCount: Record<string, number> = {};
    categories.forEach((c) => {
      categoryCount[c] = (categoryCount[c] || 0) + 1;
    });
    const topCategory = Object.keys(categoryCount).sort((a, b) => categoryCount[b] - categoryCount[a])[0];

    if (memories.length > 0) {
      return {
        title: 'Something You May Want to Notice',
        body: `ReflectAI has retained context around your focus on "${memories[0].text}". Notice how your recent reflections continue to cultivate this awareness.`,
        actionLabel: 'Explore Memories',
        targetTab: 'ai_memories'
      };
    }

    if (topCategory && topCategory !== 'Daily Reflection') {
      return {
        title: 'Something You May Want to Notice',
        body: `You've frequently explored topics in ${topCategory} lately. Examining these recurring thoughts can reveal meaningful growth over time.`,
        actionLabel: 'Explore Pattern',
        targetTab: 'ai_reflection'
      };
    }

    return {
      title: 'Something You May Want to Notice',
      body: `You have logged ${entries.length} reflections. Notice how expressing your thoughts in writing brings clarity and intentionality to your days.`,
      actionLabel: 'Explore Insights',
      targetTab: 'ai_reflection'
    };
  };

  const insight = generateDynamicInsight();

  const handleStartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartReflection(quickThought, 'write');
  };

  const handleSaveCheckIn = (reflectAfter: boolean = false) => {
    setCheckInCompleted(true);
    if (reflectAfter) {
      const summaryText = `Daily Check-In: Feeling ${checkInMood} (Energy: ${checkInEnergy}/10, Stress: ${checkInStress}/10, Focus: ${checkInFocus}/10). ${gratitudeNote ? `Grateful for: ${gratitudeNote}` : ''}`;
      onStartReflection(summaryText, 'write');
    }
  };

  const moodsList: { label: JournalMood; emoji: string; color: string }[] = [
    { label: 'Calm', emoji: '🌿', color: '#10B981' },
    { label: 'Energized', emoji: '⚡', color: '#F59E0B' },
    { label: 'Focused', emoji: '🎯', color: '#6366F1' },
    { label: 'Grateful', emoji: '🌸', color: '#EC4899' },
    { label: 'Thoughtful', emoji: '✨', color: '#8B5CF6' },
    { label: 'Curious', emoji: '🔍', color: '#06B6D4' },
    { label: 'Anxious', emoji: '🌊', color: '#F43F5E' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn" id="home-view-container">
      {/* 1. Header with personalized greeting */}
      <header className="space-y-1.5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif tracking-tight font-medium text-[#F5F5F5]">
              {getGreeting()}, <span className="font-semibold text-[#76B900]">{displayName}</span>.
            </h1>
            <p className="text-sm text-[#BDBDBD] mt-1">
              Your personal sanctuary for mindful reflections, memories, and emotional clarity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('explore')}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#76B900] hover:bg-[#76B900]/10 text-[#76B900] text-xs font-semibold transition-all active:scale-95"
              id="btn-home-quick-ask"
            >
              <Search className="w-3.5 h-3.5 text-[#76B900]" />
              <span>Semantic Search</span>
            </button>

            <button
              onClick={() => onStartReflection('', 'write')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#76B900] hover:bg-[#86D100] active:bg-[#659E00] text-black text-xs font-bold shadow-[0_0_14px_rgba(118,185,0,0.3)] transition-all active:scale-95"
              id="btn-home-quick-new"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Start Reflection</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. ONE-TAP 10-20 SEC DAILY CHECK-IN CARD */}
      {showCheckInForm && !checkInCompleted && (
        <section
          className="rounded-2xl border border-[#262626] bg-[#111111] transition-all p-5 sm:p-6 shadow-xs hover:border-[#76B900]/40"
          id="card-daily-checkin"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#76B900]/15 flex items-center justify-center text-[#76B900]">
                <Heart className="w-4 h-4 text-[#76B900]" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#76B900] flex items-center gap-2">
                  Daily Check-In
                  <span className="text-[10px] text-[#FFD600] bg-[#FFD600]/15 px-2 py-0.5 rounded-full font-mono lowercase">
                    10–20 sec
                  </span>
                </h2>
                <p className="text-xs text-[#BDBDBD]">Capture your current baseline state in seconds</p>
              </div>
            </div>
            <button
              onClick={() => setShowCheckInForm(false)}
              className="text-xs text-[#BDBDBD] hover:text-[#F5F5F5] transition-colors"
            >
              Skip
            </button>
          </div>

          <div className="space-y-5">
            {/* Mood Selector Chips */}
            <div>
              <label className="block text-xs font-semibold text-[#BDBDBD] mb-2">
                Today's Mood
              </label>
              <div className="flex flex-wrap gap-2">
                {moodsList.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setCheckInMood(m.label)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      checkInMood === m.label
                        ? 'bg-[#76B900] text-black shadow-xs scale-105 font-bold'
                        : 'bg-[#151515] border border-[#262626] text-[#F5F5F5] hover:border-[#76B900]/40'
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Micro Sliders Grid: Energy, Stress, Focus, Motivation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#262626] space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#BDBDBD] flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#FFD600]" /> Energy
                  </span>
                  <span className="font-mono font-bold text-[#FFD600]">{checkInEnergy}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={checkInEnergy}
                  onChange={(e) => setCheckInEnergy(Number(e.target.value))}
                  className="w-full accent-[#76B900] cursor-pointer h-1.5 rounded bg-[#262626]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#262626] space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#BDBDBD] flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#FFD600]" /> Stress
                  </span>
                  <span className="font-mono font-bold text-[#FFD600]">{checkInStress}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={checkInStress}
                  onChange={(e) => setCheckInStress(Number(e.target.value))}
                  className="w-full accent-[#76B900] cursor-pointer h-1.5 rounded bg-[#262626]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#262626] space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#BDBDBD] flex items-center gap-1">
                    <Target className="w-3 h-3 text-[#76B900]" /> Focus
                  </span>
                  <span className="font-mono font-bold text-[#76B900]">{checkInFocus}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={checkInFocus}
                  onChange={(e) => setCheckInFocus(Number(e.target.value))}
                  className="w-full accent-[#76B900] cursor-pointer h-1.5 rounded bg-[#262626]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#262626] space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#BDBDBD] flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-[#76B900]" /> Motivation
                  </span>
                  <span className="font-mono font-bold text-[#76B900]">{checkInMotivation}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={checkInMotivation}
                  onChange={(e) => setCheckInMotivation(Number(e.target.value))}
                  className="w-full accent-[#76B900] cursor-pointer h-1.5 rounded bg-[#262626]"
                />
              </div>
            </div>

            {/* Gratitude Quick Note */}
            <div>
              <input
                type="text"
                value={gratitudeNote}
                onChange={(e) => setGratitudeNote(e.target.value)}
                placeholder="What is one small thing you are grateful for right now? (optional)"
                className="w-full px-3.5 py-2 rounded-xl text-xs border border-[#262626] bg-[#050505] text-[#F5F5F5] placeholder-[#888888] focus:outline-none focus:border-[#76B900] transition-all"
              />
            </div>

            {/* Actions: Save Check-in or Reflect */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-[#FFD600]">
                Log today's emotional weather to calibrate personal insights.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveCheckIn(false)}
                  className="px-4 py-2 rounded-xl bg-[#151515] hover:bg-[#202020] border border-[#262626] text-[#F5F5F5] text-xs font-semibold transition-all"
                  id="btn-save-checkin-only"
                >
                  Save Check-In
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCheckIn(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#76B900] hover:bg-[#86D100] active:bg-[#659E00] text-black text-xs font-bold shadow-xs transition-all active:scale-95"
                  id="btn-save-checkin-and-reflect"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Reflect on Check-In</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {checkInCompleted && (
        <div className="p-4 rounded-2xl bg-[#111111] border border-[#76B900]/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-[#F5F5F5]">
            <CheckCircle2 className="w-4 h-4 text-[#76B900] shrink-0" />
            <span>Today's check-in logged: <strong className="text-[#76B900]">{checkInMood}</strong> (Energy: {checkInEnergy}/10, Stress: {checkInStress}/10).</span>
          </div>
          <button
            onClick={() => { setCheckInCompleted(false); setShowCheckInForm(true); }}
            className="text-[11px] text-[#FFD600] hover:underline font-semibold"
          >
            Edit Check-In
          </button>
        </div>
      )}

      {/* 3. Main Writing Prompt Trigger Card */}
      <section
        className="rounded-2xl border border-[#262626] bg-[#111111] transition-all p-5 sm:p-6 shadow-xs hover:border-[#76B900]/40"
        id="card-start-reflection"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#76B900]/15 flex items-center justify-center text-[#76B900]">
              <PenTool className="w-3.5 h-3.5 text-[#76B900]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#76B900]">
              Start a reflection
            </span>
          </div>
          <span className="text-xs text-[#FFD600] font-mono">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <form onSubmit={handleStartSubmit} className="space-y-4">
          <textarea
            value={quickThought}
            onChange={(e) => setQuickThought(e.target.value)}
            placeholder="What's on your mind? Capture a thought, feeling, or realization..."
            rows={3}
            className="w-full p-3.5 rounded-xl text-sm border border-[#262626] bg-[#0A0A0A] text-[#F5F5F5] placeholder-[#888888] resize-none focus:outline-none focus:border-[#76B900] focus:ring-1 focus:ring-[#76B900]/30 transition-all"
            id="input-home-quick-thought"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Quick Action Toolbar Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => onStartReflection(quickThought, 'voice')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#262626] bg-[#151515] text-[#F5F5F5] hover:text-[#76B900] hover:border-[#76B900]/40 transition-colors"
                title="Dictate with voice"
                id="btn-home-mode-voice"
              >
                <Mic className="w-3.5 h-3.5 text-[#76B900]" />
                <span>Voice</span>
              </button>

              <button
                type="button"
                onClick={() => onStartReflection(quickThought, 'photo')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#262626] bg-[#151515] text-[#F5F5F5] hover:text-[#76B900] hover:border-[#76B900]/40 transition-colors"
                title="Capture photo or scan handwritten notes"
                id="btn-home-mode-photo"
              >
                <Camera className="w-3.5 h-3.5 text-[#76B900]" />
                <span>Photo / Scan</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('memories')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#262626] bg-[#151515] text-[#F5F5F5] hover:text-[#76B900] hover:border-[#76B900]/40 transition-colors"
                title="Record video journal"
                id="btn-home-mode-video"
              >
                <Video className="w-3.5 h-3.5 text-[#FFD600]" />
                <span>Video Memory</span>
              </button>
            </div>

            {/* Primary Action Button (Green #76B900) */}
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#76B900] hover:bg-[#86D100] active:bg-[#659E00] text-black text-xs font-bold transition-all shadow-[0_0_14px_rgba(118,185,0,0.3)] active:scale-95 ml-auto"
              id="btn-home-begin-reflection"
            >
              <span>Begin Reflection</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        </form>
      </section>

      {/* 4. MEMORY RESURFACING CARD */}
      {resurfacedEntry && (
        <div
          className="p-5 sm:p-6 rounded-2xl border border-[#262626] bg-[#111111] transition-all hover:border-[#76B900]/40"
          id="card-memory-resurfacing"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[#76B900]">
              <RotateCcw className="w-4 h-4 text-[#76B900]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#76B900]">
                Memory Resurfacing • Reflection Prompt
              </span>
            </div>
            <span className="text-xs font-mono text-[#FFD600]">
              {new Date(resurfacedEntry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <p className="text-sm font-medium text-[#F5F5F5] mb-1">
            "{resurfacedEntry.title || 'Past Reflection'}"
          </p>
          <p className="text-xs text-[#BDBDBD] line-clamp-2 leading-relaxed mb-4">
            {resurfacedEntry.content || (resurfacedEntry.turns?.[0]?.content || '')}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#262626]">
            <span className="text-xs text-[#FFD600]">
              Five days ago, you wrote about this. How is it going now?
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenEntry(resurfacedEntry.id)}
                className="text-xs text-[#BDBDBD] hover:text-[#76B900] underline font-medium"
              >
                Read Entry
              </button>
              <button
                onClick={() => onStartReflection(`Following up on my reflection from ${new Date(resurfacedEntry.createdAt).toLocaleDateString()}: "${resurfacedEntry.title}"\n\nHow things stand now: `, 'write')}
                className="px-3 py-1.5 rounded-xl bg-[#76B900] hover:bg-[#86D100] text-black text-xs font-bold shadow-xs transition-all"
              >
                Reflect on this Memory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Grid: Insight Card & Weekly Summary Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Insight Card */}
        <div
          className="p-5 sm:p-6 rounded-2xl border border-[#262626] bg-[#111111] flex flex-col justify-between shadow-xs transition-all hover:border-[#76B900]/50"
          id="card-home-notice-insight"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#76B900]">
              <Sparkles className="w-4 h-4 text-[#76B900]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#76B900]">
                {insight.title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#F5F5F5] leading-relaxed">
              {insight.body}
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-[#262626] flex items-center justify-between">
            <span className="text-[11px] text-[#FFD600]">
              Based on your journal memory
            </span>
            <button
              onClick={() => onNavigateTab(insight.targetTab)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#76B900] hover:underline"
              id="btn-home-explore-pattern"
            >
              <span>{insight.actionLabel}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Weekly Reflection Card */}
        <div
          className="p-5 sm:p-6 rounded-2xl border border-[#262626] bg-[#111111] flex flex-col justify-between shadow-xs transition-all hover:border-[#76B900]/50"
          id="card-home-weekly-summary"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#76B900]">
                <Calendar className="w-4 h-4 text-[#76B900]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#76B900]">
                  Your Week in Reflection
                </h2>
              </div>
              <span className="text-xs font-mono text-[#FFD600]">
                {thisWeekEntries.length} {thisWeekEntries.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#F5F5F5] leading-relaxed">
              {thisWeekEntries.length > 0
                ? `You have logged ${thisWeekEntries.length} reflections this week with a dominant mood of "${dominantMood}". Consistency helps solidify mindful patterns.`
                : `No reflections logged yet this week. A short 3-minute reflection today will start your weekly synthesis.`}
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-[#262626] flex items-center justify-between">
            <span className="text-[11px] text-[#FFD600]">
              Dominant tone: <strong className="font-semibold text-[#76B900]">{dominantMood}</strong>
            </span>
            <button
              onClick={() => onNavigateTab('growth')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#76B900] hover:underline"
              id="btn-home-view-weekly-reflection"
            >
              <span>View Growth & Reviews</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Active Goals Preview */}
      {goals.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#76B900]" />
              <h2 className="text-sm font-semibold text-[#76B900]">Current Goals</h2>
            </div>
            <button
              onClick={() => onNavigateTab('growth')}
              className="text-xs font-semibold text-[#76B900] hover:underline"
            >
              Manage Goals ({goals.length})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goals.slice(0, 2).map((goal) => (
              <div
                key={goal.id}
                className="p-4 rounded-xl border border-[#262626] bg-[#111111] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#F5F5F5]">{goal.name}</span>
                  <span className="text-xs font-mono text-[#76B900]">{goal.progressPercent}%</span>
                </div>
                <div className="w-full bg-[#1C1C1C] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#76B900] h-full rounded-full transition-all"
                    style={{ width: `${goal.progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#BDBDBD] line-clamp-1">{goal.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Recent Entries Preview Section */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#76B900]" />
            <h2 className="text-base font-serif font-semibold tracking-tight text-[#76B900]">
              Recent Reflections
            </h2>
          </div>

          {entries.length > 0 && (
            <button
              onClick={() => onNavigateTab('journal')}
              className="text-xs font-semibold text-[#76B900] hover:underline inline-flex items-center gap-1"
              id="btn-home-view-all-reflections"
            >
              <span>View all ({entries.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentEntries.length === 0 ? (
          <div
            className="p-8 text-center rounded-2xl border border-dashed border-[#262626] bg-[#111111]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#76B900]/15 text-[#76B900] flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-5 h-5 text-[#76B900]" />
            </div>
            <h3 className="text-sm font-semibold mb-1 text-[#F5F5F5]">Your reflection journey begins here</h3>
            <p className="text-xs text-[#BDBDBD] max-w-sm mx-auto mb-4">
              Write freely about your day, challenges, or goals. Gemini will offer empathetic, grounded reflections that connect across time.
            </p>
            <button
              onClick={() => onStartReflection('', 'write')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#76B900] hover:bg-[#86D100] active:bg-[#659E00] text-black text-xs font-bold shadow-[0_0_12px_rgba(118,185,0,0.25)] transition-all"
              id="btn-home-empty-first-reflection"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              Start Reflection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentEntries.map((entry) => {
              const previewText =
                entry.content ||
                (entry.turns && entry.turns.length > 0
                  ? entry.turns.map((t) => t.content).join(' ')
                  : 'Empty reflection');
              const formattedDate = new Date(entry.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div
                  key={entry.id}
                  onClick={() => onOpenEntry(entry.id)}
                  className="p-4 sm:p-5 rounded-2xl border border-[#262626] bg-[#111111] cursor-pointer transition-all flex flex-col justify-between group shadow-xs hover:border-[#76B900]/40 hover:bg-[#151515]"
                  id={`card-recent-entry-${entry.id}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#FFD600] font-mono flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-[#FFD600]" />
                        {formattedDate}
                      </span>

                      <div className="flex items-center gap-2">
                        {entry.mood && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full border font-medium bg-[#FFD600]/10 text-[#FFD600] border-[#FFD600]/30"
                          >
                            {entry.mood}
                          </span>
                        )}

                        {onToggleFavorite && (
                          <button
                            type="button"
                            onClick={(e) => onToggleFavorite(entry.id, e)}
                            className="text-[#BDBDBD] hover:text-[#FFD600] transition-colors p-1"
                            title={entry.favorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                entry.favorite || entry.isPinned
                                    ? 'fill-[#FFD600] text-[#FFD600]'
                                    : 'text-[#BDBDBD]'
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold group-hover:text-[#76B900] transition-colors line-clamp-1 text-[#F5F5F5]">
                      {entry.title || 'Untitled Reflection'}
                    </h3>

                    <p className="text-xs text-[#BDBDBD] line-clamp-2 leading-relaxed">
                      {previewText}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#262626] flex items-center justify-between text-[11px] text-[#FFD600]">
                    <span>
                      {entry.wordCount || previewText.split(/\s+/).filter(Boolean).length} words
                    </span>
                    {entry.ragReflection && (
                      <span className="inline-flex items-center gap-1 text-[#76B900] text-[10px] font-semibold">
                        <Sparkles className="w-3 h-3 text-[#76B900]" />
                        Reflected
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
