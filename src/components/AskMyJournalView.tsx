import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';
import Markdown from 'react-markdown';
import { JournalEntry, AIMemory, AskJournalResponse } from '../types';
import { useVoiceInput } from '../hooks/useVoiceInput';

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
  citations?: AskJournalResponse['citations'];
  modelUsed?: string;
}

const SAMPLE_QUESTIONS = [
  'What recurring challenges have I mentioned recently?',
  'What are my main goals and aspirations this month?',
  'What activities or thoughts made me feel most calm?',
  'What patterns do you notice in my emotional trajectory?',
  'What did I write about my relationships or work?'
];

export const AskMyJournalView: React.FC<AskMyJournalViewProps> = ({
  entries,
  memories = [],
  onOpenEntry
}) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<MessageHistoryItem[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        `Hello! I am **Ask My Journal**. I can answer questions about your personal reflections, extract recurring themes, and connect memories across your entries.\n\nAsk me anything about your thoughts, emotions, or past goals, and I will cite specific dates from your private entries.`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<any | null>(null);

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
      const response = await fetch('/api/journal/ask-my-journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          entries: entries.map((e) => ({
            id: e.id,
            title: e.title,
            createdAt: e.createdAt,
            mood: e.mood,
            tags: e.tags,
            content: e.content,
            turns: e.turns
          })),
          memories
        })
      });

      if (!response.ok) {
        throw new Error('Failed to query your journal.');
      }

      const result: AskJournalResponse = await response.json();

      const aiMsg: MessageHistoryItem = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        content: result.answer,
        timestamp: new Date().toISOString(),
        citations: result.citations,
        modelUsed: result.modelUsed
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Ask Journal Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: 'Sorry, I encountered an error searching your journal. Please ensure your query is valid and try again.',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0D0E] text-white overflow-hidden rounded-2xl border border-[#1F2428]" id="ask-my-journal-view">
      {/* Header Banner */}
      <div className="px-6 py-4 border-b border-[#1F2428] bg-[#14171A] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#9C27B0] flex items-center justify-center text-white shadow-xs">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              Ask My Journal
              <span className="text-[10px] font-mono uppercase bg-[#9C27B0]/15 text-[#9C27B0] px-2 py-0.5 rounded border border-[#9C27B0]/40 font-bold">
                Grounded RAG Search
              </span>
            </h1>
            <p className="text-[11px] text-neutral-400">
              Query patterns, thoughts, and past decisions across all your {entries.length} journal reflections.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
          <span className="font-mono text-[11px] text-[#76B900] bg-[#76B900]/10 px-2.5 py-1 rounded-lg border border-[#76B900]/30 flex items-center gap-1.5 font-semibold">
            <BookOpen className="w-3 h-3" />
            {entries.length} Entries Indexed
          </span>
        </div>
      </div>

      {/* Messages Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#0B0D0E]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-[#76B900] text-black shadow-xs'
                    : 'bg-[#14171A] text-[#9C27B0] border border-[#22272B]'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl space-y-3 ${
                  isUser
                    ? 'bg-[#14171A] border border-[#76B900]/40 text-white max-w-lg shadow-xs'
                    : 'bg-[#111416] border border-[#1F2428] text-neutral-200 shadow-xs w-full'
                }`}
              >
                <div className="text-xs leading-relaxed font-sans prose prose-invert max-w-none">
                  <Markdown>{msg.content}</Markdown>
                </div>

                {/* Evidence Citations / Sources */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-3 mt-3 border-t border-[#1F2428] space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#9C27B0] flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3" />
                      Referenced Journal Entries ({msg.citations.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((cite, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedCitation(cite)}
                          className="p-2.5 rounded-xl bg-[#14171A] hover:bg-[#1A1E22] border border-[#22272B] hover:border-[#9C27B0]/50 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between text-[11px] font-semibold text-white group-hover:text-[#76B900]">
                            <span className="truncate">{cite.title || 'Journal Entry'}</span>
                            <ChevronRight className="w-3 h-3 text-neutral-500 group-hover:text-[#76B900] shrink-0" />
                          </div>
                          <div className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-2.5 h-2.5 text-[#595959]" />
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
            <div className="w-8 h-8 rounded-xl bg-[#14171A] text-[#9C27B0] flex items-center justify-center border border-[#22272B]">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-[#111416] border border-[#1F2428] text-neutral-400 text-xs flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 border-2 border-[#9C27B0] border-t-transparent rounded-full animate-spin" />
              <span>Scanning your reflections & synthesizing evidence...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Chips Bar */}
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
              {isListening ? <MicOff className="w-4 h-4 text-[#F44336]" /> : <Mic className="w-4 h-4 text-[#17DBCF]" />}
            </button>
          )}

          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your journal (e.g. 'What patterns do you notice in my thoughts?')..."
            className="flex-1 px-4 py-3 rounded-xl bg-[#111416] border border-[#22272B] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#76B900] transition-all font-sans"
          />

          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="px-4 py-3 rounded-xl bg-[#F44336] hover:bg-[#D32F2F] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>

      {/* Citation Detail Modal */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#14171A] border border-[#22272B] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#9C27B0]">
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
              <Calendar className="w-3.5 h-3.5 text-[#595959]" />
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F44336] hover:bg-[#D32F2F] text-white text-xs font-semibold transition-all shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Entry in Studio
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
