'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  mounted: boolean;
  theme: Theme;
  toggleTheme: () => void;
};

const STORAGE_KEY = 'afm-sea-theme';

const ThemeContext = createContext<ThemeContextValue>({
  mounted: false,
  theme: 'light',
  toggleTheme: () => {},
});

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const stored = localStorage.getItem(STORAGE_KEY);
    const resolved: Theme = stored === 'dark' || stored === 'light' ? stored : media.matches ? 'dark' : 'light';

    setTheme(resolved);
    applyTheme(resolved);
    setMounted(true);

    const handleChange = (event: MediaQueryListEvent) => {
      if (localStorage.getItem(STORAGE_KEY)) {
        return;
      }

      const nextTheme: Theme = event.matches ? 'dark' : 'light';
      setTheme(nextTheme);
      applyTheme(nextTheme);
    };

    media.addEventListener('change', handleChange);

    return () => {
      media.removeEventListener('change', handleChange);
    };
  }, []);

  const value = useMemo(
    () => ({
      mounted,
      theme,
      toggleTheme: () => {
        setTheme((currentTheme) => {
          const nextTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
          localStorage.setItem(STORAGE_KEY, nextTheme);
          applyTheme(nextTheme);
          return nextTheme;
        });
      },
    }),
    [mounted, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
