import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Sparkles,
  Clock,
  ArrowRight,
  Repeat,
  Compass,
  RefreshCw,
  Bookmark,
  Check,
  Quote,
  Calendar,
  Layers
} from 'lucide-react';
import { ThenVsNowItem, RecurringStatementItem, BeliefShiftItem, JournalEntry, AIMemory } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface LongitudinalChangeViewProps {
  entries: JournalEntry[];
  memories: AIMemory[];
  onOpenEntry?: (entryId: string) => void;
  onSaveMemory?: (memoryText: string, category?: string) => Promise<void> | void;
}

export const LongitudinalChangeView: React.FC<LongitudinalChangeViewProps> = ({
  entries,
  memories,
  onOpenEntry,
  onSaveMemory
}) => {
  const { user } = useAuth();
  const [subTab, setSubTab] = useState<'then_vs_now' | 'what_i_keep_saying' | 'changing_perspectives'>('then_vs_now');

  const [thenVsNowItems, setThenVsNowItems] = useState<ThenVsNowItem[]>([]);
  const [keepSayingItems, setKeepSayingItems] = useState<RecurringStatementItem[]>([]);
  const [beliefShiftItems, setBeliefShiftItems] = useState<BeliefShiftItem[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [rememberedIdx, setRememberedIdx] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFetchThenVsNow = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/life-intelligence/then-vs-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries, memories })
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setThenVsNowItems(data.items || []);
      showToast('Then vs Now timeline synthesized.');
    } catch {
      showToast('Could not analyze longitudinal shifts.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchKeepSaying = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/life-intelligence/what-i-keep-saying', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries, memories })
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setKeepSayingItems(data.items || []);
      showToast('Recurring intentions & patterns identified.');
    } catch {
      showToast('Could not analyze recurring statements.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchBeliefShifts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/life-intelligence/changing-perspectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries, memories })
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setBeliefShiftItems(data.items || []);
      showToast('Changing perspectives mapped.');
    } catch {
      showToast('Could not analyze changing perspectives.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (entries.length >= 2) {
      handleFetchThenVsNow();
    }
  }, [entries.length]);

  const handleRememberItem = async (text: string, id: string) => {
    if (!text) return;
    try {
      if (onSaveMemory) {
        await onSaveMemory(text, 'Mindset');
      }
      setRememberedIdx(id);
      showToast('Insight saved to AI Memory Vault.');
      setTimeout(() => setRememberedIdx(null), 3000);
    } catch {
      showToast('Could not save to Memory Vault.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#1F2428] border border-[#76B900] text-white rounded-xl shadow-xl animate-fade-in text-sm font-medium">
          <Sparkles className="w-4 h-4 text-[#76B900]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-6 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#76B900]/10 text-[#76B900] border border-[#76B900]/20">
                Longitudinal Growth Radar
              </span>
              <span className="text-xs text-neutral-500 font-mono">Multi-Month Evolution</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              How You Are Changing Over Time
            </h2>
            <p className="text-sm text-neutral-400 max-w-2xl">
              Track how your priorities, stress management, and beliefs have evolved across your journal history.
            </p>
          </div>

          {/* Sub-tab Switcher */}
          <div className="flex items-center p-1 bg-[#0B0D0E] border border-[#1F2428] rounded-xl shrink-0">
            <button
              onClick={() => {
                setSubTab('then_vs_now');
                if (thenVsNowItems.length === 0) handleFetchThenVsNow();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subTab === 'then_vs_now' ? 'bg-[#76B900] text-black shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Then vs Now
            </button>
            <button
              onClick={() => {
                setSubTab('what_i_keep_saying');
                if (keepSayingItems.length === 0) handleFetchKeepSaying();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subTab === 'what_i_keep_saying' ? 'bg-[#76B900] text-black shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              What I Keep Saying
            </button>
            <button
              onClick={() => {
                setSubTab('changing_perspectives');
                if (beliefShiftItems.length === 0) handleFetchBeliefShifts();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subTab === 'changing_perspectives' ? 'bg-[#76B900] text-black shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Changing Perspectives
            </button>
          </div>
        </div>
      </div>

      {/* Action refresh button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            if (subTab === 'then_vs_now') handleFetchThenVsNow();
            else if (subTab === 'what_i_keep_saying') handleFetchKeepSaying();
            else handleFetchBeliefShifts();
          }}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#181B1E] hover:bg-[#22272B] border border-[#1F2428] text-xs font-bold text-neutral-300 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Re-analyze with Gemini</span>
        </button>
      </div>

      {/* SUB-TAB 1: THEN VS NOW */}
      {subTab === 'then_vs_now' && (
        <div className="space-y-4">
          {thenVsNowItems.length === 0 && !isLoading && (
            <div className="p-8 rounded-2xl bg-[#121517] border border-[#1F2428] text-center space-y-2">
              <p className="text-xs sm:text-sm text-neutral-400">
                Write at least a few journal entries to uncover historical Then vs Now trajectories.
              </p>
            </div>
          )}

          {thenVsNowItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#121517] border border-[#1F2428] rounded-2xl p-6 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#76B900] font-mono uppercase tracking-wider">
                  {item.dimension}
                </span>
                <button
                  onClick={() => handleRememberItem(`${item.dimension}: Then (${item.thenSummary}) -> Now (${item.nowSummary})`, `then_${idx}`)}
                  disabled={rememberedIdx === `then_${idx}`}
                  className="text-xs px-2.5 py-1 rounded-lg bg-[#181B1E] hover:bg-[#22272B] text-neutral-300 flex items-center gap-1"
                >
                  {rememberedIdx === `then_${idx}` ? (
                    <>
                      <Check className="w-3 h-3 text-[#76B900]" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3 h-3 text-neutral-400" />
                      <span>Remember</span>
                    </>
                  )}
                </button>
              </div>

              {/* Comparison Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0B0D0E] border border-[#1F2428] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                    <span className="uppercase font-bold text-neutral-400">Past Pattern (Then)</span>
                    <span>{item.thenDate}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {item.thenSummary}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#16191C] border border-[#76B900]/30 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#76B900] font-mono">
                    <span className="uppercase font-bold">Current State (Now)</span>
                    <span>{item.nowDate}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                    {item.nowSummary}
                  </p>
                </div>
              </div>

              {/* Underlying Growth Driver */}
              <div className="p-3 rounded-xl bg-[#0B0D0E] border border-[#1F2428] text-xs text-neutral-300 flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-[#76B900] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Underlying Shift:</strong> {item.shiftInsight}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 2: WHAT I KEEP SAYING */}
      {subTab === 'what_i_keep_saying' && (
        <div className="space-y-4">
          {keepSayingItems.map((item, idx) => (
            <div key={idx} className="bg-[#121517] border border-[#1F2428] rounded-2xl p-6 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-[#F4B400]" />
                    <h4 className="text-sm font-bold text-white">"{item.statement}"</h4>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">
                    Observed in {item.frequencyCount} entries • Status: {item.progressStatus}
                  </span>
                </div>
                <button
                  onClick={() => handleRememberItem(`Recurring Intention: ${item.statement} (${item.deeperDriver})`, `keep_${idx}`)}
                  disabled={rememberedIdx === `keep_${idx}`}
                  className="text-xs px-2.5 py-1 rounded-lg bg-[#181B1E] text-neutral-300 flex items-center gap-1 shrink-0"
                >
                  {rememberedIdx === `keep_${idx}` ? <Check className="w-3 h-3 text-[#76B900]" /> : <Bookmark className="w-3 h-3 text-neutral-400" />}
                  <span>Remember</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#0B0D0E] border border-[#1F2428] text-xs text-neutral-300">
                <strong className="text-white">Why this keeps surfacing:</strong> {item.deeperDriver}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 3: CHANGING PERSPECTIVES */}
      {subTab === 'changing_perspectives' && (
        <div className="space-y-4">
          {beliefShiftItems.map((item, idx) => (
            <div key={idx} className="bg-[#121517] border border-[#1F2428] rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#00BCD4] font-mono uppercase">
                  {item.topic}
                </span>
                <span className="text-[11px] font-mono text-neutral-500">{item.approximateDateOfShift}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0B0D0E] border border-[#1F2428] space-y-1">
                  <span className="text-neutral-500 font-mono uppercase">Old Belief</span>
                  <p className="text-neutral-300">{item.oldBelief}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#16191C] border border-[#76B900]/30 space-y-1">
                  <span className="text-[#76B900] font-mono uppercase">New Mindset</span>
                  <p className="text-white font-medium">{item.newBelief}</p>
                </div>
              </div>

              <div className="text-xs text-neutral-400 italic">
                <strong>Catalyst Event:</strong> {item.catalystEvent}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
