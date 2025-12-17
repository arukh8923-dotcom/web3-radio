'use client';

import { useRef, useState, useCallback } from 'react';
import { FREQUENCY_BANDS, FREQUENCY_STEP, formatFrequency } from '@/constants/frequencies';

interface FrequencyDialProps {
  frequency: number;
  onChange: (frequency: number) => void;
  disabled?: boolean;
}

export function FrequencyDial({ frequency, onChange, disabled }: FrequencyDialProps) {
  const dialRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((clientX: number) => {
    if (!dialRef.current || disabled) return;
    
    const rect = dialRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    
    // Map to frequency range (88.0 - 108.0 for main bands, 420.0 for special)
    const minFreq = 88.0;
    const maxFreq = 108.0;
    const newFreq = minFreq + (percentage * (maxFreq - minFreq));
    const snappedFreq = Math.round(newFreq / FREQUENCY_STEP) * FREQUENCY_STEP;
    
    onChange(snappedFreq);
  }, [onChange, disabled]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleDrag(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleDrag(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Calculate indicator position
  const minFreq = 88.0;
  const maxFreq = 108.0;
  const indicatorPosition = ((frequency - minFreq) / (maxFreq - minFreq)) * 100;

  return (
    <div 
      className={`relative bg-dial-cream rounded-lg p-4 ${disabled ? 'opacity-50' : ''}`}
      ref={dialRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Frequency Scale */}
      <div className="relative h-16">
        {/* Scale markings */}
        <div className="absolute inset-x-0 top-0 flex justify-between px-2">
          {[88, 92, 96, 100, 104, 108].map((freq) => (
            <div key={freq} className="flex flex-col items-center">
              <div className="w-0.5 h-3 bg-dial-dark" />
              <span className="text-xs font-dial text-dial-dark mt-1">{freq}</span>
            </div>
          ))}
        </div>

        {/* Tuning Indicator */}
        <div 
          className="absolute top-0 w-0.5 h-8 bg-tuning-red transition-all duration-100"
          style={{ left: `${Math.max(0, Math.min(100, indicatorPosition))}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-tuning-red rotate-45" />
        </div>

        {/* Band Labels */}
        <div className="absolute bottom-0 inset-x-0 flex justify-around text-xs text-dial-dark/60 font-dial">
          <span>MUSIC</span>
          <span>TALK</span>
          <span>NEWS</span>
          <span>AMBIENT</span>
        </div>
      </div>

      {/* Current Frequency Display */}
      <div className="text-center mt-4">
        <span className="nixie-tube text-3xl">{formatFrequency(frequency)}</span>
      </div>

      {/* 420 Zone Button */}
      <button
        onClick={() => onChange(420.0)}
        className="absolute right-2 top-2 px-2 py-1 text-xs font-dial bg-zone-420 text-white rounded hover:bg-zone-420-light transition-colors"
        disabled={disabled}
      >
        420
      </button>
    </div>
  );
}
