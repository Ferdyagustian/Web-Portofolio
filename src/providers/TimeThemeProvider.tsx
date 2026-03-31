"use client";

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useTimeTheme, TimeTheme } from '../lib/useTimeTheme';

const ThemeContext = createContext<TimeTheme>('sore');

export function useTheme(): TimeTheme {
  return useContext(ThemeContext);
}

export default function TimeThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTimeTheme();

  // Apply CSS class to <html> element for CSS variable overrides
  useEffect(() => {
    const html = document.documentElement;
    // Remove all theme classes
    html.classList.remove('theme-pagi', 'theme-siang', 'theme-sore', 'theme-malam');
    // Add current theme class
    html.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}
