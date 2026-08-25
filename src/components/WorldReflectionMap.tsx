import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Globe,
  Compass,
  Sparkles,
  ArrowRight,
  Filter,
  Calendar,
  Layers,
  Search,
  Maximize2
} from 'lucide-react';
import { JournalEntry, JournalMood } from '../types';

interface WorldReflectionMapProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
}

const MOOD_EMOJIS: Record<string, string> = {
  Grateful: '🙏',
  Calm: '🌊',
  Focused: '🎯',
  Thoughtful: '💡',
  Curious: '🔮',
  Energized: '⚡',
  Anxious: '🌧️'
};

const MOOD_COLORS: Record<string, string> = {
  Grateful: '#10b981',
  Calm: '#06b6d4',
  Focused: '#6366f1',
  Thoughtful: '#a855f7',
  Curious: '#ec4899',
  Energized: '#f59e0b',
  Anxious: '#ef4444'
};

export const WorldReflectionMap: React.FC<WorldReflectionMapProps> = ({
  entries,
  onSelectEntry
}) => {
  const [selectedMood, setSelectedMood] = useState<string>('ALL');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter entries that have locations
  const geotaggedEntries = useMemo(() => {
    return entries.filter((e) => {
      if (!e.location || typeof e.location.lat !== 'number' || typeof e.location.lng !== 'number') {
        return false;
      }
      if (selectedMood !== 'ALL' && e.mood !== selectedMood) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = e.title?.toLowerCase().includes(q);
        const matchLoc = e.location.name?.toLowerCase().includes(q) || e.location.address?.toLowerCase().includes(q);
        if (!matchTitle && !matchLoc) return false;
      }
      return true;
    });
  }, [entries, selectedMood, searchQuery]);

  // Convert lat/lng to SVG canvas coordinate (Miller/Equirectangular projection)
  const getCanvasCoords = (lat: number, lng: number) => {
    // Normalization to 0-100%
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(8, Math.min(92, y)) };
  };

  return (
    <div className="h-full flex flex-col p-4 lg:p-6 space-y-4 overflow-y-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg text-white">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              World Reflection Map
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                {geotaggedEntries.length} Geotagged Places
              </span>
            </h2>
            <p className="text-xs text-neutral-400">
              Explore your spatial mindfulness journey and emotional landscape across geographies
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location or title..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 w-44"
            />
          </div>

          {/* Mood Filter */}
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Moods</option>
            <option value="Grateful">Grateful 🙏</option>
            <option value="Calm">Calm 🌊</option>
            <option value="Focused">Focused 🎯</option>
            <option value="Thoughtful">Thoughtful 💡</option>
            <option value="Curious">Curious 🔮</option>
            <option value="Energized">Energized ⚡</option>
            <option value="Anxious">Anxious 🌧️</option>
          </select>
        </div>
      </div>

      {/* Main Map Stage & Location Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Interactive Stylized World Map Canvas */}
        <div className="lg:col-span-2 relative min-h-[420px] rounded-2xl bg-gradient-to-b from-[#0a121e] to-[#040810] border border-neutral-800/80 p-4 overflow-hidden flex flex-col justify-between shadow-2xl">
          {/* Map Grid Background Lines */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Stylized Continents SVG Silhouette */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
            viewBox="0 0 1000 500"
            preserveAspectRatio="none"
          >
            {/* North America */}
            <path
              d="M150,80 Q250,60 320,130 Q280,220 180,250 Q130,200 120,120 Z"
              fill="#38bdf8"
            />
            {/* South America */}
            <path
              d="M260,260 Q340,280 320,420 Q270,460 250,360 Z"
              fill="#38bdf8"
            />
            {/* Europe */}
            <path
              d="M480,90 Q560,80 580,160 Q520,180 470,140 Z"
              fill="#38bdf8"
            />
            {/* Africa */}
            <path
              d="M480,190 Q580,190 560,360 Q480,380 460,260 Z"
              fill="#38bdf8"
            />
            {/* Asia */}
            <path
              d="M590,80 Q820,70 850,220 Q720,260 610,180 Z"
              fill="#38bdf8"
            />
            {/* Australia */}
            <path
              d="M780,320 Q880,310 860,410 Q770,410 760,340 Z"
              fill="#38bdf8"
            />
          </svg>

          {/* Compass Rose overlay */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 bg-neutral-950/60 px-2 py-1 rounded-md border border-neutral-800/60 backdrop-blur-sm">
            <Compass className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>GEO-REFLECT MERCATOR 1.0</span>
          </div>

          {/* Geotagged Reflection Marker Pins */}
          <div className="relative w-full h-[360px]">
            {geotaggedEntries.map((entry) => {
              const coords = getCanvasCoords(entry.location!.lat, entry.location!.lng);
              const isSelected = selectedEntry?.id === entry.id;
              const moodColor = MOOD_COLORS[entry.mood || 'Thoughtful'] || '#a855f7';
              const moodEmoji = MOOD_EMOJIS[entry.mood || 'Thoughtful'] || '📍';

              return (
                <div
                  key={entry.id}
                  style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                  onClick={() => setSelectedEntry(entry)}
                >
                  {/* Ping Animation on Active */}
                  <div
                    style={{ backgroundColor: moodColor }}
                    className="absolute inset-0 rounded-full animate-ping opacity-40 scale-150"
                  />

                  {/* Marker Pin */}
                  <div
                    style={{
                      borderColor: moodColor,
                      boxShadow: `0 0 16px ${moodColor}60`
                    }}
                    className={`relative w-8 h-8 rounded-full bg-neutral-950 border-2 flex items-center justify-center text-xs transition-transform transform group-hover:scale-125 ${
                      isSelected ? 'scale-125 ring-2 ring-white' : ''
                    }`}
                  >
                    <span>{moodEmoji}</span>
                  </div>

                  {/* Marker Label tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                    <div className="bg-neutral-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-neutral-700 shadow-xl whitespace-nowrap">
                      {entry.location?.name || 'Sanctuary'}
                      <span className="text-neutral-400 block font-normal text-[9px]">{entry.title}</span>
                    </div>
                    <div className="w-1.5 h-1.5 bg-neutral-900 border-r border-b border-neutral-700 transform rotate-45 -mt-1" />
                  </div>
                </div>
              );
            })}

            {geotaggedEntries.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-2">
                <MapPin className="w-8 h-8 text-neutral-600 animate-bounce" />
                <p className="text-sm font-semibold text-neutral-300">No Geotagged Reflections Found</p>
                <p className="text-xs text-neutral-500 max-w-sm">
                  Add location coordinates to your journal entries in the Editor or Workspace to see them pinned here on your world map.
                </p>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-800/60 pt-2">
            <span>Click any pin to inspect reflection memories</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Grateful
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Calm
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400" /> Thoughtful
              </span>
            </div>
          </div>
        </div>

        {/* Selected Entry Spotlight / Location List Sidebar */}
        <div className="space-y-4 flex flex-col">
          {/* Selected Pin Details Card */}
          {selectedEntry ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-neutral-900 border border-purple-800/50 shadow-xl space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
                    {selectedEntry.category}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1.5">{selectedEntry.title}</h3>
                </div>
                <span className="text-lg">{MOOD_EMOJIS[selectedEntry.mood || 'Thoughtful']}</span>
              </div>

              {/* Location Badge */}
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 p-2 rounded-xl border border-emerald-800/40">
                <MapPin className="w-4 h-4 shrink-0" />
                <div className="truncate">
                  <span className="font-semibold text-white">{selectedEntry.location?.name}</span>
                  {selectedEntry.location?.address && (
                    <span className="block text-[10px] text-neutral-400 truncate">{selectedEntry.location.address}</span>
                  )}
                </div>
              </div>

              {/* Entry preview snippet */}
              <div className="text-xs text-neutral-300 line-clamp-3 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80">
                {selectedEntry.turns && selectedEntry.turns.length > 0
                  ? selectedEntry.turns[0].content
                  : 'Personal reflection entry.'}
              </div>

              {/* Action */}
              <button
                onClick={() => onSelectEntry(selectedEntry)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow"
              >
                <span>Open in Journal Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ) : (
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-center space-y-2 py-8">
              <Compass className="w-6 h-6 text-neutral-500 mx-auto" />
              <p className="text-xs font-semibold text-neutral-300">Select a Location Pin</p>
              <p className="text-[11px] text-neutral-500">
                Click any marker on the map to review the thoughts and insights you captured there.
              </p>
            </div>
          )}

          {/* List of All Geotagged Entries */}
          <div className="flex-1 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-3 flex flex-col space-y-2">
            <h4 className="text-xs font-semibold text-neutral-300 px-1 flex items-center justify-between">
              <span>All Geotagged Memories</span>
              <span className="text-[10px] text-neutral-500 font-mono">{geotaggedEntries.length}</span>
            </h4>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[300px]">
              {geotaggedEntries.map((e) => (
                <div
                  key={e.id}
                  onClick={() => setSelectedEntry(e)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all text-left ${
                    selectedEntry?.id === e.id
                      ? 'bg-neutral-800 border-purple-500/60'
                      : 'bg-neutral-950/60 border-neutral-800/80 hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white truncate max-w-[160px]">{e.title}</span>
                    <span>{MOOD_EMOJIS[e.mood || 'Thoughtful']}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-1">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{e.location?.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
