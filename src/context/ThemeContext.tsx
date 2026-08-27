import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
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

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
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

  const toggleTheme = () => {
    setMode(isDark ? 'light' : 'dark');
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

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDark,
        setMode,
        toggleTheme
      }}
    >
      <div className={`min-h-screen transition-colors duration-200 font-sans ${isDark ? 'dark bg-neutral-950 text-neutral-100' : 'light bg-neutral-50 text-neutral-900'}`}>
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
