import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  TrendingUp,
  Sparkles,
  Award,
  Calendar,
  BarChart3,
  Brain,
  Clock,
  Tag,
  CheckCircle2,
  RefreshCw,
  Compass,
  Download,
  Share2,
  Copy,
  Check,
  ChevronRight,
  BookOpen,
  Zap,
  Heart
} from 'lucide-react';
import { JournalEntry, WeeklyAISummary } from '../types';
import { calculateStreak } from '../utils/streak';
import { computePersonalAnalytics } from '../utils/analytics';
import { logAuditEvent } from '../utils/auditLogger';
import { useAuth } from '../context/AuthContext';

interface AnalyticsViewProps {
  entries: JournalEntry[];
  onOpenEntry: (entry: JournalEntry) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ entries, onOpenEntry }) => {
  const { user } = useAuth();
  const [isGeneratingWeekly, setIsGeneratingWeekly] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState<WeeklyAISummary | null>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('reflectai_cached_weekly_summary');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return null;
  });
  const [copied, setCopied] = useState(false);

  const streakData = useMemo(() => calculateStreak(entries), [entries]);
  const analytics = useMemo(() => computePersonalAnalytics(entries), [entries]);

  const handleGenerateWeeklySummary = async () => {
    if (entries.length === 0) return;
    setIsGeneratingWeekly(true);

    try {
      // Pick entries from the last 7-14 days
      const recentEntries = entries.slice(0, 10);
      const res = await fetch('/api/journal/weekly-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: recentEntries,
          userId: user?.uid
        })
      });

      if (!res.ok) throw new Error('Weekly summary failed');
      const data = await res.json();

      if (data.weeklySummary) {
        setWeeklySummary(data.weeklySummary);
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('reflectai_cached_weekly_summary', JSON.stringify(data.weeklySummary));
          }
        } catch {}

        await logAuditEvent({
          userId: user?.uid || 'anon',
          userEmail: user?.email,
          action: 'WEEKLY_AI_SUMMARY_GENERATED',
          category: 'AI_GENERATION',
          resource: `weeklySummaries/${data.weeklySummary.id}`,
          status: 'SUCCESS',
          details: `Synthesized ${recentEntries.length} reflection entries.`
        });
      }
    } catch (err: any) {
      console.error('Failed to generate weekly summary:', err);
    } finally {
      setIsGeneratingWeekly(false);
    }
  };

  const handleCopySummary = () => {
    if (!weeklySummary) return;
    const text = `# ✨ ReflectAI Weekly Mindfulness Synthesis
Week: ${weeklySummary.weekStartDate} to ${weeklySummary.weekEndDate}

## Executive Summary
${weeklySummary.executiveSummary}

## Emotional Trajectory
${weeklySummary.emotionalTrajectory}

## Key Breakthroughs
${weeklySummary.keyBreakthroughs.map((b) => `- ${b}`).join('\n')}

## Next Week Socratic Prompts
${weeklySummary.nextWeekPrompts.map((p) => `- ${p}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col p-4 lg:p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xl">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Mindfulness Analytics & Streaks
              <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60">
                {streakData.currentStreak} Day Streak
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Personal introspection insights, emotional trajectory, and weekly Gemini syntheses
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateWeeklySummary}
          disabled={isGeneratingWeekly || entries.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg transition-all"
        >
          {isGeneratingWeekly ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Synthesizing Week with Gemini...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Weekly AI Summary
            </>
          )}
        </button>
      </div>

      {/* Streak & Milestone Badges Hero */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Current Streak */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80 shadow-lg flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-neutral-400 font-medium">Current Streak</span>
            <div className="text-xl font-bold text-white flex items-baseline gap-1.5">
              {streakData.currentStreak}
              <span className="text-xs text-amber-400 font-normal">
                {streakData.currentStreak === 1 ? 'day' : 'consecutive days'}
              </span>
            </div>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80 shadow-lg flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-purple-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-neutral-400 font-medium">Longest Record</span>
            <div className="text-xl font-bold text-white flex items-baseline gap-1.5">
              {streakData.longestStreak}
              <span className="text-xs text-purple-400 font-normal">days record</span>
            </div>
          </div>
        </div>

        {/* Total Words */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80 shadow-lg flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-neutral-400 font-medium">Total Volume</span>
            <div className="text-xl font-bold text-white flex items-baseline gap-1.5">
              {analytics.totalWords.toLocaleString()}
              <span className="text-xs text-cyan-400 font-normal">words</span>
            </div>
          </div>
        </div>

        {/* Active Days */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80 shadow-lg flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-neutral-400 font-medium">Days Journaled</span>
            <div className="text-xl font-bold text-white flex items-baseline gap-1.5">
              {streakData.totalActiveDays}
              <span className="text-xs text-emerald-400 font-normal">total days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Streak Milestones Badges */}
      <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Mindfulness Journey Milestones & Badges
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {streakData.milestones.map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-xl border flex flex-col items-center text-center space-y-1.5 transition-all ${
                m.unlocked
                  ? 'bg-amber-950/20 border-amber-600/50 shadow-md shadow-amber-950/30'
                  : 'bg-neutral-950/60 border-neutral-800/60 opacity-50 grayscale'
              }`}
            >
              <div className="text-2xl">{m.badgeIcon}</div>
              <div className="text-xs font-semibold text-white leading-tight">{m.name}</div>
              <div className="text-[10px] text-amber-400 font-mono">
                {m.days} {m.days === 1 ? 'Day' : 'Days'}
              </div>
              {m.unlocked ? (
                <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Unlocked
                </span>
              ) : (
                <span className="text-[9px] text-neutral-500 font-mono">In Progress</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly AI Summary Card (if generated or available) */}
      {weeklySummary && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-purple-950/40 border border-purple-800/50 p-6 rounded-2xl shadow-xl space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Weekly AI Synthesis & Growth Trajectory</h3>
                <p className="text-xs text-neutral-400">
                  Synthesized for {weeklySummary.weekStartDate} — {weeklySummary.weekEndDate} ({weeklySummary.entryCount} entries)
                </p>
              </div>
            </div>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700 transition-colors self-start"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Markdown' : 'Copy Synthesis'}</span>
            </button>
          </div>

          {/* Synthesis Content */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1">
                Executive Synthesis
              </h4>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800">
                {weeklySummary.executiveSummary}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-1">
                Emotional Trajectory
              </h4>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800">
                {weeklySummary.emotionalTrajectory}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Breakthroughs */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Key Breakthroughs
                </h4>
                <ul className="text-xs text-neutral-300 space-y-1.5 list-disc list-inside">
                  {weeklySummary.keyBreakthroughs.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>

              {/* Next Week Prompts */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-800/40 space-y-2">
                <h4 className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" />
                  Tailored Socratic Questions for Next Week
                </h4>
                <ul className="text-xs text-neutral-300 space-y-1.5 list-disc list-inside">
                  {weeklySummary.nextWeekPrompts.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mood Breakdown & Analytics Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Distribution */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            Emotional Mood Distribution
          </h3>

          <div className="space-y-3">
            {analytics.moodPercentages.map((item) => (
              <div key={item.mood} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-neutral-200">{item.mood}</span>
                  <span className="text-neutral-400">{item.count} entries ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                  <div
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    className="h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}

            {analytics.moodPercentages.length === 0 && (
              <p className="text-xs text-neutral-500 text-center py-6">
                No mood data yet. Assign a mood to your reflections to see analytics here.
              </p>
            )}
          </div>
        </div>

        {/* Time of Day Rhythm */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Reflection Time-of-Day Rhythms
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1">
              <span className="text-xs text-neutral-400">🌅 Morning (5am - 12pm)</span>
              <div className="text-lg font-bold text-white">{analytics.timeOfDayCounts.morning}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1">
              <span className="text-xs text-neutral-400">☀️ Afternoon (12pm - 5pm)</span>
              <div className="text-lg font-bold text-white">{analytics.timeOfDayCounts.afternoon}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1">
              <span className="text-xs text-neutral-400">🌆 Evening (5pm - 10pm)</span>
              <div className="text-lg font-bold text-white">{analytics.timeOfDayCounts.evening}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1">
              <span className="text-xs text-neutral-400">🌙 Night (10pm - 5am)</span>
              <div className="text-lg font-bold text-white">{analytics.timeOfDayCounts.night}</div>
            </div>
          </div>

          {/* Top Tags */}
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-neutral-300 mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-purple-400" />
              Frequently Explored Themes
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {analytics.topTags.map((t) => (
                <span
                  key={t.tag}
                  className="px-2.5 py-1 rounded-lg bg-neutral-950 text-purple-300 border border-purple-900/40 text-xs font-medium"
                >
                  #{t.tag} <span className="text-neutral-500 text-[10px]">({t.count})</span>
                </span>
              ))}
              {analytics.topTags.length === 0 && (
                <span className="text-xs text-neutral-500">No tags added to reflections yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
