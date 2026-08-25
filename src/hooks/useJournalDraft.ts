import { useState, useEffect, useCallback, useRef } from 'react';
import { JournalMood, ReflectionActionType } from '../types';

export interface JournalDraftState {
  entryId: string;
  title: string;
  content: string;
  category: string;
  mood: JournalMood;
  tags: string[];
  actionType?: ReflectionActionType;
  lastSavedAt: number;
}

export interface UseJournalDraftOptions {
  entryId?: string;
  userId?: string | null;
  initialData?: {
    title?: string;
    content?: string;
    category?: string;
    mood?: JournalMood;
    tags?: string[];
    actionType?: ReflectionActionType;
  };
  debounceMs?: number;
  enabled?: boolean;
}

export interface UseJournalDraftReturn {
  draft: JournalDraftState;
  hasUnsavedDraft: boolean;
  lastSavedTime: Date | null;
  saveDraftNow: (overrideState?: Partial<JournalDraftState>) => void;
  updateDraftField: <K extends keyof JournalDraftState>(field: K, value: JournalDraftState[K]) => void;
  updateDraft: (fields: Partial<JournalDraftState>) => void;
  clearDraft: () => void;
  restoreDraft: () => JournalDraftState | null;
  discardDraft: () => void;
  isDraftLoaded: boolean;
  formattedLastSaved: string;
}

const STORAGE_PREFIX = 'reflectai_journal_draft_v1';

/**
 * Generates a storage key scoped to user UID and entry ID
 */
function getStorageKey(userId?: string | null, entryId?: string): string {
  const safeUser = userId && typeof userId === 'string' && userId.trim() ? userId.trim() : 'anonymous';
  const safeEntry = entryId && typeof entryId === 'string' && entryId.trim() ? entryId.trim() : 'new_entry';
  return `${STORAGE_PREFIX}__${safeUser}__${safeEntry}`;
}

/**
 * Safely reads from localStorage with error trapping
 */
function readStorage(key: string): JournalDraftState | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        entryId: String(parsed.entryId || ''),
        title: String(parsed.title || ''),
        content: String(parsed.content || ''),
        category: String(parsed.category || 'Daily Reflection'),
        mood: (parsed.mood as JournalMood) || 'Thoughtful',
        tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : ['Reflection'],
        actionType: parsed.actionType || 'reflection',
        lastSavedAt: Number(parsed.lastSavedAt) || Date.now()
      };
    }
  } catch (err) {
    console.warn('[useJournalDraft] Failed to read draft from localStorage:', err);
  }
  return null;
}

/**
 * Safely writes to localStorage
 */
function writeStorage(key: string, data: JournalDraftState): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    window.localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    console.warn('[useJournalDraft] Failed to write draft to localStorage:', err);
    return false;
  }
}

/**
 * Safely deletes from localStorage
 */
function deleteStorage(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn('[useJournalDraft] Failed to clear draft from localStorage:', err);
  }
}

/**
 * Custom React Hook to sync active journal reflection draft to localStorage.
 * Prevents data loss when refreshing or accidentally navigating away.
 */
export function useJournalDraft({
  entryId = 'new-entry',
  userId = null,
  initialData,
  debounceMs = 800,
  enabled = true
}: UseJournalDraftOptions = {}): UseJournalDraftReturn {
  const storageKey = getStorageKey(userId, entryId);

  // Initialize draft state
  const [draft, setDraftState] = useState<JournalDraftState>(() => {
    return {
      entryId,
      title: initialData?.title || '',
      content: initialData?.content || '',
      category: initialData?.category || 'Daily Reflection',
      mood: initialData?.mood || 'Thoughtful',
      tags: initialData?.tags || ['Reflection'],
      actionType: initialData?.actionType || 'reflection',
      lastSavedAt: 0
    };
  });

  const [hasUnsavedDraft, setHasUnsavedDraft] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [isDraftLoaded, setIsDraftLoaded] = useState<boolean>(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const draftRef = useRef<JournalDraftState>(draft);
  draftRef.current = draft;

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    if (!enabled) return;

    const stored = readStorage(storageKey);
    if (stored) {
      // Check if stored draft has meaningful content
      const hasMeaningfulContent =
        stored.content.trim().length > 0 ||
        stored.title.trim().length > 0 ||
        (stored.tags && stored.tags.length > 1);

      // Compare with initialData
      const initialContent = initialData?.content || '';
      const initialTitle = initialData?.title || '';
      const isDifferentFromInitial =
        stored.content.trim() !== initialContent.trim() ||
        stored.title.trim() !== initialTitle.trim();

      if (hasMeaningfulContent && isDifferentFromInitial) {
        setHasUnsavedDraft(true);
        setLastSavedTime(new Date(stored.lastSavedAt));
      }
    }

    setIsDraftLoaded(true);
  }, [storageKey, enabled]);

  // 2. Synchronous save before tab unload / refresh
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      const current = draftRef.current;
      if (current.content.trim() || current.title.trim()) {
        const payload: JournalDraftState = {
          ...current,
          lastSavedAt: Date.now()
        };
        writeStorage(storageKey, payload);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [storageKey, enabled]);

  // 3. Multi-tab synchronization
  useEffect(() => {
    if (!enabled) return;

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === storageKey && event.newValue) {
        try {
          const remoteDraft: JournalDraftState = JSON.parse(event.newValue);
          if (remoteDraft && remoteDraft.lastSavedAt > (draftRef.current.lastSavedAt || 0)) {
            setLastSavedTime(new Date(remoteDraft.lastSavedAt));
            setHasUnsavedDraft(true);
          }
        } catch {
          // ignore parsing error from external tabs
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [storageKey, enabled]);

  // Immediate save execution
  const saveDraftNow = useCallback(
    (overrideState?: Partial<JournalDraftState>) => {
      if (!enabled) return;

      const toSave: JournalDraftState = {
        ...draftRef.current,
        ...(overrideState || {}),
        lastSavedAt: Date.now()
      };

      // Only write to localStorage if there's meaningful user input
      if (toSave.content.trim() || toSave.title.trim()) {
        const ok = writeStorage(storageKey, toSave);
        if (ok) {
          setDraftState(toSave);
          setLastSavedTime(new Date(toSave.lastSavedAt));
          setHasUnsavedDraft(false);
        }
      }
    },
    [storageKey, enabled]
  );

  // Debounced auto-save
  const scheduleDebouncedSave = useCallback(() => {
    if (!enabled) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const current = draftRef.current;
      if (current.content.trim() || current.title.trim()) {
        const toSave: JournalDraftState = {
          ...current,
          lastSavedAt: Date.now()
        };
        const ok = writeStorage(storageKey, toSave);
        if (ok) {
          setLastSavedTime(new Date(toSave.lastSavedAt));
        }
      }
    }, debounceMs);
  }, [storageKey, debounceMs, enabled]);

  // Update a single draft field
  const updateDraftField = useCallback(
    <K extends keyof JournalDraftState>(field: K, value: JournalDraftState[K]) => {
      setDraftState((prev) => {
        const next = { ...prev, [field]: value };
        draftRef.current = next;
        return next;
      });
      scheduleDebouncedSave();
    },
    [scheduleDebouncedSave]
  );

  // Update multiple draft fields
  const updateDraft = useCallback(
    (fields: Partial<JournalDraftState>) => {
      setDraftState((prev) => {
        const next = { ...prev, ...fields };
        draftRef.current = next;
        return next;
      });
      scheduleDebouncedSave();
    },
    [scheduleDebouncedSave]
  );

  // Clear draft (e.g. after successful Firestore save or user explicitly discards)
  const clearDraft = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    deleteStorage(storageKey);
    setHasUnsavedDraft(false);
  }, [storageKey]);

  // Restore stored draft into active state
  const restoreDraft = useCallback((): JournalDraftState | null => {
    const stored = readStorage(storageKey);
    if (stored) {
      setDraftState(stored);
      draftRef.current = stored;
      setHasUnsavedDraft(false);
      setLastSavedTime(new Date(stored.lastSavedAt));
      return stored;
    }
    return null;
  }, [storageKey]);

  // Discard stored draft
  const discardDraft = useCallback(() => {
    deleteStorage(storageKey);
    setHasUnsavedDraft(false);
  }, [storageKey]);

  // Format relative last saved text
  const formattedLastSaved = lastSavedTime
    ? `Draft saved locally ${lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
    : 'Auto-sync active';

  return {
    draft,
    hasUnsavedDraft,
    lastSavedTime,
    saveDraftNow,
    updateDraftField,
    updateDraft,
    clearDraft,
    restoreDraft,
    discardDraft,
    isDraftLoaded,
    formattedLastSaved
  };
}
