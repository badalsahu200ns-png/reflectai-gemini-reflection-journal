import React, { useState, useEffect } from 'react';
import {
  User,
  Sparkles,
  Save,
  Check,
  Brain,
  Shield,
  Target,
  Compass,
  Heart,
  Quote,
  RefreshCw,
  Bookmark,
  Layers,
  Award
} from 'lucide-react';
import { PersonalProfileData, JournalEntry, AIMemory } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface PersonalProfileStatementProps {
  entries: JournalEntry[];
  memories: AIMemory[];
  onSaveMemory?: (memoryText: string, category?: string) => Promise<void> | void;
}

export const PersonalProfileStatement: React.FC<PersonalProfileStatementProps> = ({
  entries,
  memories,
  onSaveMemory
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PersonalProfileData>({
    userId: user?.uid || '',
    whoIAm: '',
    whatMattersToMe: '',
    whatIEnjoy: '',
    whatIAmLearning: '',
    whatIAmWorkingToward: '',
    whatIWantToImprove: '',
    myValues: '',
    myPrinciples: '',
    importantGoals: '',
    careerInterests: '',
    importantPeople: '',
    importantPlaces: '',
    updatedAt: ''
  });

  const [synthesizedStatement, setSynthesizedStatement] = useState<string>('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRemembered, setIsRemembered] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const loadProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'life_intel', 'profile_statement');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as PersonalProfileData;
          setProfile(data);
          if ((data as any).synthesizedStatement) {
            setSynthesizedStatement((data as any).synthesizedStatement);
          }
        } else {
          const local = localStorage.getItem(`reflectai_profile_${user.uid}`);
          if (local) {
            const parsed = JSON.parse(local);
            setProfile(parsed);
            if (parsed.synthesizedStatement) {
              setSynthesizedStatement(parsed.synthesizedStatement);
            }
          }
        }
      } catch (err) {
        const local = localStorage.getItem(`reflectai_profile_${user.uid}`);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            setProfile(parsed);
            if (parsed.synthesizedStatement) setSynthesizedStatement(parsed.synthesizedStatement);
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

  const handleFieldChange = (field: keyof PersonalProfileData, val: string) => {
    setProfile((prev) => ({ ...prev, [field]: val }));
  };

  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    setIsSaving(true);
    const updated = {
      ...profile,
      userId: user.uid,
      updatedAt: new Date().toISOString(),
      synthesizedStatement
    };

    try {
      localStorage.setItem(`reflectai_profile_${user.uid}`, JSON.stringify(updated));
      const docRef = doc(db, 'users', user.uid, 'life_intel', 'profile_statement');
      await setDoc(docRef, updated, { merge: true });
      showToast('Personal Profile saved securely.');
    } catch (err) {
      showToast('Saved locally.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSynthesizeStatement = async () => {
    setIsSynthesizing(true);
    try {
      const promptText = `Who I Am: ${profile.whoIAm}
What Matters To Me: ${profile.whatMattersToMe}
What I Enjoy: ${profile.whatIEnjoy}
What I Am Learning: ${profile.whatIAmLearning}
Working Toward: ${profile.whatIAmWorkingToward}
What I Want to Improve: ${profile.whatIWantToImprove}
My Core Values & Principles: ${profile.myValues} | ${profile.myPrinciples}
Career Aspirations: ${profile.careerInterests}`;

      const res = await fetch('/api/ai/life-intelligence/reflect-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionKey: 'aboutMe',
          userText: promptText,
          entries,
          memories,
          personaId: 'growth_strategist'
        })
      });

      const data = await res.json();
      const statement = data.whatINotice || data.whatYourJournalSuggests || data.suggestedMemory;
      setSynthesizedStatement(statement);

      if (user?.uid) {
        const updated = { ...profile, synthesizedStatement: statement, updatedAt: new Date().toISOString() };
        localStorage.setItem(`reflectai_profile_${user.uid}`, JSON.stringify(updated));
        try {
          const docRef = doc(db, 'users', user.uid, 'life_intel', 'profile_statement');
          await setDoc(docRef, updated, { merge: true });
        } catch {}
      }

      showToast('Identity statement synthesized with Gemini.');
    } catch (err) {
      showToast('Could not synthesize statement.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleRememberStatement = async () => {
    if (!synthesizedStatement) return;
    try {
      if (onSaveMemory) {
        await onSaveMemory(synthesizedStatement, 'Mindset');
      }
      setIsRemembered(true);
      showToast('Identity statement saved to AI Memory Vault.');
      setTimeout(() => setIsRemembered(false), 3000);
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

      {/* Header Banner */}
      <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-6 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#00BCD4]/10 text-[#00BCD4] border border-[#00BCD4]/20">
                Self-Authored Profile
              </span>
              <span className="text-xs text-neutral-500 font-mono">This is Me</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              My Personal Statement & Identity Profile
            </h2>
            <p className="text-sm text-neutral-400 max-w-2xl">
              Write your own story, define your non-negotiable principles, and generate an authentic synthesis of who you are and where you are headed.
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
              onClick={handleSynthesizeStatement}
              disabled={isSynthesizing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black text-xs font-bold shadow-[0_0_15px_rgba(118,185,0,0.2)] transition-all active:scale-95 disabled:opacity-50"
            >
              {isSynthesizing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-black" />
                  <span>Synthesize "This is Me"</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Synthesized "This is Me" Card */}
      {synthesizedStatement && (
        <div className="bg-[#16191C] border border-[#76B900]/40 rounded-2xl p-6 sm:p-8 space-y-4 shadow-[0_0_20px_rgba(118,185,0,0.08)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#76B900] font-mono">
              <Sparkles className="w-4 h-4" />
              <span>Synthesized Personal Statement</span>
            </div>
            <button
              onClick={handleRememberStatement}
              disabled={isRemembered}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isRemembered ? 'bg-[#76B900] text-black' : 'bg-[#76B900]/20 text-[#76B900] hover:bg-[#76B900]/30'
              }`}
            >
              {isRemembered ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isRemembered ? 'Saved to Vault' : 'Remember This'}</span>
            </button>
          </div>
          <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-serif italic">
            "{synthesizedStatement}"
          </p>
        </div>
      )}

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Who I Am */}
        <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-5 space-y-2">
          <label className="text-xs font-bold text-neutral-200 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-[#76B900]" />
            <span>Who I Am</span>
          </label>
          <p className="text-[11px] text-neutral-500">Brief summary of your identity, personality, and background.</p>
          <textarea
            value={profile.whoIAm}
            onChange={(e) => handleFieldChange('whoIAm', e.target.value)}
            placeholder="e.g. A dedicated learner, thoughtful thinker, and creative problem solver who values quiet deep work..."
            rows={3}
            className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#76B900] rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 resize-none outline-none leading-relaxed font-sans"
          />
        </div>

        {/* What Matters To Me */}
        <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-5 space-y-2">
          <label className="text-xs font-bold text-neutral-200 flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-[#E91E63]" />
            <span>What Matters to Me</span>
          </label>
          <p className="text-[11px] text-neutral-500">Your non-negotiables, family, health, integrity, creative freedom.</p>
          <textarea
            value={profile.whatMattersToMe}
            onChange={(e) => handleFieldChange('whatMattersToMe', e.target.value)}
            placeholder="e.g. Mental peace, authentic friendships, continuous intellectual curiosity, and building meaningful tools..."
            rows={3}
            className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#76B900] rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 resize-none outline-none leading-relaxed font-sans"
          />
        </div>

        {/* Core Values & Non-Negotiables */}
        <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-5 space-y-2">
          <label className="text-xs font-bold text-neutral-200 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#00BCD4]" />
            <span>My Values & Principles</span>
          </label>
          <p className="text-[11px] text-neutral-500">The guiding rules you hold yourself accountable to.</p>
          <textarea
            value={profile.myValues}
            onChange={(e) => handleFieldChange('myValues', e.target.value)}
            placeholder="e.g. 1. Clarity over rush. 2. Kindness before reaction. 3. Consistency compounds..."
            rows={3}
            className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#76B900] rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 resize-none outline-none leading-relaxed font-sans"
          />
        </div>

        {/* What I Am Learning & Working Toward */}
        <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-5 space-y-2">
          <label className="text-xs font-bold text-neutral-200 flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-[#F4B400]" />
            <span>What I Am Learning & Working Toward</span>
          </label>
          <p className="text-[11px] text-neutral-500">Skills you are currently building and milestones on your horizon.</p>
          <textarea
            value={profile.whatIAmLearning}
            onChange={(e) => handleFieldChange('whatIAmLearning', e.target.value)}
            placeholder="e.g. Mastering full-stack architecture, improving sleep rhythm, exploring AI systems engineering..."
            rows={3}
            className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#76B900] rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 resize-none outline-none leading-relaxed font-sans"
          />
        </div>

        {/* What I Want to Improve (Growth Edges) */}
        <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-5 space-y-2">
          <label className="text-xs font-bold text-neutral-200 flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-[#9C27B0]" />
            <span>What I Want to Improve</span>
          </label>
          <p className="text-[11px] text-neutral-500">Constructive growth edges, habits to refine, or cognitive traps to ease.</p>
          <textarea
            value={profile.whatIWantToImprove}
            onChange={(e) => handleFieldChange('whatIWantToImprove', e.target.value)}
            placeholder="e.g. Overcoming perfectionist hesitation, setting clearer boundaries on late-night work..."
            rows={3}
            className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#76B900] rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 resize-none outline-none leading-relaxed font-sans"
          />
        </div>

        {/* Career & Vocational Interests */}
        <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-5 space-y-2">
          <label className="text-xs font-bold text-neutral-200 flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-[#76B900]" />
            <span>Career & Project Interests</span>
          </label>
          <p className="text-[11px] text-neutral-500">Domains, industries, or creative crafts that captivate your curiosity.</p>
          <textarea
            value={profile.careerInterests}
            onChange={(e) => handleFieldChange('careerInterests', e.target.value)}
            placeholder="e.g. AI Product Design, Independent Research, Environmental Tech, Creative Writing..."
            rows={3}
            className="w-full bg-[#0B0D0E] border border-[#1F2428] focus:border-[#76B900] rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 resize-none outline-none leading-relaxed font-sans"
          />
        </div>
      </div>
    </div>
  );
};
