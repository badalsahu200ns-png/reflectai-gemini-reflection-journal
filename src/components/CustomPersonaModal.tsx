import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Plus,
  Trash2,
  Brain,
  Shield,
  HelpCircle,
  Zap,
  Heart,
  Smile,
  Compass
} from 'lucide-react';
import { CustomAIPersona } from '../types';

interface CustomPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePersona: (persona: CustomAIPersona) => void;
  initialPersona?: CustomAIPersona | null;
}

const PRESET_TONES = [
  { id: 'analytical', label: 'Analytical & Objective', icon: Brain, desc: 'Logical, pattern-seeking, direct' },
  { id: 'compassionate', label: 'Empathetic & Nurturing', icon: Heart, desc: 'Gentle, emotionally validating, warm' },
  { id: 'socratic', label: 'Socratic & Inquisitive', icon: HelpCircle, desc: 'Probing questions, uncovers assumptions' },
  { id: 'stoic', label: 'Stoic & Grounding', icon: Shield, desc: 'Focus on control, virtue, calm resilience' },
  { id: 'coaching', label: 'Action & Momentum Coach', icon: Zap, desc: 'High-energy, micro-habits, accountability' },
  { id: 'philosophical', label: 'Poetic & Philosophical', icon: Compass, desc: 'Deep reflection, metaphors, holistic' }
];

export const CustomPersonaModal: React.FC<CustomPersonaModalProps> = ({
  isOpen,
  onClose,
  onSavePersona,
  initialPersona
}) => {
  const [name, setName] = useState(initialPersona?.name || '');
  const [tagline, setTagline] = useState(initialPersona?.tagline || '');
  const [description, setDescription] = useState(initialPersona?.description || '');
  const [tone, setTone] = useState(initialPersona?.tone || 'Empathetic & Nurturing');
  const [systemPrompt, setSystemPrompt] = useState(
    initialPersona?.systemPrompt ||
      'You are a custom AI mentor for ReflectAI. Speak with warmth, focus on actionable personal growth, and always connect today’s dilemmas to deeper values.'
  );
  const [focusAreaInput, setFocusAreaInput] = useState('');
  const [focusAreas, setFocusAreas] = useState<string[]>(
    initialPersona?.focusAreas || ['Mindset', 'Clarity', 'Goal Progress']
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddFocusArea = () => {
    if (!focusAreaInput.trim()) return;
    if (!focusAreas.includes(focusAreaInput.trim())) {
      setFocusAreas([...focusAreas, focusAreaInput.trim()]);
    }
    setFocusAreaInput('');
  };

  const handleRemoveFocusArea = (tag: string) => {
    setFocusAreas(focusAreas.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name for your custom AI Persona.');
      return;
    }
    if (!systemPrompt.trim()) {
      setError('Please provide system instructions or core guidance for this persona.');
      return;
    }

    const persona: CustomAIPersona = {
      id: initialPersona?.id || `custom-persona-${Date.now()}`,
      name: name.trim(),
      tagline: tagline.trim() || 'Custom Life Guide',
      description: description.trim() || 'A uniquely crafted AI reflection voice tuned to your specific mindfulness priorities.',
      tone,
      systemPrompt: systemPrompt.trim(),
      focusAreas: focusAreas.length > 0 ? focusAreas : ['General Reflection'],
      createdAt: initialPersona?.createdAt || new Date().toISOString()
    };

    onSavePersona(persona);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" id="custom-persona-modal">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {initialPersona ? 'Edit Custom AI Persona' : 'Create Custom AI Persona'}
              </h2>
              <p className="text-xs text-neutral-400">
                Design a custom reflective voice, specialized lens, and tailored guidance style.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Persona Name & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Persona Name <span className="text-purple-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., The Stoic Strategist"
                className="w-full px-3 py-2 bg-neutral-800/70 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                maxLength={40}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Short Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g., Ancient wisdom meets modern action"
                className="w-full px-3 py-2 bg-neutral-800/70 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                maxLength={60}
              />
            </div>
          </div>

          {/* Tone Archetype Selection */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2">
              Select Tone & Disposition
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_TONES.map((pt) => {
                const Icon = pt.icon;
                const isSelected = tone === pt.label;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setTone(pt.label)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/80 text-white'
                        : 'bg-neutral-800/40 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-purple-500 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{pt.label}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5 leading-tight">{pt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Instructions / Prompt */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Core System Instructions & Philosophical Lens <span className="text-purple-400">*</span>
              </label>
              <span className="text-[10px] text-neutral-400 font-mono">Gemini Persona Prompt</span>
            </div>
            <textarea
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Describe how this persona should analyze your entries, what frameworks it should use (e.g. CBT, Stoicism, First Principles), and what kind of questions it should ask..."
              className="w-full p-3 bg-neutral-800/70 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
            />
          </div>

          {/* Focus Areas & Domains */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Focus Areas & Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={focusAreaInput}
                onChange={(e) => setFocusAreaInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFocusArea();
                  }
                }}
                placeholder="e.g., Deep Work, Anxiety, Stoicism"
                className="flex-1 px-3 py-1.5 bg-neutral-800/70 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleAddFocusArea}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {focusAreas.map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs"
                >
                  <span>{area}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFocusArea(area)}
                    className="hover:text-purple-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-950/50 transition-all active:scale-95 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{initialPersona ? 'Save Changes' : 'Create AI Persona'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
