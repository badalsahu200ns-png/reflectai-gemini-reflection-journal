import React, { useState } from 'react';
import {
  Star,
  Search,
  BookOpen,
  Calendar,
  Clock,
  Tag,
  Sparkles,
  Smile,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { JournalEntry, JournalMood } from '../types';
import { useTheme } from '../context/ThemeContext';

interface FavoritesViewProps {
  entries: JournalEntry[];
  onOpenEntry: (entryId: string) => void;
  onToggleFavorite?: (entryId: string, e: React.MouseEvent) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  entries,
  onOpenEntry,
  onToggleFavorite
}) => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('ALL');

  // Filter only favorite or pinned entries
  const favoriteEntries = entries.filter((e) => e.favorite || e.isPinned);

  const filtered = favoriteEntries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.content && entry.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.tags && entry.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesMood = selectedMood === 'ALL' || entry.mood === selectedMood;

    return matchesSearch && matchesMood;
  });

  const moods = Array.from(new Set(favoriteEntries.map((e) => e.mood).filter(Boolean)));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn" id="favorites-view-container">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-amber-500">
          <Star className="w-5 h-5 fill-amber-500" />
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight text-neutral-900 dark:text-white">
            Favorite Reflections
          </h1>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Your bookmarked reflections, breakthrough insights, and memorable personal milestones.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search favorites..."
            className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-none transition-all ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:border-indigo-500'
                : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-indigo-600'
            }`}
            id="input-favorites-search"
          />
        </div>

        {moods.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              onClick={() => setSelectedMood('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                selectedMood === 'ALL'
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : isDark
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All Moods
            </button>
            {moods.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMood(m as string)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  selectedMood === m
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : isDark
                    ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Favorites List */}
      {filtered.length === 0 ? (
        <div
          className={`p-12 text-center rounded-2xl border border-dashed ${
            isDark ? 'border-neutral-800 bg-neutral-900/40' : 'border-neutral-200 bg-neutral-50/70'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold mb-1 text-neutral-900 dark:text-white">
            {favoriteEntries.length === 0 ? 'No favorites starred yet' : 'No matching favorites'}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            {favoriteEntries.length === 0
              ? 'Click the star icon on any journal entry or reflection card to pin it to your favorites for quick access.'
              : 'Try adjusting your search query or mood filter to see other starred entries.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((entry) => {
            const preview =
              entry.content ||
              (entry.turns && entry.turns.length > 0
                ? entry.turns.map((t) => t.content).join(' ')
                : 'Empty reflection');
            const dateStr = new Date(entry.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={entry.id}
                onClick={() => onOpenEntry(entry.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between group shadow-xs ${
                  isDark
                    ? 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                    : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50'
                }`}
                id={`card-favorite-entry-${entry.id}`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      {dateStr}
                    </span>

                    <div className="flex items-center gap-2">
                      {entry.mood && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50">
                          {entry.mood}
                        </span>
                      )}

                      {onToggleFavorite && (
                        <button
                          type="button"
                          onClick={(e) => onToggleFavorite(entry.id, e)}
                          className="text-amber-500 hover:text-neutral-400 transition-colors p-1"
                          title="Unstar favorite"
                        >
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {entry.title || 'Untitled Reflection'}
                  </h3>

                  <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-3 leading-relaxed">
                    {preview}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>{entry.category}</span>
                  {entry.ragReflection && (
                    <span className="inline-flex items-center gap-1 text-indigo-500 text-[10px] font-medium">
                      <Sparkles className="w-3 h-3" />
                      AI Reflected
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
