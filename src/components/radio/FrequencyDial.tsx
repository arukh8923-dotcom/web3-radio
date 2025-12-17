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
    <div className={`relative bg-dial-cream rounded-lg p-4 ${disabled ? 'opacity-50' : ''}`}>
      {/* Draggable Frequency Scale Area - only this area responds to drag */}
      <div 
        ref={dialRef}
        className="relative h-16 cursor-ew-resize select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={(e) => {
          setIsDragging(true);
          handleDrag(e.touches[0].clientX);
        }}
        onTouchMove={(e) => {
          if (isDragging) handleDrag(e.touches[0].clientX);
        }}
        onTouchEnd={() => setIsDragging(false)}
      >
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
          className="absolute top-0 w-0.5 h-8 bg-tuning-red transition-all duration-100 pointer-events-none"
          style={{ left: `${Math.max(0, Math.min(100, indicatorPosition))}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-tuning-red rotate-45" />
        </div>

        {/* Band Labels */}
        <div className="absolute bottom-0 inset-x-0 flex justify-around text-xs text-dial-dark/60 font-dial pointer-events-none">
          <span>MUSIC</span>
          <span>TALK</span>
          <span>NEWS</span>
          <span>AMBIENT</span>
        </div>
      </div>

      {/* Current Frequency Display + Input - separate from drag area */}
      <div className="text-center mt-4">
        <span className="nixie-tube text-3xl">{formatFrequency(frequency)}</span>
        
        {/* Manual Frequency Input with +/- buttons */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const newFreq = Math.max(88.0, frequency - FREQUENCY_STEP);
              onChange(Math.round(newFreq * 10) / 10);
            }}
            disabled={disabled || frequency <= 88.0}
            className="w-8 h-8 flex items-center justify-center text-lg font-bold bg-dial-dark text-dial-cream border border-brass/50 rounded hover:bg-brass/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            −
          </button>
          <input
            type="number"
            min={88.0}
            max={108.0}
            step={0.1}
            value={frequency}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val) && val >= 88.0 && val <= 108.0) {
                const snapped = Math.round(val / FREQUENCY_STEP) * FREQUENCY_STEP;
                onChange(snapped);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={disabled}
            className="w-20 px-2 py-1 text-center text-sm font-dial bg-dial-dark text-dial-cream border border-brass/50 rounded focus:outline-none focus:border-brass disabled:opacity-50"
            placeholder="FM"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              const newFreq = Math.min(108.0, frequency + FREQUENCY_STEP);
              onChange(Math.round(newFreq * 10) / 10);
            }}
            disabled={disabled || frequency >= 108.0}
            className="w-8 h-8 flex items-center justify-center text-lg font-bold bg-dial-dark text-dial-cream border border-brass/50 rounded hover:bg-brass/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
          <span className="text-dial-dark text-sm font-dial">FM</span>
        </div>
      </div>

      {/* 420 Zone Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onChange(420.0);
        }}
        className="absolute right-2 top-2 px-2 py-1 text-xs font-dial bg-zone-420 text-white rounded hover:bg-zone-420-light transition-colors"
        disabled={disabled}
      >
        420
      </button>
    </div>
  );
}
