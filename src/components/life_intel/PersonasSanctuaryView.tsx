import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Heart,
  Shield,
  Zap,
  Target,
  Plus,
  MessageSquare,
  RefreshCw,
  Send,
  UserCheck,
  Check,
  Flame,
  Award
} from 'lucide-react';
import { CustomAIPersona, JournalEntry, AIMemory } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface PersonasSanctuaryViewProps {
  entries: JournalEntry[];
  memories: AIMemory[];
}

export const PersonasSanctuaryView: React.FC<PersonasSanctuaryViewProps> = ({
  entries,
  memories
}) => {
  const { user } = useAuth();

  const [personas, setPersonas] = useState<CustomAIPersona[]>([
    {
      id: 'persona-compassionate',
      userId: user?.uid || 'default',
      name: 'Compassionate Mirror',
      tagline: 'Warm, non-judgmental empathy and emotional validation',
      description: 'Reflects your feelings with tender understanding, helping calm self-criticism.',
      systemInstruction: 'You are a warm, deeply empathetic companion. Listen with compassion and zero judgment.',
      tone: 'Empathetic & Nurturing',
      iconName: 'Heart',
      isCustom: false,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'persona-socratic',
      userId: user?.uid || 'default',
      name: 'Socratic Inquirer',
      tagline: 'Thought-provoking questions to challenge assumptions',
      description: 'Asks incisive questions to reveal underlying beliefs and illuminate blind spots.',
      systemInstruction: 'You are a gentle Socratic philosopher who helps the user discover their own truth through inquiry.',
      tone: 'Curious & Analytical',
      iconName: 'Brain',
      isCustom: false,
      isActive: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'persona-stoic',
      userId: user?.uid || 'default',
      name: 'Stoic Strategist',
      tagline: 'Focus on what you can control with practical resilience',
      description: 'Helps distinguish between what is in your power and what to let go.',
      systemInstruction: 'You are a wise Stoic philosopher applying ancient wisdom to modern frictions.',
      tone: 'Grounded & Stoic',
      iconName: 'Shield',
      isCustom: false,
      isActive: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'persona-growth',
      userId: user?.uid || 'default',
      name: 'Growth Catalyst',
      tagline: 'Action-oriented coaching to turn lessons into momentum',
      description: 'Focuses on actionable habits, systems, and disciplined execution.',
      systemInstruction: 'You are an energetic, practical growth coach who loves turning insights into clear daily systems.',
      tone: 'Motivating & Systematic',
      iconName: 'Zap',
      isCustom: false,
      isActive: false,
      createdAt: new Date().toISOString()
    }
  ]);

  const [activePersonaId, setActivePersonaId] = useState<string>('persona-compassionate');
  const [testInput, setTestInput] = useState('');
  const [testConversation, setTestConversation] = useState<{ sender: 'user' | 'persona'; text: string }[]>([]);
  const [isResponding, setIsResponding] = useState(false);

  // New Persona Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newInstruction, setNewInstruction] = useState('');
  const [newTone, setNewTone] = useState('');

  const activePersona = personas.find((p) => p.id === activePersonaId) || personas[0];

  const handleSelectPersona = (id: string) => {
    setActivePersonaId(id);
    setTestConversation([]);
  };

  const handleSendMessage = async () => {
    if (!testInput.trim() || isResponding) return;
    const userMsg = testInput.trim();
    setTestInput('');
    setTestConversation((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setIsResponding(true);

    try {
      const res = await fetch('/api/ai/ask-journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `[Responding as ${activePersona.name} with tone ${activePersona.tone}]: ${userMsg}`,
          entries,
          memories,
          conversationHistory: testConversation
        })
      });

      if (!res.ok) throw new Error('Response failed');
      const data = await res.json();
      const reply = data.answer || 'Thank you for sharing your thoughts with me.';
      setTestConversation((prev) => [...prev, { sender: 'persona', text: reply }]);
    } catch {
      setTestConversation((prev) => [
        ...prev,
        { sender: 'persona', text: 'I am here with you. How can we explore this further?' }
      ]);
    } finally {
      setIsResponding(false);
    }
  };

  const handleCreateCustomPersona = () => {
    if (!newName.trim()) return;
    const created: CustomAIPersona = {
      id: `custom-persona-${Date.now()}`,
      userId: user?.uid || 'default',
      name: newName.trim(),
      tagline: newTagline.trim() || 'Custom AI Persona',
      description: newDescription.trim() || 'Custom reflection guide',
      systemInstruction: newInstruction.trim() || 'Be helpful and thoughtful.',
      tone: newTone.trim() || 'Reflective',
      iconName: 'Sparkles',
      isCustom: true,
      isActive: false,
      createdAt: new Date().toISOString()
    };

    setPersonas((prev) => [...prev, created]);
    setActivePersonaId(created.id);
    setIsModalOpen(false);
    setNewName('');
    setNewTagline('');
    setNewDescription('');
    setNewInstruction('');
    setNewTone('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-6 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#76B900]/10 text-[#76B900] border border-[#76B900]/20">
                Cognitive Perspectives
              </span>
              <span className="text-xs text-neutral-500 font-mono">Conversational Mirrors</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              AI Personas Sanctuary
            </h2>
            <p className="text-sm text-neutral-400 max-w-2xl">
              Choose or craft distinct AI companion perspectives to reflect on your journal entries with diverse emotional and philosophical lenses.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181B1E] hover:bg-[#22272B] border border-[#1F2428] text-xs font-bold text-neutral-200 transition-all shrink-0"
          >
            <Plus className="w-4 h-4 text-[#76B900]" />
            <span>Create Custom Persona</span>
          </button>
        </div>
      </div>

      {/* Personas Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {personas.map((p) => {
          const isSel = p.id === activePersonaId;
          return (
            <button
              key={p.id}
              onClick={() => handleSelectPersona(p.id)}
              className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between min-h-[140px] ${
                isSel
                  ? 'bg-[#181B1E] border-[#76B900] shadow-[0_0_15px_rgba(118,185,0,0.15)] ring-1 ring-[#76B900]/50'
                  : 'bg-[#121517] border-[#1F2428] hover:border-neutral-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#76B900] px-2 py-0.5 rounded bg-[#76B900]/10">
                    {p.tone}
                  </span>
                  {isSel && <Check className="w-4 h-4 text-[#76B900]" />}
                </div>
                <h4 className="text-sm font-bold text-white">{p.name}</h4>
                <p className="text-xs text-neutral-400 line-clamp-2">{p.tagline}</p>
              </div>

              <div className="pt-2 text-[11px] text-neutral-500 font-mono flex items-center justify-between">
                <span>{p.isCustom ? 'Custom' : 'Preset'}</span>
                <span className={isSel ? 'text-[#76B900] font-bold' : ''}>{isSel ? 'Active Lens' : 'Select'}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Persona Reflection Workbench */}
      <div className="bg-[#121517] border border-[#1F2428] rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-[#1F2428]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#76B900]" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Reflecting with {activePersona.name}
              </h3>
            </div>
            <p className="text-xs text-neutral-400">{activePersona.description}</p>
          </div>
          <span className="text-xs font-mono text-neutral-500 bg-[#0B0D0E] px-3 py-1.5 rounded-lg border border-[#1F2428]">
            Tone: {activePersona.tone}
          </span>
        </div>

        {/* Conversation Stream */}
        <div className="min-h-[220px] max-h-[360px] overflow-y-auto space-y-3 p-4 rounded-xl bg-[#0B0D0E] border border-[#1F2428]">
          {testConversation.length === 0 && (
            <div className="h-44 flex flex-col items-center justify-center text-center text-neutral-500 space-y-2">
              <MessageSquare className="w-6 h-6 text-neutral-600" />
              <p className="text-xs">
                Share a thought, dilemma, or question with <strong className="text-white">{activePersona.name}</strong>.
              </p>
            </div>
          )}

          {testConversation.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <span className="text-[10px] font-mono text-neutral-500 mb-1">
                {msg.sender === 'user' ? 'You' : activePersona.name}
              </span>
              <div
                className={`p-3.5 rounded-xl max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#76B900] text-black font-medium'
                    : 'bg-[#181B1E] border border-[#1F2428] text-neutral-200'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isResponding && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono py-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#76B900]" />
              <span>{activePersona.name} is reflecting...</span>
            </div>
          )}
        </div>

        {/* Input Controls */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Talk to ${activePersona.name}...`}
            className="flex-1 bg-[#0B0D0E] border border-[#1F2428] focus:border-[#76B900] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!testInput.trim() || isResponding}
            className="p-2.5 rounded-xl bg-[#76B900] hover:bg-[#8FE000] text-black transition-all active:scale-95 disabled:opacity-50 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Create Custom Persona Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121517] border border-[#1F2428] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Create Custom AI Persona</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-neutral-300 font-bold">Persona Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Tough Love Mentor, Creative Muse, Mindful Anchor"
                  className="w-full bg-[#0B0D0E] border border-[#1F2428] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-300 font-bold">Tagline</label>
                <input
                  type="text"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  placeholder="e.g. Direct, honest feedback with zero sugarcoating"
                  className="w-full bg-[#0B0D0E] border border-[#1F2428] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-300 font-bold">Tone Description</label>
                <input
                  type="text"
                  value={newTone}
                  onChange={(e) => setNewTone(e.target.value)}
                  placeholder="e.g. Candid & Direct, Gentle & Poetic"
                  className="w-full bg-[#0B0D0E] border border-[#1F2428] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-300 font-bold">System Instruction</label>
                <textarea
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  placeholder="How should this persona interpret and respond to the user's journal entries?"
                  rows={3}
                  className="w-full bg-[#0B0D0E] border border-[#1F2428] rounded-xl p-3 text-xs text-white outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1F2428]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#181B1E] text-neutral-400 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomPersona}
                disabled={!newName.trim()}
                className="px-4 py-2 rounded-xl bg-[#76B900] text-black text-xs font-bold disabled:opacity-50"
              >
                Create Persona
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
