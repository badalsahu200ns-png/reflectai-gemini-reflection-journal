import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Compass,
  ArrowRight,
  Printer,
  Download,
  BookOpen
} from 'lucide-react';
import Markdown from 'react-markdown';
import { JournalEntry, MonthlyAISummary } from '../types';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface MonthlySummaryViewProps {
  entries: JournalEntry[];
  monthlySummaries?: MonthlyAISummary[];
  onOpenEntry?: (entry: JournalEntry) => void;
}

export const MonthlySummaryView: React.FC<MonthlySummaryViewProps> = ({
  entries,
  onOpenEntry
}) => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [currentSummary, setCurrentSummary] = useState<MonthlyAISummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter entries belonging to selected month
  const monthEntries = entries.filter((e) => {
    if (!e.createdAt) return false;
    const d = new Date(e.createdAt);
    const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return mStr === selectedMonth;
  });

  const handleGenerateSummary = async () => {
    if (monthEntries.length === 0) {
      setError('You need at least 1 journal entry in this month to generate a monthly retrospective.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    try {
      const response = await fetch('/api/journal/monthly-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: monthEntries.map((e) => ({
            id: e.id,
            title: e.title,
            createdAt: e.createdAt,
            mood: e.mood,
            tags: e.tags,
            content: e.content,
            turns: e.turns,
            wordCount: e.wordCount
          })),
          monthLabel: monthName,
          userId: user?.uid
        })
      });

      if (!response.ok) {
        throw new Error('Failed to synthesize monthly summary.');
      }

      const data = await response.json();
      setCurrentSummary(data.monthlySummary);

      // Persist to firestore if logged in
      if (user?.uid && data.monthlySummary) {
        try {
          const summaryRef = doc(db, 'users', user.uid, 'monthlySummaries', selectedMonth);
          await setDoc(summaryRef, data.monthlySummary, { merge: true });
        } catch (fErr) {
          console.warn('Could not save monthly summary to Firestore:', fErr);
        }
      }
    } catch (err: any) {
      console.error('Error in monthly synthesis:', err);
      setError(err.message || 'Could not generate monthly summary.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const monthLabel = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-neutral-900 text-neutral-100" id="monthly-summary-view">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-neutral-900 to-indigo-950/40 border border-neutral-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
                <Calendar className="w-5 h-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Monthly Retrospective & Synthesis
              </h1>
            </div>
            <p className="text-xs text-neutral-400 max-w-xl">
              Gemini analyzes recurring concerns, emotional arcs, milestones, and intentions across an entire month of reflections.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentSummary(null);
              }}
              className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleGenerateSummary}
              disabled={isGenerating || monthEntries.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md active:scale-98"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing...' : 'Generate Monthly AI'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Month Stats Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="text-[11px] text-neutral-400">Total Entries</div>
            <div className="text-xl font-bold text-white mt-1">{monthEntries.length}</div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="text-[11px] text-neutral-400">Total Words</div>
            <div className="text-xl font-bold text-purple-400 mt-1">
              {monthEntries.reduce((acc, e) => acc + (e.wordCount || 0), 0)}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="text-[11px] text-neutral-400">Selected Month</div>
            <div className="text-xs font-bold text-neutral-200 mt-1.5">{monthLabel}</div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="text-[11px] text-neutral-400">AI Retrospective</div>
            <div className="text-xs font-bold text-emerald-400 mt-1.5">
              {currentSummary ? 'Synthesized' : 'Ready to Generate'}
            </div>
          </div>
        </div>

        {/* Generated Summary Card */}
        {currentSummary ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {currentSummary.month} Reflection Synthesis
              </span>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
            </div>

            {/* Executive Summary */}
            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                Executive Summary
              </h2>
              <div className="text-xs text-neutral-300 leading-relaxed font-sans prose prose-invert max-w-none">
                <Markdown>{currentSummary.executiveSummary}</Markdown>
              </div>
            </div>

            {/* Monthly Themes & Mood Arc */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Monthly Themes */}
              <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  Key Themes of the Month
                </h3>
                <div className="space-y-2.5">
                  {currentSummary.monthlyThemes.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800/80">
                      <div className="text-xs font-semibold text-purple-300">{item.theme}</div>
                      <div className="text-[11px] text-neutral-400 mt-1">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mood Trend Narrative */}
              <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Emotional Arc & Mood Trajectory
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  {currentSummary.moodTrendNarrative}
                </p>
                {currentSummary.comparisonWithPrevious && (
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-300">
                    <span className="font-semibold">Growth Perspective: </span>
                    {currentSummary.comparisonWithPrevious}
                  </div>
                )}
              </div>
            </div>

            {/* Progress & Recurring Concerns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Milestones */}
              <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Milestones & Progress
                </h3>
                <ul className="space-y-2">
                  {currentSummary.progressAndMilestones.map((pm, idx) => (
                    <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{pm}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recurring Concerns */}
              <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  Recurring Concerns & Friction Points
                </h3>
                <ul className="space-y-2">
                  {currentSummary.recurringConcerns.map((rc, idx) => (
                    <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                      <span>{rc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Deep Reflection Questions & Next Month Intentions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Questions */}
              <div className="p-5 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-3">
                <h3 className="text-xs font-bold text-purple-300 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  End-of-Month Reflection Questions
                </h3>
                <ul className="space-y-2">
                  {currentSummary.reflectionQuestions.map((q, idx) => (
                    <li key={idx} className="text-xs text-neutral-200 italic flex items-start gap-2">
                      <span className="text-purple-400 font-bold">Q{idx + 1}:</span>
                      <span>"{q}"</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Intentions */}
              <div className="p-5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-3">
                <h3 className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-indigo-400" />
                  Suggested Next Month Intentions
                </h3>
                <ul className="space-y-2">
                  {currentSummary.nextMonthIntentions.map((intent, idx) => (
                    <li key={idx} className="text-xs text-neutral-200 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <span>{intent}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 text-center space-y-3">
            <Calendar className="w-10 h-10 text-neutral-600 mx-auto" />
            <div className="text-sm font-semibold text-white">
              Ready to generate your {monthLabel} Retrospective
            </div>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Click the "Generate Monthly AI" button above to have Gemini review your {monthEntries.length} entries for this month, detect recurring themes, and formulate intentions for next month.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
type MonthlyAISummaryProps = MonthlySummaryViewProps;
