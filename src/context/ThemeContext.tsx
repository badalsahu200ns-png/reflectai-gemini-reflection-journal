import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { JournalThemeId } from '../types';
import {
  JOURNAL_THEMES,
  JournalThemeDefinition,
  ThemeColors,
  getJournalTheme,
  CORE_JOURNAL_THEME_IDS
} from '../utils/journalThemes';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  // Journal Writing Pad Theme
  journalTheme: JournalThemeId;
  setJournalTheme: (theme: JournalThemeId) => void;
  currentTheme: JournalThemeDefinition;
  tColors: ThemeColors;
  prefersReducedMotion: boolean;
  // First-time experience & Atmosphere modal
  isAtmosphereModalOpen: boolean;
  openAtmosphereModal: () => void;
  closeAtmosphereModal: () => void;
  // AI theme suggestion
  aiSuggestedTheme: { themeId: JournalThemeId; reason: string } | null;
  dismissAiSuggestion: () => void;
  applyAiSuggestion: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('reflectai_theme_mode');
        if (saved === 'dark' || saved === 'light' || saved === 'system') {
          return saved as ThemeMode;
        }
      }
    } catch {}
    return 'dark';
  });

  const [journalTheme, setJournalThemeState] = useState<JournalThemeId>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('reflectai_journal_theme');
        if (saved && JOURNAL_THEMES[saved as JournalThemeId]) {
          return saved as JournalThemeId;
        }
      }
    } catch {}
    return 'sakura-breeze';
  });

  const [isAtmosphereModalOpen, setIsAtmosphereModalOpen] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const hasSeen = window.localStorage.getItem('reflectai_first_time_atmosphere_seen');
        return !hasSeen; // open on first time
      }
    } catch {}
    return false;
  });

  const [aiSuggestedTheme, setAiSuggestedTheme] = useState<{
    themeId: JournalThemeId;
    reason: string;
  } | null>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const dismissed = window.localStorage.getItem('reflectai_dismissed_ai_theme_v1');
        if (dismissed) return null;
      }
    } catch {}
    return {
      themeId: 'sakura-breeze',
      reason: 'Your recent reflections touch upon growth, new chapters, and hopeful beginnings.'
    };
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Listen to OS color scheme and reduced-motion changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const darkHandler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    darkQuery.addEventListener('change', darkHandler);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motionHandler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', motionHandler);

    return () => {
      darkQuery.removeEventListener('change', darkHandler);
      motionQuery.removeEventListener('change', motionHandler);
    };
  }, []);

  const isDark = mode === 'system' ? systemIsDark : mode === 'dark';

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('reflectai_theme_mode', newMode);
      }
    } catch {}
  };

  const setJournalTheme = (newTheme: JournalThemeId) => {
    setJournalThemeState(newTheme);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('reflectai_journal_theme', newTheme);
      }
    } catch {}
  };

  const toggleTheme = () => {
    setMode(isDark ? 'light' : 'dark');
  };

  const openAtmosphereModal = () => setIsAtmosphereModalOpen(true);
  const closeAtmosphereModal = () => {
    setIsAtmosphereModalOpen(false);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('reflectai_first_time_atmosphere_seen', 'true');
      }
    } catch {}
  };

  const dismissAiSuggestion = () => {
    setAiSuggestedTheme(null);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('reflectai_dismissed_ai_theme_v1', 'true');
      }
    } catch {}
  };

  const applyAiSuggestion = () => {
    if (aiSuggestedTheme) {
      setJournalTheme(aiSuggestedTheme.themeId);
      dismissAiSuggestion();
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [isDark]);

  const currentTheme = useMemo(() => {
    return getJournalTheme(journalTheme);
  }, [journalTheme]);

  const tColors = useMemo(() => {
    return isDark ? currentTheme.dark : currentTheme.light;
  }, [isDark, currentTheme]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDark,
        setMode,
        toggleTheme,
        journalTheme,
        setJournalTheme,
        currentTheme,
        tColors,
        prefersReducedMotion,
        isAtmosphereModalOpen,
        openAtmosphereModal,
        closeAtmosphereModal,
        aiSuggestedTheme,
        dismissAiSuggestion,
        applyAiSuggestion
      }}
    >
      <div
        className="min-h-screen transition-colors duration-300 font-sans bg-[#000000] text-[#F5F5F5] selection:bg-[#76B900]/30 selection:text-[#76B900]"
      >
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
