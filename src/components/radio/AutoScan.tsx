'use client';

import { useState, useEffect, useRef } from 'react';

interface AutoScanProps {
  currentFrequency: number;
  onFrequencyChange: (freq: number) => void;
  onStationFound: (freq: number) => void;
  disabled?: boolean;
}

export function AutoScan({ 
  currentFrequency, 
  onFrequencyChange, 
  onStationFound,
  disabled 
}: AutoScanProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanDirection, setScanDirection] = useState<'up' | 'down'>('up');
  const [foundStation, setFoundStation] = useState<number | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Known station frequencies (from database)
  const STATION_FREQUENCIES = [88.1, 92.5, 96.9, 101.1, 104.2, 107.7];

  const startScan = (direction: 'up' | 'down') => {
    setScanDirection(direction);
    setIsScanning(true);
    setFoundStation(null);
  };

  const stopScan = () => {
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  const confirmStation = () => {
    if (foundStation) {
      onStationFound(foundStation);
      setFoundStation(null);
    }
    stopScan();
  };

  const skipStation = () => {
    setFoundStation(null);
    setIsScanning(true);
  };

  // Scanning logic
  useEffect(() => {
    if (!isScanning || foundStation) return;

    scanIntervalRef.current = setInterval(() => {
      const step = scanDirection === 'up' ? 0.1 : -0.1;
      let nextFreq = currentFrequency + step;
      
      // Wrap around
      if (nextFreq > 108.0) nextFreq = 88.0;
      if (nextFreq < 88.0) nextFreq = 108.0;
      
      nextFreq = Math.round(nextFreq * 10) / 10;
      onFrequencyChange(nextFreq);

      // Check if we found a station
      const isStation = STATION_FREQUENCIES.some(
        (f) => Math.abs(f - nextFreq) < 0.05
      );
      
      if (isStation) {
        setFoundStation(nextFreq);
        setIsScanning(false);
      }
    }, 100); // Scan speed: 100ms per step

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [isScanning, foundStation, currentFrequency, scanDirection, onFrequencyChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  if (foundStation) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-brass text-xs animate-pulse">📡 Station found!</span>
        <button
          onClick={confirmStation}
          className="preset-button text-xs bg-green-600 hover:bg-green-500"
        >
          ✓ TUNE
        </button>
        <button
          onClick={skipStation}
          className="preset-button text-xs"
        >
          SKIP →
        </button>
      </div>
    );
  }

  if (isScanning) {
    return (
      <button
        onClick={stopScan}
        className="preset-button text-xs bg-tuning-red animate-pulse"
      >
        ⏹ STOP SCAN
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => startScan('down')}
        disabled={disabled}
        className="preset-button text-xs disabled:opacity-50"
        title="Scan Down"
      >
        ◀ SCAN
      </button>
      <button
        onClick={() => startScan('up')}
        disabled={disabled}
        className="preset-button text-xs disabled:opacity-50"
        title="Scan Up"
      >
        SCAN ▶
      </button>
    </div>
  );
}
