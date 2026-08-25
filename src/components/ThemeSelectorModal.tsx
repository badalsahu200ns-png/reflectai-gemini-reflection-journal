import React from 'react';
import { motion } from 'motion/react';
import { Palette, Check, X, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { JournalThemeId } from '../types';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { themeId, setThemeId, availableThemes } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 text-white space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Journal Visual Themes</h3>
              <p className="text-xs text-neutral-400">Select an ambient aesthetic tailored for focus and mindful reflection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {availableThemes.map((t) => {
            const isSelected = themeId === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setThemeId(t.id as JournalThemeId)}
                style={{ backgroundColor: t.previewBg }}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 relative overflow-hidden ${
                  isSelected
                    ? 'border-purple-500 ring-2 ring-purple-500/40 shadow-lg'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      style={{ backgroundColor: t.previewAccent }}
                      className="w-3.5 h-3.5 rounded-full shadow-sm"
                    />
                    <span className="text-xs font-bold text-white">{t.name}</span>
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs shadow">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-neutral-300 leading-snug line-clamp-2">
                  {t.description}
                </p>

                <div className="text-[10px] font-mono text-neutral-400 pt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>{isSelected ? 'Active Palette' : 'Click to preview'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-neutral-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition-all"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
