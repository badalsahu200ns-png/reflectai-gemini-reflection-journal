import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  Save,
  BookOpen,
  Compass,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Award,
  Layers,
  Briefcase,
  Check
} from 'lucide-react';
import { StudentProfileData, After10thGuidanceResult, JournalEntry } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface StudentIntelligenceViewProps {
  entries: JournalEntry[];
}

export const StudentIntelligenceView: React.FC<StudentIntelligenceViewProps> = ({ entries }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfileData>({
    userId: user?.uid || '',
    currentClass: 'Class 10',
    subjects: 'Mathematics, Science, English, Social Studies, Computer Science',
    strongSubjects: 'Mathematics, Computer Science',
    difficultSubjects: 'Chemistry, History',
    interests: 'Building software, exploring puzzles, reading science fiction',
    skills: 'Logical thinking, basic coding, fast reading',
    hobbies: 'Chess, gaming, cycling',
    careerInterests: 'Software Engineering, Data Science, AI Research',
    preferredWorkEnvironment: 'Creative, technology-focused, independent with team discussions',
    financialPriorities: 'Affordable education path with strong long-term career growth',
    locationPreference: 'Flexible, open to hybrid/remote',
    educationPreferences: 'College degree or integrated technical pathway',
    updatedAt: ''
  });

  const [guidanceResult, setGuidanceResult] = useState<After10thGuidanceResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    const loadProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'life_intel', 'student_profile');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data.profile || profile);
          if (data.guidanceResult) setGuidanceResult(data.guidanceResult);
        } else {
          const local = localStorage.getItem(`reflectai_student_${user.uid}`);
          if (local) {
            const parsed = JSON.parse(local);
            if (parsed.profile) setProfile(parsed.profile);
            if (parsed.guidanceResult) setGuidanceResult(parsed.guidanceResult);
          }
        }
      } catch {
        const local = localStorage.getItem(`reflectai_student_${user.uid}`);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (parsed.profile) setProfile(parsed.profile);
            if (parsed.guidanceResult) setGuidanceResult(parsed.guidanceResult);
          } catch {}
        }
      }
    };
    loadProfile();
  }, [user?.uid]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    setIsSaving(true);
    const updated = {
      profile: { ...profile, userId: user.uid, updatedAt: new Date().toISOString() },
      guidanceResult
    };

    try {
      localStorage.setItem(`reflectai_student_${user.uid}`, JSON.stringify(updated));
      const docRef = doc(db, 'users', user.uid, 'life_intel', 'student_profile');
      await setDoc(docRef, updated, { merge: true });
      showToast('Student profile saved securely.');
    } catch {
      showToast('Saved locally.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateGuidance = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/student-intelligence/after-10th-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentProfile: profile,
          entries
        })
      });

      if (!res.ok) throw new Error('Guidance failed');

      const data = await res.json();
      setGuidanceResult(data);

      if (user?.uid) {
        const updated = {
          profile: { ...profile, userId: user.uid, updatedAt: new Date().toISOString() },
          guidanceResult: data
        };
        localStorage.setItem(`reflectai_student_${user.uid}`, JSON.stringify(updated));
        try {
          const docRef = doc(db, 'users', user.uid, 'life_intel', 'student_profile');
          await setDoc(docRef, updated, { merge: true });
        } catch {}
      }

      showToast('Educational guidance report generated.');
    } catch {
      showToast('Could not generate student guidance.');
    } finally {
      setIsGenerating(false);
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

      {/* Header Banner */}
      <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-6 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#76B900]/10 text-[#76B900] border border-[#76B900]/20">
                Education & Stream Guidance
              </span>
              <span className="text-xs text-neutral-500 font-mono">Classes 10, 11, 12 & Beyond</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Student Intelligence & Pathway Explorer
            </h2>
            <p className="text-sm text-neutral-400 max-w-2xl">
              Receive balanced, objective education guidance after Class 10/12. Compare stream choices, skill prerequisites, career trajectories, and realistic tradeoffs.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181B1E] hover:bg-[#22272B] text-neutral-200 hover:text-white border border-[#1F2428] text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
            <button
              onClick={handleGenerateGuidance}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black text-xs font-bold shadow-[0_0_15px_rgba(118,185,0,0.2)] transition-all active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-black" />
                  <span>Generate Stream Guidance</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Student Profile Input Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Academic Profile */}
        <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
            <BookOpen className="w-4 h-4 text-[#76B900]" />
            <span>Academic Baseline</span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400">Current Academic Level</label>
            <input
              type="text"
              value={profile.currentClass}
              onChange={(e) => setProfile({ ...profile, currentClass: e.target.value })}
              className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#76B900] rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400">Strongest Subjects</label>
            <input
              type="text"
              value={profile.strongSubjects}
              onChange={(e) => setProfile({ ...profile, strongSubjects: e.target.value })}
              className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#76B900] rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400">Challenging / Difficult Subjects</label>
            <input
              type="text"
              value={profile.difficultSubjects}
              onChange={(e) => setProfile({ ...profile, difficultSubjects: e.target.value })}
              className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#76B900] rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>
        </div>

        {/* Interests & Strengths */}
        <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
            <Award className="w-4 h-4 text-[#00BCD4]" />
            <span>Interests & Aptitudes</span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400">Core Interests & Hobbies</label>
            <input
              type="text"
              value={profile.interests}
              onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
              className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#00BCD4] rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400">Key Skills & Strengths</label>
            <input
              type="text"
              value={profile.skills}
              onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
              className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#00BCD4] rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400">Dream Career Curiosities</label>
            <input
              type="text"
              value={profile.careerInterests}
              onChange={(e) => setProfile({ ...profile, careerInterests: e.target.value })}
              className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#00BCD4] rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>
        </div>

        {/* Priorities & Logistics */}
        <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
            <Compass className="w-4 h-4 text-[#F4B400]" />
            <span>Priorities & Preferences</span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400">Financial Considerations</label>
            <input
              type="text"
              value={profile.financialPriorities}
              onChange={(e) => setProfile({ ...profile, financialPriorities: e.target.value })}
              className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#F4B400] rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400">Preferred Work Style</label>
            <input
              type="text"
              value={profile.preferredWorkEnvironment}
              onChange={(e) => setProfile({ ...profile, preferredWorkEnvironment: e.target.value })}
              className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#F4B400] rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400">Education Path Type</label>
            <input
              type="text"
              value={profile.educationPreferences}
              onChange={(e) => setProfile({ ...profile, educationPreferences: e.target.value })}
              className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#F4B400] rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* Guidance Output */}
      {guidanceResult && (
        <div className="space-y-5">
          {/* Executive Overview */}
          <div className="p-6 rounded-2xl bg-[#16191C] border border-[#76B900]/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#76B900] font-mono">
              <Sparkles className="w-4 h-4" />
              <span>Student Pathway Executive Summary</span>
            </div>
            <p className="text-sm text-neutral-200 leading-relaxed font-serif">
              {guidanceResult.summary}
            </p>
          </div>

          {/* Stream Options Cards */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#76B900]" />
              <span>Recommended Educational Pathways</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {guidanceResult.recommendedOptions.map((opt, idx) => (
                <div
                  key={idx}
                  className="bg-[#121517] border border-[#1F2428] rounded-2xl p-6 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-base font-bold text-white tracking-tight">
                        {opt.stream}
                      </h4>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#76B900]/10 text-[#76B900] border border-[#76B900]/20 shrink-0">
                        Pathway {idx + 1}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {opt.whyFit}
                    </p>

                    {/* Skills Required */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold text-neutral-400 font-mono uppercase">
                        Skills Required
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {opt.skillsRequired.map((sk, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-md bg-[#181B1E] border border-[#1F2428] text-[11px] text-neutral-300"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 2-5 Year Education Roadmap */}
                    <div className="p-3 rounded-xl bg-[#0B0D0E] border border-[#1F2428] space-y-1">
                      <div className="text-[11px] font-bold text-[#00BCD4] font-mono flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" />
                        <span>Education Roadmap (Next 2-5 Years)</span>
                      </div>
                      <p className="text-xs text-neutral-300">{opt.educationPath}</p>
                    </div>

                    {/* Possible Careers */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-neutral-400 font-mono uppercase">
                        Possible Career Paths
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {opt.possibleCareers.map((c, cIdx) => (
                          <span
                            key={cIdx}
                            className="px-2 py-0.5 rounded-md bg-[#76B900]/10 text-[#76B900] border border-[#76B900]/20 text-[11px] font-medium"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Advantages vs Tradeoffs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-[#16191C] border border-[#1F2428] space-y-1">
                        <span className="text-[11px] font-bold text-[#76B900] font-mono uppercase">Advantages</span>
                        <ul className="text-xs text-neutral-400 space-y-1 list-disc list-inside">
                          {opt.advantages.map((adv, aIdx) => (
                            <li key={aIdx}>{adv}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 rounded-xl bg-[#16191C] border border-[#1F2428] space-y-1">
                        <span className="text-[11px] font-bold text-[#E91E63] font-mono uppercase">Tradeoffs & Demands</span>
                        <ul className="text-xs text-neutral-400 space-y-1 list-disc list-inside">
                          {opt.tradeoffs.map((tr, tIdx) => (
                            <li key={tIdx}>{tr}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* What to Explore Next */}
                  <div className="pt-3 border-t border-[#1F2428] flex items-center gap-2 text-xs text-neutral-300">
                    <Compass className="w-3.5 h-3.5 text-[#F4B400] shrink-0" />
                    <span><strong>Next Step to Test:</strong> {opt.whatToExploreNext}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Objective Disclaimer */}
          <div className="p-4 rounded-xl bg-[#121517] border border-[#1F2428] flex items-start gap-2.5 text-xs text-neutral-400">
            <AlertCircle className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
            <p>{guidanceResult.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
};
