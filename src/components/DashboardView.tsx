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
  MessageSquareQuote,
  FileEdit,
  History,
  ShieldCheck,
  Sparkles,
  Plus,
  Lock,
  Layers,
  CheckCircle2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { JournalEntry } from '../types';
import { Navbar } from './Navbar';
import { JournalHistorySidebar } from './JournalHistorySidebar';
import { JournalWorkspace } from './JournalWorkspace';
import { JournalEditor } from './JournalEditor';
import { HistoryView } from './HistoryView';
import { SecurityInspectorModal } from './SecurityInspectorModal';
import { handleFirestoreError, OperationType } from '../firebase/firestoreErrors';

type DashboardTab = 'studio' | 'editor' | 'history';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('studio');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isAiGeneratingGlobal, setIsAiGeneratingGlobal] = useState(false);

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

          // If no active entry selected and entries exist, select the most recent one
          setActiveEntryId((curr) => {
            if (curr && fetched.some((e) => e.id === curr)) return curr;
            return fetched.length > 0 ? fetched[0].id : null;
          });
        },
        (error) => {
          console.warn('Firestore real-time listener fallback:', error);
          setLoading(false);
          try {
            handleFirestoreError(error, OperationType.LIST, path);
          } catch (e) {
            // Local storage backup for offline/demo resilience
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
        }
      );

      return () => unsubscribe();
    } catch (err: unknown) {
      console.error('Error attaching Firestore snapshot listener:', err);
      setLoading(false);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }, [user?.uid]);

  // Create a brand new journal entry
  const handleCreateNewEntry = async () => {
    if (!user) return;

    const newId = 'entry-' + Date.now();
    const newEntry: JournalEntry = {
      id: newId,
      userId: user.uid,
      title: 'Untitled Reflection',
      category: 'Daily Reflection',
      mood: 'Thoughtful',
      tags: ['Reflection'],
      turns: [],
      summary: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      wordCount: 0
    };

    setEntries((prev) => [newEntry, ...prev]);
    setActiveEntryId(newId);
    setActiveTab('studio');

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
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/entries/${newId}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Update existing entry
  const handleUpdateEntry = async (updatedFields: Partial<JournalEntry>) => {
    if (!user || !activeEntryId) return;

    setIsSaving(true);
    const now = new Date().toISOString();
    const currentEntry = entries.find((e) => e.id === activeEntryId);
    if (!currentEntry) return;

    const mergedEntry: JournalEntry = {
      ...currentEntry,
      ...updatedFields,
      updatedAt: now
    };

    setEntries((prev) =>
      prev.map((e) => (e.id === activeEntryId ? mergedEntry : e))
    );

    try {
      const entryDocRef = doc(db, 'users', user.uid, 'entries', activeEntryId);
      await setDoc(
        entryDocRef,
        {
          ...mergedEntry,
          firestoreUpdatedAt: serverTimestamp()
        },
        { merge: true }
      );

      const updatedList = entries.map((e) =>
        e.id === activeEntryId ? mergedEntry : e
      );
      localStorage.setItem(`reflectai_entries_${user.uid}`, JSON.stringify(updatedList));
    } catch (err: unknown) {
      console.error('Failed to update entry in Firestore:', err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/entries/${activeEntryId}`);
    } finally {
      setIsSaving(false);
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

      const remaining = entries.filter((e) => e.id !== entryId);
      localStorage.setItem(`reflectai_entries_${user.uid}`, JSON.stringify(remaining));
    } catch (err: unknown) {
      console.error('Failed to delete entry in Firestore:', err);
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/entries/${entryId}`);
    }
  };

  // Toggle Pin
  const handleTogglePin = async (entryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    const target = entries.find((item) => item.id === entryId);
    if (!target) return;

    const newPinned = !target.isPinned;
    const updated = { ...target, isPinned: newPinned };

    setEntries((prev) => prev.map((item) => (item.id === entryId ? updated : item)));

    try {
      const entryDocRef = doc(db, 'users', user.uid, 'entries', entryId);
      await setDoc(entryDocRef, { isPinned: newPinned }, { merge: true });
    } catch (err: unknown) {
      console.error('Failed to toggle pin:', err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/entries/${entryId}`);
    }
  };

  const activeEntry = entries.find((e) => e.id === activeEntryId);

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col font-sans" id="dashboard-view-root">
      {/* Top Navbar */}
      <Navbar
        onOpenSecurityInspector={() => setIsInspectorOpen(true)}
        entriesCount={entries.length}
      />

      {/* Navigation Subheader / Mode Switcher */}
      <div className="h-12 border-b border-neutral-800 bg-neutral-950/80 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Multi-Turn Studio Tab */}
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'studio'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
            id="tab-studio"
          >
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Multi-Turn Studio</span>
          </button>

          {/* Dedicated Journal Editor Tab */}
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'editor'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
            id="tab-editor"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Journal Editor</span>
          </button>

          {/* History Archives Tab */}
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
            id="tab-history"
          >
            <History className="w-3.5 h-3.5" />
            <span>History Archive</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
              {entries.length}
            </span>
          </button>
        </div>

        {/* Global Firestore Security Scope indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
            <Lock className="w-3 h-3" />
            Firestore Path: /users/{user?.uid ? `${user.uid.slice(0, 8)}...` : 'anon'}/entries
          </span>
        </div>
      </div>

      {/* Main Tab Content with Framer Motion transitions */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
          {/* Tab 1: Multi-Turn Studio Workspace with Left History Sidebar */}
          {activeTab === 'studio' && (
            <motion.div
              key="studio"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col md:flex-row overflow-hidden h-full"
            >
              <JournalHistorySidebar
                entries={entries}
                activeEntryId={activeEntryId}
                onSelectEntry={(entry) => setActiveEntryId(entry.id)}
                onNewEntry={handleCreateNewEntry}
                onDeleteEntry={handleDeleteEntry}
                onTogglePin={handleTogglePin}
                loading={loading}
              />

              {activeEntry ? (
                <JournalWorkspace
                  entry={activeEntry}
                  onUpdateEntry={handleUpdateEntry}
                  onDeleteEntry={handleDeleteEntry}
                  isSaving={isSaving}
                  onAiStateChange={setIsAiGeneratingGlobal}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-neutral-900">
                  <div className="max-w-md space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-800 flex items-center justify-center mx-auto text-purple-400">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Your Personal Reflection Studio</h2>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Capture thoughts, brainstorm solutions, and converse multi-turn with Gemini 3.6 Flash. All records are isolated in Cloud Firestore.
                    </p>
                    <button
                      onClick={handleCreateNewEntry}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                      id="btn-create-first-reflection"
                    >
                      <Plus className="w-4 h-4" />
                      Create Reflection Entry
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 2: Dedicated Journal Editor Component */}
          {activeTab === 'editor' && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-y-auto p-4 sm:p-8 bg-neutral-900 h-full"
            >
              <div className="max-w-4xl mx-auto space-y-6">
                <JournalEditor
                  initialEntry={activeEntry}
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
                    setActiveTab('studio');
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Tab 3: Dedicated History View Component */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col overflow-hidden h-full"
            >
              <HistoryView
                onSelectEntryForEditing={(entry) => {
                  setActiveEntryId(entry.id);
                  setActiveTab('studio');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Security & Rules Inspector Modal */}
      <SecurityInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />
    </div>
  );
};
