import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Sparkles,
  Search,
  ArrowRight,
  TrendingUp,
  Layers,
  CheckCircle2,
  Clock,
  Briefcase,
  Globe,
  Award,
  RefreshCw,
  Plus,
  HelpCircle,
  AlertCircle,
  ChevronRight,
  Bookmark,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
  GraduationCap,
  Hammer,
  FileCheck,
  Scale,
  ExternalLink,
  ChevronDown,
  Building,
  Languages,
  Milestone,
  Lightbulb,
  Share2,
  Check,
  Zap,
  MapPin,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import {
  CountryData,
  CountryEducationStage,
  OccupationTaxonomyCategory,
  OccupationItem,
  GlobalCareerPathway,
  CareerEntryRoute,
  RegulatedProfessionDetails,
  InternationalRecognitionResult,
  CountryComparisonResult,
  CountryComparisonItem,
  UserSavedCareerRoadmap,
  JournalEntry,
  AIMemory
} from '../../types';
import {
  GLOBAL_COUNTRIES,
  GLOBAL_CAREER_CATEGORIES,
  POPULAR_OCCUPATIONS,
  getCountryByCode,
  getOccupationsByCategory
} from '../../data/globalCareerData';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface CareerCompassViewProps {
  entries: JournalEntry[];
  memories: AIMemory[];
  onSaveMemory?: (memoryText: string, category?: string) => Promise<void> | void;
}

type CareerTabMode = 'pathway' | 'after10' | 'international' | 'compare' | 'my_roadmaps';

export const CareerCompassView: React.FC<CareerCompassViewProps> = ({
  entries,
  memories,
  onSaveMemory
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<CareerTabMode>('pathway');

  // Country & Education Selection State
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('IN');
  const [countrySearchQuery, setCountrySearchQuery] = useState<string>('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState<boolean>(false);
  const [selectedEducationStageId, setSelectedEducationStageId] = useState<string>('in_class_12');

  // Career Selection State
  const [selectedCategory, setSelectedCategory] = useState<string>('tech_it');
  const [selectedOccupationTitle, setSelectedOccupationTitle] = useState<string>('Software Engineer / Full Stack Developer');
  const [customOccupationInput, setCustomOccupationInput] = useState<string>('');
  const [careerSearchQuery, setCareerSearchQuery] = useState<string>('');

  // User input context (from profile/journal)
  const [userSkillsInput, setUserSkillsInput] = useState<string>('TypeScript, React, Python, UI Design, Problem Solving');
  const [userInterestsInput, setUserInterestsInput] = useState<string>('Building software, AI systems, automation, user experiences');

  // Pathway Result State
  const [globalPathway, setGlobalPathway] = useState<GlobalCareerPathway | null>(null);
  const [activeRouteId, setActiveRouteId] = useState<string>('university');
  const [isGeneratingPathway, setIsGeneratingPathway] = useState<boolean>(false);

  // After 10th Guidance State
  const [after10GradeTarget, setAfter10GradeTarget] = useState<'academic' | 'vocational' | 'diploma' | 'all'>('all');

  // International Recognition State
  const [intlFromCountry, setIntlFromCountry] = useState<string>('IN');
  const [intlToCountry, setIntlToCountry] = useState<string>('DE');
  const [intlProfession, setIntlProfession] = useState<string>('Software Engineer / Full Stack Developer');
  const [intlResult, setIntlResult] = useState<InternationalRecognitionResult | null>(null);
  const [isGeneratingIntl, setIsGeneratingIntl] = useState<boolean>(false);

  // Country Comparison State
  const [compareCountries, setCompareCountries] = useState<string[]>(['IN', 'US', 'DE', 'GB']);
  const [compareOccupation, setCompareOccupation] = useState<string>('Software Engineer');
  const [comparisonResult, setComparisonResult] = useState<CountryComparisonResult | null>(null);
  const [isGeneratingCompare, setIsGeneratingCompare] = useState<boolean>(false);

  // Saved Roadmaps State
  const [savedRoadmaps, setSavedRoadmaps] = useState<UserSavedCareerRoadmap[]>([]);
  const [activeSavedRoadmap, setActiveSavedRoadmap] = useState<UserSavedCareerRoadmap | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Derive current country
  const currentCountry = useMemo<CountryData>(() => {
    return getCountryByCode(selectedCountryCode) || GLOBAL_COUNTRIES[0];
  }, [selectedCountryCode]);

  // Filtered countries for dropdown
  const filteredCountries = useMemo(() => {
    if (!countrySearchQuery.trim()) return GLOBAL_COUNTRIES;
    const q = countrySearchQuery.toLowerCase();
    return GLOBAL_COUNTRIES.filter(
      (c) =>
        c.countryName.toLowerCase().includes(q) ||
        c.countryCode.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
    );
  }, [countrySearchQuery]);

  // Filtered occupations
  const filteredOccupations = useMemo(() => {
    let list = POPULAR_OCCUPATIONS;
    if (selectedCategory !== 'all') {
      list = list.filter((o) => o.category === selectedCategory);
    }
    if (careerSearchQuery.trim()) {
      const q = careerSearchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.defaultSkills.some((s) => s.toLowerCase().includes(q)) ||
          o.briefDescription.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedCategory, careerSearchQuery]);

  // Auto-update education stage when country changes
  useEffect(() => {
    if (currentCountry.educationStages.length > 0) {
      const exists = currentCountry.educationStages.some((s) => s.id === selectedEducationStageId);
      if (!exists) {
        setSelectedEducationStageId(currentCountry.educationStages[0].id);
      }
    }
  }, [currentCountry, selectedEducationStageId]);

  // Load user saved roadmaps and data from Firestore / LocalStorage
  useEffect(() => {
    if (!user?.uid) return;
    const loadCareerData = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'life_intel', 'career_data');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const d = snap.data();
          if (d.globalPathway) setGlobalPathway(d.globalPathway);
          if (d.savedRoadmaps && Array.isArray(d.savedRoadmaps)) {
            setSavedRoadmaps(d.savedRoadmaps);
            if (d.savedRoadmaps.length > 0) setActiveSavedRoadmap(d.savedRoadmaps[0]);
          }
          if (d.intlResult) setIntlResult(d.intlResult);
          if (d.comparisonResult) setComparisonResult(d.comparisonResult);
        } else {
          const local = localStorage.getItem(`reflectai_career_global_${user.uid}`);
          if (local) {
            const parsed = JSON.parse(local);
            if (parsed.globalPathway) setGlobalPathway(parsed.globalPathway);
            if (parsed.savedRoadmaps) {
              setSavedRoadmaps(parsed.savedRoadmaps);
              if (parsed.savedRoadmaps.length > 0) setActiveSavedRoadmap(parsed.savedRoadmaps[0]);
            }
            if (parsed.intlResult) setIntlResult(parsed.intlResult);
            if (parsed.comparisonResult) setComparisonResult(parsed.comparisonResult);
          }
        }
      } catch (e) {
        console.warn('Could not load career data:', e);
      }
    };
    loadCareerData();
  }, [user?.uid]);

  // Helper to persist career data
  const persistCareerData = async (dataToMerge: any) => {
    if (!user?.uid) return;
    try {
      const existing = localStorage.getItem(`reflectai_career_global_${user.uid}`);
      const merged = { ...(existing ? JSON.parse(existing) : {}), ...dataToMerge, updatedAt: new Date().toISOString() };
      localStorage.setItem(`reflectai_career_global_${user.uid}`, JSON.stringify(merged));
      
      const docRef = doc(db, 'users', user.uid, 'life_intel', 'career_data');
      await setDoc(docRef, merged, { merge: true });
    } catch (e) {
      console.warn('Error persisting career data:', e);
    }
  };

  // Generate Global Pathway Handler
  const handleGeneratePathway = async (forcedOccupation?: string) => {
    const occupationToUse = forcedOccupation || (customOccupationInput.trim() || selectedOccupationTitle);
    if (!occupationToUse) {
      showToast('Please select or type an occupation.');
      return;
    }

    const stageObj = currentCountry.educationStages.find((s) => s.id === selectedEducationStageId);
    const stageLabel = stageObj ? stageObj.label : 'Secondary School';

    setIsGeneratingPathway(true);
    try {
      const res = await fetch('/api/ai/career/global-pathway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: currentCountry.countryCode,
          countryName: currentCountry.countryName,
          educationFramework: currentCountry.educationFrameworkName,
          occupation: occupationToUse,
          occupationCategory: selectedCategory,
          currentEducationId: selectedEducationStageId,
          currentEducationLabel: stageLabel,
          userSkills: userSkillsInput,
          userInterests: userInterestsInput
        })
      });

      if (!res.ok) throw new Error('Generation failed');

      const data: GlobalCareerPathway = await res.json();
      setGlobalPathway(data);
      if (data.entryRoutes && data.entryRoutes.length > 0) {
        setActiveRouteId(data.entryRoutes[0].id);
      }

      await persistCareerData({ globalPathway: data });
      showToast(`✨ Generated verified pathway for ${data.occupation} in ${data.countryName}!`);
    } catch (err: any) {
      console.error('Error generating pathway:', err);
      showToast('Could not generate pathway. Please try again.');
    } finally {
      setIsGeneratingPathway(false);
    }
  };

  // Generate International Recognition Assessment
  const handleGenerateIntlRecognition = async () => {
    const fromC = getCountryByCode(intlFromCountry) || currentCountry;
    const toC = getCountryByCode(intlToCountry) || GLOBAL_COUNTRIES[1];

    setIsGeneratingIntl(true);
    try {
      const res = await fetch('/api/ai/career/international-recognition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromCountry: fromC.countryName,
          fromCountryCode: fromC.countryCode,
          toCountry: toC.countryName,
          toCountryCode: toC.countryCode,
          qualificationOrProfession: intlProfession
        })
      });

      if (!res.ok) throw new Error('Recognition eval failed');

      const data: InternationalRecognitionResult = await res.json();
      setIntlResult({
        ...data,
        fromCountryFlag: fromC.flagEmoji,
        toCountryFlag: toC.flagEmoji
      });

      await persistCareerData({ intlResult: data });
      showToast(`🌍 Recognition assessment generated from ${fromC.countryName} to ${toC.countryName}!`);
    } catch (e) {
      showToast('Failed to evaluate international recognition.');
    } finally {
      setIsGeneratingIntl(false);
    }
  };

  // Generate Country Comparison
  const handleGenerateCountryComparison = async () => {
    if (compareCountries.length < 2) {
      showToast('Please select at least 2 countries to compare.');
      return;
    }

    setIsGeneratingCompare(true);
    try {
      const res = await fetch('/api/ai/career/country-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occupation: compareOccupation,
          countries: compareCountries
        })
      });

      if (!res.ok) throw new Error('Comparison failed');

      const data: CountryComparisonResult = await res.json();
      setComparisonResult(data);

      await persistCareerData({ comparisonResult: data });
      showToast(`📊 Comparison matrix generated across ${data.countries.length} countries!`);
    } catch (e) {
      showToast('Failed to generate comparison matrix.');
    } finally {
      setIsGeneratingCompare(false);
    }
  };

  // Save current pathway into Personal Roadmaps
  const handleSaveToPersonalRoadmaps = async () => {
    if (!globalPathway) return;

    const newRoadmap: UserSavedCareerRoadmap = {
      id: `roadmap-${Date.now()}`,
      userId: user?.uid || 'guest',
      countryCode: globalPathway.countryCode,
      countryName: globalPathway.countryName,
      occupation: globalPathway.occupation,
      targetRole: globalPathway.entryLevelJobTitles[0] || globalPathway.occupation,
      currentEducation: globalPathway.currentEducationLabel,
      preferredRoute: activeRouteId,
      milestones: globalPathway.milestoneRoadmap.map((m) => ({
        stageNumber: m.stageNumber,
        title: m.stageTitle,
        timeframe: m.timeframe,
        description: m.description,
        actions: m.actionItems.map((a) => ({ text: a, completed: false }))
      })),
      customNotes: `Generated based on ${globalPathway.countryName} standards (${globalPathway.educationFramework})`,
      updatedAt: new Date().toISOString()
    };

    const updated = [newRoadmap, ...savedRoadmaps.filter((r) => r.occupation !== globalPathway.occupation)];
    setSavedRoadmaps(updated);
    setActiveSavedRoadmap(newRoadmap);

    await persistCareerData({ savedRoadmaps: updated });
    showToast(`📌 Saved "${globalPathway.occupation}" to your Personal Career Roadmaps!`);
  };

  // Toggle milestone action item in personal roadmap
  const handleToggleRoadmapAction = async (milestoneIdx: number, actionIdx: number) => {
    if (!activeSavedRoadmap) return;

    const updatedMilestones = [...activeSavedRoadmap.milestones];
    const targetAction = updatedMilestones[milestoneIdx].actions[actionIdx];
    targetAction.completed = !targetAction.completed;

    const updatedRoadmap: UserSavedCareerRoadmap = {
      ...activeSavedRoadmap,
      milestones: updatedMilestones,
      updatedAt: new Date().toISOString()
    };

    setActiveSavedRoadmap(updatedRoadmap);
    const updatedList = savedRoadmaps.map((r) => (r.id === updatedRoadmap.id ? updatedRoadmap : r));
    setSavedRoadmaps(updatedList);

    await persistCareerData({ savedRoadmaps: updatedList });
  };

  // Save insight to AI Memory
  const handleSaveInsightToMemory = async (insightText: string) => {
    if (!onSaveMemory) {
      showToast('Memory saved locally.');
      return;
    }
    await onSaveMemory(insightText, 'career_guidance');
    showToast('💾 Career insight saved to your AI Memory Vault.');
  };

  // Active route detail
  const currentRouteDetail = useMemo(() => {
    if (!globalPathway?.entryRoutes) return null;
    return globalPathway.entryRoutes.find((r) => r.id === activeRouteId) || globalPathway.entryRoutes[0];
  }, [globalPathway, activeRouteId]);

  return (
    <div className="space-y-6" id="global-career-engine-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#1F2937] text-white text-xs sm:text-sm font-medium shadow-xl border border-neutral-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2"
          role="status"
        >
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner with Premium Styling */}
      <div className="p-6 sm:p-7 rounded-2xl border border-purple-200/80 dark:border-purple-900/40 bg-gradient-to-r from-purple-50/70 via-indigo-50/50 to-sky-50/60 dark:from-[#1A1625] dark:via-[#161B26] dark:to-[#121E2A] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-100/90 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Global Labor & Education Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F2937] dark:text-neutral-100">
              Country-Specific Career Pathways & Qualification Engine
            </h1>
            <p className="text-xs sm:text-sm text-[#4B5563] dark:text-neutral-300 max-w-3xl leading-relaxed">
              Explore step-by-step educational pathways across 50+ countries, evaluate regulated profession credentials, compare national education systems, and build your personalized milestone roadmap.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleGeneratePathway()}
              disabled={isGeneratingPathway}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
              id="btn-global-pathway-generate-main"
            >
              {isGeneratingPathway ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
                  <span>Verifying Standards...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Generate Pathway</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 mt-5 border-t border-purple-200/60 dark:border-purple-900/40 scrollbar-none">
          <button
            onClick={() => setActiveTab('pathway')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'pathway'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white/80 dark:bg-neutral-800 text-[#4B5563] dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700'
            }`}
            id="tab-global-career-pathway"
          >
            <Compass className="w-4 h-4" />
            <span>1. Global Pathway Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('after10')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'after10'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white/80 dark:bg-neutral-800 text-[#4B5563] dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700'
            }`}
            id="tab-global-after-10"
          >
            <GraduationCap className="w-4 h-4" />
            <span>2. After Grade 10 / Secondary</span>
          </button>

          <button
            onClick={() => setActiveTab('international')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'international'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white/80 dark:bg-neutral-800 text-[#4B5563] dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700'
            }`}
            id="tab-global-intl-recognition"
          >
            <Globe className="w-4 h-4" />
            <span>3. International Recognition</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'compare'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white/80 dark:bg-neutral-800 text-[#4B5563] dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700'
            }`}
            id="tab-global-country-compare"
          >
            <Layers className="w-4 h-4" />
            <span>4. Cross-Country Compare</span>
          </button>

          <button
            onClick={() => setActiveTab('my_roadmaps')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'my_roadmaps'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white/80 dark:bg-neutral-800 text-[#4B5563] dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700'
            }`}
            id="tab-global-my-roadmaps"
          >
            <Bookmark className="w-4 h-4" />
            <span>5. My Personal Roadmaps ({savedRoadmaps.length})</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          TAB 1: GLOBAL CAREER PATHWAY ENGINE (MAIN INTERACTIVE)
          ========================================================= */}
      {activeTab === 'pathway' && (
        <div className="space-y-6">
          {/* Controls Bar: Country Selector + Education Level + Occupation Category */}
          <div className="p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#14171A] shadow-xs space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Searchable Country Selector */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-neutral-400 mb-1.5">
                  1. Target Country ({GLOBAL_COUNTRIES.length} Supported)
                </label>
                <div
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#1B1F23] flex items-center justify-between cursor-pointer hover:border-purple-500 transition-colors"
                  id="dropdown-country-selector"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="text-lg">{currentCountry.flagEmoji}</span>
                    <div className="text-left truncate">
                      <span className="text-xs sm:text-sm font-semibold text-[#1F2937] dark:text-neutral-100 block truncate">
                        {currentCountry.countryName}
                      </span>
                      <span className="text-[11px] text-[#6B7280] dark:text-neutral-400 block truncate">
                        {currentCountry.region} • {currentCountry.educationFrameworkName.split('/')[0]}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                </div>

                {/* Country Search Dropdown Menu */}
                {isCountryDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50 p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1B1F23] shadow-2xl space-y-2 max-h-72 flex flex-col">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={countrySearchQuery}
                        onChange={(e) => setCountrySearchQuery(e.target.value)}
                        placeholder="Search country (e.g. India, Germany, UK)..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-[#1F2937] dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto space-y-1 flex-1">
                      {filteredCountries.map((country) => (
                        <div
                          key={country.countryCode}
                          onClick={() => {
                            setSelectedCountryCode(country.countryCode);
                            setIsCountryDropdownOpen(false);
                            setCountrySearchQuery('');
                          }}
                          className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            country.countryCode === selectedCountryCode
                              ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold'
                              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#374151] dark:text-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{country.flagEmoji}</span>
                            <span>{country.countryName}</span>
                          </div>
                          <span className="text-[10px] text-neutral-400">{country.region}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Country-Specific Education Stage Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-neutral-400 mb-1.5">
                  2. Current Education Level in {currentCountry.countryName}
                </label>
                <select
                  value={selectedEducationStageId}
                  onChange={(e) => setSelectedEducationStageId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#1B1F23] text-xs sm:text-sm font-medium text-[#1F2937] dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  id="select-education-stage"
                >
                  {currentCountry.educationStages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.label} {stage.isSecondaryGate ? '⭐ [Grade 10 Gate]' : ''}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-[#6B7280] dark:text-neutral-400 mt-1 block">
                  Framework: {currentCountry.educationFrameworkName}
                </span>
              </div>

              {/* 3. Occupation Category Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-neutral-400 mb-1.5">
                  3. Industry Category (21 Sectors)
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#1B1F23] text-xs sm:text-sm font-medium text-[#1F2937] dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  id="select-career-category"
                >
                  <option value="all">🌐 All Categories ({POPULAR_OCCUPATIONS.length} Roles)</option>
                  {GLOBAL_CAREER_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-[#6B7280] dark:text-neutral-400 mt-1 block">
                  Select a category or search below
                </span>
              </div>
            </div>

            {/* Occupation Quick Selection & Custom Input */}
            <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-neutral-400">
                  Select Occupation or Type Any Custom Role:
                </label>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={careerSearchQuery}
                    onChange={(e) => setCareerSearchQuery(e.target.value)}
                    placeholder="Search roles (e.g. Architect, Nurse, AI)..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-[#1F2937] dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Occupation Pills */}
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1 scrollbar-thin">
                {filteredOccupations.map((occ) => {
                  const isSelected = selectedOccupationTitle === occ.title && !customOccupationInput.trim();
                  return (
                    <button
                      key={occ.id}
                      onClick={() => {
                        setSelectedOccupationTitle(occ.title);
                        setCustomOccupationInput('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-neutral-50 dark:bg-neutral-800 text-[#374151] dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:border-purple-400'
                      }`}
                    >
                      <span>{occ.title}</span>
                      {occ.isRegulated && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold">
                          Regulated
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Occupation Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customOccupationInput}
                  onChange={(e) => setCustomOccupationInput(e.target.value)}
                  placeholder="Or enter any custom profession (e.g. Renewable Energy Grid Specialist, Maritime Logistics Officer)..."
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#1B1F23] text-[#1F2937] dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  id="input-custom-occupation"
                />
                <button
                  onClick={() => handleGeneratePathway()}
                  disabled={isGeneratingPathway}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
                  id="btn-generate-pathway-action"
                >
                  {isGeneratingPathway ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Generate</span>
                </button>
              </div>
            </div>
          </div>

          {/* =========================================================
              RENDERED GLOBAL CAREER PATHWAY DETAILS
              ========================================================= */}
          {globalPathway && (
            <div className="space-y-6 animate-in fade-in duration-300" id="section-pathway-results">
              {/* Top Banner: Occupation & Country Status */}
              <div className="p-6 rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-white dark:bg-[#14171A] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-2xl">{currentCountry.flagEmoji}</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-neutral-100">
                      {globalPathway.occupation} in {globalPathway.countryName}
                    </h2>
                    {globalPathway.regulatedDetails.isRegulated ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 text-xs font-bold border border-red-200 dark:border-red-800">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Statutory Regulated Profession
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Market & Skills Driven (Non-Regulated)
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#4B5563] dark:text-neutral-300">
                    Framework: <strong className="font-semibold text-purple-700 dark:text-purple-300">{globalPathway.educationFramework}</strong> • Current Stage: <span className="font-medium">{globalPathway.currentEducationLabel}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleSaveToPersonalRoadmaps}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-800 transition-all"
                    id="btn-save-to-personal-roadmaps"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save to My Roadmaps</span>
                  </button>
                  <button
                    onClick={() => handleSaveInsightToMemory(`Target Career: ${globalPathway.occupation} in ${globalPathway.countryName}. Minimum Education: ${globalPathway.minimumEducationRequirement}. Key Skills: ${globalPathway.requiredSkills.join(', ')}.`)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[#374151] dark:text-neutral-200 text-xs font-semibold transition-all"
                    id="btn-save-career-memory"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span>Save as Memory</span>
                  </button>
                </div>
              </div>

              {/* Regulated Profession Details Alert (if regulated) */}
              {globalPathway.regulatedDetails.isRegulated && (
                <div className="p-5 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 space-y-3">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold text-sm">
                    <Scale className="w-4 h-4 text-red-600" />
                    <span>Official Statutory Licensing & Registration Requirements in {globalPathway.countryName}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-900 border border-red-100 dark:border-red-900/40">
                      <span className="font-bold text-[#1F2937] dark:text-neutral-200 block mb-0.5">🏛️ Governing / Licensing Body:</span>
                      <p className="text-[#374151] dark:text-neutral-300">{globalPathway.regulatedDetails.licensingBody}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-900 border border-red-100 dark:border-red-900/40">
                      <span className="font-bold text-[#1F2937] dark:text-neutral-200 block mb-0.5">🎓 Mandatory Degree:</span>
                      <p className="text-[#374151] dark:text-neutral-300">{globalPathway.regulatedDetails.mandatoryDegree}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-900 border border-red-100 dark:border-red-900/40">
                      <span className="font-bold text-[#1F2937] dark:text-neutral-200 block mb-0.5">📝 Mandatory Exams:</span>
                      <p className="text-[#374151] dark:text-neutral-300">{globalPathway.regulatedDetails.mandatoryExaminations.join(', ')}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-900 border border-red-100 dark:border-red-900/40">
                      <span className="font-bold text-[#1F2937] dark:text-neutral-200 block mb-0.5">🏥 Mandatory Internship / Residency:</span>
                      <p className="text-[#374151] dark:text-neutral-300">{globalPathway.regulatedDetails.internshipOrResidency}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-red-700 dark:text-red-300 italic pt-1 border-t border-red-200 dark:border-red-900/40">
                    ⚖️ {globalPathway.regulatedDetails.statutoryDisclaimer}
                  </p>
                </div>
              )}

              {/* 5-Card Pastel Layout: Key Requirements & Standards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* 🌸 Card 1: Rose Theme - Education Requirements */}
                <div className="p-4 rounded-2xl border border-pink-200 dark:border-pink-900/40 bg-[#FFE4EC] dark:bg-[#2A171F] flex flex-col justify-between shadow-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-pink-900 dark:text-pink-300">
                      <GraduationCap className="w-4 h-4 text-pink-700 dark:text-pink-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">Education</span>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-pink-200/80 dark:bg-pink-900/60 text-pink-900 dark:text-pink-200">
                      Verified Requirement
                    </span>
                    <p className="text-xs text-[#1F2937] dark:text-pink-100 font-semibold leading-snug">
                      Min: {globalPathway.minimumEducationRequirement}
                    </p>
                    <p className="text-[11px] text-[#4B5563] dark:text-pink-200/80">
                      Preferred: {globalPathway.preferredEducationRequirement}
                    </p>
                  </div>
                </div>

                {/* 🌻 Card 2: Sunshine Theme - Required & Differentiator Skills */}
                <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-[#FFF3C4] dark:bg-[#2A2312] flex flex-col justify-between shadow-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
                      <Award className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">Key Skills</span>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                      Market Benchmark
                    </span>
                    <ul className="text-xs text-[#1F2937] dark:text-amber-100 font-medium space-y-1">
                      {globalPathway.requiredSkills.slice(0, 3).map((s, idx) => (
                        <li key={idx} className="flex items-center gap-1 truncate">
                          <Check className="w-3 h-3 text-amber-700 dark:text-amber-400 shrink-0" />
                          <span className="truncate">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 🌿 Card 3: Mint Theme - Certifications */}
                <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-[#DDF7E8] dark:bg-[#122A1E] flex flex-col justify-between shadow-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300">
                      <FileCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">Certifications</span>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                      Industry Valued
                    </span>
                    <ul className="text-xs text-[#1F2937] dark:text-emerald-100 font-medium space-y-1">
                      {(globalPathway.recommendedCertifications.length > 0
                        ? globalPathway.recommendedCertifications
                        : ['None mandatory; portfolio-driven']
                      )
                        .slice(0, 2)
                        .map((c, idx) => (
                          <li key={idx} className="truncate">
                            • {c}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                {/* 🦋 Card 4: Sky Theme - Experience & Apprenticeships */}
                <div className="p-4 rounded-2xl border border-sky-200 dark:border-sky-900/40 bg-[#DDEEFF] dark:bg-[#122233] flex flex-col justify-between shadow-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-sky-900 dark:text-sky-300">
                      <Briefcase className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">Experience</span>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-sky-200/80 dark:bg-sky-900/60 text-sky-900 dark:text-sky-200">
                      Entry Standard
                    </span>
                    <p className="text-xs text-[#1F2937] dark:text-sky-100 font-semibold line-clamp-2">
                      {globalPathway.practicalExperienceRequired}
                    </p>
                    <p className="text-[11px] text-[#4B5563] dark:text-sky-200/80 line-clamp-2">
                      {globalPathway.internshipApprenticeshipInfo}
                    </p>
                  </div>
                </div>

                {/* 💜 Card 5: Lavender Theme - Target Entry Titles */}
                <div className="p-4 rounded-2xl border border-purple-200 dark:border-purple-900/40 bg-[#E9DDFB] dark:bg-[#221833] flex flex-col justify-between shadow-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-purple-900 dark:text-purple-300">
                      <TrendingUp className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">Target Roles</span>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-200/80 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200">
                      First Jobs
                    </span>
                    <ul className="text-xs text-[#1F2937] dark:text-purple-100 font-medium space-y-1">
                      {globalPathway.entryLevelJobTitles.slice(0, 3).map((title, idx) => (
                        <li key={idx} className="truncate">
                          • {title}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Multiple Entry Routes Visualizer */}
              <div className="p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#14171A] shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[#1F2937] dark:text-neutral-100 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-purple-600" />
                      <span>Multiple Entry Routes into {globalPathway.occupation} in {globalPathway.countryName}</span>
                    </h3>
                    <p className="text-xs text-[#4B5563] dark:text-neutral-400">
                      Compare university, vocational/apprenticeship, skills-first, and career transition routes.
                    </p>
                  </div>
                </div>

                {/* Route Selector Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {globalPathway.entryRoutes.map((route) => (
                    <button
                      key={route.id}
                      onClick={() => setActiveRouteId(route.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                        activeRouteId === route.id
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-neutral-50 dark:bg-neutral-800 text-[#374151] dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:border-purple-400'
                      }`}
                    >
                      <span>{route.badgeEmoji}</span>
                      <span>{route.name}</span>
                    </button>
                  ))}
                </div>

                {/* Active Route Step-by-Step Breakdown */}
                {currentRouteDetail && (
                  <div className="p-5 rounded-xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/40 dark:bg-[#1A1625]/40 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-[#1F2937] dark:text-neutral-100 flex items-center gap-2">
                          <span>{currentRouteDetail.badgeEmoji}</span>
                          <span>{currentRouteDetail.name}</span>
                          <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-purple-200/70 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200">
                            ⏱️ {currentRouteDetail.typicalDuration}
                          </span>
                        </h4>
                        <p className="text-xs text-[#4B5563] dark:text-neutral-300 mt-1">
                          {currentRouteDetail.summary}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300 bg-white/80 dark:bg-neutral-800 px-3 py-1 rounded-lg border border-purple-200 dark:border-purple-900">
                        Best for: {currentRouteDetail.recommendedFor}
                      </span>
                    </div>

                    {/* Step Ladder */}
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                        Step-by-Step Progression:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {currentRouteDetail.steps.map((step, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-white dark:bg-[#161B22] border border-neutral-200 dark:border-neutral-700/80 space-y-1 relative"
                          >
                            <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <p className="text-xs font-medium text-[#1F2937] dark:text-neutral-200 pt-1 leading-relaxed">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Advantages vs Tradeoffs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-xl bg-[#DDF7E8]/70 dark:bg-[#122A1E]/70 border border-emerald-200 dark:border-emerald-900/40">
                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block mb-1.5">
                          ✅ Key Advantages:
                        </span>
                        <ul className="text-xs text-[#1F2937] dark:text-neutral-200 space-y-1">
                          {currentRouteDetail.advantages.map((adv, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <span>{adv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#FFF3C4]/70 dark:bg-[#2A2312]/70 border border-amber-200 dark:border-amber-900/40">
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block mb-1.5">
                          ⚠️ Realistic Trade-offs & Demands:
                        </span>
                        <ul className="text-xs text-[#1F2937] dark:text-neutral-200 space-y-1">
                          {currentRouteDetail.tradeoffs.map((tro, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                              <span>{tro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Career Progression Ladder (Entry -> Mid -> Senior -> Lead/Executive) */}
              <div className="p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#14171A] shadow-xs space-y-4">
                <h3 className="text-base font-bold text-[#1F2937] dark:text-neutral-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span>Long-Term Career Progression in {globalPathway.countryName}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {globalPathway.careerProgression.map((stage, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1A1E24] space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                            Stage {idx + 1}
                          </span>
                          <span className="text-[11px] font-mono text-[#6B7280] dark:text-neutral-400">
                            {stage.experienceYears}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#1F2937] dark:text-neutral-100">
                          {stage.typicalTitle}
                        </h4>
                        <p className="text-xs text-[#4B5563] dark:text-neutral-300 leading-relaxed">
                          {stage.description}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-neutral-400 block mb-1">
                          Focus Skills:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {stage.focusSkills.map((sk, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-white dark:bg-neutral-800 text-[#374151] dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fit Analysis & Transparent Gap Assessment (No Fake Percentages) */}
              {globalPathway.fitAnalysis && (
                <div className="p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#14171A] shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <h3 className="text-base font-bold text-[#1F2937] dark:text-neutral-100">
                      Transparent Fit & Gap Analysis
                    </h3>
                  </div>
                  <p className="text-xs text-[#4B5563] dark:text-neutral-400">
                    Clear assessment of your alignment, key skills to develop, and introspective questions without arbitrary match scores.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Strong Matches */}
                    <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Strong Natural Alignments</span>
                      </span>
                      <ul className="text-xs text-[#1F2937] dark:text-neutral-200 space-y-1.5">
                        {globalPathway.fitAnalysis.strongMatches.map((m, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Skills & Experience to Develop */}
                    <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 space-y-2">
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-purple-600" />
                        <span>Skills & Gaps to Cultivate</span>
                      </span>
                      <ul className="text-xs text-[#1F2937] dark:text-neutral-200 space-y-1.5">
                        {[
                          ...globalPathway.fitAnalysis.skillsToDevelop,
                          ...globalPathway.fitAnalysis.experienceGaps
                        ].map((g, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-purple-600 font-bold">•</span>
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Questions to Explore */}
                    <div className="p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 space-y-2">
                      <span className="text-xs font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
                        <span>Questions to Test Passion</span>
                      </span>
                      <ul className="text-xs text-[#1F2937] dark:text-neutral-200 space-y-1.5">
                        {globalPathway.fitAnalysis.questionsToExplore.map((q, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-sky-600 font-bold">?</span>
                            <span className="italic">{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Verification & Labor Authority Source Footer */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#161B22] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="text-[#374151] dark:text-neutral-300">
                    Source: <strong className="font-semibold text-[#1F2937] dark:text-neutral-100">{globalPathway.verification.sourceOrganization}</strong> • Last Verified: <span className="font-medium text-purple-600 dark:text-purple-400">{globalPathway.verification.lastVerifiedDate}</span>
                  </span>
                </div>
                {globalPathway.verification.sourceUrl && (
                  <a
                    href={globalPathway.verification.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-purple-600 hover:underline font-semibold"
                  >
                    <span>View Official Standards</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 2: AFTER GRADE 10 / SECONDARY PATHWAYS ENGINE
          ========================================================= */}
      {activeTab === 'after10' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-white dark:bg-[#14171A] shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-[#1F2937] dark:text-neutral-100 flex items-center gap-2">
                  <span>{currentCountry.flagEmoji}</span>
                  <span>After Grade 10 / Secondary Decision Engine ({currentCountry.countryName})</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#4B5563] dark:text-neutral-300">
                  Exit point analysis for students completing {currentCountry.grade10EquivName}. Compare Academic vs Vocational vs Technical Diploma streams.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGeneratePathway()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Update Guidance for {currentCountry.countryName}</span>
                </button>
              </div>
            </div>

            {/* Stream Filter Pills */}
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-xs font-bold text-[#4B5563] dark:text-neutral-400">Stream Focus:</span>
              <button
                onClick={() => setAfter10GradeTarget('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  after10GradeTarget === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-[#374151] dark:text-neutral-300'
                }`}
              >
                All Streams
              </button>
              <button
                onClick={() => setAfter10GradeTarget('academic')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  after10GradeTarget === 'academic'
                    ? 'bg-purple-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-[#374151] dark:text-neutral-300'
                }`}
              >
                🎓 Academic High School
              </button>
              <button
                onClick={() => setAfter10GradeTarget('diploma')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  after10GradeTarget === 'diploma'
                    ? 'bg-purple-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-[#374151] dark:text-neutral-300'
                }`}
              >
                📜 Polytechnic / Diploma
              </button>
              <button
                onClick={() => setAfter10GradeTarget('vocational')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  after10GradeTarget === 'vocational'
                    ? 'bg-purple-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-[#374151] dark:text-neutral-300'
                }`}
              >
                🛠️ Vocational & Apprenticeships
              </button>
            </div>
          </div>

          {/* 4 Comparative Stream Cards for Grade 10 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stream 1: Academic Track */}
            <div className="p-5 rounded-2xl border border-pink-200 dark:border-pink-900/40 bg-[#FFE4EC] dark:bg-[#2A171F] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-900 dark:text-pink-300">
                  Option 1: Academic Stream ({currentCountry.grade12EquivName})
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-pink-200 text-pink-900 font-bold">2 Years</span>
              </div>
              <h3 className="text-sm font-bold text-[#1F2937] dark:text-neutral-100">
                General / Senior High School (STEM, Commerce, Arts)
              </h3>
              <p className="text-xs text-[#374151] dark:text-pink-100 leading-relaxed">
                Prepares for competitive university entrance exams and 3-4 year undergraduate degrees in {currentCountry.countryName} and globally.
              </p>
              <div className="space-y-1 text-xs text-[#374151] dark:text-pink-200">
                <span className="font-bold block">💡 Best for:</span>
                <p>Students aiming for Medicine, Law, Research, Investment Banking, or Traditional Engineering.</p>
              </div>
            </div>

            {/* Stream 2: Polytechnic / Technical Diploma */}
            <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-[#FFF3C4] dark:bg-[#2A2312] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  Option 2: Technical Diploma ({currentCountry.vocationalSystemName})
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">3 Years</span>
              </div>
              <h3 className="text-sm font-bold text-[#1F2937] dark:text-neutral-100">
                Polytechnic & Applied Technical Diploma
              </h3>
              <p className="text-xs text-[#374151] dark:text-amber-100 leading-relaxed">
                Direct hands-on engineering, IT, or design diploma with lateral entry opportunities into the 2nd year of Bachelor's degree programs.
              </p>
              <div className="space-y-1 text-xs text-[#374151] dark:text-amber-200">
                <span className="font-bold block">💡 Best for:</span>
                <p>Learners who want fast practical engineering skills with lower financial burden.</p>
              </div>
            </div>

            {/* Stream 3: Vocational Apprenticeship */}
            <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-[#DDF7E8] dark:bg-[#122A1E] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                  Option 3: Vocational & Dual Apprenticeship
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">1-3 Years</span>
              </div>
              <h3 className="text-sm font-bold text-[#1F2937] dark:text-neutral-100">
                Work-Integrated Vocational Certificates
              </h3>
              <p className="text-xs text-[#374151] dark:text-emerald-100 leading-relaxed">
                Paid on-the-job apprenticeship with government or trade certification (e.g. ITI in India, Duale Ausbildung in Germany, TAFE in Australia).
              </p>
              <div className="space-y-1 text-xs text-[#374151] dark:text-emerald-200">
                <span className="font-bold block">💡 Best for:</span>
                <p>Electricians, precision technicians, HVAC specialists, and rapid workforce entry.</p>
              </div>
            </div>

            {/* Stream 4: Emerging Skills-First Track */}
            <div className="p-5 rounded-2xl border border-sky-200 dark:border-sky-900/40 bg-[#DDEEFF] dark:bg-[#122233] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-900 dark:text-sky-300">
                  Option 4: Digital Skills & Open Schooling
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-200 text-sky-900 font-bold">Flexible</span>
              </div>
              <h3 className="text-sm font-bold text-[#1F2937] dark:text-neutral-100">
                Open Secondary School + Specialized Tech Bootcamps
              </h3>
              <p className="text-xs text-[#374151] dark:text-sky-100 leading-relaxed">
                Combining flexible accredited distance schooling with intensive software, 3D design, or digital marketing portfolio building.
              </p>
              <div className="space-y-1 text-xs text-[#374151] dark:text-sky-200">
                <span className="font-bold block">💡 Best for:</span>
                <p>Self-driven creators, tech builders, and freelance/remote entrepreneurs.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: INTERNATIONAL QUALIFICATION RECOGNITION
          ========================================================= */}
      {activeTab === 'international' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#14171A] shadow-xs space-y-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1F2937] dark:text-neutral-100 flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                <span>International Qualification & Credential Recognition Engine</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] dark:text-neutral-300 mt-1">
                Evaluate credential equivalency, credential evaluation authorities (WES, ECCTIS, ZAB, VETASSESS), licensing examinations, language tests, and gap-bridging pathways across countries.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Origin Country */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-neutral-400 mb-1.5">
                  Origin Country (Where degree was earned)
                </label>
                <select
                  value={intlFromCountry}
                  onChange={(e) => setIntlFromCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#1B1F23] text-xs sm:text-sm font-medium text-[#1F2937] dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {GLOBAL_COUNTRIES.map((c) => (
                    <option key={c.countryCode} value={c.countryCode}>
                      {c.flagEmoji} {c.countryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Country */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-neutral-400 mb-1.5">
                  Destination Country (Where you plan to work)
                </label>
                <select
                  value={intlToCountry}
                  onChange={(e) => setIntlToCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#1B1F23] text-xs sm:text-sm font-medium text-[#1F2937] dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {GLOBAL_COUNTRIES.map((c) => (
                    <option key={c.countryCode} value={c.countryCode}>
                      {c.flagEmoji} {c.countryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Qualification / Profession */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-neutral-400 mb-1.5">
                  Degree / Profession to Evaluate
                </label>
                <input
                  type="text"
                  value={intlProfession}
                  onChange={(e) => setIntlProfession(e.target.value)}
                  placeholder="e.g. Software Engineer, Medical Doctor, Mechanical Engineer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#1B1F23] text-xs sm:text-sm font-medium text-[#1F2937] dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateIntlRecognition}
              disabled={isGeneratingIntl}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
              id="btn-evaluate-intl-recognition"
            >
              {isGeneratingIntl ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              <span>Evaluate Recognition Requirements</span>
            </button>
          </div>

          {/* International Recognition Result Cards */}
          {intlResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-6 rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-white dark:bg-[#14171A] shadow-xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{intlResult.fromCountryFlag}</span>
                    <ArrowRight className="w-4 h-4 text-purple-600" />
                    <span className="text-2xl">{intlResult.toCountryFlag}</span>
                    <h3 className="text-base sm:text-lg font-bold text-[#1F2937] dark:text-neutral-100">
                      Recognition for "{intlResult.qualificationOrProfession}" from {intlResult.fromCountry} to {intlResult.toCountry}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Feasibility: {intlResult.recognitionFeasibility}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#1A1E24] border border-neutral-200 dark:border-neutral-700/80 space-y-1.5">
                    <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <Building className="w-4 h-4" />
                      <span>Official Credential Evaluation Body:</span>
                    </span>
                    <p className="text-[#1F2937] dark:text-neutral-200 font-medium">
                      {intlResult.credentialEvaluationBody}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#1A1E24] border border-neutral-200 dark:border-neutral-700/80 space-y-1.5">
                    <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <Languages className="w-4 h-4" />
                      <span>Language Proficiency Benchmark:</span>
                    </span>
                    <p className="text-[#1F2937] dark:text-neutral-200 font-medium">
                      {intlResult.languageRequirements}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#1A1E24] border border-neutral-200 dark:border-neutral-700/80 space-y-1.5">
                    <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <Scale className="w-4 h-4" />
                      <span>Professional Licensing / Chamber Exams:</span>
                    </span>
                    <p className="text-[#1F2937] dark:text-neutral-200 font-medium">
                      {intlResult.professionalLicensingRequirements}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#1A1E24] border border-neutral-200 dark:border-neutral-700/80 space-y-1.5">
                    <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" />
                      <span>Work Experience Validation:</span>
                    </span>
                    <p className="text-[#1F2937] dark:text-neutral-200 font-medium">
                      {intlResult.workExperienceRequirements}
                    </p>
                  </div>
                </div>

                {/* Gap Bridge Programs */}
                <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 space-y-2">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                    <Milestone className="w-3.5 h-3.5" />
                    <span>Typical Adaptation & Gap-Bridge Programs:</span>
                  </span>
                  <ul className="text-xs text-[#1F2937] dark:text-neutral-200 space-y-1">
                    {intlResult.typicalGapsAndBridgePrograms.map((gap, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-[11px] text-[#6B7280] dark:text-neutral-400 italic pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  ⚖️ {intlResult.disclaimer}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 4: CROSS-COUNTRY CAREER COMPARISON MATRIX
          ========================================================= */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#14171A] shadow-xs space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1F2937] dark:text-neutral-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                <span>Side-by-Side Country Comparison Matrix</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] dark:text-neutral-300 mt-1">
                Compare educational duration, regulation status, vocational feasibility, and primary entry credentials for any profession across up to 4 countries.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-neutral-400 mb-1.5">
                  Target Occupation to Compare
                </label>
                <input
                  type="text"
                  value={compareOccupation}
                  onChange={(e) => setCompareOccupation(e.target.value)}
                  placeholder="e.g. Software Engineer, Civil Engineer, Product Designer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#1B1F23] text-xs sm:text-sm font-medium text-[#1F2937] dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-neutral-400 mb-1.5">
                  Select Countries to Compare (Pick 2-4)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                  {GLOBAL_COUNTRIES.slice(0, 15).map((c) => {
                    const isSelected = compareCountries.includes(c.countryCode);
                    return (
                      <button
                        key={c.countryCode}
                        onClick={() => {
                          if (isSelected) {
                            if (compareCountries.length > 2) {
                              setCompareCountries(compareCountries.filter((code) => code !== c.countryCode));
                            } else {
                              showToast('Please keep at least 2 countries selected.');
                            }
                          } else {
                            if (compareCountries.length < 4) {
                              setCompareCountries([...compareCountries, c.countryCode]);
                            } else {
                              showToast('Maximum 4 countries can be compared side-by-side.');
                            }
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white font-bold'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-[#374151] dark:text-neutral-300'
                        }`}
                      >
                        {c.flagEmoji} {c.countryName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateCountryComparison}
              disabled={isGeneratingCompare}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
              id="btn-run-country-comparison"
            >
              {isGeneratingCompare ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
              <span>Generate Cross-Country Matrix</span>
            </button>
          </div>

          {/* Comparison Matrix Table */}
          {comparisonResult && (
            <div className="p-6 rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-white dark:bg-[#14171A] shadow-xs space-y-4 overflow-x-auto">
              <h3 className="text-base font-bold text-[#1F2937] dark:text-neutral-100">
                Comparative Matrix for "{comparisonResult.occupation}"
              </h3>
              <table className="w-full text-xs text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-purple-50/70 dark:bg-purple-950/40">
                    <th className="p-3 font-bold text-[#1F2937] dark:text-neutral-200">Dimension</th>
                    {comparisonResult.countries.map((c) => (
                      <th key={c.countryCode} className="p-3 font-bold text-[#1F2937] dark:text-neutral-200">
                        {c.flagEmoji} {c.countryName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  <tr>
                    <td className="p-3 font-bold text-[#4B5563] dark:text-neutral-400">Primary Degree Route</td>
                    {comparisonResult.countries.map((c) => (
                      <td key={c.countryCode} className="p-3 text-[#1F2937] dark:text-neutral-200 font-medium">
                        {c.educationSystemRoute}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#4B5563] dark:text-neutral-400">Typical Duration</td>
                    {comparisonResult.countries.map((c) => (
                      <td key={c.countryCode} className="p-3 text-[#1F2937] dark:text-neutral-200 font-mono">
                        {c.typicalDuration}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#4B5563] dark:text-neutral-400">Regulation Status</td>
                    {comparisonResult.countries.map((c) => (
                      <td key={c.countryCode} className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          c.regulationStatus.toLowerCase().includes('regulated') && !c.regulationStatus.toLowerCase().includes('non')
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {c.regulationStatus}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#4B5563] dark:text-neutral-400">Vocational / Dual Feasibility</td>
                    {comparisonResult.countries.map((c) => (
                      <td key={c.countryCode} className="p-3 text-[#1F2937] dark:text-neutral-200">
                        {c.vocationalApprenticeshipAvailability}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#4B5563] dark:text-neutral-400">Skills-First Entry</td>
                    {comparisonResult.countries.map((c) => (
                      <td key={c.countryCode} className="p-3 text-[#1F2937] dark:text-neutral-200">
                        {c.skillsFirstFeasibility}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#4B5563] dark:text-neutral-400">Verified Labor Authority</td>
                    {comparisonResult.countries.map((c) => (
                      <td key={c.countryCode} className="p-3 text-[11px] text-purple-700 dark:text-purple-300 font-semibold">
                        {c.sourceOrganization}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 5: MY PERSONAL CAREER ROADMAP TRACKER
          ========================================================= */}
      {activeTab === 'my_roadmaps' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#14171A] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#1F2937] dark:text-neutral-100 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-purple-600" />
                  <span>My Saved Career Roadmaps ({savedRoadmaps.length})</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#4B5563] dark:text-neutral-300 mt-1">
                  Your active milestone action ladders persisted securely to your ReflectAI account.
                </p>
              </div>

              {savedRoadmaps.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    value={activeSavedRoadmap?.id || ''}
                    onChange={(e) => {
                      const found = savedRoadmaps.find((r) => r.id === e.target.value);
                      if (found) setActiveSavedRoadmap(found);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#1B1F23] text-xs font-medium text-[#1F2937] dark:text-neutral-100"
                  >
                    {savedRoadmaps.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.occupation} ({r.countryName})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {savedRoadmaps.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 space-y-2">
                <Compass className="w-8 h-8 text-purple-500 mx-auto" />
                <h3 className="text-sm font-bold text-[#1F2937] dark:text-neutral-200">No Roadmaps Saved Yet</h3>
                <p className="text-xs text-[#4B5563] dark:text-neutral-400 max-w-md mx-auto">
                  Generate a verified pathway in Tab 1 and click "Save to My Roadmaps" to start your personalized milestone tracker.
                </p>
                <button
                  onClick={() => setActiveTab('pathway')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
                >
                  Go to Global Pathway Engine
                </button>
              </div>
            ) : activeSavedRoadmap ? (
              <div className="space-y-5 pt-2">
                {/* Active Roadmap Banner */}
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-bold text-[#1F2937] dark:text-neutral-100">
                      🎯 {activeSavedRoadmap.occupation} Roadmap ({activeSavedRoadmap.countryName})
                    </h3>
                    <p className="text-xs text-[#4B5563] dark:text-neutral-300">
                      Target Role: <strong>{activeSavedRoadmap.targetRole}</strong> • Starting from: {activeSavedRoadmap.currentEducation}
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-white dark:bg-neutral-800 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800">
                    Route: {activeSavedRoadmap.preferredRoute}
                  </span>
                </div>

                {/* Milestones Action Checklist */}
                <div className="space-y-4">
                  {activeSavedRoadmap.milestones.map((m, mIdx) => {
                    const completedCount = m.actions.filter((a) => a.completed).length;
                    const totalCount = m.actions.length;
                    const isAllDone = totalCount > 0 && completedCount === totalCount;

                    return (
                      <div
                        key={mIdx}
                        className={`p-4 rounded-xl border transition-all ${
                          isAllDone
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900'
                            : 'bg-white dark:bg-[#161B22] border-neutral-200 dark:border-neutral-700/80'
                        }`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                              {m.stageNumber}
                            </span>
                            <h4 className="text-sm font-bold text-[#1F2937] dark:text-neutral-100">
                              {m.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-[#6B7280] dark:text-neutral-400">
                              ⏱️ {m.timeframe}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[#374151] dark:text-neutral-300">
                              {completedCount}/{totalCount} Completed
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-[#4B5563] dark:text-neutral-300 mb-3">
                          {m.description}
                        </p>

                        {/* Interactive Action Checkboxes */}
                        <div className="space-y-1.5 pl-2 border-l-2 border-purple-200 dark:border-purple-800">
                          {m.actions.map((action, aIdx) => (
                            <div
                              key={aIdx}
                              onClick={() => handleToggleRoadmapAction(mIdx, aIdx)}
                              className="flex items-center gap-2 text-xs cursor-pointer select-none group"
                            >
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                  action.completed
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-neutral-300 dark:border-neutral-600 group-hover:border-purple-500'
                                }`}
                              >
                                {action.completed && <Check className="w-3 h-3" />}
                              </div>
                              <span
                                className={`font-medium ${
                                  action.completed
                                    ? 'line-through text-neutral-400 dark:text-neutral-500'
                                    : 'text-[#1F2937] dark:text-neutral-200'
                                }`}
                              >
                                {action.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
export default CareerCompassView;
