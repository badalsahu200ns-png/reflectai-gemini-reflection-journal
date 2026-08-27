import { AIPersona, AIPersonaId } from '../types';

export const AI_PERSONAS: AIPersona[] = [
  {
    id: 'calm_coach',
    name: 'Calm Coach',
    tagline: 'Gentle, grounding, and empathetic',
    description: 'Provides soothing presence, deep emotional validation, and gentle pacing to relieve anxiety and anchor in peace.',
    iconName: 'HeartHandshake',
    tone: 'Compassionate, peaceful, reassuring'
  },
  {
    id: 'socratic',
    name: 'Socratic Guide',
    tagline: 'Inquisitive, philosophical, and thought-provoking',
    description: 'Challenges assumptions gently, illuminates blind spots, and sparks profound self-discovery through open inquiry.',
    iconName: 'HelpCircle',
    tone: 'Introspective, questioning, illuminating'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    tagline: 'Ultra-concise, high clarity, zero fluff',
    description: 'Distills your reflections into sharp, bullet-pointed observations and high-leverage takeaways with maximum economy of words.',
    iconName: 'Minimize2',
    tone: 'Crisp, direct, high-signal'
  },
  {
    id: 'mentor',
    name: 'Strategic Mentor',
    tagline: 'Action-oriented, practical, and growth-focused',
    description: 'Offers structured perspective on career decisions, goal execution, habit design, and strategic resilience.',
    iconName: 'Compass',
    tone: 'Empowering, pragmatic, structured'
  },
  {
    id: 'pattern_finder',
    name: 'Pattern Finder',
    tagline: 'Analytical, timeline-aware, and connecting dots',
    description: 'Detects behavioral loops, emotional cycles, and recurring themes across your past reflections to highlight growth.',
    iconName: 'GitMerge',
    tone: 'Analytical, synthesis-driven, perceptive'
  },
  {
    id: 'balanced',
    name: 'Balanced Reflection',
    tagline: 'Harmonious blend of empathy and wisdom',
    description: 'The standard thoughtful companion blending active listening, psychological insight, and constructive clarity.',
    iconName: 'Sparkles',
    tone: 'Supportive, balanced, mindful'
  }
];

export function getPersonaById(id?: string): AIPersona {
  return AI_PERSONAS.find((p) => p.id === id) || AI_PERSONAS[5];
}
