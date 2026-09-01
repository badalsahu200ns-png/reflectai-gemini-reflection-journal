import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Palette,
  Check,
  X,
  Moon,
  Sun,
  Monitor,
  Sparkles,
  Eye,
  CheckCircle2,
  Heart,
  Compass,
  ArrowRight
} from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { JournalThemeId } from '../types';
import {
  JOURNAL_THEMES,
  CORE_JOURNAL_THEME_IDS,
  JournalThemeDefinition
} from '../utils/journalThemes';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstTime?: boolean;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  isFirstTime = false
}) => {
  const {
    mode,
    setMode,
    isDark,
    toggleTheme,
    journalTheme,
    setJournalTheme,
    aiSuggestedTheme,
    dismissAiSuggestion,
    applyAiSuggestion
  } = useTheme();

  // Temporary preview theme for interactive testing before committing
  const [previewThemeId, setPreviewThemeId] = useState<JournalThemeId>(journalTheme);
  const [activePreviewMode, setActivePreviewMode] = useState<'preview' | 'applied'>('applied');

  if (!isOpen) return null;

  const currentActivePreview = JOURNAL_THEMES[previewThemeId] || JOURNAL_THEMES['sakura-breeze'];
  const previewColors = isDark ? currentActivePreview.dark : currentActivePreview.light;

  const handleSelectAndApply = (id: JournalThemeId) => {
    setPreviewThemeId(id);
    setJournalTheme(id);
    setActivePreviewMode('applied');
  };

  const handleApplyCurrentPreview = () => {
    setJournalTheme(previewThemeId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-3xl rounded-3xl bg-neutral-900/95 border border-neutral-800 shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-white overflow-hidden my-auto"
        id="modal-theme-selector"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500/20 to-violet-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {isFirstTime ? 'Choose your journal atmosphere' : 'Journal Writing-Pad Themes'}
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30">
                  5 Premium Spaces
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                {isFirstTime
                  ? 'Which space feels most like you? Personalize your diary paper & writing atmosphere.'
                  : 'Transform your writing pad, ambient decorations, and reflection panel.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Light/Dark toggle in modal */}
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-neutral-700/60 transition-colors"
              title={isDark ? 'Switch to Light Mode view' : 'Switch to Dark Mode view'}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light View</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-violet-400" />
                  <span className="hidden sm:inline">Dark View</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Theme Suggestion Banner */}
        {aiSuggestedTheme && (
          <div className="mx-6 mt-5 p-3.5 rounded-2xl bg-gradient-to-r from-pink-950/40 via-violet-950/30 to-neutral-900 border border-pink-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-pink-200 flex items-center gap-1.5">
                  ReflectAI Suggestion: {JOURNAL_THEMES[aiSuggestedTheme.themeId]?.name || 'Sakura Breeze'}
                </p>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  "{aiSuggestedTheme.reason}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => {
                  handleSelectAndApply(aiSuggestedTheme.themeId);
                  dismissAiSuggestion();
                }}
                className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all shadow-xs"
              >
                Try this theme
              </button>
              <button
                onClick={dismissAiSuggestion}
                className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-xs font-medium transition-colors"
              >
                Keep current
              </button>
            </div>
          </div>
        )}

        {/* Theme Cards Grid */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CORE_JOURNAL_THEME_IDS.map((themeKey) => {
              const theme = JOURNAL_THEMES[themeKey];
              const isSelected = journalTheme === theme.id;
              const isPreviewing = previewThemeId === theme.id;
              const tColors = isDark ? theme.dark : theme.light;

              return (
                <div
                  key={theme.id}
                  onClick={() => {
                    setPreviewThemeId(theme.id);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden ${
                    isSelected
                      ? 'border-pink-500 ring-2 ring-pink-500/40 bg-neutral-800/80 shadow-[0_8px_25px_rgba(236,72,153,0.15)]'
                      : isPreviewing
                      ? 'border-violet-400/80 bg-neutral-800/60 ring-1 ring-violet-400/40'
                      : 'border-neutral-800 bg-neutral-950/50 hover:border-neutral-700 hover:bg-neutral-800/40'
                  }`}
                  id={`theme-card-${theme.id}`}
                >
                  {/* Active Selected Badge */}
                  {isSelected && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                      Active
                    </span>
                  )}

                  {/* Header info */}
                  <div className="flex items-start gap-3">
                    <div className="text-2xl p-2 rounded-xl bg-neutral-900/90 border border-neutral-800 shrink-0">
                      {theme.emoji}
                    </div>
                    <div className="space-y-1 pr-14">
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {theme.name}
                      </h3>
                      <p className="text-[11px] font-medium text-pink-300">
                        {theme.atmosphere}
                      </p>
                      <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                        {theme.description}
                      </p>
                    </div>
                  </div>

                  {/* Miniature Writing-Pad Live Simulation */}
                  <div className="p-3 rounded-xl border border-neutral-800/80 bg-neutral-900/90 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-neutral-400">
                      <span className="font-semibold uppercase tracking-wider text-[9px] text-neutral-500">
                        Writing Pad Preview ({isDark ? 'Dark' : 'Light'})
                      </span>
                      {/* Swatches */}
                      <div className="flex items-center gap-1">
                        {theme.swatches.slice(0, 4).map((c, i) => (
                          <span
                            key={i}
                            className="w-2.5 h-2.5 rounded-full border border-black/30 shadow-xs inline-block"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Paper Mockup */}
                    <div
                      className={`p-2.5 rounded-lg border ${tColors.writingPadBg} ${tColors.writingPadBorder} ${tColors.writingPadShadow} space-y-1.5 transition-colors duration-200`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`h-2 rounded-full w-24 ${
                            isDark ? 'bg-white/20' : 'bg-neutral-900/20'
                          }`}
                        />
                        <div
                          className="h-1.5 rounded-full w-8"
                          style={{ backgroundColor: tColors.accentColor }}
                        />
                      </div>
                      <div className="space-y-1 pt-0.5">
                        <div
                          className={`h-1.5 rounded-full w-full ${
                            isDark ? 'bg-white/10' : 'bg-neutral-900/10'
                          }`}
                        />
                        <div
                          className={`h-1.5 rounded-full w-4/5 ${
                            isDark ? 'bg-white/10' : 'bg-neutral-900/10'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-neutral-500 italic">
                      Mood: {theme.mood.split(',')[0]}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAndApply(theme.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-neutral-800 text-neutral-400 cursor-default'
                            : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-xs'
                        }`}
                      >
                        {isSelected ? 'Applied' : 'Apply Theme'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-neutral-400 text-center sm:text-left">
            <span>Active Atmosphere: </span>
            <strong className="text-white font-semibold">
              {JOURNAL_THEMES[journalTheme]?.emoji} {JOURNAL_THEMES[journalTheme]?.name}
            </strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {isFirstTime && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
              >
                Keep default theme
              </button>
            )}

            <button
              type="button"
              onClick={handleApplyCurrentPreview}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white text-xs font-bold shadow-md transition-all active:scale-[0.98]"
            >
              Done & Save Atmosphere
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
