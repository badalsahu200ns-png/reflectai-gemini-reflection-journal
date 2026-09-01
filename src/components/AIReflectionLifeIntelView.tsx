import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  User,
  ShieldCheck,
  GraduationCap,
  Compass,
  BookOpen,
  Scale,
  TrendingUp,
  HeartHandshake,
  Layers,
  Award,
  ChevronRight
} from 'lucide-react';
import { JournalEntry, AIMemory } from '../types';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

// Subcomponents
import { LifeIntelCoreCards } from './life_intel/LifeIntelCoreCards';
import { PersonalProfileStatement } from './life_intel/PersonalProfileStatement';
import { PersonalSwotView } from './life_intel/PersonalSwotView';
import { StudentIntelligenceView } from './life_intel/StudentIntelligenceView';
import { CareerCompassView } from './life_intel/CareerCompassView';
import { AIStudyGuruView } from './life_intel/AIStudyGuruView';
import { AIGuruView } from './life_intel/AIGuruView';
import { LongitudinalChangeView } from './life_intel/LongitudinalChangeView';
import { PersonasSanctuaryView } from './life_intel/PersonasSanctuaryView';

interface AIReflectionLifeIntelViewProps {
  entries: JournalEntry[];
  memories: AIMemory[];
  onOpenEntry?: (entryId: string) => void;
  onStartReflection?: (initialText?: string) => void;
}

type MainTab =
  | 'core_intel'
  | 'profile_statement'
  | 'swot'
  | 'student'
  | 'career'
  | 'study_guru'
  | 'ai_guru'
  | 'longitudinal'
  | 'personas';

export const AIReflectionLifeIntelView: React.FC<AIReflectionLifeIntelViewProps> = ({
  entries,
  memories,
  onOpenEntry,
  onStartReflection
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<MainTab>('core_intel');

  // Unified Save to AI Memory Vault handler
  const handleSaveMemory = async (memoryText: string, category: string = 'Mindset') => {
    if (!memoryText || !memoryText.trim()) return;

    const memoryPayload = {
      userId: user?.uid || 'anonymous',
      memoryText: memoryText.trim(),
      category,
      confidenceScore: 0.95,
      createdAt: new Date().toISOString(),
      isUserConfirmed: true,
      lastReferencedAt: new Date().toISOString()
    };

    if (user?.uid) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'ai_memories'), memoryPayload);
      } catch (err) {
        console.warn('Could not write memory to Firestore, saving to local vault:', err);
        const existing = JSON.parse(localStorage.getItem(`reflectai_memories_${user.uid}`) || '[]');
        existing.unshift({ id: `local_mem_${Date.now()}`, ...memoryPayload });
        localStorage.setItem(`reflectai_memories_${user.uid}`, JSON.stringify(existing));
      }
    }
  };

  const NAV_TABS = [
    { id: 'core_intel', label: '1. Life Intelligence Core', icon: Brain, desc: 'What Matters, Energizes, Drains & Patterns' },
    { id: 'profile_statement', label: '2. Identity & Personal Statement', icon: User, desc: 'This is Me, Principles & Values' },
    { id: 'swot', label: '3. Personal SWOT', icon: ShieldCheck, desc: 'Strengths, Weaknesses, Opportunities & Threats' },
    { id: 'student', label: '4. Student Guidance', icon: GraduationCap, desc: 'Stream Choices, 10th/12th Pathways & Tradeoffs' },
    { id: 'career', label: '5. Career Compass & Roadmap', icon: Compass, desc: 'Career Discovery, Matrix & 8-Stage Ladder' },
    { id: 'study_guru', label: '6. AI Study Guru', icon: BookOpen, desc: 'Concept Breakdown, ELI12, Quizzes & Flashcards' },
    { id: 'ai_guru', label: '7. AI Guru (Ethical Support)', icon: Scale, desc: '7-Step Decision & Life Dilemma Framework' },
    { id: 'longitudinal', label: '8. Longitudinal Growth', icon: TrendingUp, desc: 'Then vs Now & What I Keep Saying' },
    { id: 'personas', label: '9. AI Personas Sanctuary', icon: HeartHandshake, desc: 'Multi-perspective Reflective Mirrors' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Main Navigation Bar */}
      <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-2.5 shadow-md">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MainTab)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  isSel
                    ? 'bg-[#76B900] text-black shadow-[0_0_15px_rgba(118,185,0,0.25)]'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#181B1E]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSel ? 'stroke-[2.5]' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active View Tab */}
      {activeTab === 'core_intel' && (
        <LifeIntelCoreCards
          entries={entries}
          memories={memories}
          onOpenEntry={onOpenEntry}
          onSaveMemory={handleSaveMemory}
        />
      )}

      {activeTab === 'profile_statement' && (
        <PersonalProfileStatement
          entries={entries}
          memories={memories}
          onSaveMemory={handleSaveMemory}
        />
      )}

      {activeTab === 'swot' && (
        <PersonalSwotView
          entries={entries}
          memories={memories}
          onOpenEntry={onOpenEntry}
          onSaveMemory={handleSaveMemory}
        />
      )}

      {activeTab === 'student' && (
        <StudentIntelligenceView
          entries={entries}
        />
      )}

      {activeTab === 'career' && (
        <CareerCompassView
          entries={entries}
          memories={memories}
          onSaveMemory={handleSaveMemory}
        />
      )}

      {activeTab === 'study_guru' && (
        <AIStudyGuruView
          entries={entries}
        />
      )}

      {activeTab === 'ai_guru' && (
        <AIGuruView
          entries={entries}
          memories={memories}
          onSaveMemory={handleSaveMemory}
        />
      )}

      {activeTab === 'longitudinal' && (
        <LongitudinalChangeView
          entries={entries}
          memories={memories}
          onOpenEntry={onOpenEntry}
          onSaveMemory={handleSaveMemory}
        />
      )}

      {activeTab === 'personas' && (
        <PersonasSanctuaryView
          entries={entries}
          memories={memories}
        />
      )}
    </div>
  );
};
