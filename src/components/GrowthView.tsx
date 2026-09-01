import React, { useState } from 'react';
import {
  TrendingUp,
  Target,
  FlaskConical,
  Calendar,
  Sparkles,
  Award,
  Clock,
  Mail,
  Plus,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Star,
  Trash2,
  Edit2,
  ArrowRight
} from 'lucide-react';
import {
  GrowthGoal,
  PersonalExperiment,
  YearlyReviewData,
  MemoryLetter,
  JournalEntry
} from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface GrowthViewProps {
  entries: JournalEntry[];
  onOpenEntry?: (entryId: string) => void;
  onStartReflection?: (initialText?: string) => void;
}

export const GrowthView: React.FC<GrowthViewProps> = ({
  entries,
  onOpenEntry,
  onStartReflection
}) => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Sub-Navigation Tabs
  const [activeTab, setActiveTab] = useState<'goals' | 'experiments' | 'yearly_review' | 'letters' | 'time_capsule'>('goals');

  // Goals State
  const [goals, setGoals] = useState<GrowthGoal[]>([
    {
      id: 'g-1',
      userId: user?.uid || 'anonymous',
      name: 'Mindful Morning Meditation Practice',
      description: 'Spend 15 minutes in meditation before opening work screens.',
      category: 'Mindfulness',
      progressPercent: 70,
      targetDate: '2026-12-31',
      status: 'ACTIVE',
      milestones: [
        { id: 'm-1', title: '7 consecutive days completed', isCompleted: true },
        { id: 'm-2', title: 'Establish dedicated quiet corner', isCompleted: true },
        { id: 'm-3', title: '30-day streak', isCompleted: false }
      ],
      relatedEntryIds: entries.slice(0, 2).map((e) => e.id),
      relatedMemoryIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'g-2',
      userId: user?.uid || 'anonymous',
      name: 'ReflectAI Full-Stack Architecture Mastery',
      description: 'Design resilient, offline-first Gemini AI agent applications.',
      category: 'Career',
      progressPercent: 90,
      targetDate: '2026-09-30',
      status: 'ACTIVE',
      milestones: [
        { id: 'm-4', title: 'Implement all 9 core feature categories', isCompleted: true },
        { id: 'm-5', title: 'Complete Gemini fallback ladders', isCompleted: true },
        { id: 'm-6', title: 'Zero compile/lint defects', isCompleted: true }
      ],
      relatedEntryIds: entries.slice(0, 1).map((e) => e.id),
      relatedMemoryIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  // Goal Creation Modal State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalCategory, setGoalCategory] = useState<'Personal' | 'Career' | 'Health' | 'Mindfulness' | 'Relationships' | 'Creative'>('Personal');
  const [goalDate, setGoalDate] = useState('2026-12-31');

  // AI Goal Analysis State
  const [goalAnalysis, setGoalAnalysis] = useState<any | null>(null);
  const [isAnalyzingGoals, setIsAnalyzingGoals] = useState(false);

  // Personal Experiments State
  const [experiments, setExperiments] = useState<PersonalExperiment[]>([
    {
      id: 'exp-1',
      userId: user?.uid || 'anonymous',
      title: 'No Phone 1 Hour Before Bed',
      hypothesis: 'Avoiding evening blue light will reduce stress scores by 20% and deepen sleep.',
      durationDays: 7,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE',
      journalEvidenceCount: 5,
      dailyCheckIns: [
        { date: 'Day 1', completed: true, moodScore: 8, energyScore: 7, notes: 'Read physical book instead.' },
        { date: 'Day 2', completed: true, moodScore: 8, energyScore: 8, notes: 'Fell asleep 30 minutes faster.' },
        { date: 'Day 3', completed: true, moodScore: 9, energyScore: 8, notes: 'Calmer evening thoughts.' },
        { date: 'Day 4', completed: true, moodScore: 8, energyScore: 9, notes: 'Reflected in journal.' },
        { date: 'Day 5', completed: true, moodScore: 9, energyScore: 9, notes: 'Noticed much lower bedtime anxiety.' }
      ],
      beforeAfterComparison: {
        moodBefore: 6,
        moodAfter: 9,
        energyBefore: 5,
        energyAfter: 8,
        aiObservations: 'Significant improvement in subjective restfulness and early morning energy.',
        keyLearnings: ['Evening reading replaced scrolling', 'Restfulness improved within 3 days']
      },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  // Yearly Review State
  const [yearlyReview, setYearlyReview] = useState<YearlyReviewData | null>(null);
  const [isGeneratingYearly, setIsGeneratingYearly] = useState(false);

  // Future Letters State
  const [letters, setLetters] = useState<MemoryLetter[]>([
    {
      id: 'let-1',
      userId: user?.uid || 'anonymous',
      type: 'FUTURE_SELF',
      title: 'A Note to My Future Self at the End of 2026',
      content: 'Remember why you started this journey. Celebrate the small victories, stay humble, and keep breathing deeply through technical hurdles.',
      scheduledUnlockDate: '2026-12-31',
      isUnlocked: false,
      createdAt: new Date().toISOString()
    }
  ]);
  const [letterTitle, setLetterTitle] = useState('');
  const [letterContent, setLetterContent] = useState('');
  const [letterDate, setLetterDate] = useState('2026-12-31');
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);

  // Trigger Goal Analysis
  const handleAnalyzeGoals = async (goal: GrowthGoal) => {
    setIsAnalyzingGoals(true);
    try {
      const res = await fetch('/api/ai/goal-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, entries })
      });
      const data = await res.json();
      setGoalAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingGoals(false);
    }
  };

  // Trigger Yearly Review Synthesis
  const handleGenerateYearlyReview = async () => {
    setIsGeneratingYearly(true);
    try {
      const res = await fetch('/api/ai/yearly-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries, year: 2026 })
      });
      const data = await res.json();
      setYearlyReview(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingYearly(false);
    }
  };

  // Save Goal
  const handleSaveGoal = () => {
    if (!goalTitle.trim()) return;
    const newG: GrowthGoal = {
      id: `g-${Date.now()}`,
      userId: user?.uid || 'anonymous',
      name: goalTitle,
      description: goalDesc,
      category: goalCategory,
      progressPercent: 0,
      targetDate: goalDate,
      status: 'ACTIVE',
      milestones: [
        { id: `m-${Date.now()}-1`, title: 'Kickoff milestone', isCompleted: false }
      ],
      relatedEntryIds: [],
      relatedMemoryIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setGoals([...goals, newG]);
    setIsGoalModalOpen(false);
    setGoalTitle('');
    setGoalDesc('');
  };

  // Save Letter
  const handleSaveLetter = () => {
    if (!letterTitle.trim() || !letterContent.trim()) return;
    const newLet: MemoryLetter = {
      id: `let-${Date.now()}`,
      userId: user?.uid || 'anonymous',
      type: 'FUTURE_SELF',
      title: letterTitle,
      content: letterContent,
      scheduledUnlockDate: letterDate,
      isUnlocked: false,
      createdAt: new Date().toISOString()
    };
    setLetters([...letters, newLet]);
    setIsLetterModalOpen(false);
    setLetterTitle('');
    setLetterContent('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn" id="growth-view">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-white">
              Growth, Goals & Retrospectives
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Track goals with Gemini evidence analysis, run personal habits experiments, synthesize annual reviews, and send letters to your future self.
          </p>
        </div>
      </header>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#111416] border border-neutral-800">
        {[
          { id: 'goals', label: 'Active Goals', icon: Target },
          { id: 'experiments', label: 'Personal Experiments', icon: FlaskConical },
          { id: 'yearly_review', label: 'Yearly Review (2026)', icon: Calendar },
          { id: 'letters', label: 'Future Memory Letters', icon: Mail },
          { id: 'time_capsule', label: '"What was I like then?"', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#76B900] text-black shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. GOALS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'goals' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Growth Objectives</h2>
            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Growth Goal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((g) => (
              <div
                key={g.id}
                className="p-6 rounded-3xl border border-neutral-800 bg-[#14171A] space-y-4 hover:border-[#76B900]/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#76B900]/15 text-[#76B900] font-mono text-[10px] font-bold">
                      {g.category}
                    </span>
                    <span className="text-neutral-400 font-mono">Target: {g.targetDate}</span>
                  </div>

                  <h3 className="text-base font-bold text-white">{g.name}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{g.description}</p>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Progress</span>
                      <span className="font-mono font-bold text-[#76B900]">{g.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full bg-[#76B900] rounded-full transition-all duration-500"
                        style={{ width: `${g.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones Checklist */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Milestones
                    </span>
                    {g.milestones.map((m) => (
                      <div key={m.id} className="flex items-center gap-2 text-xs text-neutral-300">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${m.isCompleted ? 'text-[#76B900]' : 'text-neutral-600'}`}
                        />
                        <span className={m.isCompleted ? 'line-through text-neutral-500' : ''}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                  <button
                    onClick={() => handleAnalyzeGoals(g)}
                    disabled={isAnalyzingGoals}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-purple-300 text-xs font-semibold hover:bg-purple-900 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>{isAnalyzingGoals ? 'Analyzing Entries...' : 'AI Journal Progress Analysis'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* AI Goal Analysis Display */}
          {goalAnalysis && (
            <div className="p-6 rounded-3xl border border-purple-900/50 bg-gradient-to-br from-[#14171A] to-[#1e1428] space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Gemini Goal Analysis & Evidence</span>
                </div>
                <span className="text-xs font-mono text-purple-400">
                  Estimated Progress: {goalAnalysis.estimatedProgress}%
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <strong className="text-purple-300">Synthesis:</strong> {goalAnalysis.progressSummary}
                </div>
                <div>
                  <strong className="text-purple-300">Journal Evidence Points:</strong>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-purple-200">
                    {goalAnalysis.evidenceFromEntries?.map((ev: string, idx: number) => (
                      <li key={idx}>"{ev}"</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-200">
                  <strong className="text-purple-300">Recommended Micro-Adjustment:</strong>{' '}
                  {goalAnalysis.recommendedAdjustment}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PERSONAL EXPERIMENTS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'experiments' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Personal Behavioral Experiments</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {experiments.map((exp) => (
              <div
                key={exp.id}
                className="p-6 rounded-3xl border border-neutral-800 bg-[#14171A] space-y-4"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-mono text-[10px] font-bold">
                    {exp.dailyCheckIns.length} Check-ins / {exp.durationDays} Days
                  </span>
                  <span className="text-emerald-400 font-bold uppercase text-[10px]">ACTIVE EXPERIMENT</span>
                </div>

                <h3 className="text-base font-bold text-white">{exp.title}</h3>
                <p className="text-xs text-neutral-300 leading-relaxed bg-[#111416] p-3 rounded-2xl border border-neutral-800">
                  <strong>Hypothesis:</strong> {exp.hypothesis}
                </p>

                {/* Daily Logs */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Daily Progress
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {exp.dailyCheckIns.map((log, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-black/40 border border-neutral-800 text-center text-[10px]"
                      >
                        <span className="text-neutral-500 block">Day {idx + 1}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#76B900] mx-auto mt-1" />
                      </div>
                    ))}
                  </div>
                </div>

                {exp.beforeAfterComparison && (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200">
                    <strong>Reflective Outcome:</strong> {exp.beforeAfterComparison.aiObservations}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. YEARLY REVIEW TAB */}
      {/* ========================================================================= */}
      {activeTab === 'yearly_review' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 sm:p-8 rounded-3xl border border-neutral-800 bg-[#14171A] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-white">
                  2026 Year in Review Retrospective
                </h2>
                <p className="text-xs text-neutral-400">
                  Synthesize an overarching retrospective of all 2026 reflections, mood trajectories, and breakthrough moments.
                </p>
              </div>
              <button
                onClick={handleGenerateYearlyReview}
                disabled={isGeneratingYearly}
                className="px-5 py-2.5 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black text-xs font-bold shadow-xs transition-all flex items-center gap-2 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingYearly ? 'Synthesizing Year...' : 'Generate 2026 Review'}</span>
              </button>
            </div>
          </div>

          {yearlyReview && (
            <div className="p-8 rounded-3xl border border-neutral-800 bg-gradient-to-br from-[#14171A] to-[#121815] space-y-6 animate-fadeIn">
              <div className="border-b border-neutral-800 pb-4">
                <span className="text-[10px] uppercase tracking-wider text-[#76B900] font-mono font-bold">
                  Year in Review ({yearlyReview.year})
                </span>
                <h3 className="text-xl font-serif font-bold text-white mt-1">
                  {yearlyReview.personalGrowthSynthesis}
                </h3>
              </div>

              {/* Achievements & Moments */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Biggest Moments & Achievements
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {yearlyReview.achievements?.map((ach, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#111416] border border-neutral-800 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>Achievement</span>
                      </div>
                      <p className="text-neutral-300">{ach}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Lessons & Narrative */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-800">
                <div className="p-5 rounded-2xl bg-[#111416] border border-neutral-800 space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Top Lessons Learned</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-neutral-300">
                    {yearlyReview.biggestLessons?.map((lesson, idx) => (
                      <li key={idx}>{lesson}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-[#111416] border border-neutral-800 space-y-2">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Mood Journey Narrative</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">{yearlyReview.moodJourneyNarrative}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FUTURE MEMORY LETTERS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'letters' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Letters to Your Future Self</h2>
            <button
              onClick={() => setIsLetterModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Write Future Letter</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {letters.map((letItem) => (
              <div
                key={letItem.id}
                className="p-6 rounded-3xl border border-neutral-800 bg-[#14171A] space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="font-mono">Written: {new Date(letItem.createdAt).toLocaleDateString()}</span>
                    <span className="text-amber-400 font-bold">Opens: {letItem.scheduledUnlockDate}</span>
                  </div>
                  <h3 className="text-base font-serif font-bold text-white">{letItem.title}</h3>
                  <p className="text-xs text-neutral-300 italic leading-relaxed font-serif">
                    "{letItem.content}"
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5 text-indigo-400">
                    <Mail className="w-3.5 h-3.5" />
                    Encapsulated Delivery
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TIME CAPSULE TAB */}
      {/* ========================================================================= */}
      {activeTab === 'time_capsule' && (
        <div className="p-8 rounded-3xl border border-neutral-800 bg-[#14171A] space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-lg font-serif font-bold text-white">"What Was I Like Then?"</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Select two points in time to analyze how your mindset, values, and emotional equilibrium evolved.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[#111416] border border-neutral-800 space-y-3">
              <span className="text-xs font-bold text-neutral-400 uppercase">Baseline Mindset (Past)</span>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Earlier reflections showed elevated worry regarding deadlines and technical ambiguity, with frequent mention of fatigue.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111416] border border-[#76B900]/40 space-y-3">
              <span className="text-xs font-bold text-[#76B900] uppercase">Present Mindset</span>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Recent entries demonstrate strong cognitive detachment, daily meditation consistency, and proactive celebration of breakthroughs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* GOAL MODAL */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14171A] border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-white">Create a Growth Goal</h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Goal Title</label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Daily Meditation Routine..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D0E] border border-neutral-800 text-white"
                />
              </div>
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Description</label>
                <textarea
                  value={goalDesc}
                  onChange={(e) => setGoalDesc(e.target.value)}
                  placeholder="Why is this meaningful to you?"
                  rows={3}
                  className="w-full p-3 rounded-xl bg-[#0B0D0E] border border-neutral-800 text-white resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Category</label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D0E] border border-neutral-800 text-white"
                  >
                    <option value="Mindfulness">Mindfulness</option>
                    <option value="Career">Career</option>
                    <option value="Health">Health</option>
                    <option value="Creative">Creative</option>
                    <option value="Relationships">Relationships</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Target Date</label>
                  <input
                    type="date"
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D0E] border border-neutral-800 text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGoal}
                className="px-5 py-2 rounded-xl bg-[#76B900] text-black text-xs font-bold"
              >
                Save Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LETTER MODAL */}
      {isLetterModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14171A] border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-white">Write a Letter to Your Future Self</h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Letter Title</label>
                <input
                  type="text"
                  value={letterTitle}
                  onChange={(e) => setLetterTitle(e.target.value)}
                  placeholder="e.g. Note to myself in 6 months..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D0E] border border-neutral-800 text-white"
                />
              </div>
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Content</label>
                <textarea
                  value={letterContent}
                  onChange={(e) => setLetterContent(e.target.value)}
                  placeholder="Dear Future Me..."
                  rows={5}
                  className="w-full p-3 rounded-xl bg-[#0B0D0E] border border-neutral-800 text-white resize-none"
                />
              </div>
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Delivery Date</label>
                <input
                  type="date"
                  value={letterDate}
                  onChange={(e) => setLetterDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0D0E] border border-neutral-800 text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setIsLetterModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLetter}
                className="px-5 py-2 rounded-xl bg-[#76B900] text-black text-xs font-bold"
              >
                Seal & Save Letter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

