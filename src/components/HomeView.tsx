import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';
import { JournalEntry, AIMemory, JournalMood } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface HomeViewProps {
  entries: JournalEntry[];
  memories: AIMemory[];
  onStartReflection: (initialText?: string, initialMode?: 'write' | 'voice' | 'photo' | 'mood') => void;
  onOpenEntry: (entryId: string) => void;
  onNavigateTab: (tab: any) => void;
  onToggleFavorite?: (entryId: string, e: React.MouseEvent) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  entries,
  memories,
  onStartReflection,
  onOpenEntry,
  onNavigateTab,
  onToggleFavorite
}) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [quickThought, setQuickThought] = useState('');

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
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisWeekEntries = entries.filter((e) => new Date(e.createdAt) >= weekStart);
  
  // Calculate dominant mood & theme
  const moodCounts: Record<string, number> = {};
  thisWeekEntries.forEach((e) => {
    if (e.mood) {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    }
  });
  const dominantMood = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a])[0] || 'Thoughtful';

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
        targetTab: 'memories'
      };
    }

    if (topCategory && topCategory !== 'Daily Reflection') {
      return {
        title: 'Something You May Want to Notice',
        body: `You've frequently explored topics in ${topCategory} lately. Examining these recurring thoughts can reveal meaningful growth over time.`,
        actionLabel: 'Explore Pattern',
        targetTab: 'insights'
      };
    }

    return {
      title: 'Something You May Want to Notice',
      body: `You have logged ${entries.length} reflections. Notice how expressing your thoughts in writing brings clarity and intentionality to your days.`,
      actionLabel: 'Explore Insights',
      targetTab: 'insights'
    };
  };

  const insight = generateDynamicInsight();

  const handleStartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartReflection(quickThought, 'write');
  };

  const getMoodBadgeClass = (mood?: JournalMood) => {
    switch (mood) {
      case 'Calm':
        return isDark ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Energized':
        return isDark ? 'bg-amber-950/60 text-amber-300 border-amber-800/40' : 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Grateful':
        return isDark ? 'bg-pink-950/60 text-pink-300 border-pink-800/40' : 'bg-pink-50 text-pink-700 border-pink-200';
      case 'Focused':
        return isDark ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40' : 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Curious':
        return isDark ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/40' : 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Anxious':
        return isDark ? 'bg-rose-950/60 text-rose-300 border-rose-800/40' : 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return isDark ? 'bg-purple-950/60 text-purple-300 border-purple-800/40' : 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn" id="home-view-container">
      {/* 1. Header with personalized greeting */}
      <header className="space-y-1.5 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif tracking-tight font-medium text-[#1A1A1A] dark:text-[#F5F5F5]">
              {getGreeting()}, <span className="font-semibold text-[#76B900]">{displayName}</span>.
            </h1>
            <p className="text-sm text-[#333333] dark:text-neutral-400 mt-1">
              What would you like to reflect on today?
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('ask')}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#8BC34A] text-[#8BC34A] hover:bg-[#8BC34A]/10 text-xs font-semibold transition-all active:scale-95"
              id="btn-home-quick-ask"
            >
              <Search className="w-3.5 h-3.5 text-[#9C27B0]" />
              <span>Ask My Journal</span>
            </button>

            <button
              onClick={() => onStartReflection('', 'write')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F44336] hover:bg-[#D32F2F] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
              id="btn-home-quick-new"
            >
              <Plus className="w-4 h-4" />
              <span>Start Reflection</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Writing Prompt Trigger Card */}
      <section
        className={`rounded-2xl border transition-all p-5 sm:p-6 shadow-xs ${
          isDark
            ? 'bg-[#14171A] border-neutral-800/80 hover:border-[#76B900]/40'
            : 'bg-white border-neutral-200/80 hover:border-[#76B900]/40'
        }`}
        id="card-start-reflection"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#76B900]/15 flex items-center justify-center text-[#76B900]">
              <PenTool className="w-3.5 h-3.5 text-[#76B900]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#333333] dark:text-neutral-300">
              Start a reflection
            </span>
          </div>
          <span className="text-xs text-[#595959] dark:text-neutral-400 font-mono">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <form onSubmit={handleStartSubmit} className="space-y-4">
          <textarea
            value={quickThought}
            onChange={(e) => setQuickThought(e.target.value)}
            placeholder="What's on your mind? Capture a thought, feeling, or realization..."
            rows={3}
            className={`w-full p-3.5 rounded-xl text-sm border resize-none focus:outline-none transition-all ${
              isDark
                ? 'bg-[#0B0D0E] border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:border-[#76B900] focus:ring-1 focus:ring-[#76B900]/30'
                : 'bg-neutral-50 border-neutral-200 text-[#1A1A1A] placeholder-neutral-400 focus:border-[#76B900] focus:ring-1 focus:ring-[#76B900]/20'
            }`}
            id="input-home-quick-thought"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Quick Action Toolbar Icons with Semantic Colors */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => onStartReflection(quickThought, 'voice')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isDark
                    ? 'bg-[#111416] border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
                    : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/70'
                }`}
                title="Dictate with voice"
                id="btn-home-mode-voice"
              >
                <Mic className="w-3.5 h-3.5 text-[#17DBCF]" />
                <span>Voice</span>
              </button>

              <button
                type="button"
                onClick={() => onStartReflection(quickThought, 'photo')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isDark
                    ? 'bg-[#111416] border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
                    : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/70'
                }`}
                title="Capture photo or scan handwritten notes"
                id="btn-home-mode-photo"
              >
                <Camera className="w-3.5 h-3.5 text-[#2176FF]" />
                <span>Photo / Scan</span>
              </button>

              <button
                type="button"
                onClick={() => onStartReflection(quickThought, 'mood')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isDark
                    ? 'bg-[#111416] border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
                    : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/70'
                }`}
                title="Log current mood"
                id="btn-home-mode-mood"
              >
                <Smile className="w-3.5 h-3.5 text-[#F4B400]" />
                <span>Mood</span>
              </button>
            </div>

            {/* Primary Action Button (Red #F44336) */}
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F44336] hover:bg-[#D32F2F] text-white text-xs font-semibold transition-all shadow-xs active:scale-95 ml-auto"
              id="btn-home-begin-reflection"
            >
              <span>Begin Reflection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </section>

      {/* 3. Grid: Insight Card & Weekly Summary Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Insight Card: "Something You May Want to Notice" with AI accent #9C27B0 */}
        <div
          className={`p-5 sm:p-6 rounded-2xl border flex flex-col justify-between shadow-xs transition-all ${
            isDark
              ? 'bg-[#14171A] border-neutral-800/80 hover:border-[#9C27B0]/50'
              : 'bg-white border-neutral-200/80 hover:border-[#9C27B0]/50'
          }`}
          id="card-home-notice-insight"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#9C27B0]">
              <Sparkles className="w-4 h-4 text-[#9C27B0]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#333333] dark:text-neutral-200">
                {insight.title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#333333] dark:text-neutral-300 leading-relaxed">
              {insight.body}
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between">
            <span className="text-[11px] text-[#595959] dark:text-neutral-400">
              Based on your journal memory
            </span>
            <button
              onClick={() => onNavigateTab(insight.targetTab)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8BC34A] hover:underline"
              id="btn-home-explore-pattern"
            >
              <span>{insight.actionLabel}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Weekly Reflection Card (Reports Gray #595959 & Mood #F4B400) */}
        <div
          className={`p-5 sm:p-6 rounded-2xl border flex flex-col justify-between shadow-xs transition-all ${
            isDark
              ? 'bg-[#14171A] border-neutral-800/80 hover:border-neutral-700'
              : 'bg-white border-neutral-200/80 hover:border-neutral-300'
          }`}
          id="card-home-weekly-summary"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#595959] dark:text-neutral-300">
                <Calendar className="w-4 h-4 text-[#595959]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#333333] dark:text-neutral-200">
                  Your Week in Reflection
                </h2>
              </div>
              <span className="text-xs font-mono text-[#595959] dark:text-neutral-400">
                {thisWeekEntries.length} {thisWeekEntries.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#333333] dark:text-neutral-300 leading-relaxed">
              {thisWeekEntries.length > 0
                ? `You have logged ${thisWeekEntries.length} reflections this week with a dominant mood of "${dominantMood}". Consistency helps solidify mindful patterns.`
                : `No reflections logged yet this week. A short 3-minute reflection today will start your weekly synthesis.`}
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between">
            <span className="text-[11px] text-[#595959] dark:text-neutral-400">
              Dominant tone: <strong className="font-semibold text-[#F4B400]">{dominantMood}</strong>
            </span>
            <button
              onClick={() => onNavigateTab('insights')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8BC34A] hover:underline"
              id="btn-home-view-weekly-reflection"
            >
              <span>View Weekly Reflection</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Recent Entries Preview Section */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#595959] dark:text-neutral-300" />
            <h2 className="text-base font-serif font-semibold tracking-tight text-[#1A1A1A] dark:text-[#F5F5F5]">
              Recent Reflections
            </h2>
          </div>

          {entries.length > 0 && (
            <button
              onClick={() => onNavigateTab('journal')}
              className="text-xs font-semibold text-[#8BC34A] hover:underline inline-flex items-center gap-1"
              id="btn-home-view-all-reflections"
            >
              <span>View all ({entries.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentEntries.length === 0 ? (
          <div
            className={`p-8 text-center rounded-2xl border border-dashed ${
              isDark ? 'border-neutral-800 bg-[#111416]' : 'border-neutral-200 bg-neutral-50/70'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#76B900]/15 text-[#76B900] flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold mb-1 text-[#1A1A1A] dark:text-white">Your reflection journey begins here</h3>
            <p className="text-xs text-[#595959] dark:text-neutral-400 max-w-sm mx-auto mb-4">
              Write freely about your day, challenges, or goals. Gemini will offer empathetic, grounded reflections that connect across time.
            </p>
            <button
              onClick={() => onStartReflection('', 'write')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F44336] hover:bg-[#D32F2F] text-white text-xs font-semibold shadow-xs transition-all"
              id="btn-home-empty-first-reflection"
            >
              <Plus className="w-3.5 h-3.5" />
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
                  className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between group shadow-xs ${
                    isDark
                      ? 'bg-[#14171A] border-neutral-800/80 hover:border-[#76B900]/40 hover:bg-[#171A1C]'
                      : 'bg-white border-neutral-200/80 hover:border-[#76B900]/40 hover:bg-neutral-50/50'
                  }`}
                  id={`card-recent-entry-${entry.id}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#595959] dark:text-neutral-400 font-mono flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-[#595959]" />
                        {formattedDate}
                      </span>

                      <div className="flex items-center gap-2">
                        {entry.mood && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full border font-medium bg-[#F4B400]/10 text-[#c89200] dark:text-[#F4B400] border-[#F4B400]/30"
                          >
                            {entry.mood}
                          </span>
                        )}

                        {onToggleFavorite && (
                          <button
                            type="button"
                            onClick={(e) => onToggleFavorite(entry.id, e)}
                            className="text-neutral-400 hover:text-[#F4B400] transition-colors p-1"
                            title={entry.favorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                entry.favorite || entry.isPinned
                                  ? 'fill-[#F4B400] text-[#F4B400]'
                                  : 'text-neutral-400'
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold group-hover:text-[#76B900] transition-colors line-clamp-1 text-[#1A1A1A] dark:text-white">
                      {entry.title || 'Untitled Reflection'}
                    </h3>

                    <p className="text-xs text-[#333333] dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {previewText}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-[11px] text-[#595959] dark:text-neutral-400">
                    <span>
                      {entry.wordCount || previewText.split(/\s+/).filter(Boolean).length} words
                    </span>
                    {entry.ragReflection && (
                      <span className="inline-flex items-center gap-1 text-[#9C27B0] text-[10px] font-semibold">
                        <Sparkles className="w-3 h-3 text-[#9C27B0]" />
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
