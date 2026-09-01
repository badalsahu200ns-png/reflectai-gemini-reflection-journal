import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Calendar as CalendarIcon,
  Clock,
  RotateCcw,
  BookOpen,
  FolderPlus,
  Share2,
  Filter,
  CheckCircle2,
  Star,
  ChevronRight,
  ChevronLeft,
  PenTool,
  Camera,
  Film,
  Compass,
  Plus,
  Trash2,
  Eye,
  GitBranch,
  Layers,
  Sparkle
} from 'lucide-react';
import {
  AIMemory,
  JournalEntry,
  DedicatedMemoryItem,
  MemoryCapsule,
  MemoryConnectionNode,
  MemoryStory
} from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface AIMemoriesVaultViewProps {
  entries: JournalEntry[];
  memories: AIMemory[];
  onOpenEntry?: (entryId: string) => void;
  onStartReflection?: (initialText?: string, initialMode?: string) => void;
  onNavigateTab?: (tab: any) => void;
}

export const AIMemoriesVaultView: React.FC<AIMemoriesVaultViewProps> = ({
  entries,
  memories,
  onOpenEntry,
  onStartReflection,
  onNavigateTab
}) => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'vault' | 'resurfacing' | 'calendar' | 'timeline' | 'capsules' | 'connections' | 'stories'>('vault');

  // Memory Capsules State
  const [capsules, setCapsules] = useState<MemoryCapsule[]>([
    {
      id: 'cap-1',
      userId: user?.uid || 'anonymous',
      title: '2026 Mindfulness Journey',
      description: 'Key breakthroughs in emotional resilience and presence.',
      coverImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      colorGradient: 'from-emerald-900 to-teal-950',
      memoryIds: ['mem-sample-1'],
      entryIds: entries.slice(0, 3).map((e) => e.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cap-2',
      userId: user?.uid || 'anonymous',
      title: 'Career & Creative Momentum',
      description: 'Building software architectures and navigating growth.',
      coverImageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
      colorGradient: 'from-indigo-900 to-purple-950',
      memoryIds: ['mem-sample-2'],
      entryIds: entries.slice(0, 2).map((e) => e.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  // Memory Connections Nodes
  const [connections, setConnections] = useState<MemoryConnectionNode[]>([
    {
      id: 'conn-1',
      tripOrTheme: 'Morning Redwoods Hike',
      photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
      journalEntryTitle: 'Silence in Nature',
      journalEntryId: entries[0]?.id || 'entry-1',
      mood: 'Calm',
      insight: 'Nature walks lower cortisol and spark creative breakthroughs.',
      date: '5 days ago'
    },
    {
      id: 'conn-2',
      tripOrTheme: 'Tech Architecture Solve',
      photoUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80',
      journalEntryTitle: 'Flow State & Coding',
      journalEntryId: entries[1]?.id || 'entry-2',
      mood: 'Energized',
      insight: 'Stepping away from screens untangles algorithmic bottlenecks.',
      date: '2 days ago'
    }
  ]);

  // AI Memory Stories State
  const [stories, setStories] = useState<MemoryStory[]>([]);
  const [selectedStoryMemories, setSelectedStoryMemories] = useState<string[]>([]);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [newStoryPrompt, setNewStoryPrompt] = useState('');

  // Memory Resurfacing & 5-Day Logic
  const [fiveDayResurfacingEnabled, setFiveDayResurfacingEnabled] = useState(true);
  const now = new Date();
  
  // Find entries from 5 days ago and same date in previous years
  const fiveDaysAgoDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const fiveDayEntries = entries.filter((e) => {
    const diff = Math.abs((now.getTime() - new Date(e.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 4 && diff <= 6;
  });

  const onThisDayEntries = entries.filter((e) => {
    const entryDate = new Date(e.createdAt);
    return entryDate.getDate() === now.getDate() && entryDate.getMonth() === now.getMonth();
  });

  // Calendar State
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());

  // Generate AI Story Handler
  const handleGenerateStory = async () => {
    setIsGeneratingStory(true);
    try {
      const selectedMems = entries.slice(0, 4).map((e) => ({
        id: e.id,
        title: e.title,
        description: e.content,
        capturedAt: e.createdAt
      }));

      const res = await fetch('/api/ai/memory-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memories: selectedMems,
          customPrompt: newStoryPrompt || 'Focus on personal growth and self-discovery.'
        })
      });
      const data = await res.json();
      setStories([data, ...stories]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // Calendar Helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calYear = currentCalendarMonth.getFullYear();
  const calMonth = currentCalendarMonth.getMonth();
  const totalDays = daysInMonth(calYear, calMonth);
  const startDay = firstDayOfMonth(calYear, calMonth);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn" id="ai-memories-vault-view">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400">
              <Brain className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-white">
              AI Memory Vault & Timeline
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Memory resurfacing, on-this-day nostalgia, capsule collections, connections graph, and chronological AI stories.
          </p>
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#111416] border border-neutral-800">
        {[
          { id: 'vault', label: 'Memory Vault', icon: Brain },
          { id: 'resurfacing', label: '5-Day & On This Day', icon: RotateCcw },
          { id: 'calendar', label: 'Memory Calendar', icon: CalendarIcon },
          { id: 'timeline', label: 'Emotional Timeline', icon: Clock },
          { id: 'capsules', label: 'Capsules', icon: Layers },
          { id: 'connections', label: 'Connections Graph', icon: GitBranch },
          { id: 'stories', label: 'AI Memory Stories', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#76B900] text-black shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. MEMORY VAULT TAB */}
      {/* ========================================================================= */}
      {activeTab === 'vault' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-2xl border border-dashed border-neutral-800 bg-[#111416]">
                <Brain className="w-8 h-8 text-neutral-500 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1">Your Memory Vault is Forming</h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto mb-4">
                  As you write journal entries, Gemini extracts enduring preferences, milestones, and personal themes into this secure vault.
                </p>
                {onStartReflection && (
                  <button
                    onClick={() => onStartReflection('', 'write')}
                    className="px-4 py-2 rounded-xl bg-[#76B900] text-black text-xs font-bold"
                  >
                    Write Reflection
                  </button>
                )}
              </div>
            ) : (
              memories.map((mem) => (
                <div
                  key={mem.id}
                  className="p-5 rounded-2xl border border-neutral-800 bg-[#14171A] flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40 capitalize">
                        {mem.category || 'Core Insight'}
                      </span>
                      <span>{new Date(mem.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-medium text-white leading-relaxed">
                      "{mem.text}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1 text-purple-400 font-semibold">
                      <Sparkles className="w-3 h-3" />
                      Retained Context
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. 5-DAY RESURFACING & ON THIS DAY TAB */}
      {/* ========================================================================= */}
      {activeTab === 'resurfacing' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Every 5 Days Configuration Banner */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-indigo-200 uppercase">
                  Every 5 Days Memory Resurfacing Loop
                </h3>
                <p className="text-xs text-indigo-300/80">
                  ReflectAI surfaces reflections from exactly 5 days ago to prompt: "How is this going now?"
                </p>
              </div>
            </div>
            <button
              onClick={() => setFiveDayResurfacingEnabled(!fiveDayResurfacingEnabled)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                fiveDayResurfacingEnabled
                  ? 'bg-indigo-600 text-white'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {fiveDayResurfacingEnabled ? 'Active (Every 5 Days)' : 'Paused'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 5 Days Ago Resurfacing Cards */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#76B900]" />
                <span>Five Days Ago Reflections</span>
              </h2>

              {fiveDayEntries.length === 0 ? (
                <div className="p-6 rounded-2xl border border-neutral-800 bg-[#14171A] text-center text-xs text-neutral-400">
                  No reflections found from exactly 5 days ago. Keep journaling to build your resurfacing timeline.
                </div>
              ) : (
                fiveDayEntries.map((e) => (
                  <div
                    key={e.id}
                    className="p-5 rounded-2xl border border-neutral-800 bg-[#14171A] space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span className="font-mono">{new Date(e.createdAt).toLocaleDateString()}</span>
                      <span className="text-amber-400">{e.mood}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white">{e.title}</h3>
                    <p className="text-xs text-neutral-400 line-clamp-2">{e.content}</p>
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs text-indigo-300">How is it going now?</span>
                      {onStartReflection && (
                        <button
                          onClick={() => onStartReflection(`Reflecting on my entry from 5 days ago: "${e.title}"\n\nHow things stand now: `, 'write')}
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                        >
                          Reflect Now
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* On This Day Cards */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-pink-400" />
                <span>On This Day (Past Milestones)</span>
              </h2>

              {onThisDayEntries.length === 0 ? (
                <div className="p-6 rounded-2xl border border-neutral-800 bg-[#14171A] text-center text-xs text-neutral-400">
                  No past year memories for today's date ({now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}).
                </div>
              ) : (
                onThisDayEntries.map((e) => (
                  <div
                    key={e.id}
                    className="p-5 rounded-2xl border border-neutral-800 bg-[#14171A] space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span className="font-mono">{new Date(e.createdAt).toLocaleDateString()}</span>
                      <span className="text-pink-400 font-bold">On This Day</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white">{e.title}</h3>
                    <p className="text-xs text-neutral-400 line-clamp-2">{e.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MEMORY CALENDAR TAB */}
      {/* ========================================================================= */}
      {activeTab === 'calendar' && (
        <div className="p-6 rounded-3xl border border-neutral-800 bg-[#14171A] space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-white">
              {currentCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentCalendarMonth(new Date(calYear, calMonth - 1, 1))}
                className="p-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentCalendarMonth(new Date(calYear, calMonth + 1, 1))}
                className="p-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-2 text-neutral-500 font-bold">
                {d}
              </div>
            ))}

            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="p-3" />
            ))}

            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const hasEntries = entries.some((e) => {
                const d = new Date(e.createdAt);
                return d.getDate() === day && d.getMonth() === calMonth && d.getFullYear() === calYear;
              });

              return (
                <div
                  key={day}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center min-h-[64px] transition-all cursor-pointer ${
                    hasEntries
                      ? 'bg-[#111416] border-[#76B900]/40 text-white hover:border-[#76B900]'
                      : 'bg-black/20 border-neutral-900 text-neutral-500 hover:border-neutral-800'
                  }`}
                >
                  <span className="font-mono text-xs">{day}</span>
                  {hasEntries && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#76B900] mt-1 shadow-xs" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. EMOTIONAL TIMELINE TAB */}
      {/* ========================================================================= */}
      {activeTab === 'timeline' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="relative border-l-2 border-neutral-800 ml-4 pl-6 space-y-8">
            {entries.slice(0, 10).map((entry, idx) => (
              <div key={entry.id} className="relative group">
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#76B900] border-4 border-[#14171A]" />
                <div
                  onClick={() => onOpenEntry && onOpenEntry(entry.id)}
                  className="p-5 rounded-2xl border border-neutral-800 bg-[#14171A] hover:border-[#76B900]/50 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                    <span>{new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    {entry.mood && <span className="text-amber-400 font-semibold">{entry.mood}</span>}
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#76B900] transition-colors">
                    {entry.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2">{entry.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MEMORY CAPSULES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'capsules' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {capsules.map((cap) => (
              <div
                key={cap.id}
                className={`p-6 rounded-3xl border border-neutral-800 bg-gradient-to-br ${cap.colorGradient || 'from-neutral-900 to-black'} space-y-4 shadow-xl flex flex-col justify-between`}
              >
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#76B900] bg-black/40 px-2.5 py-1 rounded-full">
                    Memory Capsule
                  </span>
                  <h3 className="text-base font-serif font-bold text-white">{cap.title}</h3>
                  <p className="text-xs text-neutral-300/80 leading-relaxed">{cap.description}</p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-300">
                  <span>{cap.entryIds.length + cap.memoryIds.length} Linked Items</span>
                  <button className="text-xs font-semibold text-[#76B900] hover:underline flex items-center gap-1">
                    Open Capsule <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CONNECTIONS GRAPH TAB */}
      {/* ========================================================================= */}
      {activeTab === 'connections' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl border border-neutral-800 bg-[#14171A] space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Memory & Insight Connections</h2>
              <p className="text-xs text-neutral-400">
                Visualizing how locations, activities, journal entries, and AI insights link together.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  className="p-5 rounded-2xl border border-neutral-800 bg-[#111416] space-y-4"
                >
                  <div className="flex items-center gap-3">
                    {conn.photoUrl && (
                      <img
                        src={conn.photoUrl}
                        alt="Node"
                        className="w-12 h-12 rounded-xl object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white">{conn.tripOrTheme}</h4>
                      <span className="text-[10px] text-neutral-400">{conn.date} • {conn.mood}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-neutral-800/60 text-xs space-y-1">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Linked Journal:</span>
                    <p className="text-white font-medium">"{conn.journalEntryTitle}"</p>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs space-y-1 text-purple-200">
                    <span className="text-[10px] text-purple-400 font-bold uppercase">Synthesized Insight:</span>
                    <p>{conn.insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. AI MEMORY STORIES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'stories' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Story Generator Card */}
          <div className="p-6 rounded-3xl border border-neutral-800 bg-[#14171A] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Generate Chronological AI Memory Story</span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Select memories across months or seasons. Gemini will weave them into an evocative narrative biography.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newStoryPrompt}
                onChange={(e) => setNewStoryPrompt(e.target.value)}
                placeholder="Optional story focus: 'My creative journey over the last few months'..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#0B0D0E] border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:border-[#76B900] focus:outline-none"
              />
              <button
                onClick={handleGenerateStory}
                disabled={isGeneratingStory}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingStory ? 'Synthesizing Story...' : 'Weave Memory Story'}</span>
              </button>
            </div>
          </div>

          {/* Generated Stories List */}
          <div className="space-y-6">
            {stories.map((st) => (
              <div
                key={st.id}
                className="p-6 sm:p-8 rounded-3xl border border-purple-900/40 bg-gradient-to-br from-[#14171A] to-[#1a1728] space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
                  <div>
                    <span className="text-[10px] text-purple-400 font-mono uppercase font-bold tracking-wider">
                      {st.timeframe || 'Chronological Story Capsule'}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-white mt-1">{st.title}</h3>
                  </div>
                  <span className="text-xs text-neutral-500 font-mono">
                    {new Date(st.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="prose prose-invert max-w-none text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-line font-serif">
                  {st.storyNarrative}
                </div>

                <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-800/40 text-xs text-purple-200 space-y-1">
                  <strong className="text-purple-300">Mindful Takeaway:</strong>
                  <p>{st.reflectionTakeaway}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
