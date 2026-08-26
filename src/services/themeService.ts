import { useState, useEffect } from 'react';

export type ThemeMode = 'dark';

export function getInitialTheme(): ThemeMode {
  return 'dark';
}

export function applyThemeToDOM(_theme: ThemeMode = 'dark') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.add('theme-dark');
  root.classList.add('dark');
  root.classList.remove('theme-light');
  try {
    localStorage.setItem('ppokae_theme_mode', 'dark');
  } catch {}
}

export function useTheme() {
  const [theme] = useState<ThemeMode>('dark');

  useEffect(() => {
    applyThemeToDOM('dark');
  }, []);

  const toggleTheme = () => {
    // 🔒 Permanent Dark Mode Enforced
    applyThemeToDOM('dark');
  };

  return { theme: 'dark' as const, toggleTheme, isLight: false };
}
