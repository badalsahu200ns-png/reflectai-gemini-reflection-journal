import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Sparkles,
  Save,
  Check,
  TrendingUp,
  AlertTriangle,
  Zap,
  Target,
  Quote,
  Lightbulb,
  RefreshCw,
  Bookmark,
  CheckCircle2
} from 'lucide-react';
import { PersonalSwotData, JournalEntry, AIMemory } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface PersonalSwotViewProps {
  entries: JournalEntry[];
  memories: AIMemory[];
  onOpenEntry?: (entryId: string) => void;
  onSaveMemory?: (memoryText: string, category?: string) => Promise<void> | void;
}

export const PersonalSwotView: React.FC<PersonalSwotViewProps> = ({
  entries,
  memories,
  onOpenEntry,
  onSaveMemory
}) => {
  const { user } = useAuth();
  const [swot, setSwot] = useState<PersonalSwotData>({
    userId: user?.uid || '',
    strengths: '',
    weaknesses: '',
    opportunities: '',
    threats: '',
    updatedAt: ''
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [rememberedStrategyIdx, setRememberedStrategyIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    const loadSwot = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'life_intel', 'swot_analysis');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setSwot(snap.data() as PersonalSwotData);
        } else {
          const local = localStorage.getItem(`reflectai_swot_${user.uid}`);
          if (local) setSwot(JSON.parse(local));
        }
      } catch (err) {
        const local = localStorage.getItem(`reflectai_swot_${user.uid}`);
        if (local) {
          try {
            setSwot(JSON.parse(local));
          } catch {}
        }
      }
    };
    loadSwot();
  }, [user?.uid]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveSwot = async () => {
    if (!user?.uid) return;
    setIsSaving(true);
    const updated = {
      ...swot,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(`reflectai_swot_${user.uid}`, JSON.stringify(updated));
      const docRef = doc(db, 'users', user.uid, 'life_intel', 'swot_analysis');
      await setDoc(docRef, updated, { merge: true });
      showToast('SWOT saved securely.');
    } catch {
      showToast('Saved locally.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunSwotAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/life-intelligence/swot-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strengths: swot.strengths,
          weaknesses: swot.weaknesses,
          opportunities: swot.opportunities,
          threats: swot.threats,
          entries
        })
      });

      if (!res.ok) throw new Error('Analysis failed');

      const data = await res.json();
      const updated: PersonalSwotData = {
        ...swot,
        aiAnalysis: {
          strengthsAnalysis: data.strengthsAnalysis || '',
          weaknessesAnalysis: data.weaknessesAnalysis || '',
          opportunitiesAnalysis: data.opportunitiesAnalysis || '',
          threatsAnalysis: data.threatsAnalysis || '',
          strategicRecommendations: data.strategicRecommendations || [],
          evidence: data.evidence || [],
          generatedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      };

      setSwot(updated);
      if (user?.uid) {
        localStorage.setItem(`reflectai_swot_${user.uid}`, JSON.stringify(updated));
        try {
          const docRef = doc(db, 'users', user.uid, 'life_intel', 'swot_analysis');
          await setDoc(docRef, updated, { merge: true });
        } catch {}
      }

      showToast('Personal SWOT synthesis generated with evidence.');
    } catch (err) {
      showToast('Could not complete SWOT analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRememberStrategy = async (strategy: string, idx: number) => {
    if (!strategy) return;
    try {
      if (onSaveMemory) {
        await onSaveMemory(strategy, 'Goals');
      }
      setRememberedStrategyIdx(idx);
      showToast('Strategy saved to AI Memory Vault.');
      setTimeout(() => setRememberedStrategyIdx(null), 3000);
    } catch {
      showToast('Could not save to Memory Vault.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#F4B400]/10 text-[#F4B400] border border-[#F4B400]/20">
                Personal Strategy Matrix
              </span>
              <span className="text-xs text-neutral-500 font-mono">Self-Audit</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Personal SWOT Analysis
            </h2>
            <p className="text-sm text-neutral-400 max-w-2xl">
              Map your strengths, growth edges, opportunities, and potential obstacles. Gemini will synthesize a strategic roadmap grounded in your journal history.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleSaveSwot}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181B1E] hover:bg-[#22272B] text-neutral-200 hover:text-white border border-[#1F2428] text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Inputs'}</span>
            </button>
            <button
              onClick={handleRunSwotAnalysis}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black text-xs font-bold shadow-[0_0_15px_rgba(118,185,0,0.2)] transition-all active:scale-95 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-black" />
                  <span>Run SWOT with Gemini</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4 Quadrants Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Strengths */}
        <div className="bg-[#121517] border border-[#76B900]/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#76B900] flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Strengths (Internal Assets)</span>
            </label>
            <span className="text-[10px] text-neutral-500 font-mono uppercase">Leverage</span>
          </div>
          <p className="text-[11px] text-neutral-400">Natural talents, skills, resilience, positive habits, supportive network.</p>
          <textarea
            value={swot.strengths}
            onChange={(e) => setSwot({ ...swot, strengths: e.target.value })}
            placeholder="e.g. Deep curiosity, ability to stay calm under pressure, strong written communication..."
            rows={3}
            className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#76B900] rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 resize-none outline-none leading-relaxed"
          />
        </div>

        {/* Weaknesses / Growth Edges */}
        <div className="bg-[#121517] border border-[#E91E63]/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#E91E63] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Weaknesses / Growth Edges</span>
            </label>
            <span className="text-[10px] text-neutral-500 font-mono uppercase">Refine</span>
          </div>
          <p className="text-[11px] text-neutral-400">Friction areas, procrastination triggers, difficulty saying no, skill gaps.</p>
          <textarea
            value={swot.weaknesses}
            onChange={(e) => setSwot({ ...swot, weaknesses: e.target.value })}
            placeholder="e.g. Tendency to overthink before starting, irregular sleep during high-work weeks..."
            rows={3}
            className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#E91E63] rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 resize-none outline-none leading-relaxed"
          />
        </div>

        {/* Opportunities */}
        <div className="bg-[#121517] border border-[#00BCD4]/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#00BCD4] flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Opportunities (External Possibilities)</span>
            </label>
            <span className="text-[10px] text-neutral-500 font-mono uppercase">Capture</span>
          </div>
          <p className="text-[11px] text-neutral-400">Emerging tech, career paths, mentorship, creative projects, networking.</p>
          <textarea
            value={swot.opportunities}
            onChange={(e) => setSwot({ ...swot, opportunities: e.target.value })}
            placeholder="e.g. Emerging AI engineering tools, freelance projects, publishing my articles online..."
            rows={3}
            className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#00BCD4] rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 resize-none outline-none leading-relaxed"
          />
        </div>

        {/* Threats / Obstacles */}
        <div className="bg-[#121517] border border-[#F4B400]/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#F4B400] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Threats (Potential Obstacles)</span>
            </label>
            <span className="text-[10px] text-neutral-500 font-mono uppercase">Mitigate</span>
          </div>
          <p className="text-[11px] text-neutral-400">Burnout risks, excessive context-switching, market competition, distractions.</p>
          <textarea
            value={swot.threats}
            onChange={(e) => setSwot({ ...swot, threats: e.target.value })}
            placeholder="e.g. Overcommitting to multiple projects, cognitive fatigue from screen time..."
            rows={3}
            className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#F4B400] rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 resize-none outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* Gemini SWOT Analysis Output */}
      {swot.aiAnalysis && (
        <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1F2428]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#76B900]" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Gemini Grounded Strategic Synthesis
              </h3>
            </div>
            <span className="text-[11px] text-neutral-500 font-mono">
              Generated {new Date(swot.aiAnalysis.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths Deep Dive */}
            <div className="p-4 rounded-xl bg-[#0B0D0E] border border-[#1F2428] space-y-1.5">
              <h4 className="text-xs font-bold text-[#76B900] uppercase tracking-wider font-mono">
                Strengths Deep Dive
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {swot.aiAnalysis.strengthsAnalysis}
              </p>
            </div>

            {/* Growth Edges Refinement */}
            <div className="p-4 rounded-xl bg-[#0B0D0E] border border-[#1F2428] space-y-1.5">
              <h4 className="text-xs font-bold text-[#E91E63] uppercase tracking-wider font-mono">
                Growth Edges & Friction
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {swot.aiAnalysis.weaknessesAnalysis}
              </p>
            </div>

            {/* Opportunities Strategy */}
            <div className="p-4 rounded-xl bg-[#0B0D0E] border border-[#1F2428] space-y-1.5">
              <h4 className="text-xs font-bold text-[#00BCD4] uppercase tracking-wider font-mono">
                High-Leverage Opportunities
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {swot.aiAnalysis.opportunitiesAnalysis}
              </p>
            </div>

            {/* Obstacle Prevention */}
            <div className="p-4 rounded-xl bg-[#0B0D0E] border border-[#1F2428] space-y-1.5">
              <h4 className="text-xs font-bold text-[#F4B400] uppercase tracking-wider font-mono">
                Obstacle & Fatigue Prevention
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {swot.aiAnalysis.threatsAnalysis}
              </p>
            </div>
          </div>

          {/* Strategic Recommendations */}
          {swot.aiAnalysis.strategicRecommendations && swot.aiAnalysis.strategicRecommendations.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#76B900]" />
                <span>Actionable Strategic Recommendations</span>
              </h4>
              <div className="space-y-2.5">
                {swot.aiAnalysis.strategicRecommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#16191C] border border-[#1F2428] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#76B900]/20 text-[#76B900] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-neutral-200">{rec}</p>
                    </div>
                    <button
                      onClick={() => handleRememberStrategy(rec, idx)}
                      disabled={rememberedStrategyIdx === idx}
                      className="shrink-0 text-xs px-2.5 py-1 rounded-lg bg-[#1F2428] hover:bg-[#2A3036] text-neutral-300 hover:text-white transition-colors flex items-center gap-1"
                    >
                      {rememberedStrategyIdx === idx ? (
                        <>
                          <Check className="w-3 h-3 text-[#76B900]" />
                          <span>Saved!</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3 h-3 text-neutral-400" />
                          <span>Remember</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Citations */}
          {swot.aiAnalysis.evidence && swot.aiAnalysis.evidence.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#1F2428]">
              <div className="text-xs font-bold text-neutral-400 font-mono uppercase tracking-wider">
                Journal Cross-References ({swot.aiAnalysis.evidence.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {swot.aiAnalysis.evidence.map((ev, idx) => (
                  <div
                    key={idx}
                    onClick={() => ev.entryId && onOpenEntry && onOpenEntry(ev.entryId)}
                    className="p-3 rounded-xl bg-[#0B0D0E] border border-[#1F2428] hover:border-neutral-600 transition-colors text-left space-y-1 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                      <span className="text-neutral-400 font-medium group-hover:text-[#76B900] line-clamp-1">
                        {ev.title || 'Journal Entry'}
                      </span>
                      <span>{ev.date}</span>
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2 italic">
                      "{ev.excerpt}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
