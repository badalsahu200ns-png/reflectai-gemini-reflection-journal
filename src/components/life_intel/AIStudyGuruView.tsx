import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Baby,
  Calendar,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  Layers,
  Award,
  Clock
} from 'lucide-react';
import { StudyGuruMode, StudyGuruResult, JournalEntry } from '../../types';

interface AIStudyGuruViewProps {
  entries: JournalEntry[];
}

export const AIStudyGuruView: React.FC<AIStudyGuruViewProps> = ({ entries }) => {
  const [topic, setTopic] = useState('Dynamic Programming & Memoization in Computer Science');
  const [notesOrContext, setNotesOrContext] = useState('');
  const [selectedMode, setSelectedMode] = useState<StudyGuruMode>('concept_breakdown');
  const [targetExamOrLevel, setTargetExamOrLevel] = useState('University / Technical Interview');
  const [result, setResult] = useState<StudyGuruResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<number, number>>({});
  const [revealedQuiz, setRevealedQuiz] = useState<Record<number, boolean>>({});
  const [revealedFlashcards, setRevealedFlashcards] = useState<Record<number, boolean>>({});

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setUserQuizAnswers({});
    setRevealedQuiz({});
    setRevealedFlashcards({});

    try {
      const res = await fetch('/api/ai/study-guru/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          notesOrContext,
          mode: selectedMode,
          targetExamOrLevel
        })
      });

      if (!res.ok) throw new Error('Generation failed');

      const data: StudyGuruResult = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Study guru error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const MODES: { mode: StudyGuruMode; label: string; icon: any; desc: string }[] = [
    { mode: 'concept_breakdown', label: 'Concept Deep Dive', icon: BookOpen, desc: 'Intuitive foundation + technical rigor' },
    { mode: 'explain_like_12', label: "Explain Like I'm 12", icon: Baby, desc: 'Vivid real-world analogies & zero jargon' },
    { mode: 'study_plan', label: '5-7 Day Study Plan', icon: Calendar, desc: 'Day-by-day active recall & revision schedule' },
    { mode: 'quiz_flashcards', label: 'Practice Quiz & Flashcards', icon: HelpCircle, desc: 'Interactive self-testing & instant answer feedback' },
    { mode: 'common_mistakes', label: 'Common Mistakes', icon: AlertTriangle, desc: 'Top misconceptions and how to avoid them' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-6 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#00BCD4]/10 text-[#00BCD4] border border-[#00BCD4]/20">
                Cognitive Mastery Engine
              </span>
              <span className="text-xs text-neutral-500 font-mono">Any Subject / Level</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              AI Study Guru
            </h2>
            <p className="text-sm text-neutral-400 max-w-2xl">
              Break down complex concepts, test your comprehension with interactive quizzes, and construct active-recall study schedules.
            </p>
          </div>
        </div>
      </div>

      {/* Input Control Center */}
      <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">Topic or Subject Name</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Quantum Computing, Photosynthesis, Bayes Theorem..."
              className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#76B900] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">Target Level / Exam</label>
            <input
              type="text"
              value={targetExamOrLevel}
              onChange={(e) => setTargetExamOrLevel(e.target.value)}
              placeholder="e.g. Class 12 Boards, High School, GRE, Technical Interview..."
              className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#76B900] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-neutral-300">Optional Notes or Specific Questions</label>
          <textarea
            value={notesOrContext}
            onChange={(e) => setNotesOrContext(e.target.value)}
            placeholder="Paste syllabus snippets, difficult homework problems, or specific areas you want to clarify..."
            rows={2}
            className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#76B900] rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 resize-none outline-none leading-relaxed"
          />
        </div>

        {/* Mode Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 font-mono uppercase">Select Tutoring Mode</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {MODES.map((m) => {
              const Icon = m.icon;
              const isSel = selectedMode === m.mode;
              return (
                <button
                  key={m.mode}
                  onClick={() => setSelectedMode(m.mode)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSel
                      ? 'bg-[#181B1E] border-[#76B900] text-white ring-1 ring-[#76B900]/50'
                      : 'bg-[#0B0D0E] border-[#1F2428] text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${isSel ? 'text-[#76B900]' : 'text-neutral-500'}`} />
                    <span className="text-xs font-bold line-clamp-1">{m.label}</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 line-clamp-2">{m.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#1F2428]">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black text-xs font-bold shadow-[0_0_15px_rgba(118,185,0,0.2)] transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Lesson...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 fill-black" />
                <span>Launch Study Guru</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Result Container */}
      {result && (
        <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1F2428]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#76B900]/10 text-[#76B900] border border-[#76B900]/20">
                  {result.mode}
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">{result.topic}</h3>
              </div>
            </div>
            <span className="text-[11px] text-neutral-500 font-mono">
              Generated {new Date(result.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* CONCEPT BREAKDOWN */}
          {result.conceptExplanation && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0B0D0E] border border-[#1F2428] space-y-2">
                <h4 className="text-xs font-bold text-[#76B900] uppercase tracking-wider font-mono">
                  Intuitive Foundation & Summary
                </h4>
                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                  {result.conceptExplanation.summary}
                </p>
              </div>

              {result.conceptExplanation.intuitiveAnalogy && (
                <div className="p-4 rounded-xl bg-[#16191C] border border-[#00BCD4]/30 space-y-1.5">
                  <h4 className="text-xs font-bold text-[#00BCD4] uppercase tracking-wider font-mono">
                    Real-World Analogy
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-300 italic font-serif leading-relaxed">
                    "{result.conceptExplanation.intuitiveAnalogy}"
                  </p>
                </div>
              )}

              {result.conceptExplanation.keyPrinciples && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
                    Core Principles & Mechanism
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.conceptExplanation.keyPrinciples.map((kp, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#0B0D0E] border border-[#1F2428] flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#76B900]/20 text-[#76B900] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-neutral-300">{kp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STUDY PLAN */}
          {result.studyPlanDays && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Day-by-Day Mastery Schedule
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.studyPlanDays.map((day) => (
                  <div key={day.dayNumber} className="p-4 rounded-xl bg-[#0B0D0E] border border-[#1F2428] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#76B900] font-mono">Day {day.dayNumber}</span>
                      <span className="text-neutral-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {day.timeCommitmentMinutes || 45} mins
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-white">{day.focusArea}</h5>
                    <ul className="text-xs text-neutral-400 space-y-1 list-disc list-inside">
                      {day.activities.map((act, aIdx) => (
                        <li key={aIdx}>{act}</li>
                      ))}
                    </ul>
                    {day.activeRecallPrompt && (
                      <div className="pt-1 text-[11px] text-[#00BCD4] italic">
                        Recall Check: {day.activeRecallPrompt}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRACTICE QUIZ */}
          {result.quizQuestions && result.quizQuestions.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Interactive Practice Quiz ({result.quizQuestions.length} Questions)
              </h4>
              <div className="space-y-4">
                {result.quizQuestions.map((q, qIdx) => {
                  const selectedOpt = userQuizAnswers[qIdx];
                  const isRevealed = revealedQuiz[qIdx];
                  return (
                    <div key={q.id || qIdx} className="p-4 rounded-xl bg-[#0B0D0E] border border-[#1F2428] space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs sm:text-sm font-semibold text-white">
                          <span className="text-[#76B900] font-bold mr-2">Q{qIdx + 1}.</span>
                          {q.question}
                        </h5>
                        <button
                          onClick={() => setRevealedQuiz((prev) => ({ ...prev, [qIdx]: !prev[qIdx] }))}
                          className="text-[11px] font-mono text-neutral-400 hover:text-white px-2 py-1 rounded bg-[#181B1E] shrink-0 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{isRevealed ? 'Hide' : 'Reveal'}</span>
                        </button>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isPicked = selectedOpt === optIdx;
                          const isCorrect = optIdx === q.correctOptionIndex;
                          let btnStyle = 'bg-[#181B1E] border-[#1F2428] text-neutral-300 hover:border-neutral-600';

                          if (isRevealed) {
                            if (isCorrect) btnStyle = 'bg-[#76B900]/20 border-[#76B900] text-[#76B900] font-bold';
                            else if (isPicked && !isCorrect) btnStyle = 'bg-[#E91E63]/20 border-[#E91E63] text-[#E91E63]';
                          } else if (isPicked) {
                            btnStyle = 'bg-[#1F2428] border-neutral-400 text-white';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => setUserQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                              className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isRevealed && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-[#76B900]" />}
                              {isRevealed && isPicked && !isCorrect && <XCircle className="w-3.5 h-3.5 text-[#E91E63]" />}
                            </button>
                          );
                        })}
                      </div>

                      {isRevealed && q.explanation && (
                        <div className="p-3 rounded-lg bg-[#16191C] border border-[#1F2428] text-xs text-neutral-300 leading-relaxed">
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FLASHCARDS */}
          {result.flashcards && result.flashcards.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Active Recall Flashcards ({result.flashcards.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.flashcards.map((fc, fIdx) => {
                  const isFlipped = revealedFlashcards[fIdx];
                  return (
                    <div
                      key={fc.id || fIdx}
                      onClick={() => setRevealedFlashcards((prev) => ({ ...prev, [fIdx]: !prev[fIdx] }))}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2 min-h-[120px] flex flex-col justify-between ${
                        isFlipped ? 'bg-[#181B1E] border-[#76B900]' : 'bg-[#0B0D0E] border-[#1F2428] hover:border-neutral-700'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-mono uppercase text-neutral-500">
                          {isFlipped ? 'Answer / Concept' : 'Flashcard Question'}
                        </span>
                        <p className="text-xs font-medium text-white pt-1">
                          {isFlipped ? fc.back : fc.front}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500 flex items-center justify-end gap-1">
                        <Eye className="w-3 h-3" />
                        <span>Click to flip</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* COMMON MISTAKES */}
          {result.commonMistakes && result.commonMistakes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#E91E63] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Common Misconceptions & Pitfalls</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.commonMistakes.map((cm, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#0B0D0E] border border-[#1F2428] space-y-2">
                    <div className="text-xs font-bold text-[#E91E63]">{cm.mistake}</div>
                    <p className="text-xs text-neutral-400"><strong>Why it occurs:</strong> {cm.whyItHappens}</p>
                    <div className="p-2 rounded bg-[#16191C] text-xs text-[#76B900]">
                      <strong>Correct mental model:</strong> {cm.howToAvoid}
                    </div>
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
