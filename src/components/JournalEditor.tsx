import React, { useState, useEffect, useRef } from 'react';
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
  HardDrive,
  Mic,
  Camera,
  HeartHandshake,
  Compass,
  Minimize2,
  GitMerge,
  BookmarkPlus,
  Plus,
  Bot,
  MapPin,
  Flame,
  Check,
  Image as ImageIcon,
  Paperclip,
  X,
  MessageSquare,
  Navigation
} from 'lucide-react';
import Markdown from 'react-markdown';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import {
  JournalEntry,
  JournalMood,
  EntryTurn,
  ReflectionActionType,
  AIPersonaId,
  StructuredRAGReflection,
  AIMemory,
  JournalAttachment,
  JournalLocation
} from '../types';
import { handleFirestoreError, OperationType } from '../firebase/firestoreErrors';
import { useJournalDraft } from '../hooks/useJournalDraft';
import { VoiceRecorderModal } from './VoiceRecorderModal';
import { ImageAnalysisModal } from './ImageAnalysisModal';
import { HandwritingOCRModal } from './HandwritingOCRModal';
import { LocationPickerModal } from './LocationPickerModal';
import { AI_PERSONAS, getPersonaById } from '../utils/personas';
import { retrieveRelevantHistoricalEntries } from '../utils/ragHelper';

interface JournalEditorProps {
  initialEntry?: JournalEntry | null;
  allEntries?: JournalEntry[];
  memories?: AIMemory[];
  onSaved?: (entry: JournalEntry) => void;
  onEntryReflected?: (entry: JournalEntry) => void;
  onSaveMemory?: (text: string, category: string) => void;
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

const EMOTION_PILLS = [
  'Peaceful',
  'Grateful',
  'Overwhelmed',
  'Inspired',
  'Hopeful',
  'Restless',
  'Clarity',
  'Accomplished',
  'Tender',
  'Motivated'
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
  allEntries = [],
  memories = [],
  onSaved,
  onEntryReflected,
  onSaveMemory
}) => {
  const { user } = useAuth();

  const [entryId, setEntryId] = useState<string>(initialEntry?.id || 'entry-' + Date.now());
  const [title, setTitle] = useState<string>(initialEntry?.title || '');
  const [content, setContent] = useState<string>(
    initialEntry?.content ||
    (initialEntry?.turns && initialEntry.turns.length > 0
      ? initialEntry.turns.map((t) => (t.role === 'user' ? t.content : '')).filter(Boolean).join('\n\n')
      : '')
  );
  const [category, setCategory] = useState<any>(initialEntry?.category || 'Daily Reflection');
  const [mood, setMood] = useState<JournalMood>(initialEntry?.mood || 'Thoughtful');
  const [moodScale, setMoodScale] = useState<number>(initialEntry?.moodScale || 7);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(initialEntry?.emotions || ['Peaceful']);
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>(initialEntry?.tags || ['Reflection']);
  const [selectedPersona, setSelectedPersona] = useState<AIPersonaId>(initialEntry?.personaUsed || 'balanced');
  const [actionType, setActionType] = useState<ReflectionActionType>('reflection');
  const [inputMethod, setInputMethod] = useState<'text' | 'voice' | 'ocr' | 'photo'>(
    initialEntry?.inputMethod || 'text'
  );
  const [location, setLocation] = useState<JournalLocation | null>(initialEntry?.location || null);
  const [attachments, setAttachments] = useState<JournalAttachment[]>(initialEntry?.attachments || []);

  const [ragReflection, setRagReflection] = useState<StructuredRAGReflection | null>(
    initialEntry?.ragReflection || null
  );

  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isReflecting, setIsReflecting] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Modals state
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [showOcrModal, setShowOcrModal] = useState<boolean>(false);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [activeAnalysisAttachment, setActiveAnalysisAttachment] = useState<JournalAttachment | null>(null);
  const [savedMemorySuccess, setSavedMemorySuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setMoodScale(initialEntry.moodScale || 7);
      setSelectedEmotions(initialEntry.emotions || ['Peaceful']);
      setTags(initialEntry.tags || ['Reflection']);
      setInputMethod(initialEntry.inputMethod || 'text');
      setLocation(initialEntry.location || null);
      setAttachments(initialEntry.attachments || []);
      if (initialEntry.personaUsed) setSelectedPersona(initialEntry.personaUsed);
      if (initialEntry.ragReflection) setRagReflection(initialEntry.ragReflection);
      const userText = initialEntry.content || (initialEntry.turns
        ?.filter((t) => t.role === 'user')
        .map((t) => t.content)
        .join('\n\n') || '');
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

  const handleToggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    );
  };

  // Photo Attachment upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const newAttachment: JournalAttachment = {
          id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          url: reader.result as string,
          name: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          createdAt: new Date().toISOString()
        };
        setAttachments((prev) => [...prev, newAttachment]);
        setInputMethod('photo');
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const handleUpdateAttachmentCaption = (attId: string, newCaption: string) => {
    setAttachments((prev) =>
      prev.map((att) => (att.id === attId ? { ...att, caption: newCaption } : att))
    );
  };

  // Persist the journal text to Firestore under the current user's UID
  const handleSaveToFirestore = async (extraReflection?: StructuredRAGReflection): Promise<JournalEntry | null> => {
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
        content: sanitized.trim(),
        category,
        mood,
        moodScale,
        emotions: selectedEmotions,
        tags,
        turns,
        summary: initialEntry?.summary || null,
        ragReflection: extraReflection || ragReflection || initialEntry?.ragReflection || null,
        personaUsed: selectedPersona,
        inputMethod,
        location,
        attachments,
        createdAt: initialEntry?.createdAt || now,
        updatedAt: now,
        isPinned: Boolean(initialEntry?.isPinned),
        favorite: Boolean(initialEntry?.favorite),
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
      setStatusMessage('Saved securely to Cloud Firestore under your private UID.');
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

  // Generate Grounded RAG Reflection with Gemini
  const handleGenerateRAGReflection = async () => {
    if (!content.trim() || isReflecting) return;

    // Retrieve relevant historical context from past user entries
    const historicalEntries = retrieveRelevantHistoricalEntries(
      { title, content, category, mood, tags },
      allEntries,
      entryId,
      4
    );

    setIsReflecting(true);
    setStatusMessage(`Retrieving context & querying Gemini (${getPersonaById(selectedPersona).name})...`);

    try {
      const response = await fetch('/api/journal/reflect-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: content.trim(),
          mood,
          moodScale,
          emotions: selectedEmotions,
          persona: selectedPersona,
          historicalEntries,
          memories: memories.filter((m) => m.isActive !== false)
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || 'Gemini reflection request failed.');
      }

      const reflectionData: StructuredRAGReflection = await response.json();
      setRagReflection(reflectionData);

      // Auto-save entry with new reflection
      const updatedEntry = await handleSaveToFirestore(reflectionData);
      if (updatedEntry && onEntryReflected) {
        onEntryReflected(updatedEntry);
      }

      setSaveStatus('saved');
      setStatusMessage(`Received 6-part reflection from ${getPersonaById(selectedPersona).name}.`);
    } catch (err: any) {
      console.error('Reflection error:', err);
      setSaveStatus('error');
      setStatusMessage(err.message || 'Failed to generate reflection.');
    } finally {
      setIsReflecting(false);
    }
  };

  const handleSaveMemoryItem = (memText: string) => {
    if (onSaveMemory) {
      onSaveMemory(memText, category === 'Career & Goals' ? 'Goals' : 'Mindset');
      setSavedMemorySuccess(memText);
      setTimeout(() => setSavedMemorySuccess(null), 3000);
    }
  };

  return (
    <div className="bg-[#0B0D0E] border border-[#1F2428] rounded-2xl p-4 sm:p-6 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)]" id="journal-editor-container">
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* Unsaved Local Draft Detected Banner */}
      {hasUnsavedDraft && (
        <div
          className="p-3 sm:p-4 rounded-xl bg-[#171A1C] border border-[#76B900]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg"
          id="banner-unsaved-draft"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#111416] border border-[#76B900]/40 flex items-center justify-center text-[#76B900] shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                Unsaved local reflection draft recovered
              </p>
              <p className="text-[11px] text-neutral-400">
                We safely cached your inputs before the session paused.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleRestoreDraft}
              className="px-3 py-1.5 rounded-lg bg-[#76B900] hover:bg-[#8FE000] text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
              id="btn-restore-draft"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore Draft
            </button>
            <button
              onClick={discardDraft}
              className="px-2.5 py-1.5 rounded-lg bg-[#111416] hover:bg-[#22272B] text-neutral-400 hover:text-neutral-200 border border-[#2B3238] text-xs font-medium flex items-center gap-1 transition-colors"
              id="btn-discard-draft"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1F2428] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#111416] border border-[#76B900]/40 flex items-center justify-center text-[#76B900] shadow-[0_0_12px_rgba(118,185,0,0.2)]">
            <FileEdit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-white">Journal Editor</h2>
              <span className="px-2 py-0.5 rounded bg-[#76B900]/15 text-[#8FE000] border border-[#76B900]/40 text-[10px] font-mono">
                UID: {user?.uid ? `${user.uid.slice(0, 8)}...` : 'Guest'}
              </span>
              <span
                className="px-2 py-0.5 rounded bg-[#111416] text-neutral-400 border border-[#22272B] text-[10px] flex items-center gap-1"
                title="Synced to local storage"
              >
                <HardDrive className="w-2.5 h-2.5 text-[#76B900]" />
                {formattedLastSaved}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Voice transcription, photo memories, notebook OCR, location tagging, and grounded Gemini RAG reflections.
            </p>
          </div>
        </div>

        {/* Priority 3 Action Toolbars */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* 1. Voice Journaling Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowVoiceModal(true)}
            className="px-3 py-1.5 rounded-xl bg-[#111416] hover:bg-[#171A1C] text-neutral-300 hover:text-white border border-[#22272B] hover:border-[#17DBCF]/50 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            title="Voice-to-Text Journaling with live speech waveform"
          >
            <Mic className="w-3.5 h-3.5 text-[#17DBCF]" />
            <span>Voice</span>
          </button>

          {/* 2. Photo Attachment Trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-[#111416] hover:bg-[#171A1C] text-neutral-300 hover:text-white border border-[#22272B] hover:border-[#2176FF]/50 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            title="Attach photo memories"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#2176FF]" />
            <span>Photo</span>
          </button>

          {/* 3. Notebook OCR Scan Trigger */}
          <button
            type="button"
            onClick={() => setShowOcrModal(true)}
            className="px-3 py-1.5 rounded-xl bg-[#111416] hover:bg-[#171A1C] text-neutral-300 hover:text-white border border-[#22272B] hover:border-[#FFC107]/50 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            title="Scan handwritten notebook page with Gemini Vision"
          >
            <Camera className="w-3.5 h-3.5 text-[#FFC107]" />
            <span>Scan OCR</span>
          </button>

          {/* 4. Location Picker Trigger */}
          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              location
                ? 'bg-[#00BCD4]/15 border-[#00BCD4]/50 text-[#00BCD4]'
                : 'bg-[#111416] hover:bg-[#171A1C] text-neutral-300 hover:text-white border-[#22272B]'
            }`}
            title="Tag physical or mindful sanctuary location"
          >
            <MapPin className="w-3.5 h-3.5 text-[#00BCD4]" />
            <span>{location ? location.name.slice(0, 14) : 'Location'}</span>
          </button>

          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="px-3 py-1.5 rounded-xl bg-[#111416] hover:bg-[#171A1C] text-neutral-300 hover:text-white border border-[#22272B] text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#595959]" />
            <span>{isPreviewMode ? 'Edit' : 'Preview'}</span>
          </button>

          {/* Save Reflection Primary Action Button (#F44336) */}
          <button
            onClick={() => handleSaveToFirestore()}
            disabled={isSaving || isReflecting || !content.trim()}
            className="px-4 py-1.5 rounded-xl bg-[#F44336] hover:bg-[#D32F2F] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 disabled:opacity-40"
            id="btn-save-firestore"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Reflection</span>
              </>
            )}
          </button>

          {/* AI Reflection CTA (#76B900) */}
          <button
            onClick={handleGenerateRAGReflection}
            disabled={isReflecting || isSaving || !content.trim()}
            className="px-4 py-1.5 rounded-xl bg-[#76B900] hover:bg-[#85c90d] text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_18px_rgba(118,185,0,0.25)] active:scale-95 disabled:opacity-40"
            id="btn-editor-reflect"
          >
            {isReflecting ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Reflecting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Reflect AI</span>
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
            placeholder="e.g. Morning Clarity & Decisions"
            className="w-full bg-[#111416] border border-[#22272B] rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#76B900] font-medium transition-colors"
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
            className="w-full bg-[#111416] border border-[#22272B] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#76B900] cursor-pointer font-medium transition-colors"
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
            className="w-full bg-[#111416] border border-[#22272B] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#76B900] cursor-pointer font-medium transition-colors"
          >
            {MOODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mood Scale & Emotion Pills */}
      <div className="p-4 rounded-xl bg-[#111416] border border-[#1F2428] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-neutral-300">Energy & Mood Scale:</span>
            <span className="text-xs font-bold text-[#8FE000]">{moodScale} / 10</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={moodScale}
            onChange={(e) => setMoodScale(Number(e.target.value))}
            className="w-full sm:w-48 accent-[#76B900] cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[10px] uppercase font-bold text-neutral-500 mr-1">Felt Emotions:</span>
          {EMOTION_PILLS.map((em) => {
            const isSel = selectedEmotions.includes(em);
            return (
              <button
                key={em}
                type="button"
                onClick={() => handleToggleEmotion(em)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  isSel
                    ? 'bg-[#76B900] text-black font-bold shadow-xs'
                    : 'bg-[#171A1C] text-neutral-400 hover:text-white border border-[#22272B]'
                }`}
              >
                {em}
              </button>
            );
          })}
        </div>
      </div>

      {/* Attached Location & Attached Photos Gallery Bar */}
      {(location || attachments.length > 0) && (
        <div className="p-3.5 rounded-xl bg-[#111416] border border-[#1F2428] space-y-3">
          {/* Location Badge */}
          {location && (
            <div className="flex items-center justify-between bg-[#0B0D0E] border border-[#22272B] p-2.5 rounded-xl">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#111416] text-[#76B900]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-neutral-200 truncate">{location.name}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{location.address || `GPS (${location.lat.toFixed(3)}, ${location.lng.toFixed(3)})`}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLocation(null)}
                className="p-1 text-neutral-500 hover:text-rose-400"
                title="Remove Location"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Photo Attachments List */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#8FE000]" />
                  Photo Attachments ({attachments.length})
                </span>
                <span className="text-[10px] text-neutral-500">Click to inspect or analyze with Gemini Vision</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="relative group rounded-xl overflow-hidden bg-[#0B0D0E] border border-[#22272B] hover:border-[#76B900]/50 aspect-4/3 transition-all"
                  >
                    <img
                      src={att.url}
                      alt={att.name}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setActiveAnalysisAttachment(att)}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => setActiveAnalysisAttachment(att)}
                        className="p-1.5 rounded-lg bg-[#76B900] text-black font-bold text-xs"
                        title="Analyze with AI"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="p-1.5 rounded-lg bg-rose-950/80 text-rose-300 text-xs border border-rose-800"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {att.caption && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/80 px-2 py-1 text-[10px] text-neutral-300 truncate font-sans">
                        {att.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Persona Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-[#76B900]" />
            AI Reflection Persona
          </label>
          <span className="text-[10px] text-neutral-500">
            {getPersonaById(selectedPersona).tagline}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {AI_PERSONAS.map((p) => {
            const isSelected = selectedPersona === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPersona(p.id)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#14171A] border-[#76B900] text-white shadow-[0_0_15px_rgba(118,185,0,0.15)]'
                    : 'bg-[#111416] border-[#22272B] text-neutral-400 hover:text-neutral-200 hover:border-[#2B3238]'
                }`}
              >
                <div className="text-[11px] font-bold truncate">{p.name}</div>
                <div className="text-[9px] text-neutral-400 line-clamp-1 mt-0.5">{p.tagline}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Text Input / Markdown Preview Area */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <label className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-2">
            Journal Body & Reflection Content
          </label>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span>{content.length} / 50,000 chars</span>
            <span>&bull;</span>
            <span>{content.split(/\s+/).filter(Boolean).length} words</span>
          </div>
        </div>

        {isPreviewMode ? (
          <div className="min-h-[220px] max-h-[360px] overflow-y-auto p-4 rounded-xl bg-[#111416] border border-[#22272B] text-neutral-200 markdown-body text-xs sm:text-sm">
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
            placeholder="Write your thoughts, daily learnings, and decisions... Or capture using Voice, Photo attachments, or OCR Notebook Scanning above. (Markdown supported)"
            rows={10}
            className="w-full bg-[#111416] border border-[#22272B] focus:border-[#76B900] focus:ring-1 focus:ring-[#76B900] rounded-xl p-4 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none transition-all leading-relaxed font-sans"
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
            className="inline-flex items-center gap-1 bg-[#111416] text-neutral-300 border border-[#22272B] px-2.5 py-0.5 rounded-lg text-[11px]"
          >
            #{tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="text-neutral-500 hover:text-rose-400 font-bold ml-0.5"
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

      {/* Grounded 6-Part RAG Reflection Card with NVIDIA-Inspired Visuals */}
      {ragReflection && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0E1113] border border-[#76B900]/40 space-y-4 shadow-[0_0_30px_rgba(118,185,0,0.08)]">
          <div className="flex items-center justify-between border-b border-[#1F2428] pb-3">
            <div className="flex items-center gap-2 text-[#76B900] font-bold text-xs">
              <Sparkles className="w-4 h-4 text-[#8FE000]" />
              <span className="tracking-wide uppercase">ReflectAI Grounded Reflection ({getPersonaById(ragReflection.personaUsed).name})</span>
            </div>
            {ragReflection.modelUsed && (
              <span className="text-[10px] font-mono text-neutral-400 bg-[#111416] px-2 py-0.5 rounded border border-[#22272B]">
                {ragReflection.modelUsed}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
            {/* 1. What I Hear */}
            <div className="p-3.5 rounded-xl bg-[#111416] border border-[#1F2428] space-y-1.5">
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                1. What I Hear
              </div>
              <p className="text-neutral-200 font-sans">{ragReflection.whatIHear}</p>
            </div>

            {/* 2. What Stands Out */}
            <div className="p-3.5 rounded-xl bg-[#111416] border border-[#1F2428] space-y-1.5">
              <div className="text-[11px] font-bold text-[#8FE000] uppercase tracking-wider">
                2. What Stands Out
              </div>
              <p className="text-neutral-200 font-sans">{ragReflection.whatStandsOut}</p>
            </div>

            {/* 3. Connection to Your History */}
            <div className="p-3.5 rounded-xl bg-[#111416] border border-[#1F2428] space-y-1.5 md:col-span-2">
              <div className="text-[11px] font-bold text-[#76B900] uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                3. Connection to Your History & Memories
              </div>
              <p className="text-neutral-200 italic font-sans">{ragReflection.connectionToHistory}</p>
            </div>

            {/* 4. Reflection */}
            <div className="p-4 rounded-xl bg-[#14171A] border border-[#22272B] space-y-1.5 md:col-span-2">
              <div className="text-[11px] font-bold text-white uppercase tracking-wider">
                4. Deep Personalized Reflection
              </div>
              <div className="text-neutral-200 prose prose-invert max-w-none text-xs">
                <Markdown>{ragReflection.reflection}</Markdown>
              </div>
            </div>

            {/* 5. A Question to Consider */}
            <div className="p-3.5 rounded-xl bg-[#111416] border border-[#76B900]/30 space-y-1.5">
              <div className="text-[11px] font-bold text-[#8FE000] uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                5. Question to Consider
              </div>
              <p className="text-neutral-200 font-medium italic">"{ragReflection.questionToConsider}"</p>
            </div>

            {/* 6. Small Next Step */}
            <div className="p-3.5 rounded-xl bg-[#111416] border border-[#76B900]/30 space-y-1.5">
              <div className="text-[11px] font-bold text-[#76B900] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                6. Small Next Step
              </div>
              <p className="text-neutral-200 font-sans">{ragReflection.smallNextStep}</p>
            </div>
          </div>

          {/* Extracted Memories to Save */}
          {ragReflection.extractedMemories && ragReflection.extractedMemories.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#111416] border border-[#1F2428] space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <BookmarkPlus className="w-3.5 h-3.5 text-[#76B900]" />
                Extracted Insights (1-Click Save to AI Memory Vault)
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {ragReflection.extractedMemories.map((mem, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSaveMemoryItem(mem)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B0D0E] hover:bg-[#171A1C] border border-[#22272B] hover:border-[#76B900] text-xs text-neutral-300 hover:text-white transition-all text-left"
                  >
                    {savedMemorySuccess === mem ? (
                      <Check className="w-3.5 h-3.5 text-[#8FE000] shrink-0" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-[#76B900] shrink-0" />
                    )}
                    <span>{mem}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Prompts */}
          {ragReflection.followUpPrompts && ragReflection.followUpPrompts.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Follow-up Journaling Prompts:
              </span>
              <div className="space-y-1">
                {ragReflection.followUpPrompts.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => setContent((prev) => (prev ? `${prev}\n\n**Reflection on Prompt:** ${p}\n` : p))}
                    className="p-2.5 rounded-xl bg-[#111416] hover:bg-[#171A1C] border border-[#22272B] text-[11px] text-neutral-300 hover:text-white cursor-pointer transition-colors"
                  >
                    &bull; {p} <span className="text-[#76B900] text-[10px] ml-1">(Click to add to text)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-[10px] text-neutral-500 italic pt-2 text-center">
            ReflectAI reflections are for personal mindfulness and self-reflection, not professional medical diagnosis.
          </p>
        </div>
      )}

      {/* Input Validation & Security Status Box */}
      <div className="p-3.5 rounded-xl bg-[#111416] border border-[#1F2428] space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-neutral-300 text-[11px]">
            <ShieldCheck className={`w-3.5 h-3.5 ${validationReport.isValid ? 'text-[#8FE000]' : 'text-red-400'}`} />
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
            <span className="px-2 py-0.5 rounded bg-[#76B900]/15 text-[#8FE000] border border-[#76B900]/40 text-[10px] font-mono font-bold">
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
              : 'bg-[#111416] border border-[#22272B] text-neutral-300'
          }`}
        >
          {saveStatus === 'saved' && <CheckCircle2 className="w-4 h-4 text-[#8FE000] shrink-0" />}
          {saveStatus === 'error' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 1. Voice Journaling Modal */}
      <VoiceRecorderModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onApplyTranscript={(transcript) => {
          setContent((prev) => (prev ? `${prev}\n\n${transcript}` : transcript));
          setInputMethod('voice');
        }}
      />

      {/* 2. Handwriting OCR Scanner Modal */}
      <HandwritingOCRModal
        isOpen={showOcrModal}
        onClose={() => setShowOcrModal(false)}
        onApplyText={(text, mode) => {
          if (mode === 'replace') {
            setContent(text);
          } else {
            setContent((prev) => (prev ? `${prev}\n\n${text}` : text));
          }
          setInputMethod('ocr');
        }}
      />

      {/* 3. Location Picker Modal */}
      <LocationPickerModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        currentLocation={location}
        onSelectLocation={(loc) => setLocation(loc)}
      />

      {/* 4. Image Analysis & Reflection Modal */}
      <ImageAnalysisModal
        isOpen={Boolean(activeAnalysisAttachment)}
        onClose={() => setActiveAnalysisAttachment(null)}
        attachment={activeAnalysisAttachment}
        journalContextText={content}
        onApplyAnalysisToJournal={(textToAppend) => {
          setContent((prev) => `${prev}${textToAppend}`);
        }}
        onUpdateCaption={handleUpdateAttachmentCaption}
      />
    </div>
  );
};
