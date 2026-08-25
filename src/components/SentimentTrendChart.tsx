import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Smile,
  Calendar,
  Sparkles,
  ChevronRight,
  Filter,
  BarChart2,
  LineChart as LineChartIcon,
  HelpCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { JournalEntry, JournalMood } from '../types';

interface SentimentTrendChartProps {
  entries: JournalEntry[];
  onSelectEntry?: (entry: JournalEntry) => void;
}

// Mood baseline polarity mapping
const MOOD_POLARITY: Record<JournalMood, number> = {
  Grateful: 90,
  Energized: 85,
  Calm: 75,
  Focused: 65,
  Curious: 58,
  Thoughtful: 50,
  Anxious: 28
};

const MOOD_COLORS: Record<JournalMood, string> = {
  Grateful: '#10b981',   // emerald
  Energized: '#f59e0b',   // amber
  Calm: '#06b6d4',        // cyan
  Focused: '#6366f1',     // indigo
  Curious: '#8b5cf6',     // violet
  Thoughtful: '#a855f7',  // purple
  Anxious: '#f43f5e'      // rose
};

const POSITIVE_LEXICON = [
  'breakthrough', 'clarity', 'happy', 'success', 'grateful', 'gratitude',
  'peace', 'progress', 'growth', 'excited', 'inspired', 'confident',
  'joy', 'proud', 'accomplished', 'love', 'thrive', 'optimistic', 'calm',
  'solution', 'strength', 'ease', 'energized'
];

const STRESS_LEXICON = [
  'stressed', 'anxious', 'anxiety', 'doubt', 'fear', 'overwhelmed',
  'stuck', 'failure', 'tired', 'exhausted', 'conflict', 'uncertain',
  'uncertainty', 'worry', 'worried', 'frustrated', 'pressure', 'hard',
  'struggle', 'lost', 'lonely', 'sad', 'hesitant'
];

// Content sentiment evaluation algorithm
function computeContentSentimentScore(entry: JournalEntry): number {
  const baseMoodScore = entry.mood ? (MOOD_POLARITY[entry.mood] ?? 50) : 50;

  const fullText = (
    (entry.title || '') + ' ' +
    (entry.turns?.map((t) => t.content).join(' ') || '') + ' ' +
    (entry.summary?.executiveSummary || '')
  ).toLowerCase();

  const words = fullText.split(/\s+/).filter(Boolean);
  if (words.length === 0) return baseMoodScore;

  let positiveHits = 0;
  let stressHits = 0;

  for (const word of words) {
    const clean = word.replace(/[^a-z]/g, '');
    if (POSITIVE_LEXICON.includes(clean)) positiveHits++;
    if (STRESS_LEXICON.includes(clean)) stressHits++;
  }

  // Sentiment delta normalized to [-20, +20]
  const sentimentDelta = Math.min(20, Math.max(-20, (positiveHits - stressHits) * 3));
  const finalScore = Math.min(98, Math.max(10, baseMoodScore + sentimentDelta));

  return Math.round(finalScore);
}

export const SentimentTrendChart: React.FC<SentimentTrendChartProps> = ({
  entries,
  onSelectEntry
}) => {
  const [timeframe, setTimeframe] = useState<'all' | '30d' | '7d'>('all');
  const [selectedDataPoint, setSelectedDataPoint] = useState<any | null>(null);
  const [chartType, setChartType] = useState<'trend' | 'distribution'>('trend');

  // Filter entries chronologically (oldest to newest for trend line)
  const sortedEntries = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const now = Date.now();
    if (timeframe === '7d') {
      const cutOff = now - 7 * 24 * 60 * 60 * 1000;
      return sorted.filter((e) => new Date(e.createdAt).getTime() >= cutOff);
    }
    if (timeframe === '30d') {
      const cutOff = now - 30 * 24 * 60 * 60 * 1000;
      return sorted.filter((e) => new Date(e.createdAt).getTime() >= cutOff);
    }
    return sorted;
  }, [entries, timeframe]);

  // Data mapped for Recharts
  const chartData = useMemo(() => {
    return sortedEntries.map((entry, idx) => {
      const dateObj = new Date(entry.createdAt);
      const sentimentScore = computeContentSentimentScore(entry);
      const wordCount =
        entry.wordCount ||
        entry.turns?.reduce((acc, t) => acc + (t.content ? t.content.split(/\s+/).length : 0), 0) ||
        0;

      return {
        id: entry.id,
        index: idx + 1,
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        title: entry.title || 'Untitled Reflection',
        sentiment: sentimentScore,
        rawMood: entry.mood || 'Thoughtful',
        category: entry.category || 'Daily Reflection',
        wordCount,
        turnsCount: entry.turns?.length || 0,
        summary: entry.summary?.executiveSummary || entry.turns?.[0]?.content?.slice(0, 120) || '',
        entryRef: entry
      };
    });
  }, [sortedEntries]);

  // Mood frequency breakdown
  const moodDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      Grateful: 0,
      Energized: 0,
      Calm: 0,
      Focused: 0,
      Curious: 0,
      Thoughtful: 0,
      Anxious: 0
    };

    entries.forEach((e) => {
      const m = e.mood || 'Thoughtful';
      if (counts[m] !== undefined) counts[m]++;
      else counts[m] = 1;
    });

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([mood, count]) => ({
        mood,
        count,
        color: MOOD_COLORS[mood as JournalMood] || '#a855f7'
      }));
  }, [entries]);

  // Metric averages
  const averageSentiment = useMemo(() => {
    if (chartData.length === 0) return 50;
    const sum = chartData.reduce((acc, d) => acc + d.sentiment, 0);
    return Math.round(sum / chartData.length);
  }, [chartData]);

  const sentimentTrajectory = useMemo(() => {
    if (chartData.length < 2) return { label: 'Baseline Established', trend: 'neutral', delta: 0 };
    const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2));

    const avg1 = firstHalf.reduce((acc, d) => acc + d.sentiment, 0) / firstHalf.length;
    const avg2 = secondHalf.reduce((acc, d) => acc + d.sentiment, 0) / secondHalf.length;
    const delta = Math.round(avg2 - avg1);

    if (delta > 3) return { label: `+${delta} pts Emotional Rise`, trend: 'up', delta };
    if (delta < -3) return { label: `${delta} pts Deep Processing`, trend: 'down', delta };
    return { label: 'Emotional Equilibrium', trend: 'neutral', delta };
  }, [chartData]);

  if (entries.length === 0) {
    return (
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 text-center space-y-3">
        <Activity className="w-8 h-8 text-neutral-600 mx-auto" />
        <h3 className="text-sm font-bold text-neutral-300">Sentiment & Emotional Trend Mapping</h3>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          Start logging journal reflections and multi-turn inquiries. The analytical engine will chart your emotional polarity and mindset trajectory over time.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-6 space-y-5 shadow-xl"
      id="sentiment-analytics-container"
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-950 to-indigo-950 border border-purple-800/60 flex items-center justify-center text-purple-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Emotional & Sentiment Analytics
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                {entries.length} Reflections Analyzed
              </span>
            </h2>
            <p className="text-xs text-neutral-400">
              Heuristic sentiment mapping combining mindset states, lexical tone analysis, and reflection depth.
            </p>
          </div>
        </div>

        {/* Action / View Filters */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
          {/* Chart Mode Toggle */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setChartType('trend')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                chartType === 'trend'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              Trend Curve
            </button>
            <button
              onClick={() => setChartType('distribution')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                chartType === 'distribution'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Mood Distribution
            </button>
          </div>

          {/* Timeframe Filter */}
          {chartType === 'trend' && (
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs">
              {(['all', '30d', '7d'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    timeframe === tf
                      ? 'bg-neutral-800 text-purple-300 font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {tf === 'all' && 'All Time'}
                  {tf === '30d' && 'Last 30 Days'}
                  {tf === '7d' && 'Last 7 Days'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analytical KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Average Polarity */}
        <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Average Positivity Score
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white font-mono">{averageSentiment}</span>
            <span className="text-[10px] text-neutral-500 font-mono">/ 100</span>
          </div>
          <div className="text-[11px] text-neutral-400">
            {averageSentiment >= 70
              ? 'Consistently High Vitality'
              : averageSentiment >= 50
              ? 'Balanced Mindful State'
              : 'Processing Complex Friction'}
          </div>
        </div>

        {/* Metric 2: Trajectory Momentum */}
        <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Emotional Trajectory
          </div>
          <div className="flex items-center gap-1.5">
            {sentimentTrajectory.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
            {sentimentTrajectory.trend === 'down' && <TrendingDown className="w-4 h-4 text-amber-400" />}
            {sentimentTrajectory.trend === 'neutral' && <Activity className="w-4 h-4 text-purple-400" />}
            <span className="text-xs font-bold text-white truncate">{sentimentTrajectory.label}</span>
          </div>
          <div className="text-[11px] text-neutral-400">
            Based on historical inflection delta
          </div>
        </div>

        {/* Metric 3: Total Word Volume */}
        <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Reflected Word Volume
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {chartData.reduce((acc, d) => acc + d.wordCount, 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-400">
            Across {entries.length} reflections
          </div>
        </div>

        {/* Metric 4: Dominant Mindset */}
        <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Primary Mood Anchor
          </div>
          <div className="text-base font-bold text-purple-300 truncate">
            {moodDistribution[0]?.mood || 'Thoughtful'}
          </div>
          <div className="text-[11px] text-neutral-400">
            {moodDistribution[0]?.count || 0} entries logged
          </div>
        </div>
      </div>

      {/* Main Chart Canvas Area */}
      <div className="h-64 sm:h-72 w-full pt-2">
        {chartType === 'trend' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length > 0) {
                  setSelectedDataPoint(e.activePayload[0].payload);
                }
              }}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333ea" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#737373"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#262626' }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#737373"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#262626' }}
                ticks={[20, 40, 60, 80, 100]}
              />
              <ReferenceLine y={50} stroke="#525252" strokeDasharray="3 3" label={{ value: 'Neutral Baseline', fill: '#737373', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="sentiment"
                stroke="#a855f7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#sentimentGradient)"
                activeDot={{
                  r: 6,
                  fill: '#c084fc',
                  stroke: '#1e1b4b',
                  strokeWidth: 2,
                  onClick: (_, payload: any) => setSelectedDataPoint(payload.payload)
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={moodDistribution}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis
                dataKey="mood"
                stroke="#737373"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#262626' }}
              />
              <YAxis
                allowDecimals={false}
                stroke="#737373"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#262626' }}
              />
              <Tooltip content={<DistributionTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {moodDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Selected Data Point Detail Preview Banner */}
      <AnimatePresence>
        {selectedDataPoint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white truncate text-sm">
                    {selectedDataPoint.title}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50 text-[10px] font-semibold">
                    Mood: {selectedDataPoint.rawMood}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Score: {selectedDataPoint.sentiment}/100
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    {selectedDataPoint.fullDate}
                  </span>
                </div>
                <p className="text-neutral-300 line-clamp-1 text-[11px]">
                  {selectedDataPoint.summary || 'Click to view complete multi-turn reflection.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onSelectEntry && (
                  <button
                    onClick={() => onSelectEntry(selectedDataPoint.entryRef)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1.5 transition-all shadow"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open in Studio
                  </button>
                )}
                <button
                  onClick={() => setSelectedDataPoint(null)}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-900">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          Click any point along the timeline to inspect reflection specifics.
        </span>
        <span className="font-mono text-[10px]">
          Recharts 2.x &bull; Dynamic Lexical Analyzer
        </span>
      </div>
    </motion.div>
  );
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const moodColor = MOOD_COLORS[data.rawMood as JournalMood] || '#a855f7';

    return (
      <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl space-y-1.5 max-w-xs text-xs z-50">
        <div className="flex items-center justify-between gap-2 border-b border-neutral-800/80 pb-1 text-[10px] text-neutral-400">
          <span>{data.fullDate}</span>
          <span className="font-mono font-bold text-purple-400">Score: {data.sentiment}/100</span>
        </div>
        <div className="font-bold text-white text-xs line-clamp-1">{data.title}</div>
        <div className="flex items-center gap-2 text-[11px]">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: moodColor }}
          />
          <span className="text-neutral-300 font-medium">{data.rawMood}</span>
          <span className="text-neutral-500">&bull;</span>
          <span className="text-neutral-400">{data.category}</span>
        </div>
        <div className="text-[10px] text-neutral-500 font-mono">
          {data.wordCount} words &bull; {data.turnsCount} conversation turns
        </div>
      </div>
    );
  }
  return null;
};

// Distribution Tooltip
const DistributionTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg shadow-xl text-xs space-y-1">
        <div className="font-bold text-white flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
          <span>{data.mood}</span>
        </div>
        <div className="text-neutral-300 font-mono text-[11px]">
          {data.count} {data.count === 1 ? 'reflection' : 'reflections'}
        </div>
      </div>
    );
  }
  return null;
};
