'use client';

import { useRef, useState, useCallback } from 'react';

interface VolumeKnobProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  disabled?: boolean;
}

export function VolumeKnob({ value, onChange, label, disabled }: VolumeKnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || disabled) return;
    
    const deltaY = startY - e.clientY;
    const deltaValue = deltaY * 0.5; // Sensitivity
    const newValue = Math.max(0, Math.min(100, startValue + deltaValue));
    
    onChange(Math.round(newValue));
  }, [isDragging, startY, startValue, onChange, disabled]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Calculate rotation based on value (0-100 maps to -135 to 135 degrees)
  const rotation = (value / 100) * 270 - 135;

  return (
    <div 
      className={`flex flex-col items-center gap-2 ${disabled ? 'opacity-50' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Knob */}
      <div
        ref={knobRef}
        className="radio-knob relative w-16 h-16 cursor-pointer select-none"
        onMouseDown={handleMouseDown}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Indicator line */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-4 bg-brass rounded-full" />
        
        {/* Ridges */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-full"
            style={{ transform: `rotate(${i * 30}deg)` }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-cabinet-dark/30" />
          </div>
        ))}
      </div>

      {/* Label */}
      <span className="text-xs font-dial text-dial-cream/70 uppercase tracking-wider">
        {label}
      </span>

      {/* Value indicator arc */}
      <div className="relative w-20 h-2">
        <div className="absolute inset-0 bg-cabinet-dark/50 rounded-full" />
        <div 
          className="absolute left-0 top-0 h-full bg-brass rounded-full transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
