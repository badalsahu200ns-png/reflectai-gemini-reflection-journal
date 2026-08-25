import { JournalEntry, JournalMood } from '../types';

export interface PersonalAnalyticsData {
  totalEntries: number;
  totalWords: number;
  avgWordsPerEntry: number;
  totalTurns: number;
  avgTurnsPerEntry: number;
  moodCounts: Record<JournalMood, number>;
  moodPercentages: { mood: JournalMood; count: number; percentage: number; color: string }[];
  categoryCounts: Record<string, number>;
  timeOfDayCounts: {
    morning: number; // 5:00 - 11:59
    afternoon: number; // 12:00 - 16:59
    evening: number; // 17:00 - 21:59
    night: number; // 22:00 - 4:59
  };
  sentimentTimeline: {
    date: string;
    title: string;
    score: number; // 0 - 100
    energy: number; // 1 - 10
    mood?: string;
  }[];
  topTags: { tag: string; count: number }[];
  geotaggedEntriesCount: number;
}

const MOOD_COLOR_MAP: Record<JournalMood, string> = {
  Grateful: '#10b981', // Emerald
  Calm: '#06b6d4', // Cyan
  Focused: '#6366f1', // Indigo
  Thoughtful: '#a855f7', // Purple
  Curious: '#ec4899', // Pink
  Energized: '#f59e0b', // Amber
  Anxious: '#ef4444' // Red
};

export function computePersonalAnalytics(entries: JournalEntry[]): PersonalAnalyticsData {
  const totalEntries = entries.length;

  let totalWords = 0;
  let totalTurns = 0;
  let geotaggedCount = 0;

  const moodCounts: Record<JournalMood, number> = {
    Thoughtful: 0,
    Energized: 0,
    Calm: 0,
    Focused: 0,
    Anxious: 0,
    Curious: 0,
    Grateful: 0
  };

  const categoryCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};
  const timeOfDayCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };

  const sentimentTimeline: PersonalAnalyticsData['sentimentTimeline'] = [];

  // Sort ascending for timeline
  const chronEntries = [...entries].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  chronEntries.forEach((entry) => {
    // Word calculation
    let entryWords = 0;
    if (entry.turns && entry.turns.length > 0) {
      entry.turns.forEach((t) => {
        if (t.content) {
          entryWords += t.content.trim().split(/\s+/).filter(Boolean).length;
        }
      });
      totalTurns += entry.turns.length;
    } else if (entry.wordCount) {
      entryWords = entry.wordCount;
    }
    totalWords += entryWords;

    // Mood counting
    if (entry.mood && entry.mood in moodCounts) {
      moodCounts[entry.mood]++;
    }

    // Category
    const cat = entry.category || 'Daily Reflection';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    // Tags
    if (Array.isArray(entry.tags)) {
      entry.tags.forEach((tag) => {
        const clean = tag.trim().toLowerCase();
        if (clean) tagCounts[clean] = (tagCounts[clean] || 0) + 1;
      });
    }

    // Geotagged count
    if (entry.location && typeof entry.location.lat === 'number') {
      geotaggedCount++;
    }

    // Time of day
    if (entry.createdAt) {
      const d = new Date(entry.createdAt);
      if (!isNaN(d.getTime())) {
        const hour = d.getHours();
        if (hour >= 5 && hour < 12) timeOfDayCounts.morning++;
        else if (hour >= 12 && hour < 17) timeOfDayCounts.afternoon++;
        else if (hour >= 17 && hour < 22) timeOfDayCounts.evening++;
        else timeOfDayCounts.night++;

        // Sentiment estimation or AI scored
        let score = 70; // default baseline
        let energy = 6;
        if (entry.moodAnalysis) {
          score = entry.moodAnalysis.sentimentScore;
          energy = entry.moodAnalysis.energyLevel;
        } else if (entry.mood) {
          if (entry.mood === 'Grateful') score = 90;
          else if (entry.mood === 'Energized') { score = 88; energy = 9; }
          else if (entry.mood === 'Calm') score = 82;
          else if (entry.mood === 'Focused') score = 78;
          else if (entry.mood === 'Curious') score = 75;
          else if (entry.mood === 'Thoughtful') score = 68;
          else if (entry.mood === 'Anxious') { score = 35; energy = 4; }
        }

        sentimentTimeline.push({
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          title: entry.title,
          score,
          energy,
          mood: entry.mood
        });
      }
    }
  });

  const totalMoodEntries = Object.values(moodCounts).reduce((a, b) => a + b, 0) || 1;
  const moodPercentages = (Object.keys(moodCounts) as JournalMood[])
    .filter((mood) => moodCounts[mood] > 0)
    .map((mood) => ({
      mood,
      count: moodCounts[mood],
      percentage: Math.round((moodCounts[mood] / totalMoodEntries) * 100),
      color: MOOD_COLOR_MAP[mood] || '#a855f7'
    }))
    .sort((a, b) => b.count - a.count);

  const topTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalEntries,
    totalWords,
    avgWordsPerEntry: totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0,
    totalTurns,
    avgTurnsPerEntry: totalEntries > 0 ? Math.round((totalTurns / totalEntries) * 10) / 10 : 0,
    moodCounts,
    moodPercentages,
    categoryCounts,
    timeOfDayCounts,
    sentimentTimeline: sentimentTimeline.slice(-14), // Last 14 reflection points
    topTags,
    geotaggedEntriesCount: geotaggedCount
  };
}
