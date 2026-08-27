import React, { useState, useEffect } from 'react';
import {
  Brain,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Lock,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Tag,
  Info,
  Calendar
} from 'lucide-react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { AIMemory } from '../types';
import { handleFirestoreError, OperationType } from '../firebase/firestoreErrors';

const MEMORY_CATEGORIES = [
  'Goals',
  'Habits',
  'Relationships',
  'Mindset',
  'Work & Projects',
  'General'
] as const;

export const MemoriesView: React.FC = () => {
  const { user } = useAuth();
  const [memories, setMemories] = useState<AIMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMemoryEnabled, setIsMemoryEnabled] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<any>('General');
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load memories from Firestore
  useEffect(() => {
    if (!user?.uid) {
      setMemories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const path = `users/${user.uid}/memories`;

    try {
      const memoriesRef = collection(db, 'users', user.uid, 'memories');
      const q = query(memoriesRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: AIMemory[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            items.push({
              id: docSnap.id,
              userId: user.uid,
              text: data.text || '',
              category: data.category || 'General',
              sourceEntryId: data.sourceEntryId,
              createdAt: data.createdAt || new Date().toISOString(),
              isActive: data.isActive !== false
            });
          });
          setMemories(items);
          setLoading(false);
        },
        (error) => {
          console.warn('Firestore memories fallback:', error);
          setLoading(false);
          // Local fallback
          const local = localStorage.getItem(`reflectai_memories_${user.uid}`);
          if (local) {
            try {
              setMemories(JSON.parse(local));
            } catch {}
          }
        }
      );

      // Load user preferences for memory toggle
      const savedPref = localStorage.getItem(`reflectai_ai_memory_enabled_${user.uid}`);
      if (savedPref !== null) {
        setIsMemoryEnabled(savedPref === 'true');
      }

      return () => unsubscribe();
    } catch (err) {
      console.error('Error fetching memories:', err);
      setLoading(false);
    }
  }, [user?.uid]);

  const handleToggleMemoryEnabled = (enabled: boolean) => {
    setIsMemoryEnabled(enabled);
    if (user?.uid) {
      localStorage.setItem(`reflectai_ai_memory_enabled_${user.uid}`, String(enabled));
      try {
        const prefRef = doc(db, 'users', user.uid, 'preferences', 'general');
        setDoc(prefRef, { aiMemoryEnabled: enabled, updatedAt: new Date().toISOString() }, { merge: true });
      } catch {}
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newText.trim()) return;

    const id = 'mem-' + Date.now();
    const newMem: AIMemory = {
      id,
      userId: user.uid,
      text: newText.trim(),
      category: newCategory,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    setMemories((prev) => [newMem, ...prev]);
    setNewText('');
    setShowAddModal(false);

    try {
      const docRef = doc(db, 'users', user.uid, 'memories', id);
      await setDoc(docRef, { ...newMem, firestoreTimestamp: serverTimestamp() });
      localStorage.setItem(`reflectai_memories_${user.uid}`, JSON.stringify([newMem, ...memories]));
    } catch (err) {
      console.error('Failed to add memory:', err);
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/memories/${id}`);
    }
  };

  const handleToggleActive = async (mem: AIMemory) => {
    if (!user) return;
    const updated = !mem.isActive;
    setMemories((prev) => prev.map((m) => (m.id === mem.id ? { ...m, isActive: updated } : m)));

    try {
      const docRef = doc(db, 'users', user.uid, 'memories', mem.id);
      await setDoc(docRef, { isActive: updated }, { merge: true });
    } catch (err) {
      console.error('Failed to toggle memory active status:', err);
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!user || !editText.trim()) return;

    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, text: editText.trim() } : m)));
    setEditingMemoryId(null);

    try {
      const docRef = doc(db, 'users', user.uid, 'memories', id);
      await setDoc(docRef, { text: editText.trim() }, { merge: true });
    } catch (err) {
      console.error('Failed to save memory edit:', err);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!user) return;
    setMemories((prev) => prev.filter((m) => m.id !== id));

    try {
      const docRef = doc(db, 'users', user.uid, 'memories', id);
      await deleteDoc(docRef);
      localStorage.setItem(`reflectai_memories_${user.uid}`, JSON.stringify(memories.filter((m) => m.id !== id)));
    } catch (err) {
      console.error('Failed to delete memory:', err);
    }
  };

  const handleClearAllMemories = async () => {
    if (!user) return;
    setIsProcessing(true);

    try {
      const memsRef = collection(db, 'users', user.uid, 'memories');
      const snap = await getDocs(memsRef);
      const deletes = snap.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletes);

      setMemories([]);
      localStorage.removeItem(`reflectai_memories_${user.uid}`);
      setShowClearConfirm(false);
    } catch (err) {
      console.error('Failed to clear all memories:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-neutral-900 text-neutral-100" id="memories-view-root">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-950/50 via-neutral-900 to-indigo-950/40 border border-neutral-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
                <Brain className="w-5 h-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                AI Long-Term Memory
              </h1>
            </div>
            <p className="text-xs text-neutral-400 max-w-xl">
              ReflectAI securely learns meaningful goals, habits, and recurring insights from your reflections to provide deeply contextual, personalized guidance over time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md active:scale-98"
              id="btn-add-memory"
            >
              <Plus className="w-4 h-4" />
              <span>Add Memory</span>
            </button>
          </div>
        </div>

        {/* Global Memory Retrieval Toggle & Privacy Box */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                Contextual Memory Retrieval in Reflections
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                  {memories.filter((m) => m.isActive).length} Active Points
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                When enabled, Gemini accesses relevant memory points during journaling to connect past themes.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleToggleMemoryEnabled(!isMemoryEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isMemoryEnabled
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
          >
            {isMemoryEnabled ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-neutral-500" />}
            <span>{isMemoryEnabled ? 'Memory Enabled' : 'Memory Disabled'}</span>
          </button>
        </div>

        {/* Memories List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-purple-400" />
              Stored Reflection Memories ({memories.length})
            </h2>

            {memories.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear All Memories
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center text-neutral-500 text-xs">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading your personal memory vault...
            </div>
          ) : memories.length === 0 ? (
            <div className="p-8 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 text-center space-y-3">
              <Brain className="w-8 h-8 text-neutral-600 mx-auto" />
              <div className="text-xs font-semibold text-white">No memory points extracted yet</div>
              <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
                As you journal and converse with ReflectAI, key goals and milestones will automatically appear here. You can also add custom memory points manually.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add First Memory
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {memories.map((mem) => {
                const isEditing = editingMemoryId === mem.id;

                return (
                  <div
                    key={mem.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      mem.isActive
                        ? 'bg-neutral-950/80 border-neutral-800 hover:border-purple-500/40'
                        : 'bg-neutral-950/40 border-neutral-900 opacity-60'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                          {mem.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleActive(mem)}
                            className="text-[10px] text-neutral-500 hover:text-neutral-300 px-1.5 py-0.5 rounded hover:bg-neutral-900 transition-colors"
                            title={mem.isActive ? 'Deactivate Memory' : 'Activate Memory'}
                          >
                            {mem.isActive ? 'Active' : 'Muted'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingMemoryId(mem.id);
                              setEditText(mem.text);
                            }}
                            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteMemory(mem.id)}
                            className="p-1 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-800 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="space-y-2 pt-1">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={3}
                            className="w-full p-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingMemoryId(null)}
                              className="px-2.5 py-1 rounded-md text-[11px] text-neutral-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEdit(mem.id)}
                              className="px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-200 leading-relaxed font-sans">
                          "{mem.text}"
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-neutral-900 flex items-center justify-between text-[10px] text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(mem.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-mono text-purple-400/70">
                        {mem.sourceEntryId ? 'Auto-Extracted' : 'User Authored'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                Add Long-Term Memory Point
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMemory} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1.5">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {MEMORY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1.5">
                  Memory Description
                </label>
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="e.g. Currently focused on morning meditation and building deep work focus."
                  rows={4}
                  required
                  className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-neutral-900 border border-red-900/60 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-sm font-bold text-white">Clear All AI Memories?</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              This will permanently delete all extracted personal facts and long-term memory points from your Firestore account.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllMemories}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all"
              >
                {isProcessing ? 'Clearing...' : 'Yes, Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
