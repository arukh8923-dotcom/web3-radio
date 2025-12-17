'use client';

import { useState } from 'react';

interface BandSelectorProps {
  currentBand: string;
  onBandChange: (band: string) => void;
}

const BANDS = [
  { id: 'all', name: 'ALL', icon: '📻', range: '88-108 FM' },
  { id: 'music', name: 'MUSIC', icon: '🎵', range: '88-92 FM' },
  { id: 'talk', name: 'TALK', icon: '🎙️', range: '92-96 FM' },
  { id: 'news', name: 'NEWS', icon: '📰', range: '96-100 FM' },
  { id: 'ambient', name: 'AMBIENT', icon: '🌙', range: '100-104 FM' },
  { id: '420', name: '420', icon: '🌿', range: '104-108 FM' },
];

export function BandSelector({ currentBand, onBandChange }: BandSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const current = BANDS.find(b => b.id === currentBand) || BANDS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="preset-button text-xs flex items-center gap-1"
      >
        <span>{current.icon}</span>
        <span>{current.name}</span>
        <span className="text-dial-cream/50">▼</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 bottom-full mb-2 bg-cabinet-dark border border-brass rounded-lg shadow-xl z-50 min-w-[160px]">
            <p className="px-3 py-2 text-dial-cream/60 text-xs border-b border-brass/30">
              Select Band
            </p>
            {BANDS.map((band) => (
              <button
                key={band.id}
                onClick={() => {
                  onBandChange(band.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-black/30 transition-colors flex items-center gap-2 ${
                  currentBand === band.id ? 'text-brass' : 'text-dial-cream'
                }`}
              >
                <span>{band.icon}</span>
                <span>{band.name}</span>
                <span className="text-dial-cream/40 text-xs ml-auto">{band.range}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
