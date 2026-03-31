"use client";

import { useState, useEffect } from 'react';

export type TimeTheme = 'pagi' | 'siang' | 'sore' | 'malam';

/**
 * Detects current Indonesia time (WIB = UTC+7) and returns the active theme.
 * Automatically switches based on the time of day.
 * Updates every 60 seconds.
 */
export function useTimeTheme(): TimeTheme {
  // Initial state uses a safe default to avoid server/client hydration mismatch
  const [theme, setTheme] = useState<TimeTheme>('sore');

  useEffect(() => {
    const updateTheme = () => {
      setTheme(getThemeForCurrentTime());
    };

    // Run immediately on mount (client-side)
    updateTheme();

    // Check every 60 seconds for time-based updates
    const interval = setInterval(updateTheme, 60000);

    return () => clearInterval(interval);
  }, []);

  return theme;
}

function getThemeForCurrentTime(): TimeTheme {
  // Get current hour in WIB (Asia/Jakarta = UTC+7)
  const now = new Date();
  const wibTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
  const hour = wibTime.getHours();

  if (hour >= 5 && hour < 11) return 'pagi';
  if (hour >= 11 && hour < 15) return 'siang';
  if (hour >= 15 && hour < 18) return 'sore';
  return 'malam'; // 18-04
}
