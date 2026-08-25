import React, { useState, useEffect } from 'react';
import {
  Save,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Tag,
  Smile,
  FileEdit,
  Eye,
  RefreshCw,
  HelpCircle,
  Clock,
  Send,
  RotateCcw,
  Trash2,
  HardDrive
} from 'lucide-react';
import Markdown from 'react-markdown';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { JournalEntry, JournalMood, EntryTurn, ReflectionActionType } from '../types';
import { handleFirestoreError, OperationType } from '../firebase/firestoreErrors';
import { useJournalDraft } from '../hooks/useJournalDraft';

interface JournalEditorProps {
  initialEntry?: JournalEntry | null;
  onSaved?: (entry: JournalEntry) => void;
  onEntryReflected?: (entry: JournalEntry) => void;
}

const MOODS: JournalMood[] = [
  'Thoughtful',
  'Energized',
  'Calm',
  'Focused',
  'Anxious',
  'Curious',
  'Grateful'
];

const CATEGORIES = [
  'Daily Reflection',
  'Brainstorming',
  'Decision Making',
  'Mindfulness',
  'Career & Goals',
  'Creative'
] as const;

// Input Validation and Injection Sanitization Utility
export function validateAndSanitizeInput(text: string): {
  isValid: boolean;
  sanitized: string;
  threats: string[];
  warnings: string[];
} {
  const threats: string[] = [];
  const warnings: string[] = [];
  let sanitized = text;

  // 1. Length Boundary Checks
  if (text.length > 50000) {
    threats.push('Payload exceeds safe volumetric boundary (max 50,000 characters).');
    sanitized = text.slice(0, 50000);
  }

  // 2. Cross-Site Scripting (XSS) & Unsafe HTML Tag Neutralization
  const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  if (scriptRegex.test(sanitized)) {
    threats.push('Dangerous <script> executable block detected and neutralized.');
    sanitized = sanitized.replace(scriptRegex, '[SANITIZED_SCRIPT_BLOCK]');
  }

  const iframeRegex = /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi;
  if (iframeRegex.test(sanitized)) {
    threats.push('Potentially malicious <iframe> embed detected and neutralized.');
    sanitized = sanitized.replace(iframeRegex, '[SANITIZED_IFRAME]');
  }

  const javascriptUriRegex = /javascript:[^\s"']+/gi;
  if (javascriptUriRegex.test(sanitized)) {
    threats.push('Javascript pseudo-protocol URI detected and neutralized.');
    sanitized = sanitized.replace(javascriptUriRegex, 'about:blank#sanitized');
  }

  // 3. Prompt Injection Heuristics
  const promptInjectionPatterns = [
    { pattern: /ignore\s+(all\s+)?(previous|prior)\s+instructions/i, desc: 'Instruction override directive ("ignore previous instructions")' },
    { pattern: /you\s+are\s+now\s+in\s+developer\s+mode/i, desc: 'Roleplay jailbreak attempt ("developer mode")' },
    { pattern: /system\s*prompt\s*leak|print\s*system\s*instructions/i, desc: 'System prompt exfiltration attempt' },
    { pattern: /disregard\s+safety\s+guidelines/i, desc: 'Safety bypass attempt' }
  ];

  for (const { pattern, desc } of promptInjectionPatterns) {
    if (pattern.test(sanitized)) {
      warnings.push(`Heuristic match: ${desc}. Content will be safely framed.`);
    }
  }

  // 4. Control Characters / Null-byte stripping
  sanitized = sanitized.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');

  return {
    isValid: threats.length === 0,
    sanitized,
    threats,
    warnings
  };
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  initialEntry,
  onSaved,
  onEntryReflected
}) => {
  const { user } = useAuth();

  const [entryId, setEntryId] = useState<string>(initialEntry?.id || 'entry-' + Date.now());
  const [title, setTitle] = useState<string>(initialEntry?.title || '');
  const [content, setContent] = useState<string>(
    initialEntry?.turns && initialEntry.turns.length > 0
      ? initialEntry.turns.map((t) => (t.role === 'user' ? t.content : '')).filter(Boolean).join('\n\n')
      : ''
  );
  const [category, setCategory] = useState<any>(initialEntry?.category || 'Daily Reflection');
  const [mood, setMood] = useState<JournalMood>(initialEntry?.mood || 'Thoughtful');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>(initialEntry?.tags || ['Reflection']);
  const [actionType, setActionType] = useState<ReflectionActionType>('reflection');

  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isReflecting, setIsReflecting] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Local storage draft sync hook
  const {
    hasUnsavedDraft,
    restoreDraft,
    discardDraft,
    clearDraft,
    updateDraft,
    formattedLastSaved
  } = useJournalDraft({
    entryId,
    userId: user?.uid,
    initialData: {
      title,
      content,
      category,
      mood,
      tags,
      actionType
    },
    debounceMs: 600,
    enabled: true
  });

  const [validationReport, setValidationReport] = useState<{
    isValid: boolean;
    threats: string[];
    warnings: string[];
  }>({ isValid: true, threats: [], warnings: [] });

  useEffect(() => {
    if (initialEntry) {
      setEntryId(initialEntry.id);
      setTitle(initialEntry.title || '');
      setCategory(initialEntry.category || 'Daily Reflection');
      setMood(initialEntry.mood || 'Thoughtful');
      setTags(initialEntry.tags || ['Reflection']);
      const userText = initialEntry.turns
        ?.filter((t) => t.role === 'user')
        .map((t) => t.content)
        .join('\n\n') || '';
      setContent(userText);
    }
  }, [initialEntry]);

  // Live validation and draft sync on text/field changes
  useEffect(() => {
    const report = validateAndSanitizeInput(content);
    setValidationReport({
      isValid: report.isValid,
      threats: report.threats,
      warnings: report.warnings
    });

    // Sync active state to local storage draft
    updateDraft({
      entryId,
      title,
      content,
      category,
      mood,
      tags,
      actionType
    });
  }, [content, title, category, mood, tags, actionType, entryId, updateDraft]);

  // Handle restoring saved draft from local storage
  const handleRestoreDraft = () => {
    const restored = restoreDraft();
    if (restored) {
      setTitle(restored.title || '');
      setContent(restored.content || '');
      setCategory(restored.category || 'Daily Reflection');
      setMood(restored.mood || 'Thoughtful');
      setTags(restored.tags || ['Reflection']);
      if (restored.actionType) setActionType(restored.actionType);
      setStatusMessage('Local draft successfully restored.');
      setSaveStatus('idle');
    }
  };

  // Tag Management
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '').slice(0, 30);
      if (!tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Persist the journal text to Firestore under the current user's UID
  const handleSaveToFirestore = async (): Promise<JournalEntry | null> => {
    if (!user?.uid) {
      setStatusMessage('Authentication required: please log in.');
      setSaveStatus('error');
      return null;
    }

    const { sanitized, isValid, threats } = validateAndSanitizeInput(content);
    if (!isValid && threats.length > 0) {
      setStatusMessage(`Validation blocked save: ${threats[0]}`);
      setSaveStatus('error');
      return null;
    }

    const finalTitle = title.trim() || 'Untitled Reflection';
    const now = new Date().toISOString();
    const path = `users/${user.uid}/entries/${entryId}`;

    setIsSaving(true);
    setSaveStatus('idle');
    setStatusMessage('');

    try {
      // Build user turn if content exists
      const turns: EntryTurn[] = sanitized.trim()
        ? [
            {
              id: 'turn-u-' + Date.now(),
              role: 'user',
              content: sanitized.trim(),
              timestamp: now,
              actionType
            }
          ]
        : initialEntry?.turns || [];

      const entryPayload: JournalEntry = {
        id: entryId,
        userId: user.uid,
        title: finalTitle,
        category,
        mood,
        tags,
        turns,
        summary: initialEntry?.summary || null,
        createdAt: initialEntry?.createdAt || now,
        updatedAt: now,
        isPinned: Boolean(initialEntry?.isPinned),
        wordCount: sanitized.split(/\s+/).filter(Boolean).length
      };

      const entryDocRef = doc(db, 'users', user.uid, 'entries', entryId);
      await setDoc(entryDocRef, {
        ...entryPayload,
        firestoreUpdatedAt: serverTimestamp()
      }, { merge: true });

      // Clear local draft upon confirmed Firestore write
      clearDraft();

      setSaveStatus('saved');
      setStatusMessage('Successfully persisted to Cloud Firestore under your UID.');
      if (onSaved) onSaved(entryPayload);

      return entryPayload;
    } catch (err: unknown) {
      console.error('Error in handleSaveToFirestore:', err);
      setSaveStatus('error');
      setStatusMessage('Failed to persist to Firestore.');
      handleFirestoreError(err, OperationType.WRITE, path);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Generate reflection with Gemini 3.6 Flash
  const handleGenerateReflection = async () => {
    if (!content.trim() || isReflecting) return;

    // Save first to ensure state persistence
    const savedEntry = await handleSaveToFirestore();
    if (!savedEntry) return;

    setIsReflecting(true);
    setStatusMessage('Querying Gemini 3.6 Flash reflection engine with fallback ladder...');

    try {
      const response = await fetch('/api/journal/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: content.trim(),
          history: [],
          actionType,
          category,
          mood
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || 'Gemini reflection request failed.');
      }

      const resData = await response.json();
      const modelTurn: EntryTurn = {
        id: 'turn-m-' + Date.now(),
        role: 'model',
        content: resData.reply,
        timestamp: new Date().toISOString(),
        actionType,
        modelUsed: resData.modelUsed || 'gemini-3.6-flash'
      };

      const updatedTurns = [...savedEntry.turns, modelTurn];
      const finalEntry: JournalEntry = {
        ...savedEntry,
        turns: updatedTurns,
        updatedAt: new Date().toISOString()
      };

      if (user?.uid) {
        const path = `users/${user.uid}/entries/${entryId}`;
        const entryDocRef = doc(db, 'users', user.uid, 'entries', entryId);
        await setDoc(entryDocRef, {
          ...finalEntry,
          firestoreUpdatedAt: serverTimestamp()
        }, { merge: true });
      }

      setSaveStatus('saved');
      setStatusMessage(`Reflection received using ${resData.modelUsed || 'Gemini 3.6 Flash'}.`);
      if (onEntryReflected) onEntryReflected(finalEntry);
    } catch (err: any) {
      console.error('Reflection error:', err);
      setSaveStatus('error');
      setStatusMessage(err.message || 'Failed to generate reflection.');
    } finally {
      setIsReflecting(false);
    }
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-6 space-y-5 shadow-2xl" id="journal-editor-container">
      {/* Unsaved Local Draft Detected Banner */}
      {hasUnsavedDraft && (
        <div
          className="p-3 sm:p-4 rounded-xl bg-purple-950/70 border border-purple-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg"
          id="banner-unsaved-draft"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-900/80 border border-purple-700/70 flex items-center justify-center text-purple-300 shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-200">
                Unsaved local reflection draft recovered
              </p>
              <p className="text-[11px] text-purple-300/80">
                We safely cached your inputs before the tab refreshed or closed.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleRestoreDraft}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow active:scale-95"
              id="btn-restore-draft"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore Draft
            </button>
            <button
              onClick={discardDraft}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 text-xs font-medium flex items-center gap-1 transition-colors"
              id="btn-discard-draft"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
            <FileEdit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Journal Editor</h2>
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[10px] font-mono">
                UID: {user?.uid ? `${user.uid.slice(0, 8)}...` : 'Guest'}
              </span>
              <span
                className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 text-[10px] flex items-center gap-1"
                title="Synced to local storage"
              >
                <HardDrive className="w-2.5 h-2.5 text-purple-400" />
                {formattedLastSaved}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Captures text, auto-syncs drafts to local storage, and persists directly to Cloud Firestore.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Toggle Markdown Preview"
          >
            <Eye className="w-3.5 h-3.5" />
            {isPreviewMode ? 'Edit Mode' : 'Preview'}
          </button>

          <button
            onClick={() => handleSaveToFirestore()}
            disabled={isSaving || isReflecting || !content.trim()}
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-40"
            id="btn-save-firestore"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save to Firestore
              </>
            )}
          </button>

          <button
            onClick={handleGenerateReflection}
            disabled={isReflecting || isSaving || !content.trim()}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-40"
            id="btn-editor-reflect"
          >
            {isReflecting ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Reflecting...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Reflect with Gemini
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metadata Configuration Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Title Input */}
        <div className="sm:col-span-1 space-y-1">
          <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Navigating Team Transitions"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
          />
        </div>

        {/* Category Selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer font-medium"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Mood Selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Mindset / Mood
          </label>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value as JournalMood)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer font-medium"
          >
            {MOODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reflection Action Mode */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-neutral-400 font-medium text-[11px]">Gemini Mode:</span>
        {(['reflection', 'brainstorm', 'socratic', 'continuation'] as ReflectionActionType[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setActionType(mode)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              actionType === mode
                ? 'bg-purple-900/80 text-purple-200 border border-purple-600'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            {mode === 'reflection' && 'Reflect & Inquire'}
            {mode === 'brainstorm' && 'Brainstorm Ideas'}
            {mode === 'socratic' && 'Socratic Inquiry'}
            {mode === 'continuation' && 'Deep Dive'}
          </button>
        ))}
      </div>

      {/* Main Text Input / Markdown Preview Area */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <label className="font-semibold uppercase tracking-wider text-[11px]">
            Journal Body & Reflection Content
          </label>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span>{content.length} / 50,000 chars</span>
            <span>&bull;</span>
            <span>{content.split(/\s+/).filter(Boolean).length} words</span>
          </div>
        </div>

        {isPreviewMode ? (
          <div className="min-h-[220px] max-h-[360px] overflow-y-auto p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-neutral-200 markdown-body text-xs sm:text-sm">
            {content.trim() ? (
              <Markdown>{content}</Markdown>
            ) : (
              <p className="text-neutral-500 italic">No content written yet.</p>
            )}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your raw reflections, thoughts, questions, or decision logs here... (Markdown supported)"
            rows={9}
            className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl p-4 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none transition-all leading-relaxed"
            id="journal-editor-textarea"
          />
        )}
      </div>

      {/* Tags input */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <Tag className="w-3.5 h-3.5 text-neutral-500" />
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-neutral-900 text-neutral-300 border border-neutral-800 px-2 py-0.5 rounded text-[11px]"
          >
            #{tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="text-neutral-500 hover:text-red-400 font-bold ml-0.5"
            >
              &times;
            </button>
          </span>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="+ Add tag (Enter)"
          className="bg-transparent border-none text-[11px] text-neutral-400 placeholder-neutral-600 focus:outline-none w-28"
        />
      </div>

      {/* Input Validation & Security Status Box */}
      <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-neutral-300 text-[11px]">
            <ShieldCheck className={`w-3.5 h-3.5 ${validationReport.isValid ? 'text-emerald-400' : 'text-red-400'}`} />
            Payload Validation & Injection Neutralizer
          </div>
          {validationReport.threats.length > 0 ? (
            <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[10px] font-mono">
              BLOCKED THREAT
            </span>
          ) : validationReport.warnings.length > 0 ? (
            <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono">
              HEURISTIC NOTICE
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[10px] font-mono">
              CLEAN PAYLOAD
            </span>
          )}
        </div>

        {validationReport.threats.map((threat, idx) => (
          <div key={idx} className="text-red-400 text-[11px] flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>{threat}</span>
          </div>
        ))}

        {validationReport.warnings.map((warning, idx) => (
          <div key={idx} className="text-amber-400 text-[11px] flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>{warning}</span>
          </div>
        ))}

        {validationReport.threats.length === 0 && validationReport.warnings.length === 0 && (
          <p className="text-neutral-400 text-[11px]">
            Text passes injection filtering, script sanitization, and volumetric constraints.
          </p>
        )}
      </div>

      {/* Save / Error Status Message */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            saveStatus === 'saved'
              ? 'bg-emerald-950/70 border border-emerald-800/80 text-emerald-200'
              : saveStatus === 'error'
              ? 'bg-red-950/70 border border-red-800/80 text-red-200'
              : 'bg-neutral-900 border border-neutral-800 text-neutral-300'
          }`}
        >
          {saveStatus === 'saved' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {saveStatus === 'error' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
};
