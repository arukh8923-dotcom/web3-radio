'use client';

import { useState, useEffect, useRef } from 'react';

interface SleepTimerProps {
  onSleep: () => void;
}

const TIMER_OPTIONS = [
  { minutes: 5, label: '5 min' },
  { minutes: 15, label: '15 min' },
  { minutes: 30, label: '30 min' },
  { minutes: 60, label: '1 hour' },
];

export function SleepTimer({ onSleep }: SleepTimerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update countdown
  useEffect(() => {
    if (!endTime) {
      setRemaining(0);
      return;
    }

    const updateRemaining = () => {
      const now = Date.now();
      const diff = endTime - now;
      
      if (diff <= 0) {
        setEndTime(null);
        setRemaining(0);
        onSleep();
        return;
      }
      
      setRemaining(Math.ceil(diff / 1000));
    };

    updateRemaining();
    intervalRef.current = setInterval(updateRemaining, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [endTime, onSleep]);

  const setTimer = (minutes: number) => {
    setEndTime(Date.now() + minutes * 60 * 1000);
    setIsOpen(false);
  };

  const cancelTimer = () => {
    setEndTime(null);
    setIsOpen(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`preset-button text-xs ${endTime ? 'bg-brass/30' : ''}`}
        title="Sleep Timer"
      >
        {endTime ? `😴 ${formatTime(remaining)}` : '😴 SLEEP'}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 bottom-full mb-2 bg-cabinet-dark border border-brass rounded-lg shadow-xl z-50 min-w-[150px]">
            <p className="px-3 py-2 text-dial-cream/60 text-xs border-b border-brass/30">
              Sleep Timer
            </p>
            {TIMER_OPTIONS.map((option) => (
              <button
                key={option.minutes}
                onClick={() => setTimer(option.minutes)}
                className="w-full px-3 py-2 text-left text-sm text-dial-cream hover:bg-black/30 transition-colors"
              >
                {option.label}
              </button>
            ))}
            {endTime && (
              <button
                onClick={cancelTimer}
                className="w-full px-3 py-2 text-left text-sm text-tuning-red hover:bg-black/30 transition-colors border-t border-brass/30"
              >
                Cancel Timer
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
