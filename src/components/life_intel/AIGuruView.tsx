import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  Heart,
  Scale,
  RefreshCw,
  Lightbulb,
  Bookmark,
  Check,
  CheckCircle2
} from 'lucide-react';
import { GuruGuidanceResult, JournalEntry, AIMemory } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AIGuruViewProps {
  entries: JournalEntry[];
  memories: AIMemory[];
  onSaveMemory?: (memoryText: string, category?: string) => Promise<void> | void;
}

export const AIGuruView: React.FC<AIGuruViewProps> = ({
  entries,
  memories,
  onSaveMemory
}) => {
  const { user } = useAuth();
  const [dilemma, setDilemma] = useState(
    'I am torn between taking a secure, predictable job offer versus investing all my energy into building my independent product venture.'
  );
  const [context, setContext] = useState(
    'I have 6 months of runway. My family prefers stability, but I feel deep creative passion and regret avoiding the challenge.'
  );
  const [values, setValues] = useState('Autonomy, long-term craft, honesty, emotional peace, financial responsibility');
  const [guidance, setGuidance] = useState<GuruGuidanceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSeekGuidance = async () => {
    if (!dilemma.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/guru/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dilemma,
          context,
          values,
          entries,
          memories
        })
      });

      if (!res.ok) throw new Error('Failed');

      const data: GuruGuidanceResult = await res.json();
      setGuidance(data);
      showToast('Ethical decision synthesis generated.');
    } catch {
      showToast('Could not synthesize guidance.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRememberGuidance = async () => {
    if (!guidance) return;
    const textToSave = `Decision Framework (${guidance.coreDilemma}): ${guidance.introspectiveQuestion} -> ${guidance.practicalNextStep}`;
    try {
      if (onSaveMemory) {
        await onSaveMemory(textToSave, 'Principles');
      }
      setIsSaved(true);
      showToast('Decision guidance saved to AI Memory Vault.');
      setTimeout(() => setIsSaved(false), 3000);
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

      {/* Header */}
      <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-6 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#76B900]/10 text-[#76B900] border border-[#76B900]/20">
                Ethical Reflection Framework
              </span>
              <span className="text-xs text-neutral-500 font-mono">Structured Decision Support</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              AI Guru: Life & Ethical Decision Support
            </h2>
            <p className="text-sm text-neutral-400 max-w-2xl">
              Navigate dilemmas and crossroads without generic advice. The AI Guru applies a 7-step reflective framework rooted in your authentic values and peace of mind.
            </p>
          </div>
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-6 space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-neutral-300">The Dilemma or Crossroad</label>
          <textarea
            value={dilemma}
            onChange={(e) => setDilemma(e.target.value)}
            rows={2}
            placeholder="Describe the decision, crossroad, or conflict you are facing..."
            className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#76B900] rounded-xl p-3 text-xs text-neutral-200 resize-none outline-none leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">Context & Circumstances</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={2}
              placeholder="Background factors, timeline, emotional weight, or constraints..."
              className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#76B900] rounded-xl p-3 text-xs text-neutral-200 resize-none outline-none leading-relaxed"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">Values & Non-Negotiables at Stake</label>
            <textarea
              value={values}
              onChange={(e) => setValues(e.target.value)}
              rows={2}
              placeholder="Integrity, freedom, family, health, mastery..."
              className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#76B900] rounded-xl p-3 text-xs text-neutral-200 resize-none outline-none leading-relaxed"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#1F2428]">
          <button
            onClick={handleSeekGuidance}
            disabled={isLoading || !dilemma.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black text-xs font-bold shadow-[0_0_15px_rgba(118,185,0,0.2)] transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing Reflection...</span>
              </>
            ) : (
              <>
                <Scale className="w-3.5 h-3.5 fill-black" />
                <span>Synthesize 7-Step Framework</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 7-Step Synthesis Card */}
      {guidance && (
        <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1F2428]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#76B900]" />
              <h3 className="text-base font-bold text-white tracking-tight">
                7-Step Reflective Decision Framework
              </h3>
            </div>
            <button
              onClick={handleRememberGuidance}
              disabled={isSaved}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isSaved ? 'bg-[#76B900] text-black' : 'bg-[#76B900]/20 text-[#76B900] hover:bg-[#76B900]/30'
              }`}
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved to Vault' : 'Remember Framework'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Step 1: Core Dilemma */}
            <div className="p-4 rounded-xl bg-[#0B0D0E] border border-[#1F2428] space-y-1">
              <span className="text-[11px] font-bold text-[#76B900] font-mono uppercase">
                Step 1: Core Dilemma Clarified
              </span>
              <p className="text-xs sm:text-sm text-neutral-200">{guidance.coreDilemma}</p>
            </div>

            {/* Step 2: Values at Stake */}
            <div className="p-4 rounded-xl bg-[#0B0D0E] border border-[#1F2428] space-y-2">
              <span className="text-[11px] font-bold text-[#00BCD4] font-mono uppercase">
                Step 2: Values & Goals at Stake
              </span>
              <div className="flex flex-wrap gap-2">
                {guidance.valuesAtStake.map((val, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md bg-[#16191C] border border-[#1F2428] text-xs text-neutral-200">
                    {val}
                  </span>
                ))}
              </div>
            </div>

            {/* Step 3 & 4: Alternative Paths & Tradeoffs */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-neutral-400 font-mono uppercase">
                Step 3 & 4: Realistic Alternative Paths & Tradeoffs
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {guidance.alternativePaths.map((alt, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#0B0D0E] border border-[#1F2428] space-y-2">
                    <h5 className="text-xs font-bold text-white">{alt.pathName}</h5>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="text-neutral-300">
                        <strong className="text-[#76B900]">Advantages:</strong> {alt.advantages.join(', ')}
                      </div>
                      <div className="text-neutral-300">
                        <strong className="text-[#E91E63]">Tradeoffs:</strong> {alt.tradeoffs.join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 5: Ethics & Peace of Mind */}
            <div className="p-4 rounded-xl bg-[#16191C] border border-[#F4B400]/30 space-y-1.5">
              <span className="text-[11px] font-bold text-[#F4B400] font-mono uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Step 5: Ethics & Long-Term Peace of Mind
              </span>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-serif italic">
                "{guidance.ethicalConsiderations}"
              </p>
            </div>

            {/* Step 6 & 7: Introspective Question & Practical Next Step */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#0B0D0E] border border-[#1F2428] space-y-1.5">
                <span className="text-[11px] font-bold text-[#76B900] font-mono uppercase flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Step 6: Introspective Question
                </span>
                <p className="text-xs sm:text-sm text-neutral-200 italic">
                  {guidance.introspectiveQuestion}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0D0E] border border-[#1F2428] space-y-1.5">
                <span className="text-[11px] font-bold text-[#00BCD4] font-mono uppercase flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5" />
                  Step 7: Practical Next Step
                </span>
                <p className="text-xs sm:text-sm text-neutral-200">
                  {guidance.practicalNextStep}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
