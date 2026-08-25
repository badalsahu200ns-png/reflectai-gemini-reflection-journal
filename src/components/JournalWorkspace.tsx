import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  BrainCircuit,
  MessageSquareQuote,
  Lightbulb,
  HelpCircle,
  Compass,
  FileText,
  Copy,
  Check,
  Download,
  Trash2,
  ListTodo,
  CheckCircle2,
  Calendar,
  Smile,
  Tag,
  Share2,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Lock,
  AlertCircle,
  CheckCircle,
  Layers
} from 'lucide-react';
import Markdown from 'react-markdown';
import {
  JournalEntry,
  EntryTurn,
  StructuredSummary,
  ReflectionActionType,
  JournalMood
} from '../types';

interface JournalWorkspaceProps {
  entry: JournalEntry;
  onUpdateEntry: (updated: Partial<JournalEntry>) => Promise<void>;
  onDeleteEntry: (entryId: string) => void;
  isSaving: boolean;
  onAiStateChange?: (isGenerating: boolean) => void;
}

const INSPIRATIONAL_PROMPTS = [
  'What went exceptionally well today, and what made it work?',
  'What is a decision or uncertainty I am currently wrestling with?',
  'Where did I feel internal friction, resistance, or self-doubt today?',
  'What is one bold idea or creative project I want to explore without fear?',
  'What am I genuinely grateful for right now, and why?'
];

const MOOD_OPTIONS: JournalMood[] = [
  'Thoughtful',
  'Energized',
  'Calm',
  'Focused',
  'Anxious',
  'Curious',
  'Grateful'
];

const CATEGORY_OPTIONS = [
  'Daily Reflection',
  'Brainstorming',
  'Decision Making',
  'Mindfulness',
  'Career & Goals',
  'Creative'
] as const;

export const JournalWorkspace: React.FC<JournalWorkspaceProps> = ({
  entry,
  onUpdateEntry,
  onDeleteEntry,
  isSaving,
  onAiStateChange
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedAction, setSelectedAction] = useState<ReflectionActionType>('reflection');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSuggestingTitle, setIsSuggestingTitle] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [completedActionItems, setCompletedActionItems] = useState<Record<number, boolean>>({});
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(entry.title || 'Untitled Reflection');
  const [tagInput, setTagInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitleInput(entry.title || 'Untitled Reflection');
    setCompletedActionItems({});
  }, [entry.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entry.turns, isGenerating]);

  // Sync state to parent
  useEffect(() => {
    if (onAiStateChange) {
      onAiStateChange(isGenerating || isSummarizing);
    }
  }, [isGenerating, isSummarizing, onAiStateChange]);

  // Handle title edit submit
  const handleSaveTitle = async () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput !== entry.title) {
      await onUpdateEntry({ title: titleInput.trim() });
    }
  };

  // Add Tag
  const handleAddTag = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (!entry.tags?.includes(newTag)) {
        const updatedTags = [...(entry.tags || []), newTag];
        await onUpdateEntry({ tags: updatedTags });
      }
      setTagInput('');
    }
  };

  // Remove Tag
  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = (entry.tags || []).filter((t) => t !== tagToRemove);
    await onUpdateEntry({ tags: updatedTags });
  };

  // Copy turn content
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Auto suggest title using Gemini
  const handleAutoSuggestTitle = async () => {
    if (!entry.turns || entry.turns.length === 0 || isSuggestingTitle) return;
    setIsSuggestingTitle(true);
    try {
      const firstUserTurn = entry.turns.find((t) => t.role === 'user')?.content || entry.turns[0].content;
      const res = await fetch('/api/journal/suggest-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: firstUserTurn })
      });
      const data = await res.json();
      if (data.title) {
        setTitleInput(data.title);
        await onUpdateEntry({
          title: data.title,
          mood: data.mood || entry.mood,
          tags: Array.from(new Set([...(entry.tags || []), ...(data.tags || [])]))
        });
      }
    } catch (err: any) {
      console.error('Error suggesting title:', err);
    } finally {
      setIsSuggestingTitle(false);
    }
  };

  // Send turn to Gemini Conversational Reflection API
  const handleSendTurn = async (customPrompt?: string, forcedAction?: ReflectionActionType) => {
    const promptToSend = customPrompt || inputText;
    const action = forcedAction || selectedAction;

    // Strict guard to prevent duplicate submissions while generating
    if (!promptToSend.trim() || isGenerating || isSummarizing) return;

    setErrorMessage(null);
    setIsGenerating(true);
    setGenerationStage('Sanitizing and validating journal prompt...');

    const userTurn: EntryTurn = {
      id: 'turn-u-' + Date.now(),
      role: 'user',
      content: promptToSend.trim(),
      timestamp: new Date().toISOString(),
      actionType: action
    };

    const currentTurns = entry.turns || [];
    const newTurnsWithUser = [...currentTurns, userTurn];

    // Optimistically update
    await onUpdateEntry({
      turns: newTurnsWithUser,
      updatedAt: new Date().toISOString()
    });

    if (!customPrompt) {
      setInputText('');
    }

    try {
      // Progress simulation stages for clear UX feedback
      const stageTimer1 = setTimeout(() => {
        setGenerationStage('Querying Gemini 3.6 Flash via resilient model fallback ladder...');
      }, 400);

      const stageTimer2 = setTimeout(() => {
        setGenerationStage('Synthesizing psychological reflection and growth insights...');
      }, 1200);

      const historyPayload = currentTurns.map((t) => ({
        role: t.role,
        content: t.content
      }));

      const response = await fetch('/api/journal/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend.trim(),
          history: historyPayload,
          actionType: action,
          category: entry.category,
          mood: entry.mood
        })
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Gemini reflection request failed.');
      }

      const data = await response.json();

      const modelTurn: EntryTurn = {
        id: 'turn-m-' + Date.now(),
        role: 'model',
        content: data.reply,
        timestamp: new Date().toISOString(),
        actionType: action,
        modelUsed: data.modelUsed || 'gemini-3.6-flash'
      };

      const finalTurns = [...newTurnsWithUser, modelTurn];

      // If it's the very first exchange and title is default, suggest title automatically
      let extraUpdates: Partial<JournalEntry> = {};
      if (currentTurns.length === 0 && (entry.title === 'Untitled Reflection' || !entry.title)) {
        try {
          const titleRes = await fetch('/api/journal/suggest-title', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: promptToSend.trim() })
          });
          const titleData = await titleRes.json();
          if (titleData.title) {
            extraUpdates = {
              title: titleData.title,
              mood: titleData.mood || entry.mood,
              tags: titleData.tags || entry.tags
            };
            setTitleInput(titleData.title);
          }
        } catch {}
      }

      await onUpdateEntry({
        turns: finalTurns,
        updatedAt: new Date().toISOString(),
        wordCount: finalTurns.reduce((acc, t) => acc + (t.content ? t.content.split(/\s+/).length : 0), 0),
        ...extraUpdates
      });
    } catch (err: any) {
      console.error('Error during conversation:', err);
      setErrorMessage(err.message || 'Failed to receive reflection from Gemini.');
    } finally {
      setIsGenerating(false);
      setGenerationStage('');
    }
  };

  // Generate Structured Summary & Insights
  const handleGenerateSummary = async () => {
    if (!entry.turns || entry.turns.length === 0 || isSummarizing || isGenerating) {
      setErrorMessage('Write at least one reflection entry before generating a summary.');
      return;
    }

    setIsSummarizing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/journal/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turns: entry.turns,
          title: entry.title,
          category: entry.category
        })
      });

      if (!response.ok) {
        throw new Error('Summarization failed');
      }

      const summaryData: StructuredSummary = await response.json();
      await onUpdateEntry({
        summary: summaryData,
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('Error generating summary:', err);
      setErrorMessage(err.message || 'Failed to synthesize summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Export Entry to Markdown
  const handleExportMarkdown = () => {
    let md = `# ${entry.title || 'Journal Reflection'}\n\n`;
    md += `**Date:** ${new Date(entry.createdAt).toLocaleString()}\n`;
    md += `**Category:** ${entry.category}\n`;
    if (entry.mood) md += `**Mood:** ${entry.mood}\n`;
    if (entry.tags && entry.tags.length > 0) md += `**Tags:** ${entry.tags.map((t) => `#${t}`).join(' ')}\n`;
    md += `\n---\n\n`;

    if (entry.summary) {
      md += `## Structured AI Summary\n\n`;
      md += `### Executive Synthesis\n${entry.summary.executiveSummary}\n\n`;
      if (entry.summary.keyThemes?.length) {
        md += `### Key Themes\n${entry.summary.keyThemes.map((t) => `- ${t}`).join('\n')}\n\n`;
      }
      if (entry.summary.growthInsights?.length) {
        md += `### Growth & Psychological Insights\n${entry.summary.growthInsights.map((i) => `- ${i}`).join('\n')}\n\n`;
      }
      if (entry.summary.actionItems?.length) {
        md += `### Action Items\n${entry.summary.actionItems.map((a) => `- [ ] ${a}`).join('\n')}\n\n`;
      }
      md += `---\n\n## Transcript & Multi-Turn Reflections\n\n`;
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

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-neutral-900 overflow-hidden select-text">
      {/* Entry Top Header Bar */}
      <div className="border-b border-neutral-800 bg-neutral-950 px-4 sm:px-6 py-3 shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                autoFocus
                className="text-base sm:text-lg font-bold text-white bg-neutral-900 border border-purple-500 rounded px-2 py-0.5 w-full max-w-md focus:outline-none"
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-base sm:text-lg font-bold text-white hover:text-purple-300 cursor-pointer transition-colors truncate max-w-md"
                title="Click to edit title"
              >
                {entry.title || 'Untitled Reflection'}
              </h1>
            )}

            {entry.turns && entry.turns.length > 0 && (
              <button
                onClick={handleAutoSuggestTitle}
                disabled={isSuggestingTitle || isGenerating}
                className="p-1 rounded text-neutral-500 hover:text-purple-400 transition-colors disabled:opacity-30"
                title="Auto-suggest title using Gemini"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isSuggestingTitle ? 'animate-spin text-purple-400' : ''}`} />
              </button>
            )}
          </div>

          {/* Metadata Controls */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs">
            {/* Category Dropdown */}
            <select
              value={entry.category}
              onChange={(e) => onUpdateEntry({ category: e.target.value as any })}
              className="bg-neutral-900 border border-neutral-800 text-neutral-300 rounded px-2 py-0.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Mood Dropdown */}
            <select
              value={entry.mood || 'Thoughtful'}
              onChange={(e) => onUpdateEntry({ mood: e.target.value as JournalMood })}
              className="bg-neutral-900 border border-neutral-800 text-neutral-300 rounded px-2 py-0.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
            >
              {MOOD_OPTIONS.map((mood) => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </select>

            {/* Tags display */}
            <div className="flex items-center gap-1 flex-wrap">
              {entry.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-neutral-900 text-neutral-400 border border-neutral-800 px-2 py-0.5 rounded text-[11px]"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-400 text-neutral-600 font-bold"
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
                placeholder="+ tag"
                className="w-14 bg-transparent border-none text-[11px] text-neutral-400 placeholder-neutral-600 focus:outline-none"
              />
            </div>

            {/* Firestore sync status */}
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 ml-auto">
              <CheckCircle2 className="w-3 h-3" />
              {isSaving ? 'Syncing to Firestore...' : 'Saved to Cloud Firestore'}
            </span>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Summarize button */}
          <button
            onClick={handleGenerateSummary}
            disabled={isSummarizing || isGenerating || !entry.turns?.length}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-40 disabled:pointer-events-none"
            id="btn-summarize-entry"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSummarizing ? 'animate-spin' : ''}`} />
            {isSummarizing ? 'Synthesizing Summary...' : 'Summarize Entry'}
          </button>

          {/* Export Markdown */}
          <button
            onClick={handleExportMarkdown}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
            title="Download as Markdown"
            id="btn-export-markdown"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Delete entry */}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this journal entry from Cloud Firestore?')) {
                onDeleteEntry(entry.id);
              }
            }}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-red-950/60 text-neutral-400 hover:text-red-400 border border-neutral-800 transition-colors"
            title="Delete this entry"
            id="btn-delete-entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Conversation & Reflection Body */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Error notice if any */}
        {errorMessage && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 font-bold">&times;</button>
          </div>
        )}

        {/* Empty state / Welcome prompt helper */}
        {(!entry.turns || entry.turns.length === 0) && (
          <div className="max-w-2xl mx-auto py-8 text-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-300">
              <MessageSquareQuote className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Begin Your Multi-Turn Reflection</h2>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Express your raw thoughts, decisions, or curiosities. Gemini 3.6 Flash will converse, reflect, and help you find clarity.
              </p>
            </div>

            {/* Quick Inspiration Pills */}
            <div className="space-y-2 text-left max-w-lg mx-auto">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block text-center">
                Need inspiration to start? Click a prompt:
              </span>
              <div className="space-y-1.5">
                {INSPIRATIONAL_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    disabled={isGenerating}
                    onClick={() => {
                      setInputText(prompt);
                      textareaRef.current?.focus();
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-neutral-950/60 hover:bg-neutral-800/80 border border-neutral-800 text-xs text-neutral-300 hover:text-white transition-all flex items-center justify-between group disabled:opacity-40"
                  >
                    <span>{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-purple-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Structured Summary Card (If already generated) */}
        {entry.summary && (
          <div className="max-w-3xl mx-auto p-5 sm:p-6 bg-gradient-to-b from-indigo-950/40 to-neutral-950/80 border border-indigo-800/50 rounded-2xl shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-indigo-900/50 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-indigo-200 uppercase tracking-wider">
                  AI Synthesized Reflection Summary
                </h2>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                Generated {new Date(entry.summary.generatedAt).toLocaleTimeString()}
              </span>
            </div>

            {/* Executive Synthesis */}
            <div className="space-y-1.5 text-xs text-neutral-200 leading-relaxed">
              <div className="text-[11px] font-bold uppercase text-indigo-400 tracking-wider">
                Core Synthesis
              </div>
              <p className="bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800 text-neutral-200">
                {entry.summary.executiveSummary}
              </p>
            </div>

            {/* Key Themes & Growth Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Key Themes */}
              <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                <div className="text-[11px] font-bold uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Key Themes Identified
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {entry.summary.keyThemes?.map((theme, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/60 text-purple-300 text-[11px] font-medium"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>

              {/* Psychological / Strategic Growth Insights */}
              <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                <div className="text-[11px] font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Growth Insights & Mindset
                </div>
                <ul className="space-y-1 text-neutral-300 text-[11px]">
                  {entry.summary.growthInsights?.map((insight, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">&bull;</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Items with checkboxes */}
            {entry.summary.actionItems && entry.summary.actionItems.length > 0 && (
              <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2 text-xs">
                <div className="text-[11px] font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <ListTodo className="w-3.5 h-3.5" />
                  Recommended Action Steps
                </div>
                <div className="space-y-1.5">
                  {entry.summary.actionItems.map((item, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-neutral-800/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={!!completedActionItems[idx]}
                        onChange={(e) =>
                          setCompletedActionItems({
                            ...completedActionItems,
                            [idx]: e.target.checked
                          })
                        }
                        className="mt-0.5 rounded border-neutral-700 bg-neutral-900 text-purple-600 focus:ring-purple-500"
                      />
                      <span className={`text-xs ${completedActionItems[idx] ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up reflection prompts */}
            {entry.summary.followUpQuestions && entry.summary.followUpQuestions.length > 0 && (
              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-bold uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Suggested Follow-Up Inquiries (Click to explore)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {entry.summary.followUpQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      disabled={isGenerating}
                      onClick={() => handleSendTurn(q, 'socratic')}
                      className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-left text-[11px] text-neutral-300 hover:text-white transition-all group flex items-start justify-between gap-2 disabled:opacity-40"
                    >
                      <span className="italic">"{q}"</span>
                      <ArrowRight className="w-3 h-3 text-neutral-600 group-hover:text-purple-400 shrink-0 mt-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Conversation Turns Stream */}
        <div className="max-w-3xl mx-auto space-y-4">
          {entry.turns?.map((turn, index) => {
            const isUser = turn.role === 'user';

            return (
              <div
                key={turn.id || index}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar for Model */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800/80 flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                )}

                {/* Bubble Container */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 space-y-2 shadow-sm text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-purple-900/40 border border-purple-700/50 text-neutral-100'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-200'
                  }`}
                >
                  {/* Bubble Header */}
                  <div className="flex items-center justify-between gap-3 text-[11px] pb-1 border-b border-neutral-800/50">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-neutral-300">
                        {isUser ? 'Your Journal Reflection' : 'Gemini 3.6 Flash'}
                      </span>
                      {turn.actionType && (
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                          {turn.actionType}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-neutral-500">
                      <span className="text-[10px] font-mono">
                        {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => handleCopy(turn.id, turn.content)}
                        className="p-1 hover:text-neutral-300 transition-colors"
                        title="Copy text"
                      >
                        {copiedId === turn.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Markdown or plain text render */}
                  <div className="markdown-body prose-invert prose-xs sm:prose-sm text-neutral-200">
                    <Markdown>{turn.content}</Markdown>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Model Generating Skeleton & Visual Progress Indicator */}
          {isGenerating && (
            <div className="flex gap-3 sm:gap-4 justify-start animate-in fade-in duration-200" id="gemini-loading-skeleton">
              <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800/80 flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>

              <div className="max-w-[85%] sm:max-w-[78%] w-full bg-neutral-950 border border-purple-900/50 rounded-2xl p-5 space-y-4 shadow-xl">
                {/* Progress Bar & Status Pill */}
                <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                    <span>{generationStage || 'Gemini 3.6 Flash synthesizing reflection...'}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 animate-pulse">
                    ACTIVE INFERENCE
                  </span>
                </div>

                {/* Shimmer Skeleton Paragraph Bars */}
                <div className="space-y-2.5">
                  <div className="h-3.5 bg-neutral-800/80 rounded-md w-11/12 animate-pulse" />
                  <div className="h-3.5 bg-neutral-800/60 rounded-md w-full animate-pulse" />
                  <div className="h-3.5 bg-neutral-800/70 rounded-md w-9/12 animate-pulse" />
                  <div className="h-3.5 bg-neutral-800/50 rounded-md w-10/12 animate-pulse" />
                </div>

                {/* Sub-skeleton insights pills */}
                <div className="pt-2 flex items-center gap-2 flex-wrap">
                  <div className="h-5 w-24 bg-neutral-900 border border-neutral-800 rounded-md animate-pulse" />
                  <div className="h-5 w-32 bg-neutral-900 border border-neutral-800 rounded-md animate-pulse" />
                  <div className="h-5 w-20 bg-neutral-900 border border-neutral-800 rounded-md animate-pulse" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Input Dock */}
      <div className="border-t border-neutral-800 bg-neutral-950 p-4 sm:px-8 shrink-0">
        <div className="max-w-3xl mx-auto space-y-2.5">
          {/* Action Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-neutral-500 font-bold uppercase text-[10px] mr-1 hidden sm:inline">
              Mode:
            </span>

            <button
              onClick={() => setSelectedAction('reflection')}
              disabled={isGenerating}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedAction === 'reflection'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              } disabled:opacity-40`}
            >
              <MessageSquareQuote className="w-3 h-3" />
              Reflect & Inquire
            </button>

            <button
              onClick={() => setSelectedAction('brainstorm')}
              disabled={isGenerating}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedAction === 'brainstorm'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              } disabled:opacity-40`}
            >
              <Lightbulb className="w-3 h-3" />
              Brainstorm Ideas
            </button>

            <button
              onClick={() => setSelectedAction('socratic')}
              disabled={isGenerating}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedAction === 'socratic'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              } disabled:opacity-40`}
            >
              <HelpCircle className="w-3 h-3" />
              Socratic Inquiry
            </button>

            <button
              onClick={() => setSelectedAction('continuation')}
              disabled={isGenerating}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedAction === 'continuation'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              } disabled:opacity-40`}
            >
              <Compass className="w-3 h-3" />
              Deep Dive
            </button>
          </div>

          {/* Textarea + Submit Box */}
          <div className={`relative rounded-2xl bg-neutral-900 border transition-all ${
            isGenerating
              ? 'border-purple-800/80 bg-neutral-950/80 opacity-90'
              : 'border-neutral-700/80 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500'
          }`}>
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isGenerating) {
                  e.preventDefault();
                  handleSendTurn();
                }
              }}
              placeholder={
                isGenerating
                  ? 'Gemini is actively synthesizing your reflection. Please wait...'
                  : 'Write your reflection, thoughts, or questions (Press Cmd+Enter or click Send)...'
              }
              rows={3}
              disabled={isGenerating}
              className="w-full text-xs sm:text-sm p-3.5 pr-28 bg-transparent text-white placeholder-neutral-500 focus:outline-none resize-none disabled:cursor-not-allowed"
              id="input-reflection-textarea"
            />

            {/* Bottom-right Send Button / Duplicate submission blocker */}
            <div className="absolute right-2.5 bottom-2.5 flex items-center gap-2">
              <button
                onClick={() => handleSendTurn()}
                disabled={!inputText.trim() || isGenerating}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                id="btn-send-reflection"
                title={isGenerating ? 'Generation in progress...' : 'Send turn'}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Processing</span>
                  </>
                ) : (
                  <>
                    <span>Send</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-neutral-500 px-1">
            <span>
              {isGenerating ? 'Duplicate submissions locked while Gemini is generating' : 'Cmd + Enter to submit turn'}
            </span>
            <span className="font-mono text-emerald-400">
              Cloud Firestore Scoped &bull; Gemini 3.6 Flash Ladder
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
