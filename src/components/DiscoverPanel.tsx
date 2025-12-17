'use client';

import { useState, useEffect } from 'react';
import { useRadio } from '@/hooks/useRadio';

interface Station {
  id: string;
  name: string;
  frequency: number;
  category: string;
  description: string;
  listener_count: number;
  is_live: boolean;
}

interface DiscoverPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DiscoverPanel({ isOpen, onClose }: DiscoverPanelProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const { setFrequency } = useRadio();

  useEffect(() => {
    if (isOpen) {
      loadStations();
    }
  }, [isOpen]);

  const loadStations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stations');
      const data = await res.json();
      if (data.stations) {
        setStations(data.stations);
      }
    } catch (error) {
      console.error('Failed to load stations:', error);
    }
    setLoading(false);
  };

  const handleTuneIn = (frequency: number) => {
    setFrequency(frequency);
    onClose();
  };

  const filteredStations = filter === 'all' 
    ? stations 
    : stations.filter(s => s.category === filter);

  const categories = ['all', ...new Set(stations.map(s => s.category))];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-brass rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brass/30">
          <h2 className="text-lg font-dial text-brass">🔍 Discover Stations</h2>
          <button
            onClick={onClose}
            className="text-dial-cream/60 hover:text-dial-cream text-2xl"
          >
            ×
          </button>
        </div>

        {/* Filter */}
        <div className="p-2 border-b border-brass/30 flex gap-1.5 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-xs px-2 py-1.5 rounded-md whitespace-nowrap transition-colors min-h-[32px] ${
                filter === cat 
                  ? 'bg-brass text-cabinet-dark font-bold' 
                  : 'bg-black/30 text-dial-cream/70 hover:bg-black/50'
              }`}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Station List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="loading-spinner" />
            </div>
          ) : filteredStations.length === 0 ? (
            <p className="text-dial-cream/50 text-center py-8">
              No stations found
            </p>
          ) : (
            filteredStations.map((station) => (
              <div
                key={station.id}
                className="bg-black/30 rounded-lg p-3 hover:bg-black/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="nixie-tube text-sm">
                        {station.frequency.toFixed(1)} FM
                      </span>
                      {station.is_live && (
                        <span className="px-1.5 py-0.5 bg-tuning-red/20 text-tuning-red text-xs rounded">
                          LIVE
                        </span>
                      )}
                    </div>
                    <p className="text-dial-cream font-dial mt-1">{station.name}</p>
                    <p className="text-dial-cream/50 text-xs mt-0.5 truncate">
                      {station.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-dial-cream/40">
                      <span>📁 {station.category}</span>
                      <span>👥 {station.listener_count}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTuneIn(station.frequency)}
                    className="preset-button text-xs px-3 py-1 ml-2"
                  >
                    TUNE
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
