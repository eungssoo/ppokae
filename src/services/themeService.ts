import { useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light';

const THEME_STORAGE_KEY = 'ppokae_theme_mode';

export function getInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {}
  return 'dark';
}

export function applyThemeToDOM(theme: ThemeMode) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.add('theme-light');
    root.classList.remove('theme-dark');
  } else {
    root.classList.add('theme-dark');
    root.classList.remove('theme-light');
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const initial = getInitialTheme();
    applyThemeToDOM(initial);
    return initial;
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {}
      applyThemeToDOM(next);
      return next;
    });
  };

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  return { theme, toggleTheme, isLight: theme === 'light' };
}
