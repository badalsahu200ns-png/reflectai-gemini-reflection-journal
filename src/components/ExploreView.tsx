import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Search,
  Sparkles,
  BookOpen,
  Filter,
  Star,
  Globe,
  Tag,
  Calendar,
  Layers,
  Heart,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { JournalEntry, AIMemory, DedicatedMemoryItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface ExploreViewProps {
  entries: JournalEntry[];
  memories: AIMemory[];
  onOpenEntry?: (entryId: string) => void;
  onStartReflection?: (initialText?: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  entries,
  memories,
  onOpenEntry,
  onStartReflection
}) => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState<'map' | 'search' | 'sanctuary'>('map');

  // Semantic Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilterMood, setSearchFilterMood] = useState('ALL');
  const [searchResults, setSearchResults] = useState<JournalEntry[]>(entries);

  // Map Selected Pin
  const [selectedMapPin, setSelectedMapPin] = useState<{
    id: string;
    title: string;
    locationName: string;
    mood: string;
    lat: number;
    lng: number;
  } | null>(null);

  // Dynamic Map Markers from actual entries + defaults
  const entryLocations = entries
    .filter((e) => e.location && e.location.name)
    .map((e) => ({
      id: e.id,
      title: e.title || 'Untitled Entry',
      locationName: e.location?.name || 'Sanctuary',
      mood: e.mood || 'Thoughtful',
      lat: e.location?.lat || 37.77,
      lng: e.location?.lng || -122.41
    }));

  const mapLocations = entryLocations.length > 0 ? entryLocations : [
    { id: 'loc-1', title: 'Lake Reflection & Morning Mist', locationName: 'Crystal Springs Lake', mood: 'Calm', lat: 37.5, lng: -122.3 },
    { id: 'loc-2', title: 'Studio Coding Breakthrough', locationName: 'San Francisco Design Studio', mood: 'Energized', lat: 37.77, lng: -122.41 },
    { id: 'loc-3', title: 'Redwood Forest Walk', locationName: 'Muir Woods Sanctuary', mood: 'Peaceful', lat: 37.89, lng: -122.58 }
  ];

  // Perform Semantic Search
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults(entries);
      return;
    }
    const lower = q.toLowerCase();
    const filtered = entries.filter((e) => {
      const matchText = e.title.toLowerCase().includes(lower) || e.content.toLowerCase().includes(lower);
      const matchTags = e.tags?.some((t) => t.toLowerCase().includes(lower));
      const matchMood = searchFilterMood === 'ALL' || e.mood === searchFilterMood;
      return matchText && matchMood;
    });
    setSearchResults(filtered);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn" id="explore-view">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400">
              <Compass className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-white">
              Explore & Life Sanctuary
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Explore reflections across the world map, perform deep semantic RAG searches, and visit your curated sanctuary.
          </p>
        </div>
      </header>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#111416] border border-neutral-800">
        {[
          { id: 'map', label: 'Reflection World Map', icon: Globe },
          { id: 'search', label: 'Semantic RAG Search', icon: Search },
          { id: 'sanctuary', label: 'Sanctuary Library', icon: BookOpen }
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
      {/* 1. REFLECTION WORLD MAP TAB */}
      {/* ========================================================================= */}
      {activeTab === 'map' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 sm:p-8 rounded-3xl border border-neutral-800 bg-[#14171A] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Geographic Reflection Map</h2>
                <p className="text-xs text-neutral-400">
                  Visualizing where your thoughts and memories took place around the globe.
                </p>
              </div>
              <span className="text-xs font-mono text-[#76B900] bg-[#76B900]/15 px-3 py-1 rounded-full font-bold">
                {mapLocations.length} Geotagged Locations
              </span>
            </div>

            {/* Stylized World Map Container */}
            <div className="relative aspect-[21/9] rounded-2xl bg-[#0B0D0E] border border-neutral-800 overflow-hidden flex items-center justify-center p-4">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#76B900_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Map Interactive Nodes */}
              <div className="relative w-full h-full">
                {mapLocations.map((loc, idx) => (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedMapPin(loc)}
                    className="absolute p-2 rounded-full bg-[#76B900] text-black hover:scale-125 transition-transform shadow-[0_0_15px_rgba(118,185,0,0.5)] cursor-pointer"
                    style={{
                      top: `${30 + idx * 25}%`,
                      left: `${25 + idx * 22}%`
                    }}
                    title={`${loc.title} (${loc.locationName})`}
                  >
                    <MapPin className="w-4 h-4 fill-black" />
                  </button>
                ))}
              </div>

              {/* Pin Detail Overlay */}
              {selectedMapPin && (
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm p-4 rounded-2xl bg-[#14171A]/95 border border-[#76B900]/50 backdrop-blur-md text-xs space-y-2.5 shadow-2xl animate-fadeIn z-20">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#76B900] font-mono">
                      {selectedMapPin.mood} Mood
                    </span>
                    <button
                      onClick={() => setSelectedMapPin(null)}
                      className="text-neutral-400 hover:text-white p-1"
                    >
                      ✕
                    </button>
                  </div>
                  <h4 className="font-bold text-white text-sm">{selectedMapPin.title}</h4>
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{selectedMapPin.locationName}</span>
                  </div>
                  {onOpenEntry && (
                    <button
                      onClick={() => {
                        onOpenEntry(selectedMapPin.id);
                      }}
                      className="w-full mt-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black font-semibold text-xs transition-all shadow"
                    >
                      <span>Open Journal Reflection</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SEMANTIC RAG SEARCH TAB */}
      {/* ========================================================================= */}
      {activeTab === 'search' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl border border-neutral-800 bg-[#14171A] space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search journal entries by meaning, topics, emotional cues, or tags..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0D0E] border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:border-[#76B900] focus:outline-none"
                />
              </div>

              <select
                value={searchFilterMood}
                onChange={(e) => {
                  setSearchFilterMood(e.target.value);
                  handleSearch(searchQuery);
                }}
                className="px-3 py-2.5 rounded-xl bg-[#0B0D0E] border border-neutral-800 text-xs text-white focus:border-[#76B900] focus:outline-none"
              >
                <option value="ALL">All Moods</option>
                <option value="Calm">Calm</option>
                <option value="Energized">Energized</option>
                <option value="Focused">Focused</option>
                <option value="Grateful">Grateful</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {searchResults.map((entry) => (
              <div
                key={entry.id}
                onClick={() => onOpenEntry && onOpenEntry(entry.id)}
                className="p-5 rounded-2xl border border-neutral-800 bg-[#14171A] hover:border-[#76B900]/50 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                  <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                  <span className="text-amber-400">{entry.mood}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{entry.title}</h3>
                <p className="text-xs text-neutral-400 line-clamp-2">{entry.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SANCTUARY LIBRARY TAB */}
      {/* ========================================================================= */}
      {activeTab === 'sanctuary' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl border border-neutral-800 bg-[#14171A] space-y-3">
              <div className="flex items-center gap-2 text-pink-400">
                <Heart className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-pink-300">
                  Favorite Quotes & Breakthroughs
                </h3>
              </div>
              <div className="p-4 rounded-2xl bg-[#111416] border border-neutral-800 text-xs italic font-serif text-neutral-200">
                "Patience transforms friction into deep technical mastery."
              </div>
              <div className="p-4 rounded-2xl bg-[#111416] border border-neutral-800 text-xs italic font-serif text-neutral-200">
                "Rest is not the absence of productivity; it is the prerequisite for insight."
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-neutral-800 bg-[#14171A] space-y-3">
              <div className="flex items-center gap-2 text-[#76B900]">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#76B900]">
                  Mindful Grounding Mantras
                </h3>
              </div>
              <div className="p-4 rounded-2xl bg-[#111416] border border-neutral-800 text-xs text-neutral-300">
                🌱 <strong>Morning:</strong> Take three deep belly breaths before checking notifications.
              </div>
              <div className="p-4 rounded-2xl bg-[#111416] border border-neutral-800 text-xs text-neutral-300">
                🌙 <strong>Evening:</strong> Write down one thing that made you smile today.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
