import React, { useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Plus,
  Lock,
  Layers,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Calendar,
  Shield,
  Bell,
  Star
} from 'lucide-react';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { JournalEntry, AIMemory, AppNotification } from '../types';
import { Sidebar } from './Sidebar';
import { HomeView } from './HomeView';
import { JournalEditor } from './JournalEditor';
import { JournalWorkspace } from './JournalWorkspace';
import { AskMyJournalView } from './AskMyJournalView';
import { MemoriesView } from './MemoriesView';
import { AnalyticsView } from './AnalyticsView';
import { MonthlySummaryView } from './MonthlySummaryView';
import { FavoritesView } from './FavoritesView';
import { PrivacyCenterView } from './PrivacyCenterView';
import { SettingsView } from './SettingsView';
import { AdminView } from './AdminView';
import { DailyReminderModal } from './DailyReminderModal';
import { SecurityInspectorModal } from './SecurityInspectorModal';
import { NotificationCenterModal } from './NotificationCenterModal';
import { handleFirestoreError, OperationType } from '../firebase/firestoreErrors';

export type DashboardTab =
  | 'home'
  | 'journal'
  | 'ask'
  | 'insights'
  | 'memories'
  | 'favorites'
  | 'privacy'
  | 'admin'
  | 'settings';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [memories, setMemories] = useState<AIMemory[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [journalViewMode, setJournalViewMode] = useState<'editor' | 'conversation'>('editor');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // App Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Mindful Evening Reflection',
      message: 'Take 2 minutes to record your key decisions and energy level today.',
      type: 'REMINDER',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isRead: false,
      actionTab: 'journal'
    },
    {
      id: 'notif-2',
      title: 'Weekly Pattern Synthesis Available',
      message: 'Gemini identified a shift toward focus and calm over the past 7 days.',
      type: 'WEEKLY_SUMMARY',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      isRead: false,
      actionTab: 'insights'
    },
    {
      id: 'notif-3',
      title: 'Streak Milestones Maintained',
      message: 'You are continuing your daily mindful journaling pace.',
      type: 'STREAK',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isRead: true
    }
  ]);

  // Gamification & Streak state
  const [streakDays, setStreakDays] = useState<number>(() => {
    try {
      if (typeof window !== 'undefined' && user?.uid) {
        const saved = localStorage.getItem(`reflectai_streak_${user.uid}`);
        if (saved) return parseInt(saved, 10) || 1;
      }
    } catch {}
    return 1;
  });

  const [isGamificationEnabled, setIsGamificationEnabled] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && user?.uid) {
        const saved = localStorage.getItem(`reflectai_gamification_enabled_${user.uid}`);
        if (saved !== null) return saved === 'true';
      }
    } catch {}
    return true;
  });

  // Synchronize entries in real-time from Cloud Firestore
  useEffect(() => {
    if (!user?.uid) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const path = `users/${user.uid}/entries`;

    try {
      const entriesRef = collection(db, 'users', user.uid, 'entries');
      const q = query(entriesRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetched: JournalEntry[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            fetched.push({
              id: docSnap.id,
              userId: user.uid,
              title: data.title || 'Untitled Reflection',
              content: data.content || '',
              category: data.category || 'Daily Reflection',
              mood: data.mood,
              moodScale: data.moodScale || 7,
              emotions: data.emotions || [],
              tags: data.tags || [],
              turns: data.turns || [],
              summary: data.summary || null,
              ragReflection: data.ragReflection || null,
              personaUsed: data.personaUsed || 'balanced',
              inputMethod: data.inputMethod || 'text',
              location: data.location || null,
              attachments: data.attachments || [],
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
              isPinned: Boolean(data.isPinned),
              favorite: Boolean(data.favorite || data.isPinned),
              wordCount: data.wordCount || 0
            });
          });

          setEntries(fetched);
          setLoading(false);

          // Calculate streak
          if (fetched.length > 0) {
            const daysSet = new Set(
              fetched.map((e) => new Date(e.createdAt).toISOString().split('T')[0])
            );
            const calculatedStreak = Math.max(1, daysSet.size);
            setStreakDays(calculatedStreak);
            localStorage.setItem(`reflectai_streak_${user.uid}`, String(calculatedStreak));
          }

          // If no active entry selected and entries exist, select the most recent one
          setActiveEntryId((curr) => {
            if (curr && fetched.some((e) => e.id === curr)) return curr;
            return fetched.length > 0 ? fetched[0].id : null;
          });
        },
        (error) => {
          console.warn('Firestore real-time listener fallback:', error);
          setLoading(false);
          // Local storage backup for offline resilience
          const localSaved = localStorage.getItem(`reflectai_entries_${user.uid}`);
          if (localSaved) {
            try {
              const parsed = JSON.parse(localSaved);
              setEntries(parsed);
              if (parsed.length > 0 && !activeEntryId) {
                setActiveEntryId(parsed[0].id);
              }
            } catch {}
          }
        }
      );

      return () => unsubscribe();
    } catch (err: unknown) {
      console.error('Error attaching Firestore snapshot listener:', err);
      setLoading(false);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }, [user?.uid]);

  // Synchronize AI Long-Term Memories in real-time from Cloud Firestore
  useEffect(() => {
    if (!user?.uid) {
      setMemories([]);
      return;
    }

    try {
      const memsRef = collection(db, 'users', user.uid, 'memories');
      const unsubscribe = onSnapshot(
        memsRef,
        (snapshot) => {
          const fetched: AIMemory[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            fetched.push({
              id: docSnap.id,
              userId: user.uid,
              text: data.text || data.memoryText || '',
              category: data.category || 'Mindset',
              sourceEntryId: data.sourceEntryId,
              isActive: data.isActive !== false,
              createdAt: data.createdAt || new Date().toISOString()
            });
          });
          setMemories(fetched);
        },
        (err) => {
          console.warn('Memories listener warning:', err);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('Failed to load memories:', e);
    }
  }, [user?.uid]);

  // Save manual memory item
  const handleSaveMemory = async (memoryText: string, cat: string) => {
    if (!user?.uid || !memoryText.trim()) return;
    const memId = 'mem-' + Date.now();
    const newMem: AIMemory = {
      id: memId,
      userId: user.uid,
      text: memoryText.trim(),
      category: cat as any,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = doc(db, 'users', user.uid, 'memories', memId);
      await setDoc(docRef, {
        ...newMem,
        firestoreCreatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error('Error saving memory:', e);
    }
  };

  // Create a brand new journal entry
  const handleCreateNewEntry = async (initialContent?: string) => {
    if (!user) return;

    const newId = 'entry-' + Date.now();
    const newEntry: JournalEntry = {
      id: newId,
      userId: user.uid,
      title: '',
      content: initialContent || '',
      category: 'Daily Reflection',
      mood: 'Thoughtful',
      moodScale: 7,
      emotions: ['Peaceful'],
      tags: ['Reflection'],
      turns: initialContent
        ? [
            {
              id: 'turn-' + Date.now(),
              role: 'user',
              content: initialContent,
              timestamp: new Date().toISOString(),
              actionType: 'reflection'
            }
          ]
        : [],
      summary: null,
      ragReflection: null,
      personaUsed: 'balanced',
      inputMethod: 'text',
      location: null,
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      favorite: false,
      wordCount: initialContent ? initialContent.split(/\s+/).filter(Boolean).length : 0
    };

    setEntries((prev) => [newEntry, ...prev]);
    setActiveEntryId(newId);
    setActiveTab('journal');

    try {
      setIsSaving(true);
      const entryDocRef = doc(db, 'users', user.uid, 'entries', newId);
      await setDoc(entryDocRef, {
        ...newEntry,
        firestoreTimestamp: serverTimestamp()
      });

      const updatedList = [newEntry, ...entries.filter((e) => e.id !== newId)];
      localStorage.setItem(`reflectai_entries_${user.uid}`, JSON.stringify(updatedList));
    } catch (err: unknown) {
      console.error('Failed to create entry in Firestore:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle favorite / pin
  const handleToggleFavorite = async (entryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    const target = entries.find((item) => item.id === entryId);
    if (!target) return;

    const newFav = !target.favorite && !target.isPinned;
    const updated = { ...target, favorite: newFav, isPinned: newFav };

    setEntries((prev) => prev.map((item) => (item.id === entryId ? updated : item)));

    try {
      const entryDocRef = doc(db, 'users', user.uid, 'entries', entryId);
      await setDoc(entryDocRef, { favorite: newFav, isPinned: newFav }, { merge: true });
    } catch (err: unknown) {
      console.error('Failed to toggle favorite in Firestore:', err);
    }
  };

  // Delete entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!user) return;

    setEntries((prev) => prev.filter((e) => e.id !== entryId));

    if (activeEntryId === entryId) {
      const remaining = entries.filter((e) => e.id !== entryId);
      setActiveEntryId(remaining.length > 0 ? remaining[0].id : null);
    }

    try {
      const entryDocRef = doc(db, 'users', user.uid, 'entries', entryId);
      await deleteDoc(entryDocRef);
    } catch (err: unknown) {
      console.error('Failed to delete entry in Firestore:', err);
    }
  };

  // Notification handlers
  const handleMarkNotifAsRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllNotifsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearNotifs = () => {
    setNotifications([]);
  };

  const activeEntry = entries.find((e) => e.id === activeEntryId);
  const favoritesCount = entries.filter((e) => e.favorite || e.isPinned).length;
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row transition-colors bg-[#0B0D0E] text-white font-sans selection:bg-[#76B900]/20 selection:text-[#8FE000]"
      id="reflectai-dashboard-root"
    >
      {/* 1. Global Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onNewReflection={() => handleCreateNewEntry()}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        unreadNotificationsCount={unreadNotifsCount}
        entriesCount={entries.length}
        memoriesCount={memories.length}
        favoritesCount={favoritesCount}
        streakDays={streakDays}
        gamificationEnabled={isGamificationEnabled}
      />

      {/* 2. Main Content Canvas */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen pb-20 md:pb-0 relative bg-[#0B0D0E]">
        <AnimatePresence mode="wait">
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex-1"
            >
              <HomeView
                entries={entries}
                memories={memories}
                onStartReflection={(quickText) => handleCreateNewEntry(quickText)}
                onOpenEntry={(entryId) => {
                  setActiveEntryId(entryId);
                  setActiveTab('journal');
                }}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onToggleFavorite={handleToggleFavorite}
              />
            </motion.div>
          )}

          {/* TAB 2: JOURNAL & REFLECTION STUDIO */}
          {activeTab === 'journal' && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex-1 flex flex-col h-full"
            >
              {/* Top Sub-Bar for Journal: Entry Selector & Mode Switch */}
              <div
                className="px-4 sm:px-6 py-3 border-b border-[#1F2428] flex items-center justify-between shrink-0 bg-[#0E1012]"
              >
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 shrink-0">
                    Reflection Studio
                  </span>

                  {/* Mode switcher */}
                  <div
                    className="inline-flex p-0.5 rounded-xl border border-[#22272B] bg-[#111416] text-xs font-medium"
                  >
                    <button
                      onClick={() => setJournalViewMode('editor')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        journalViewMode === 'editor'
                          ? 'bg-[#76B900] text-black font-bold shadow-xs'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Studio Editor
                    </button>
                    <button
                      onClick={() => setJournalViewMode('conversation')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        journalViewMode === 'conversation'
                          ? 'bg-[#76B900] text-black font-bold shadow-xs'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Dialogue View
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleCreateNewEntry()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black text-xs font-bold shadow-[0_0_15px_rgba(118,185,0,0.2)] transition-all active:scale-95"
                  id="btn-journal-new"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>New Entry</span>
                </button>
              </div>

              {/* View Switch */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                {journalViewMode === 'editor' ? (
                  <div className="max-w-4xl mx-auto">
                    <JournalEditor
                      initialEntry={activeEntry}
                      allEntries={entries}
                      memories={memories}
                      onSaveMemory={handleSaveMemory}
                      onSaved={(saved) => {
                        setEntries((prev) => {
                          const idx = prev.findIndex((e) => e.id === saved.id);
                          if (idx >= 0) {
                            const copy = [...prev];
                            copy[idx] = saved;
                            return copy;
                          }
                          return [saved, ...prev];
                        });
                        setActiveEntryId(saved.id);
                      }}
                      onEntryReflected={(reflected) => {
                        setEntries((prev) => {
                          const idx = prev.findIndex((e) => e.id === reflected.id);
                          if (idx >= 0) {
                            const copy = [...prev];
                            copy[idx] = reflected;
                            return copy;
                          }
                          return [reflected, ...prev];
                        });
                        setActiveEntryId(reflected.id);
                      }}
                    />
                  </div>
                ) : activeEntry ? (
                  <JournalWorkspace
                    entry={activeEntry}
                    onUpdateEntry={async (fields) => {
                      const merged = { ...activeEntry, ...fields, updatedAt: new Date().toISOString() };
                      setEntries((prev) => prev.map((e) => (e.id === activeEntry.id ? merged : e)));
                      try {
                        const docRef = doc(db, 'users', user?.uid || '', 'entries', activeEntry.id);
                        await setDoc(docRef, merged, { merge: true });
                      } catch {}
                    }}
                    onDeleteEntry={handleDeleteEntry}
                    isSaving={isSaving}
                  />
                ) : (
                  <div className="text-center py-16">
                    <p className="text-sm text-neutral-400">Select or create an entry to start.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: ASK MY JOURNAL */}
          {activeTab === 'ask' && (
            <motion.div
              key="ask"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex-1 p-4 sm:p-6 lg:p-8"
            >
              <div className="max-w-4xl mx-auto">
                <AskMyJournalView
                  entries={entries}
                  memories={memories}
                  onOpenEntry={(entryId) => {
                    setActiveEntryId(entryId);
                    setActiveTab('journal');
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* TAB 4: INSIGHTS (MONTHLY SYNTHESIS & PATTERNS) */}
          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8"
            >
              <div className="max-w-5xl mx-auto space-y-8">
                <AnalyticsView
                  entries={entries}
                  onOpenEntry={(entry) => {
                    setActiveEntryId(entry.id);
                    setActiveTab('journal');
                  }}
                />
                <div className="pt-4 border-t border-[#1F2428]">
                  <MonthlySummaryView
                    entries={entries}
                    onOpenEntry={(entry) => {
                      setActiveEntryId(entry.id);
                      setActiveTab('journal');
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: MEMORIES VAULT */}
          {activeTab === 'memories' && (
            <motion.div
              key="memories"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex-1 p-4 sm:p-6 lg:p-8"
            >
              <div className="max-w-4xl mx-auto">
                <MemoriesView />
              </div>
            </motion.div>
          )}

          {/* TAB 6: FAVORITES */}
          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex-1 p-4 sm:p-6 lg:p-8"
            >
              <div className="max-w-5xl mx-auto">
                <FavoritesView
                  entries={entries}
                  onOpenEntry={(entryId) => {
                    setActiveEntryId(entryId);
                    setActiveTab('journal');
                  }}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            </motion.div>
          )}

          {/* TAB 7: PRIVACY CENTER */}
          {activeTab === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex-1 p-4 sm:p-6 lg:p-8"
            >
              <div className="max-w-4xl mx-auto">
                <PrivacyCenterView
                  entries={entries}
                  memories={memories}
                  onOpenSecurityInspector={() => setIsInspectorOpen(true)}
                />
              </div>
            </motion.div>
          )}

          {/* TAB 8: ADMIN & RBAC GOVERNANCE */}
          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex-1"
            >
              <AdminView />
            </motion.div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex-1 p-4 sm:p-6 lg:p-8"
            >
              <div className="max-w-4xl mx-auto">
                <SettingsView
                  onOpenPrivacyCenter={() => setActiveTab('privacy')}
                  onOpenSecurityInspector={() => setIsInspectorOpen(true)}
                  onOpenReminderModal={() => setIsReminderModalOpen(true)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Daily Reminder Settings Modal */}
      <DailyReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
      />

      {/* Security & Rules Inspector Modal */}
      <SecurityInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotifAsRead}
        onMarkAllAsRead={handleMarkAllNotifsAsRead}
        onClearAll={handleClearNotifs}
        onNavigateToTab={(tab, entryId) => {
          setIsNotificationCenterOpen(false);
          if (tab) setActiveTab(tab as DashboardTab);
          if (entryId) setActiveEntryId(entryId);
        }}
      />
    </div>
  );
};
