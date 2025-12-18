'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface VolumeKnobProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  disabled?: boolean;
}

export function VolumeKnob({ value, onChange, label, disabled }: VolumeKnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastAngleRef = useRef<number | null>(null);

  const getAngleFromEvent = useCallback((clientX: number, clientY: number) => {
    if (!knobRef.current) return 0;
    const rect = knobRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
    return angle;
  }, []);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (disabled) return;
    setIsDragging(true);
    lastAngleRef.current = getAngleFromEvent(clientX, clientY);
  }, [disabled, getAngleFromEvent]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || disabled || lastAngleRef.current === null) return;
    
    const currentAngle = getAngleFromEvent(clientX, clientY);
    let deltaAngle = currentAngle - lastAngleRef.current;
    
    // Handle wrap-around at 180/-180 degrees
    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;
    
    // Convert angle delta to value delta (270 degrees = 100 value range)
    const deltaValue = (deltaAngle / 270) * 100;
    const newValue = Math.max(0, Math.min(100, value + deltaValue));
    
    lastAngleRef.current = currentAngle;
    onChange(Math.round(newValue));
  }, [isDragging, disabled, value, onChange, getAngleFromEvent]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    lastAngleRef.current = null;
  }, []);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => handleStart(e.clientX, e.clientY);
  
  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  // Global mouse/touch move and up handlers
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };
    const handleMouseUp = () => handleEnd();
    const handleTouchEnd = () => handleEnd();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  // Calculate rotation based on value (0-100 maps to -135 to 135 degrees)
  const rotation = (value / 100) * 270 - 135;

  return (
    <div 
      className={`flex flex-col items-center gap-2 ${disabled ? 'opacity-50' : ''}`}
    >
      {/* Knob */}
      <div
        ref={knobRef}
        className="radio-knob relative w-16 h-16 cursor-pointer select-none touch-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
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
