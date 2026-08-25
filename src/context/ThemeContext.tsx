import React, { createContext, useContext, useState, useEffect } from 'react';
import { JournalThemeId, JournalThemeConfig } from '../types';

export const JOURNAL_THEMES: Record<JournalThemeId, JournalThemeConfig> = {
  twilight: {
    id: 'twilight',
    name: 'Modern Twilight',
    description: 'Deep cosmic slate with vibrant indigo & amethyst accents',
    previewBg: '#090d16',
    previewAccent: '#a855f7',
    classes: {
      bg: 'bg-neutral-950 text-neutral-100',
      card: 'bg-neutral-900/90 border-neutral-800',
      border: 'border-neutral-800',
      accent: 'from-purple-600 to-indigo-600',
      accentHover: 'hover:border-purple-500/50',
      textPrimary: 'text-neutral-100',
      textSecondary: 'text-neutral-400'
    }
  },
  sepia: {
    id: 'sepia',
    name: 'Warm Parchment & Sepia',
    description: 'Nostalgic leather, warm amber tones, and cozy analog study atmosphere',
    previewBg: '#1a1410',
    previewAccent: '#f59e0b',
    classes: {
      bg: 'bg-[#120e0b] text-[#f4ece1]',
      card: 'bg-[#1c1712]/90 border-[#382d23]',
      border: 'border-[#382d23]',
      accent: 'from-amber-600 to-orange-700',
      accentHover: 'hover:border-amber-500/50',
      textPrimary: 'text-[#fbf6ee]',
      textSecondary: 'text-[#c2b29f]'
    }
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Sanctuary',
    description: 'Restorative botanical pine, eucalyptus, and luminous mint highlights',
    previewBg: '#061612',
    previewAccent: '#10b981',
    classes: {
      bg: 'bg-[#061410] text-[#e3f6ee]',
      card: 'bg-[#0c241d]/90 border-[#1a4437]',
      border: 'border-[#1a4437]',
      accent: 'from-emerald-600 to-teal-700',
      accentHover: 'hover:border-emerald-500/50',
      textPrimary: 'text-[#ecfdf5]',
      textSecondary: 'text-[#a7d9c6]'
    }
  },
  rose: {
    id: 'rose',
    name: 'Rose Quartz & Dusk',
    description: 'Subtle plum, serene blush, and soothing emotional grounding palette',
    previewBg: '#170b13',
    previewAccent: '#ec4899',
    classes: {
      bg: 'bg-[#140810] text-[#faedf4]',
      card: 'bg-[#22101b]/90 border-[#47203a]',
      border: 'border-[#47203a]',
      accent: 'from-pink-600 to-rose-700',
      accentHover: 'hover:border-pink-500/50',
      textPrimary: 'text-[#fdf2f8]',
      textSecondary: 'text-[#d8b4cb]'
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Midnight',
    description: 'Deep abyssal navy, electric cyan highlights, and tranquil sea breezes',
    previewBg: '#05121f',
    previewAccent: '#06b6d4',
    classes: {
      bg: 'bg-[#030e1a] text-[#e0f2fe]',
      card: 'bg-[#081a2e]/90 border-[#153456]',
      border: 'border-[#153456]',
      accent: 'from-cyan-600 to-blue-700',
      accentHover: 'hover:border-cyan-500/50',
      textPrimary: 'text-[#f0f9ff]',
      textSecondary: 'text-[#94bbdc]'
    }
  },
  monochrome: {
    id: 'monochrome',
    name: 'Monochrome Minimalist',
    description: 'Pure high-contrast carbon, titanium gray, and editorial clarity',
    previewBg: '#000000',
    previewAccent: '#e5e5e5',
    classes: {
      bg: 'bg-black text-white',
      card: 'bg-neutral-900 border-neutral-800',
      border: 'border-neutral-800',
      accent: 'from-neutral-700 to-neutral-900',
      accentHover: 'hover:border-neutral-500',
      textPrimary: 'text-white',
      textSecondary: 'text-neutral-400'
    }
  }
};

interface ThemeContextType {
  themeId: JournalThemeId;
  theme: JournalThemeConfig;
  setThemeId: (id: JournalThemeId) => void;
  availableThemes: JournalThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<JournalThemeId>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('reflectai_theme');
        if (saved && saved in JOURNAL_THEMES) {
          return saved as JournalThemeId;
        }
      }
    } catch {}
    return 'twilight';
  });

  const setThemeId = (id: JournalThemeId) => {
    setThemeIdState(id);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('reflectai_theme', id);
      }
    } catch {}
  };

  const theme = JOURNAL_THEMES[themeId] || JOURNAL_THEMES.twilight;

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        theme,
        setThemeId,
        availableThemes: Object.values(JOURNAL_THEMES)
      }}
    >
      <div data-theme={themeId} className={`min-h-screen transition-colors duration-300 ${theme.classes.bg}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
};
