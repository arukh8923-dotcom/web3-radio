'use client';

import { useState, useEffect } from 'react';

interface StereoToggleProps {
  onChange?: (mode: 'stereo' | 'mono') => void;
  disabled?: boolean;
}

export function StereoToggle({ onChange, disabled }: StereoToggleProps) {
  const [mode, setMode] = useState<'stereo' | 'mono'>('stereo');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('web3radio-audio-mode');
    if (saved === 'mono' || saved === 'stereo') {
      setMode(saved);
    }
  }, []);

  const toggleMode = () => {
    const newMode = mode === 'stereo' ? 'mono' : 'stereo';
    setMode(newMode);
    localStorage.setItem('web3radio-audio-mode', newMode);
    onChange?.(newMode);
  };

  return (
    <button
      onClick={toggleMode}
      disabled={disabled}
      className={`preset-button text-xs flex items-center gap-1.5 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      title={`Audio Mode: ${mode}`}
    >
      {mode === 'stereo' ? (
        <>
          <span className="flex gap-0.5">
            <span className="w-1.5 h-3 bg-brass rounded-sm" />
            <span className="w-1.5 h-3 bg-brass rounded-sm" />
          </span>
          <span>STEREO</span>
        </>
      ) : (
        <>
          <span className="w-3 h-3 bg-brass rounded-full" />
          <span>MONO</span>
        </>
      )}
    </button>
  );
}
