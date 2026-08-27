import React from 'react';
import { motion } from 'motion/react';
import { Palette, Check, X, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { mode, setMode, isDark } = useTheme();

  if (!isOpen) return null;

  const themes = [
    { id: 'dark' as ThemeMode, name: 'Dark Serenade', desc: 'Deep neutral dark palette designed for low-light focus and comfort.', icon: Moon },
    { id: 'light' as ThemeMode, name: 'Quiet Light', desc: 'Soft off-white canvas with sharp typography and high legibility.', icon: Sun },
    { id: 'system' as ThemeMode, name: 'System Synchronized', desc: 'Automatically adapt to your operating system appearance preference.', icon: Monitor }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 text-white space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Appearance & Themes</h3>
              <p className="text-xs text-neutral-400">Choose your reflection workspace atmosphere</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {themes.map((t) => {
            const Icon = t.icon;
            const isSelected = mode === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setMode(t.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                    : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-neutral-800 text-neutral-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{t.name}</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{t.desc}</p>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-1" />}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-neutral-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
