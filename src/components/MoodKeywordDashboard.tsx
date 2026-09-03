import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Activity,
  Smile,
  Hash,
  Calendar,
  Sparkles,
  BarChart2,
  LineChart as LineChartIcon,
  Filter,
  Layers,
  ChevronRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import { JournalEntry, JournalMood } from '../types';

interface MoodKeywordDashboardProps {
  entries: JournalEntry[];
  onSelectEntry?: (entry: JournalEntry) => void;
}

// Mood polarity baseline values (0 to 100)
const MOOD_SCORES: Record<JournalMood, number> = {
  Grateful: 92,
  Energized: 86,
  Calm: 78,
  Focused: 68,
  Curious: 62,
  Thoughtful: 52,
  Anxious: 30
};

const MOOD_COLORS: Record<JournalMood, string> = {
  Grateful: '#10B981',   // Emerald
  Energized: '#F59E0B',   // Amber
  Calm: '#06B6D4',        // Cyan
  Focused: '#6366F1',     // Indigo
  Curious: '#8B5CF6',     // Purple
  Thoughtful: '#EC4899',  // Pink
  Anxious: '#F43F5E'      // Rose
};

// Common stopwords to exclude from keyword extraction
const STOP_WORDS = new Set([
  'about', 'after', 'again', 'against', 'all', 'also', 'and', 'another', 'any', 'are', 'around',
  'back', 'because', 'been', 'before', 'being', 'between', 'both', 'but', 'came', 'can',
  'come', 'could', 'day', 'did', 'does', 'down', 'each', 'even', 'first', 'for', 'from',
  'get', 'give', 'good', 'great', 'had', 'has', 'have', 'having', 'her', 'here', 'him',
  'his', 'how', 'into', 'its', 'just', 'know', 'like', 'make', 'many', 'may', 'more',
  'most', 'much', 'must', 'new', 'not', 'now', 'off', 'only', 'our', 'out', 'over',
  'own', 'part', 'people', 'said', 'same', 'see', 'should', 'some', 'still', 'such',
  'take', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they',
  'thing', 'things', 'think', 'this', 'those', 'through', 'time', 'today', 'too', 'two',
  'under', 'very', 'want', 'was', 'way', 'well', 'were', 'what', 'when', 'where',
  'which', 'while', 'who', 'will', 'with', 'would', 'year', 'your', 'write', 'feel',
  'entry', 'journal', 'reflection', 'thought', 'thoughts'
]);

type TimeRange = '7d' | '30d' | '90d' | 'all';
type ViewTab = 'mood' | 'keywords' | 'combined';

export const MoodKeywordDashboard: React.FC<MoodKeywordDashboardProps> = ({
  entries,
  onSelectEntry
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [activeTab, setActiveTab] = useState<ViewTab>('combined');
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<JournalMood | null>(null);

  // 1. Filter entries by time range
  const filteredEntries = useMemo(() => {
    if (!entries || entries.length === 0) return [];

    const now = new Date().getTime();
    return [...entries]
      .filter((e) => {
        if (timeRange === 'all') return true;
        const entryTime = new Date(e.createdAt).getTime();
        const diffDays = (now - entryTime) / (1000 * 60 * 60 * 24);
        if (timeRange === '7d') return diffDays <= 7;
        if (timeRange === '30d') return diffDays <= 30;
        if (timeRange === '90d') return diffDays <= 90;
        return true;
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [entries, timeRange]);

  // 2. Compute Mood Trend Data over Time for Recharts
  const moodTimelineData = useMemo(() => {
    return filteredEntries.map((e, idx) => {
      const dateObj = new Date(e.createdAt);
      const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const mood = e.mood || 'Thoughtful';
      const baseScore = MOOD_SCORES[mood] ?? 60;
      const energy = (e.moodScale || 5) * 10;
      const combinedScore = Math.round((baseScore * 0.65) + (energy * 0.35));

      return {
        id: e.id,
        index: idx + 1,
        date: label,
        fullDate: dateObj.toLocaleDateString(),
        title: e.title || 'Untitled',
        mood,
        score: combinedScore,
        energy: e.moodScale || 5,
        wordCount: e.wordCount || (e.content ? e.content.split(/\s+/).filter(Boolean).length : 0),
        entry: e
      };
    });
  }, [filteredEntries]);

  // 3. Compute Mood Breakdown Distribution
  const moodDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    const moods: JournalMood[] = ['Grateful', 'Energized', 'Calm', 'Focused', 'Curious', 'Thoughtful', 'Anxious'];
    moods.forEach((m) => { counts[m] = 0; });

    filteredEntries.forEach((e) => {
      const m = e.mood || 'Thoughtful';
      counts[m] = (counts[m] || 0) + 1;
    });

    return moods.map((m) => ({
      mood: m,
      count: counts[m] || 0,
      color: MOOD_COLORS[m]
    })).filter((item) => item.count > 0);
  }, [filteredEntries]);

  // 4. Compute Keyword Frequency across Journal Entries
  const keywordFrequencyData = useMemo(() => {
    const freq: Record<string, { count: number; entries: JournalEntry[] }> = {};

    filteredEntries.forEach((entry) => {
      // 1. Gather tags
      if (Array.isArray(entry.tags)) {
        entry.tags.forEach((tag) => {
          const cleanTag = tag.trim().toLowerCase();
          if (cleanTag.length > 2 && !STOP_WORDS.has(cleanTag)) {
            if (!freq[cleanTag]) freq[cleanTag] = { count: 0, entries: [] };
            freq[cleanTag].count += 3; // Give user tags higher weight
            if (!freq[cleanTag].entries.includes(entry)) freq[cleanTag].entries.push(entry);
          }
        });
      }

      // 2. Gather body words & title
      const textToAnalyze = `${entry.title || ''} ${entry.content || ''}`.toLowerCase();
      const words = textToAnalyze.match(/[a-z]{3,}/g) || [];

      words.forEach((w) => {
        if (!STOP_WORDS.has(w)) {
          if (!freq[w]) freq[w] = { count: 0, entries: [] };
          freq[w].count += 1;
          if (!freq[w].entries.includes(entry)) freq[w].entries.push(entry);
        }
      });
    });

    return Object.entries(freq)
      .map(([word, data]) => ({
        keyword: word,
        count: data.count,
        occurrences: data.entries.length,
        entries: data.entries
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [filteredEntries]);

  // 5. Keyword Frequency Over Time (Grouped into chunks/weeks)
  const keywordTimelineData = useMemo(() => {
    if (keywordFrequencyData.length === 0 || filteredEntries.length === 0) return [];
    const topKeywords = keywordFrequencyData.slice(0, 4).map((k) => k.keyword);

    // Group into 5-8 chronological buckets
    const bucketCount = Math.min(6, filteredEntries.length);
    if (bucketCount <= 1) return [];

    const bucketSize = Math.ceil(filteredEntries.length / bucketCount);
    const buckets: any[] = [];

    for (let i = 0; i < filteredEntries.length; i += bucketSize) {
      const slice = filteredEntries.slice(i, i + bucketSize);
      const firstDate = new Date(slice[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const bucketObj: any = { period: firstDate };

      topKeywords.forEach((kw) => {
        bucketObj[kw] = 0;
      });

      slice.forEach((entry) => {
        const text = `${entry.title || ''} ${entry.content || ''} ${(entry.tags || []).join(' ')}`.toLowerCase();
        topKeywords.forEach((kw) => {
          const matches = text.match(new RegExp(`\\b${kw}\\b`, 'gi'));
          if (matches) {
            bucketObj[kw] += matches.length;
          }
        });
      });

      buckets.push(bucketObj);
    }

    return buckets;
  }, [filteredEntries, keywordFrequencyData]);

  // 6. Summary Statistics
  const stats = useMemo(() => {
    if (filteredEntries.length === 0) {
      return {
        dominantMood: 'Thoughtful',
        dominantMoodColor: MOOD_COLORS['Thoughtful'],
        avgScore: 65,
        stabilityScore: 82,
        topKeyword: 'clarity',
        totalWords: 0
      };
    }

    const moodCounts: Record<string, number> = {};
    let totalScore = 0;
    let totalWords = 0;

    filteredEntries.forEach((e) => {
      const m = e.mood || 'Thoughtful';
      moodCounts[m] = (moodCounts[m] || 0) + 1;
      totalScore += MOOD_SCORES[m] ?? 60;
      totalWords += e.wordCount || (e.content ? e.content.split(/\s+/).filter(Boolean).length : 0);
    });

    let dominantMood: JournalMood = 'Thoughtful';
    let maxCount = -1;
    Object.entries(moodCounts).forEach(([m, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantMood = m as JournalMood;
      }
    });

    const avgScore = Math.round(totalScore / filteredEntries.length);

    // Variance calculation for emotional stability
    const variance = filteredEntries.reduce((acc, e) => {
      const s = MOOD_SCORES[e.mood || 'Thoughtful'] ?? 60;
      return acc + Math.pow(s - avgScore, 2);
    }, 0) / filteredEntries.length;

    const stdDev = Math.sqrt(variance);
    const stabilityScore = Math.max(40, Math.min(99, Math.round(100 - stdDev * 1.5)));
    const topKeyword = keywordFrequencyData[0]?.keyword || 'reflection';

    return {
      dominantMood,
      dominantMoodColor: MOOD_COLORS[dominantMood] || '#10B981',
      avgScore,
      stabilityScore,
      topKeyword,
      totalWords
    };
  }, [filteredEntries, keywordFrequencyData]);

  return (
    <div className="space-y-6" id="mood-keyword-dashboard-root">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#14171A] border border-[#22272B] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#76B900]/15 text-[#8FE000]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Mood Trends & Keyword Frequency Dashboard
                <span className="text-[10px] font-mono font-normal text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  Recharts Engine
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Longitudinal patterns and linguistic frequency across your reflections
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Tab Buttons */}
          <div className="flex items-center bg-[#0B0D0E] p-1 rounded-xl border border-[#22272B]">
            <button
              onClick={() => setActiveTab('combined')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'combined'
                  ? 'bg-[#76B900] text-black shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('mood')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'mood'
                  ? 'bg-[#76B900] text-black shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Mood Curve
            </button>
            <button
              onClick={() => setActiveTab('keywords')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'keywords'
                  ? 'bg-[#76B900] text-black shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Keywords
            </button>
          </div>

          {/* Time Range Pills */}
          <div className="flex items-center bg-[#0B0D0E] p-1 rounded-xl border border-[#22272B]">
            {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase transition-all ${
                  timeRange === range
                    ? 'bg-[#22272B] text-white font-bold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#14171A] border border-[#22272B] space-y-1">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5" style={{ color: stats.dominantMoodColor }} />
            Dominant Mindset
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white">{stats.dominantMood}</span>
            <span className="text-xs font-mono text-neutral-400">{stats.avgScore}/100</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#14171A] border border-[#22272B] space-y-1">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Emotional Stability
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-cyan-400">{stats.stabilityScore}%</span>
            <span className="text-[11px] text-neutral-400 font-sans">Index</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#14171A] border border-[#22272B] space-y-1">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-purple-400" />
            Top Keyword
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-purple-300 truncate">#{stats.topKeyword}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#14171A] border border-[#22272B] space-y-1">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            Reflections Analyzed
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white">{filteredEntries.length}</span>
            <span className="text-[11px] text-neutral-400 font-sans">{stats.totalWords.toLocaleString()} words</span>
          </div>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#14171A] border border-[#22272B] space-y-2">
          <Sparkles className="w-8 h-8 text-neutral-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No journal entries recorded in this window</h3>
          <p className="text-xs text-neutral-400">
            Write entries or select a broader time range to visualize trends.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. MOOD TREND OVER TIME (Recharts AreaChart) */}
          {(activeTab === 'combined' || activeTab === 'mood') && (
            <div className="p-5 rounded-2xl bg-[#14171A] border border-[#22272B] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#76B900]" />
                    Mood Trajectory & Emotional Energy Curve
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Calculated from self-rated mood polarity (0-100) and energy scale over time
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#76B900]" /> Mood Polarity
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Energy (x10)
                  </span>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={moodTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#76B900" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#76B900" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#22272B" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#55606B"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#55606B"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `${val}`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-3 rounded-xl bg-[#0B0D0E] border border-[#22272B] shadow-xl text-xs space-y-1 font-sans">
                              <p className="font-bold text-white truncate max-w-[200px]">{data.title}</p>
                              <p className="text-[11px] text-neutral-400">{data.fullDate}</p>
                              <div className="pt-1 flex items-center justify-between gap-3 text-[11px]">
                                <span className="text-neutral-300">Mindset:</span>
                                <span
                                  className="font-bold px-1.5 py-0.5 rounded text-[10px]"
                                  style={{
                                    backgroundColor: `${MOOD_COLORS[data.mood as JournalMood] || '#76B900'}20`,
                                    color: MOOD_COLORS[data.mood as JournalMood] || '#76B900'
                                  }}
                                >
                                  {data.mood}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-3 text-[11px]">
                                <span className="text-neutral-300">Mood Score:</span>
                                <span className="font-bold text-[#8FE000]">{data.score}/100</span>
                              </div>
                              <div className="flex items-center justify-between gap-3 text-[11px]">
                                <span className="text-neutral-300">Energy Scale:</span>
                                <span className="font-bold text-cyan-400">{data.energy}/10</span>
                              </div>
                              {onSelectEntry && (
                                <p className="text-[10px] text-neutral-500 pt-1 italic">Click dot to inspect entry</p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#76B900"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#moodGradient)"
                      activeDot={{
                        r: 6,
                        onClick: (_, event) => {
                          const entry = (event as any)?.payload?.entry;
                          if (entry && onSelectEntry) onSelectEntry(entry);
                        }
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={(item) => item.energy * 10}
                      name="Energy"
                      stroke="#06B6D4"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Mood Distribution Bar Breakdown */}
              <div className="pt-2 border-t border-[#22272B]">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                  Mindset Distribution
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {moodDistributionData.map((item) => (
                    <button
                      key={item.mood}
                      onClick={() => setSelectedMoodFilter(selectedMoodFilter === item.mood ? null : item.mood as JournalMood)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        selectedMoodFilter === item.mood
                          ? 'bg-neutral-800 border-[#76B900] shadow-sm'
                          : 'bg-[#0B0D0E] border-[#22272B] hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold" style={{ color: item.color }}>
                          {item.mood}
                        </span>
                        <span className="text-xs font-bold text-white font-mono">{item.count}</span>
                      </div>
                      <div className="w-full bg-neutral-800 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(item.count / filteredEntries.length) * 100}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. KEYWORD FREQUENCY VISUALIZATION (Recharts BarChart) */}
          {(activeTab === 'combined' || activeTab === 'keywords') && (
            <div className="p-5 rounded-2xl bg-[#14171A] border border-[#22272B] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-purple-400" />
                    Top Keyword Frequency Analysis
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Highest-frequency reflective themes and keywords extracted across your entries
                  </p>
                </div>
                <div className="text-[11px] font-mono text-neutral-500">
                  {keywordFrequencyData.length} prominent keywords identified
                </div>
              </div>

              {keywordFrequencyData.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-6 text-center">
                  Add more reflective body text or tags to extract keywords.
                </p>
              ) : (
                <div className="h-64 sm:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={keywordFrequencyData}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#22272B" horizontal={false} />
                      <XAxis type="number" stroke="#55606B" fontSize={11} />
                      <YAxis
                        dataKey="keyword"
                        type="category"
                        stroke="#55606B"
                        fontSize={11}
                        tickLine={false}
                        width={80}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="p-3 rounded-xl bg-[#0B0D0E] border border-[#22272B] shadow-xl text-xs space-y-1">
                                <p className="font-bold text-purple-300 capitalize">#{data.keyword}</p>
                                <p className="text-neutral-300">
                                  Total Weight / Frequency: <strong className="text-white">{data.count}</strong>
                                </p>
                                <p className="text-neutral-400 text-[11px]">
                                  Mentioned across <strong className="text-white">{data.occurrences}</strong> entries
                                </p>
                                {onSelectEntry && (
                                  <p className="text-[10px] text-neutral-500 pt-1 italic">Click bar to filter entries</p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="count"
                        radius={[0, 8, 8, 0]}
                        onClick={(data: any) => {
                          const kw = data?.keyword || data?.payload?.keyword;
                          if (kw) {
                            setSelectedKeyword(selectedKeyword === kw ? null : kw);
                          }
                        }}
                      >
                        {keywordFrequencyData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              selectedKeyword === entry.keyword
                                ? '#A855F7'
                                : index < 3
                                ? '#8B5CF6'
                                : '#6366F1'
                            }
                            cursor="pointer"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Keyword Pills Filter */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#22272B]">
                <span className="text-[11px] font-semibold text-neutral-400 mr-2 py-1">Quick Filter:</span>
                {keywordFrequencyData.map((k) => (
                  <button
                    key={k.keyword}
                    onClick={() => setSelectedKeyword(selectedKeyword === k.keyword ? null : k.keyword)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                      selectedKeyword === k.keyword
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-[#0B0D0E] text-neutral-300 hover:text-white border border-[#22272B]'
                    }`}
                  >
                    #{k.keyword} ({k.occurrences})
                  </button>
                ))}
                {selectedKeyword && (
                  <button
                    onClick={() => setSelectedKeyword(null)}
                    className="px-2.5 py-1 rounded-lg text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors"
                  >
                    Clear Filter &times;
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 3. KEYWORD EVOLUTION OVER TIME (Grouped Bar Chart) */}
          {activeTab === 'combined' && keywordTimelineData.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#14171A] border border-[#22272B] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-[#8FE000]" />
                    Top Keyword Velocity Over Time Intervals
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Shows which core topics dominated different periods of your reflections
                  </p>
                </div>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={keywordTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#22272B" vertical={false} />
                    <XAxis dataKey="period" stroke="#55606B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#55606B" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0B0D0E',
                        borderColor: '#22272B',
                        borderRadius: '0.75rem',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    {keywordFrequencyData.slice(0, 4).map((kw, i) => {
                      const colors = ['#8FE000', '#06B6D4', '#8B5CF6', '#EC4899'];
                      return (
                        <Bar
                          key={kw.keyword}
                          dataKey={kw.keyword}
                          fill={colors[i % colors.length]}
                          radius={[4, 4, 0, 0]}
                        />
                      );
                    })}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
