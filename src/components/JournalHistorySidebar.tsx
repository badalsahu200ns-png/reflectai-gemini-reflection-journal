import React, { useState } from 'react';
import {
  Plus,
  Search,
  BookOpen,
  Calendar,
  Tag,
  Trash2,
  Smile,
  Pin,
  Filter,
  Sparkles,
  ChevronRight,
  Clock,
  Layers
} from 'lucide-react';
import { JournalEntry, JournalMood } from '../types';

interface JournalHistorySidebarProps {
  entries: JournalEntry[];
  activeEntryId: string | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onNewEntry: () => void;
  onDeleteEntry: (entryId: string) => void;
  onTogglePin: (entryId: string, e: React.MouseEvent) => void;
  loading: boolean;
}

const CATEGORIES = [
  'All',
  'Daily Reflection',
  'Brainstorming',
  'Decision Making',
  'Mindfulness',
  'Career & Goals',
  'Creative'
];

export const JournalHistorySidebar: React.FC<JournalHistorySidebarProps> = ({
  entries,
  activeEntryId,
  onSelectEntry,
  onNewEntry,
  onDeleteEntry,
  onTogglePin,
  loading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      entry.turns?.some((t) => t.content.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || entry.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const pinnedEntries = filteredEntries.filter((e) => e.isPinned);
  const otherEntries = filteredEntries.filter((e) => !e.isPinned);

  const formatTimestamp = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 2) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getMoodColor = (mood?: JournalMood) => {
    switch (mood) {
      case 'Energized': return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
      case 'Calm': return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
      case 'Focused': return 'text-blue-400 bg-blue-950/40 border-blue-800/40';
      case 'Thoughtful': return 'text-purple-400 bg-purple-950/40 border-purple-800/40';
      case 'Curious': return 'text-indigo-400 bg-indigo-950/40 border-indigo-800/40';
      case 'Grateful': return 'text-pink-400 bg-pink-950/40 border-pink-800/40';
      case 'Anxious': return 'text-orange-400 bg-orange-950/40 border-orange-800/40';
      default: return 'text-neutral-400 bg-neutral-900 border-neutral-800';
    }
  };

  return (
    <aside className="w-full md:w-80 lg:w-88 border-r border-neutral-800 bg-neutral-950 flex flex-col h-[calc(100vh-4rem)] select-none">
      {/* Top Action Bar */}
      <div className="p-4 border-b border-neutral-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
              Reflection History
            </h2>
          </div>
          <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {/* New Reflection Button */}
        <button
          onClick={onNewEntry}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md active:scale-[0.99]"
          id="btn-new-reflection"
        >
          <Plus className="w-4 h-4" />
          New Journal Reflection
        </button>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries, tags, insights..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
            id="input-search-entries"
          />
        </div>

        {/* Category Scroll Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors text-[11px] font-medium ${
                selectedCategory === cat
                  ? 'bg-purple-950/80 text-purple-200 border border-purple-700/60'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-neutral-900/50">
        {loading && entries.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500 space-y-2">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Syncing Firestore records...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-xs space-y-3">
            <Sparkles className="w-8 h-8 mx-auto text-neutral-600" />
            <p className="font-medium text-neutral-400">No reflections found</p>
            <p className="text-[11px]">
              {searchQuery
                ? 'Try tweaking your search query or filter.'
                : 'Click "New Journal Reflection" above to begin your first multi-turn session.'}
            </p>
          </div>
        ) : (
          <>
            {/* Pinned Section */}
            {pinnedEntries.length > 0 && (
              <div className="space-y-1 pb-2">
                <div className="px-2 py-1 text-[10px] font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-1">
                  <Pin className="w-3 h-3 text-amber-400 rotate-45" />
                  Pinned Reflections
                </div>
                {pinnedEntries.map((entry) => renderEntryCard(entry))}
              </div>
            )}

            {/* Main Entries Section */}
            <div className="space-y-1 pt-1">
              {pinnedEntries.length > 0 && otherEntries.length > 0 && (
                <div className="px-2 py-1 text-[10px] font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Recent Reflections
                </div>
              )}
              {otherEntries.map((entry) => renderEntryCard(entry))}
            </div>
          </>
        )}
      </div>

      {/* Sidebar Footer Info */}
      <div className="p-3 border-t border-neutral-800 text-[10px] text-neutral-500 flex items-center justify-between bg-neutral-950/60">
        <span>Firestore Collection</span>
        <span className="font-mono text-neutral-400">/users/.../entries</span>
      </div>
    </aside>
  );

  function renderEntryCard(entry: JournalEntry) {
    const isActive = entry.id === activeEntryId;
    const turnsCount = entry.turns?.length || 0;
    const hasSummary = Boolean(entry.summary);

    return (
      <div
        key={entry.id}
        onClick={() => onSelectEntry(entry)}
        className={`group relative p-3 rounded-xl cursor-pointer transition-all border text-left ${
          isActive
            ? 'bg-neutral-900 border-purple-500/80 shadow-md ring-1 ring-purple-500/20'
            : 'bg-neutral-950/50 hover:bg-neutral-900/60 border-neutral-800/80 hover:border-neutral-700'
        }`}
        id={`entry-card-${entry.id}`}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className={`text-xs font-semibold leading-snug line-clamp-1 ${
            isActive ? 'text-white' : 'text-neutral-200 group-hover:text-white'
          }`}>
            {entry.title || 'Untitled Reflection'}
          </h3>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
            {/* Pin Toggle */}
            <button
              onClick={(e) => onTogglePin(entry.id, e)}
              className={`p-1 rounded hover:bg-neutral-800 text-neutral-500 transition-colors ${
                entry.isPinned ? 'text-amber-400' : 'hover:text-neutral-300'
              }`}
              title={entry.isPinned ? 'Unpin reflection' : 'Pin to top'}
            >
              <Pin className={`w-3 h-3 ${entry.isPinned ? 'rotate-45 fill-amber-400' : ''}`} />
            </button>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Delete this journal reflection from Firestore?')) {
                  onDeleteEntry(entry.id);
                }
              }}
              className="p-1 rounded hover:bg-red-950/60 text-neutral-500 hover:text-red-400 transition-colors"
              title="Delete reflection"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Snippet from latest turn */}
        <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-normal font-normal">
          {entry.turns && entry.turns.length > 0
            ? entry.turns[entry.turns.length - 1].content
            : 'Empty reflection draft. Click to write your thoughts...'}
        </p>

        {/* Metadata badges */}
        <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap text-[10px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            {entry.mood && (
              <span className={`px-1.5 py-0.5 rounded border text-[10px] font-medium ${getMoodColor(entry.mood)}`}>
                {entry.mood}
              </span>
            )}
            <span className="text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
              {entry.category || 'Reflection'}
            </span>
            {hasSummary && (
              <span className="text-indigo-300 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                Summary
              </span>
            )}
          </div>

          <span className="text-neutral-500 font-mono text-[10px]">
            {formatTimestamp(entry.updatedAt || entry.createdAt)}
          </span>
        </div>
      </div>
    );
  }
};
