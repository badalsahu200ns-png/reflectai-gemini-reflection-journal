import { JournalEntry, AIMemory } from '../types';

/**
 * Selects 2 to 5 relevant historical journal entries for user-scoped RAG reflection.
 * Ranks by category match, shared tags, mood similarity, and recency without overloading context.
 */
export function retrieveRelevantHistoricalEntries(
  currentEntry: { title?: string; content?: string; category?: string; mood?: string; tags?: string[] },
  allEntries: JournalEntry[],
  currentEntryId?: string,
  maxEntries: number = 4
): Array<{ id: string; date: string; title: string; excerpt: string; mood?: string; tags?: string[] }> {
  // Filter out the active entry being edited
  const candidates = allEntries.filter((e) => e.id !== currentEntryId);

  if (candidates.length === 0) return [];

  const currentTags = new Set((currentEntry.tags || []).map((t) => t.toLowerCase()));
  const currentContent = (currentEntry.content || '').toLowerCase();
  const currentTitle = (currentEntry.title || '').toLowerCase();

  const scored = candidates.map((entry) => {
    let score = 0;

    // 1. Tag overlap (high relevance)
    if (entry.tags && entry.tags.length > 0) {
      entry.tags.forEach((tag) => {
        if (currentTags.has(tag.toLowerCase())) {
          score += 3;
        }
      });
    }

    // 2. Category match
    if (entry.category && currentEntry.category && entry.category === currentEntry.category) {
      score += 2;
    }

    // 3. Mood similarity
    if (entry.mood && currentEntry.mood && entry.mood === currentEntry.mood) {
      score += 1.5;
    }

    // 4. Keyword overlap in titles
    if (entry.title && (currentContent.includes(entry.title.toLowerCase()) || currentTitle.includes(entry.title.toLowerCase()))) {
      score += 2.5;
    }

    // 5. Recency boost (entries in last 14 days get a slight boost)
    const entryDate = new Date(entry.createdAt).getTime();
    const daysAgo = (Date.now() - entryDate) / (1000 * 60 * 60 * 24);
    if (daysAgo <= 7) score += 2;
    else if (daysAgo <= 30) score += 1;

    // 6. Pinned entry importance
    if (entry.isPinned) score += 1.5;

    // Build excerpt
    const content = entry.content || (entry.turns && entry.turns.length > 0 ? entry.turns.map((t) => t.content).join(' ') : '');
    const excerpt = content.length > 300 ? content.slice(0, 300) + '...' : content;

    return {
      score,
      id: entry.id,
      date: new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      title: entry.title,
      excerpt,
      mood: entry.mood,
      tags: entry.tags
    };
  });

  // Sort descending by score, take top maxEntries
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxEntries).map(({ score, ...rest }) => rest);
}
