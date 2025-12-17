'use client';

import { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show placeholder before mount to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        className="preset-button text-xs w-10 h-10 flex items-center justify-center"
        aria-label="Toggle theme"
        disabled
      >
        🌓
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="preset-button text-xs w-10 h-10 flex items-center justify-center"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
