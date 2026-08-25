import { JournalEntry, StreakData } from '../types';

export function calculateStreak(entries: JournalEntry[]): StreakData {
  if (!entries || entries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      lastJournaledDate: null,
      isStreakActiveToday: false,
      streakStatus: 'INACTIVE',
      milestones: getMilestones(0)
    };
  }

  // Extract unique sorted dates (YYYY-MM-DD in local time)
  const dateSet = new Set<string>();
  entries.forEach((e) => {
    if (e.createdAt) {
      const d = new Date(e.createdAt);
      if (!isNaN(d.getTime())) {
        const dateStr = d.toISOString().split('T')[0];
        dateSet.add(dateStr);
      }
    }
  });

  const sortedDates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  const totalActiveDays = sortedDates.length;

  if (totalActiveDays === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      lastJournaledDate: null,
      isStreakActiveToday: false,
      streakStatus: 'INACTIVE',
      milestones: getMilestones(0)
    };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const hasJournaledToday = sortedDates.includes(todayStr);
  const hasJournaledYesterday = sortedDates.includes(yesterdayStr);

  let currentStreak = 0;

  if (hasJournaledToday || hasJournaledYesterday) {
    let checkDate = new Date(hasJournaledToday ? todayStr : yesterdayStr);
    while (true) {
      const dateKey = checkDate.toISOString().split('T')[0];
      if (dateSet.has(dateKey)) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across all history
  let longestStreak = 0;
  if (sortedDates.length > 0) {
    const ascDates = Array.from(dateSet).sort((a, b) => a.localeCompare(b));
    let tempStreak = 1;
    longestStreak = 1;

    for (let i = 1; i < ascDates.length; i++) {
      const prev = new Date(ascDates[i - 1]);
      const curr = new Date(ascDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
  }

  const streakStatus = hasJournaledToday
    ? 'ACTIVE'
    : hasJournaledYesterday
    ? 'AT_RISK'
    : 'INACTIVE';

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalActiveDays,
    lastJournaledDate: sortedDates[0] || null,
    isStreakActiveToday: hasJournaledToday,
    streakStatus,
    milestones: getMilestones(Math.max(longestStreak, currentStreak))
  };
}

function getMilestones(maxDays: number) {
  const definitions = [
    { id: 'm1', name: 'First Spark', days: 1, badgeIcon: '✨' },
    { id: 'm3', name: '3-Day Momentum', days: 3, badgeIcon: '🔥' },
    { id: 'm7', name: '7-Day Philosopher', days: 7, badgeIcon: '🌿' },
    { id: 'm14', name: '14-Day Resilient Thinker', days: 14, badgeIcon: '⚡' },
    { id: 'm30', name: '30-Day Zen Master', days: 30, badgeIcon: '💎' },
    { id: 'm100', name: '100-Day Centered Sage', days: 100, badgeIcon: '👑' }
  ];

  return definitions.map((m) => ({
    ...m,
    unlocked: maxDays >= m.days,
    unlockedAt: maxDays >= m.days ? 'Unlocked' : undefined
  }));
}
