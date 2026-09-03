import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Sparkles, Calendar, Quote } from 'lucide-react';

export interface ReflectionQuote {
  dayNumber: number;
  category: string;
  theme: string;
  quote: string;
  description: string;
}

export const SEVEN_DAY_REFLECTION_QUOTES: ReflectionQuote[] = [
  {
    dayNumber: 1,
    category: 'PAUSE',
    theme: 'Pause',
    quote: 'Before you change your life, take a moment to notice the life you are already living.',
    description: 'Slow down and bring your presence to this exact moment.'
  },
  {
    dayNumber: 2,
    category: 'REMEMBER',
    theme: 'Remember',
    quote: 'Your past is not just where you have been; it is evidence of how far you have come.',
    description: 'Honor your journey and the milestones you have surpassed.'
  },
  {
    dayNumber: 3,
    category: 'NOTICE',
    theme: 'Notice',
    quote: 'Patterns often whisper before they become impossible to ignore.',
    description: 'Pay attention to subtle rhythms in your thoughts and energy.'
  },
  {
    dayNumber: 4,
    category: 'UNDERSTAND',
    theme: 'Understand',
    quote: 'Sometimes clarity begins with asking yourself a better question.',
    description: 'Deepen insight through thoughtful inquiry rather than quick answers.'
  },
  {
    dayNumber: 5,
    category: 'LEARN',
    theme: 'Learn',
    quote: 'Every experience leaves something behind. Reflection helps you discover what it taught you.',
    description: 'Transform daily events into lasting personal wisdom.'
  },
  {
    dayNumber: 6,
    category: 'GROW',
    theme: 'Grow',
    quote: 'Growth is not always becoming someone new; sometimes it is finally understanding who you already are.',
    description: 'Embrace self-realization and aligned personal evolution.'
  },
  {
    dayNumber: 7,
    category: 'BEGIN',
    theme: 'Begin',
    quote: 'You do not need to have your whole future figured out. You only need to understand your next step.',
    description: 'Take your next deliberate step with clarity and courage.'
  }
];

/**
 * Calculates the deterministic daily quote index based on the user's local calendar day.
 * Returns an index from 0 to 6 (representing Day 1 to Day 7).
 */
export function getDailyQuoteForDate(targetDate: Date = new Date()): ReflectionQuote {
  // Reference epoch: Jan 1, 2026 in local time
  const referenceEpoch = new Date(2026, 0, 1).getTime();
  const currentMidnight = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  ).getTime();

  const daysElapsed = Math.floor((currentMidnight - referenceEpoch) / (24 * 60 * 60 * 1000));
  // Safe positive modulo 7
  const quoteIndex = ((daysElapsed % 7) + 7) % 7;

  return SEVEN_DAY_REFLECTION_QUOTES[quoteIndex];
}

interface DailyReflectionQuoteProps {
  className?: string;
  showTagline?: boolean;
}

export const DailyReflectionQuote: React.FC<DailyReflectionQuoteProps> = ({
  className = '',
  showTagline = true
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Deterministic quote calculation based on today's local date
  const currentQuote = useMemo(() => {
    return getDailyQuoteForDate();
  }, []);

  return (
    <div
      className={`w-full max-w-xl mx-auto ${className}`}
      aria-label="Daily Reflection Quote"
      role="region"
    >
      {/* Main ReflectAI Tagline */}
      {showTagline && (
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-widest font-mono text-[#76B900] font-semibold flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#76B900]" />
            <span>The adventure of your life starts on a blank page.</span>
          </p>
        </div>
      )}

      {/* Quote Card with subtle entrance transition */}
      <motion.article
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.65,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="relative p-6 sm:p-7 rounded-2xl bg-[#0A0A0A] border border-neutral-800/90 shadow-2xl backdrop-blur-sm text-left group overflow-hidden"
      >
        {/* Subtle Decorative Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#76B900]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-[#FFD600]/5 rounded-full blur-2xl pointer-events-none" />

        {/* Header Metadata: Day Number & Category */}
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold tracking-wider uppercase bg-[#76B900]/15 text-[#76B900] border border-[#76B900]/30">
              <Calendar className="w-3 h-3 text-[#76B900]" />
              DAY {currentQuote.dayNumber} &middot; {currentQuote.category}
            </span>
          </div>

          <span className="text-[11px] font-mono text-neutral-400 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600]" />
            Daily Reflection
          </span>
        </div>

        {/* Quote Content */}
        <div className="relative pl-1 sm:pl-2">
          <Quote className="w-6 h-6 text-neutral-700/80 mb-2 rotate-180" />
          <blockquote className="text-base sm:text-lg font-serif italic leading-relaxed text-[#F5F5F5] tracking-tight">
            &ldquo;{currentQuote.quote}&rdquo;
          </blockquote>
          <p className="mt-3 text-xs text-[#BDBDBD] font-sans leading-relaxed">
            {currentQuote.description}
          </p>
        </div>

        {/* 7-Day Philosophy Track Bar */}
        <div className="mt-6 pt-4 border-t border-neutral-900 flex items-center justify-between gap-1 sm:gap-1.5">
          {SEVEN_DAY_REFLECTION_QUOTES.map((q) => {
            const isActive = q.dayNumber === currentQuote.dayNumber;
            return (
              <div
                key={q.dayNumber}
                className="flex-1 flex flex-col items-center gap-1"
                title={`Day ${q.dayNumber}: ${q.category}`}
              >
                <div
                  className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-[#76B900] shadow-xs shadow-[#76B900]/50'
                      : 'bg-neutral-800'
                  }`}
                />
                <span
                  className={`text-[9px] font-mono uppercase truncate ${
                    isActive ? 'text-[#76B900] font-bold' : 'text-neutral-500'
                  }`}
                >
                  {q.category.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </motion.article>
    </div>
  );
};
