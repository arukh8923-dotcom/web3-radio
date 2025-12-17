'use client';

import { useRef, useState } from 'react';

interface PresetButtonsProps {
  onSelect: (preset: number) => void;
  onLongPress?: (preset: number) => void;
  activePreset?: number;
}

export function PresetButtons({ onSelect, onLongPress, activePreset }: PresetButtonsProps) {
  const presets = [1, 2, 3, 4, 5, 6];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [pressing, setPressing] = useState<number | null>(null);

  const handleMouseDown = (preset: number) => {
    setPressing(preset);
    timerRef.current = setTimeout(() => {
      if (onLongPress) {
        onLongPress(preset);
        setPressing(null);
      }
    }, 800); // Long press = 800ms
  };

  const handleMouseUp = (preset: number) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (pressing === preset) {
      onSelect(preset);
    }
    setPressing(null);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPressing(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            onMouseDown={() => handleMouseDown(preset)}
            onMouseUp={() => handleMouseUp(preset)}
            onMouseLeave={handleMouseLeave}
            onTouchStart={() => handleMouseDown(preset)}
            onTouchEnd={() => handleMouseUp(preset)}
            className={`
              preset-button w-12 h-10 flex items-center justify-center
              ${activePreset === preset ? 'bg-brass text-cabinet-dark' : 'text-dial-cream'}
              ${pressing === preset ? 'scale-95 bg-brass/50' : ''}
              transition-all duration-150
            `}
          >
            {preset}
          </button>
        ))}
      </div>
      <p className="text-dial-cream/40 text-xs text-center">
        Tap to load • Hold to save
      </p>
    </div>
  );
}
