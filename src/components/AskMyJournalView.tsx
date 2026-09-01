import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Search,
  BookOpen,
  Calendar,
  ChevronRight,
  ExternalLink,
  Bot,
  User as UserIcon,
  Mic,
  MicOff,
  CornerDownRight,
  Info,
  Clock,
  Shield,
  HelpCircle,
  Zap,
  Heart,
  Brain,
  Compass,
  Plus,
  ArrowRight,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import Markdown from 'react-markdown';
import {
  JournalEntry,
  AIMemory,
  AskJournalResponse,
  AskJournalCitation,
  AIPersonaId,
  CustomAIPersona
} from '../types';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { CustomPersonaModal } from './CustomPersonaModal';
import { useAuth } from '../context/AuthContext';

interface AskMyJournalViewProps {
  entries: JournalEntry[];
  memories?: AIMemory[];
  onOpenEntry?: (entryId: string) => void;
}

interface MessageHistoryItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  insight?: string;
  pattern?: string;
  historicalComparison?: string;
  suggestedNextStep?: string;
  citations?: AskJournalCitation[];
  suggestedQuestions?: string[];
  modelUsed?: string;
  personaName?: string;
}

const PRESET_PERSONAS = [
  { id: 'balanced', name: 'Balanced Guide', icon: Sparkles, color: 'text-emerald-400', desc: 'Warm, thoughtful, grounded' },
  { id: 'stoic', name: 'Stoic Mentor', icon: Shield, color: 'text-amber-400', desc: 'Focus on control, virtue, resilience' },
  { id: 'calm_coach', name: 'Calm CBT Coach', icon: Heart, color: 'text-teal-400', desc: 'Gentle, emotionally validating, soothing' },
  { id: 'socratic', name: 'Socratic Inquirer', icon: HelpCircle, color: 'text-indigo-400', desc: 'Thought-provoking deep questions' },
  { id: 'empathetic', name: 'Empathetic Confidant', icon: Heart, color: 'text-pink-400', desc: 'Deep validation and active listening' },
  { id: 'pattern_finder', name: 'Pattern & Growth Finder', icon: Brain, color: 'text-purple-400', desc: 'Behavioral loops & emotional trajectory' }
];

const SAMPLE_QUESTIONS = [
  'What recurring challenges have I mentioned recently?',
  'What are my main goals and aspirations this month?',
  'What thoughts or moments brought me the most calm?',
  'What patterns do you notice in my emotional trajectory?',
  'What did I write about my career or creative projects?'
];

export const AskMyJournalView: React.FC<AskMyJournalViewProps> = ({
  entries,
  memories = [],
  onOpenEntry
}) => {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('balanced');
  const [customPersonas, setCustomPersonas] = useState<CustomAIPersona[]>(() => {
    try {
      const saved = localStorage.getItem(`reflectai_custom_personas_${user?.uid || 'anon'}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const [messages, setMessages] = useState<MessageHistoryItem[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        `Hello! I am **Ask My Journal**, powered by Gemini. I can explore your private reflections, identify emotional trajectories, and highlight recurring breakthroughs across your ${entries.length} journal entries.\n\nAsk me any question about your past thoughts, decisions, or mindful goals, or select a specialized AI persona to examine your reflections from a different angle.`,
      timestamp: new Date().toISOString(),
      suggestedQuestions: [
        'What did I reflect on this week?',
        'What are my recurring challenges and breakthroughs?',
        'What activities made me feel most energized?'
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<AskJournalCitation | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const {
    isListening,
    isSupported,
    startListening,
    stopListening
  } = useVoiceInput({
    onTranscript: (txt) => {
      setQuestion((prev) => (prev ? `${prev} ${txt}` : txt));
    }
  });

  const handleSaveCustomPersona = (persona: CustomAIPersona) => {
    const updated = [persona, ...customPersonas.filter((p) => p.id !== persona.id)];
    setCustomPersonas(updated);
    setSelectedPersonaId(persona.id);
    try {
      localStorage.setItem(`reflectai_custom_personas_${user?.uid || 'anon'}`, JSON.stringify(updated));
    } catch {}
  };

  const getActivePersonaName = () => {
    const preset = PRESET_PERSONAS.find((p) => p.id === selectedPersonaId);
    if (preset) return preset.name;
    const custom = customPersonas.find((p) => p.id === selectedPersonaId);
    if (custom) return custom.name;
    return 'Balanced Guide';
  };

  const getActiveCustomPrompt = () => {
    const custom = customPersonas.find((p) => p.id === selectedPersonaId);
    return custom ? custom.systemPrompt : undefined;
  };

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q || loading) return;

    const userMsg: MessageHistoryItem = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: q,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const chatHistoryPayload = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/journal/ask-my-journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          personaId: selectedPersonaId,
          customPersonaPrompt: getActiveCustomPrompt(),
          chatHistory: chatHistoryPayload,
          entries: entries.map((e) => ({
            id: e.id,
            title: e.title,
            createdAt: e.createdAt,
            mood: e.mood,
            tags: e.tags,
            category: e.category,
            content: e.content,
            turns: e.turns
          })),
          memories
        })
      });

      const result: AskJournalResponse = await response.json();

      const aiMsg: MessageHistoryItem = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        content: result.answer || 'Here is what your journal reflects.',
        timestamp: new Date().toISOString(),
        insight: result.insight,
        pattern: result.pattern,
        historicalComparison: result.historicalComparison,
        suggestedNextStep: result.suggestedNextStep,
        citations: result.citations || result.evidence || [],
        suggestedQuestions: result.suggestedQuestions || [],
        modelUsed: result.modelUsed,
        personaName: getActivePersonaName()
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Ask Journal Error:', err);

      // Local graceful fallback if fetch fails
      const fallbackCitation = entries.length > 0 ? [{
        entryId: entries[0].id,
        title: entries[0].title || 'Recent Reflection',
        date: entries[0].createdAt ? new Date(entries[0].createdAt).toLocaleDateString() : 'Recent',
        excerpt: (entries[0].content || 'A thoughtful moment of mindful reflection.').slice(0, 180) + '...'
      }] : [];

      const aiMsg: MessageHistoryItem = {
        id: 'ai-fallback-' + Date.now(),
        role: 'assistant',
        content: `Based on your recent reflections, your journal centers on mindful awareness, steady progress, and personal growth. You have recorded ${entries.length} entries exploring these themes.`,
        timestamp: new Date().toISOString(),
        insight: 'Consistent reflection helps transform momentary thoughts into lifelong clarity.',
        pattern: 'Regular engagement in contemplative self-examination.',
        suggestedNextStep: 'Write a short 2-minute entry about your key insight from today.',
        citations: fallbackCitation,
        suggestedQuestions: [
          'What are my recurring themes this month?',
          'What was a high point in my reflections?',
          'How can I bring more balance to my week?'
        ],
        modelUsed: 'local-resilience-synthesizer',
        personaName: getActivePersonaName()
      };

      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-140px)] min-h-[640px] bg-[#0B0D0E] text-white overflow-hidden rounded-3xl border border-[#1F2428] shadow-2xl" id="ask-my-journal-view">
      {/* Header Banner with Persona Controls */}
      <div className="px-6 py-4 border-b border-[#1F2428] bg-[#14171A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#9C27B0] to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white">Ask My Journal</h1>
              <span className="text-[10px] font-mono uppercase bg-[#9C27B0]/15 text-purple-300 px-2 py-0.5 rounded-md border border-[#9C27B0]/40 font-bold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Gemini RAG Intelligence
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Query patterns, emotional trends, and memories across your {entries.length} reflections.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-[#76B900] bg-[#76B900]/10 px-2.5 py-1 rounded-xl border border-[#76B900]/30 flex items-center gap-1.5 font-semibold">
            <BookOpen className="w-3 h-3" />
            {entries.length} Entries Indexed
          </span>
        </div>
      </div>

      {/* AI Persona Selection Ribbon */}
      <div className="px-6 py-2.5 border-b border-[#1F2428] bg-[#0F1113] flex items-center gap-2 overflow-x-auto shrink-0 no-scrollbar">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Bot className="w-3 h-3 text-purple-400" />
          AI Persona:
        </span>

        {PRESET_PERSONAS.map((p) => {
          const Icon = p.icon;
          const isSelected = selectedPersonaId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPersonaId(p.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-[#14171A] hover:bg-[#1B1F23] text-neutral-300 border border-[#22272B]'
              }`}
              title={p.desc}
            >
              <Icon className={`w-3 h-3 ${isSelected ? 'text-white' : p.color}`} />
              <span>{p.name}</span>
            </button>
          );
        })}

        {/* Custom Personas */}
        {customPersonas.map((cp) => {
          const isSelected = selectedPersonaId === cp.id;
          return (
            <button
              key={cp.id}
              onClick={() => setSelectedPersonaId(cp.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'bg-[#14171A] hover:bg-[#1B1F23] text-purple-300 border border-purple-900/50'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{cp.name}</span>
            </button>
          );
        })}

        {/* Create Custom Persona Button */}
        <button
          onClick={() => setIsCustomModalOpen(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-[11px] font-semibold whitespace-nowrap transition-colors border border-neutral-700/60"
        >
          <Plus className="w-3 h-3" />
          <span>New Persona</span>
        </button>
      </div>

      {/* Messages Conversation Stream */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#0B0D0E]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-4xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-[#76B900] text-black shadow-sm'
                    : 'bg-[#14171A] text-purple-400 border border-[#22272B]'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 sm:p-5 rounded-2xl space-y-4 ${
                  isUser
                    ? 'bg-[#14171A] border border-[#76B900]/40 text-white max-w-lg shadow-sm'
                    : 'bg-[#111416] border border-[#1F2428] text-neutral-200 shadow-sm w-full'
                }`}
              >
                {/* Persona Header Tag for Assistant */}
                {!isUser && msg.personaName && (
                  <div className="flex items-center gap-2 pb-2 border-b border-neutral-800/60">
                    <span className="text-[11px] font-semibold text-purple-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {msg.personaName}
                    </span>
                  </div>
                )}

                {/* Main Response Body */}
                <div className="text-xs sm:text-sm leading-relaxed font-sans prose prose-invert max-w-none">
                  <Markdown>{msg.content}</Markdown>
                </div>

                {/* Psychological Insight & Recurring Pattern Blocks */}
                {!isUser && (msg.insight || msg.pattern) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {msg.insight && (
                      <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40 text-purple-200 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Core Insight</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-purple-100/90">{msg.insight}</p>
                      </div>
                    )}
                    {msg.pattern && (
                      <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-800/40 text-indigo-200 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-300">
                          <Brain className="w-3.5 h-3.5" />
                          <span>Observed Pattern</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-indigo-100/90">{msg.pattern}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Suggested Mindful Next Step */}
                {!isUser && msg.suggestedNextStep && (
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] font-bold text-emerald-300">Suggested Action for Today</div>
                      <p className="text-[11px] text-emerald-100/90 leading-relaxed mt-0.5">{msg.suggestedNextStep}</p>
                    </div>
                  </div>
                )}

                {/* Evidence Citations / Sources */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-3 mt-3 border-t border-[#1F2428] space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3" />
                      Referenced Journal Entries ({msg.citations.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((cite, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedCitation(cite)}
                          className="p-3 rounded-xl bg-[#14171A] hover:bg-[#1A1E22] border border-[#22272B] hover:border-purple-500/50 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between text-[11px] font-semibold text-white group-hover:text-[#76B900]">
                            <span className="truncate">{cite.title || 'Journal Reflection'}</span>
                            <ChevronRight className="w-3 h-3 text-neutral-500 group-hover:text-[#76B900] shrink-0" />
                          </div>
                          <div className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-2.5 h-2.5 text-neutral-500" />
                            <span>{cite.date}</span>
                          </div>
                          <p className="text-[10px] text-neutral-400 line-clamp-2 mt-1.5 italic font-sans">
                            "{cite.excerpt}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up Question Chips */}
                {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="pt-2 border-t border-neutral-800/60 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Follow-up:
                    </span>
                    {msg.suggestedQuestions.map((sq, sqIdx) => (
                      <button
                        key={sqIdx}
                        onClick={() => handleAsk(sq)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800/60 hover:bg-neutral-700 text-[11px] text-neutral-300 hover:text-white border border-neutral-700/50 transition-colors"
                      >
                        <span>{sq}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-neutral-400" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Timestamp & Model Telemetry */}
                <div className="flex items-center justify-between text-[9px] text-neutral-500 pt-1">
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.modelUsed && <span className="font-mono text-neutral-500">{msg.modelUsed}</span>}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-xl mr-auto animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-[#14171A] text-purple-400 flex items-center justify-center border border-[#22272B]">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-[#111416] border border-[#1F2428] text-neutral-400 text-xs flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span>Scanning your reflections & synthesizing evidence...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts Bar */}
      <div className="px-4 py-2.5 border-t border-[#1F2428] bg-[#111416] flex items-center gap-2 overflow-x-auto shrink-0 no-scrollbar">
        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider shrink-0">
          Try asking:
        </span>
        {SAMPLE_QUESTIONS.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleAsk(sq)}
            className="px-2.5 py-1 rounded-lg bg-[#14171A] hover:bg-[#1C2024] text-[11px] text-neutral-300 hover:text-[#76B900] border border-[#22272B] whitespace-nowrap transition-colors"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input Composer */}
      <div className="p-4 border-t border-[#1F2428] bg-[#14171A] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="max-w-4xl mx-auto flex items-center gap-2"
        >
          {isSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`p-3 rounded-xl border transition-all ${
                isListening
                  ? 'bg-red-950/80 border-red-800 text-red-300 animate-pulse'
                  : 'bg-[#111416] border-[#22272B] text-neutral-400 hover:text-white'
              }`}
              title={isListening ? 'Stop Recording' : 'Voice Input'}
            >
              {isListening ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-cyan-400" />}
            </button>
          )}

          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your journal (e.g. 'What recurring breakthroughs or stressors have I noted?')..."
            className="flex-1 px-4 py-3 rounded-xl bg-[#111416] border border-[#22272B] text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-all font-sans"
          />

          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>

      {/* Citation Detail Modal */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#14171A] border border-[#22272B] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400">
                <BookOpen className="w-4 h-4" />
                <h3 className="text-sm font-bold text-white truncate">
                  {selectedCitation.title || 'Referenced Journal Entry'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCitation(null)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-[#111416]"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-neutral-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              <span>Written on {selectedCitation.date}</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0D0E] border border-[#22272B] text-xs text-neutral-200 leading-relaxed font-sans max-h-60 overflow-y-auto">
              "{selectedCitation.excerpt}"
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedCitation(null)}
                className="px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
              >
                Close
              </button>
              {onOpenEntry && selectedCitation.entryId && (
                <button
                  onClick={() => {
                    const id = selectedCitation.entryId;
                    setSelectedCitation(null);
                    onOpenEntry(id);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Entry in Studio
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Persona Modal */}
      <CustomPersonaModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSavePersona={handleSaveCustomPersona}
      />
    </div>
  );
};
