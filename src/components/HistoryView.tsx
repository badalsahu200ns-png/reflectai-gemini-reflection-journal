import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import {
  History,
  BookOpen,
  Search,
  Pin,
  Trash2,
  ExternalLink,
  Sparkles,
  Calendar,
  Tag,
  Smile,
  Download,
  Filter,
  RefreshCw,
  MessageSquareQuote,
  CheckCircle2,
  Eye,
  FileText,
  X,
  ChevronRight,
  ListTodo,
  Activity,
  LayoutGrid
} from 'lucide-react';
import Markdown from 'react-markdown';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { JournalEntry, JournalMood } from '../types';
import { handleFirestoreError, OperationType } from '../firebase/firestoreErrors';
import { SentimentTrendChart } from './SentimentTrendChart';

interface HistoryViewProps {
  onSelectEntryForEditing?: (entry: JournalEntry) => void;
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

export const HistoryView: React.FC<HistoryViewProps> = ({ onSelectEntryForEditing }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMood, setSelectedMood] = useState<string>('All');
  const [activeDetailEntry, setActiveDetailEntry] = useState<JournalEntry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSentimentAnalytics, setShowSentimentAnalytics] = useState<boolean>(true);

  // Fetch and sync user-scoped journal entries from Firestore
  useEffect(() => {
    if (!user?.uid) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    const path = `users/${user.uid}/entries`;

    try {
      const entriesRef = collection(db, 'users', user.uid, 'entries');
      const q = query(entriesRef, orderBy('updatedAt', 'desc'));

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
              category: data.category || 'Daily Reflection',
              mood: data.mood,
              tags: data.tags || [],
              turns: data.turns || [],
              summary: data.summary || null,
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
              isPinned: Boolean(data.isPinned),
              wordCount: data.wordCount || 0
            });
          });

          setEntries(fetched);
          setLoading(false);
        },
        (error) => {
          console.warn('Firestore history listener error:', error);
          setLoading(false);
          try {
            handleFirestoreError(error, OperationType.LIST, path);
          } catch (e: any) {
            setErrorMessage(`Firestore Read Error: ${e.message}`);
          }
        }
      );

      return () => unsubscribe();
    } catch (err: unknown) {
      console.error('Error fetching journal history:', err);
      setLoading(false);
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (e: any) {
        setErrorMessage(e.message);
      }
    }
  }, [user?.uid]);

  // Delete entry
  const handleDeleteEntry = async (entryId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user?.uid) return;

    if (!window.confirm('Delete this journal reflection from Cloud Firestore?')) {
      return;
    }

    const path = `users/${user.uid}/entries/${entryId}`;
    try {
      const docRef = doc(db, 'users', user.uid, 'entries', entryId);
      await deleteDoc(docRef);
      setEntries((prev) => prev.filter((item) => item.id !== entryId));
      if (activeDetailEntry?.id === entryId) {
        setActiveDetailEntry(null);
      }
    } catch (err: unknown) {
      console.error('Failed to delete entry:', err);
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Toggle Pin
  const handleTogglePin = async (entryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid) return;

    const target = entries.find((item) => item.id === entryId);
    if (!target) return;

    const newPinned = !target.isPinned;
    const path = `users/${user.uid}/entries/${entryId}`;

    try {
      const docRef = doc(db, 'users', user.uid, 'entries', entryId);
      await setDoc(docRef, { isPinned: newPinned }, { merge: true });
      setEntries((prev) =>
        prev.map((item) => (item.id === entryId ? { ...item, isPinned: newPinned } : item))
      );
    } catch (err: unknown) {
      console.error('Failed to toggle pin:', err);
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  // Export Markdown
  const handleExportMarkdown = (entry: JournalEntry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    let md = `# ${entry.title || 'Journal Reflection'}\n\n`;
    md += `**Date:** ${new Date(entry.createdAt).toLocaleString()}\n`;
    md += `**Category:** ${entry.category}\n`;
    if (entry.mood) md += `**Mood:** ${entry.mood}\n`;
    if (entry.tags?.length) md += `**Tags:** ${entry.tags.map((t) => `#${t}`).join(' ')}\n\n`;
    md += `---\n\n`;

    if (entry.summary) {
      md += `## Structured AI Summary\n\n${entry.summary.executiveSummary}\n\n`;
      if (entry.summary.keyThemes?.length) {
        md += `### Key Themes\n${entry.summary.keyThemes.map((t) => `- ${t}`).join('\n')}\n\n`;
      }
      if (entry.summary.growthInsights?.length) {
        md += `### Growth Insights\n${entry.summary.growthInsights.map((i) => `- ${i}`).join('\n')}\n\n`;
      }
      if (entry.summary.actionItems?.length) {
        md += `### Action Items\n${entry.summary.actionItems.map((a) => `- [ ] ${a}`).join('\n')}\n\n`;
      }
      md += `---\n\n`;
    }

    entry.turns?.forEach((t) => {
      md += `### ${t.role === 'user' ? 'Author Reflection' : 'Gemini 3.6 Flash'}\n`;
      md += `*${new Date(t.timestamp).toLocaleTimeString()}*\n\n`;
      md += `${t.content}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(entry.title || 'reflection').toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter list
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      entry.turns?.some((t) => t.content.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || entry.category === selectedCategory;

    const matchesMood =
      selectedMood === 'All' || entry.mood === selectedMood;

    return matchesSearch && matchesCategory && matchesMood;
  });

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-neutral-900 overflow-hidden" id="history-view-container">
      {/* Top Controls Header */}
      <div className="p-4 sm:p-6 border-b border-neutral-800 bg-neutral-950 shrink-0 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Personal Reflection Archives
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                  {entries.length} {entries.length === 1 ? 'record' : 'records'}
                </span>
              </h1>
              <p className="text-xs text-neutral-400">
                Encrypted & user-isolated records in Cloud Firestore (<code className="text-purple-300 font-mono text-[10px]">/users/{user?.uid}/entries</code>)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Sentiment Chart Toggle */}
            <button
              onClick={() => setShowSentimentAnalytics(!showSentimentAnalytics)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                showSentimentAnalytics
                  ? 'bg-purple-950 text-purple-200 border-purple-700/60 shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800'
              }`}
              title="Toggle Sentiment & Emotional Trends Visualization"
            >
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>{showSentimentAnalytics ? 'Hide Analytics' : 'Show Sentiment Analytics'}</span>
            </button>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reflections, insights, tags..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-neutral-500 font-bold uppercase text-[10px] flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-950/80 text-purple-200 border border-purple-700/60'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid View Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {errorMessage && (
          <div className="p-3 bg-red-950 border border-red-800 rounded-xl text-xs text-red-300">
            {errorMessage}
          </div>
        )}

        {/* Sentiment Analysis Visualizer with Animated Collapsible Container */}
        <AnimatePresence>
          {showSentimentAnalytics && entries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <SentimentTrendChart
                entries={entries}
                onSelectEntry={(entry) => {
                  if (onSelectEntryForEditing) {
                    onSelectEntryForEditing(entry);
                  } else {
                    setActiveDetailEntry(entry);
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-neutral-400 font-mono">Loading records from Cloud Firestore...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-neutral-300">No Journal Entries Found</h3>
            <p className="text-xs text-neutral-500 max-w-sm">
              {searchQuery
                ? 'Try adjusting your search keywords or active category filters.'
                : 'Write your first journal reflection in the workspace or editor to view history.'}
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{
                    duration: 0.28,
                    delay: Math.min(index * 0.035, 0.35),
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.15 } }}
                  onClick={() => setActiveDetailEntry(entry)}
                  className="group relative bg-neutral-950/70 hover:bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-md hover:shadow-xl cursor-pointer"
                >
                  <div className="space-y-2.5">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                          {entry.category}
                        </span>
                        {entry.mood && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                            {entry.mood}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleTogglePin(entry.id, e)}
                          className={`p-1 rounded hover:bg-neutral-900 text-neutral-500 transition-colors ${
                            entry.isPinned ? 'text-amber-400' : 'hover:text-neutral-300'
                          }`}
                          title={entry.isPinned ? 'Unpin' : 'Pin to top'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${entry.isPinned ? 'rotate-45 fill-amber-400' : ''}`} />
                        </button>

                        <button
                          onClick={(e) => handleDeleteEntry(entry.id, e)}
                          className="p-1 rounded hover:bg-red-950 text-neutral-500 hover:text-red-400 transition-colors"
                          title="Delete from Firestore"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                      {entry.title || 'Untitled Reflection'}
                    </h3>

                    {/* Snippet / Executive Summary */}
                    <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                      {entry.summary?.executiveSummary ||
                        entry.turns?.map((t) => t.content).join(' ') ||
                        'Draft reflection with no content yet.'}
                    </p>

                    {/* Tags */}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-1">
                        {entry.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800/80"
                          >
                            #{tag}
                          </span>
                        ))}
                        {entry.tags.length > 3 && (
                          <span className="text-[10px] text-neutral-600">+{entry.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 mt-3 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-500">
                    <div className="flex items-center gap-2">
                      <span>{entry.turns?.length || 0} {entry.turns?.length === 1 ? 'turn' : 'turns'}</span>
                      {entry.summary && (
                        <span className="text-indigo-400 flex items-center gap-1 text-[10px] font-semibold">
                          <Sparkles className="w-3 h-3" />
                          Summarized
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span>{new Date(entry.updatedAt).toLocaleDateString()}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Expanded Entry Detail Modal with Framer Motion */}
      <AnimatePresence>
        {activeDetailEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
                <div className="space-y-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
                      {activeDetailEntry.category}
                    </span>
                    {activeDetailEntry.mood && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        {activeDetailEntry.mood}
                      </span>
                    )}
                    <span className="text-[10px] text-neutral-500">
                      {new Date(activeDetailEntry.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white truncate">
                    {activeDetailEntry.title || 'Untitled Reflection'}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      if (onSelectEntryForEditing) {
                        onSelectEntryForEditing(activeDetailEntry);
                      }
                      setActiveDetailEntry(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open in Workspace
                  </button>
                  <button
                    onClick={(e) => handleExportMarkdown(activeDetailEntry, e)}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800"
                    title="Export Markdown"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveDetailEntry(null)}
                    className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-6 text-xs sm:text-sm leading-relaxed">
                {/* Structured AI Summary section if available */}
                {activeDetailEntry.summary && (
                  <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/50 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      Gemini Executive Summary & Synthesis
                    </div>
                    <p className="text-neutral-200 text-xs">
                      {activeDetailEntry.summary.executiveSummary}
                    </p>

                    {activeDetailEntry.summary.growthInsights && activeDetailEntry.summary.growthInsights.length > 0 && (
                      <div className="space-y-1 text-xs pt-2">
                        <div className="font-semibold text-emerald-400">Growth Insights:</div>
                        <ul className="list-disc list-inside text-neutral-300 space-y-0.5 text-[11px]">
                          {activeDetailEntry.summary.growthInsights.map((insight, i) => (
                            <li key={i}>{insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeDetailEntry.summary.actionItems && activeDetailEntry.summary.actionItems.length > 0 && (
                      <div className="space-y-1 text-xs pt-2">
                        <div className="font-semibold text-amber-400">Action Items:</div>
                        <ul className="list-disc list-inside text-neutral-300 space-y-0.5 text-[11px]">
                          {activeDetailEntry.summary.actionItems.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Multi-turn transcript */}
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Full Reflection Transcript ({activeDetailEntry.turns?.length || 0} turns)
                  </div>

                  {activeDetailEntry.turns?.map((turn, i) => (
                    <div
                      key={turn.id || i}
                      className={`p-4 rounded-xl text-xs sm:text-sm ${
                        turn.role === 'user'
                          ? 'bg-purple-950/40 border border-purple-800/50 text-purple-100 ml-4'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-200 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-2 pb-1 border-b border-neutral-800/40">
                        <span className="font-semibold">
                          {turn.role === 'user' ? 'Author' : `Gemini (${turn.modelUsed || '3.6 Flash'})`}
                        </span>
                        <span>{new Date(turn.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="markdown-body">
                        <Markdown>{turn.content}</Markdown>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-neutral-800 bg-neutral-900/60 flex items-center justify-between text-xs text-neutral-400">
                <span className="font-mono text-[11px]">
                  ID: {activeDetailEntry.id}
                </span>
                <button
                  onClick={() => setActiveDetailEntry(null)}
                  className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium"
                >
                  Close View
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
