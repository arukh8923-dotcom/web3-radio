'use client';

import { useState, useEffect } from 'react';

interface BaseNameDisplayProps {
  address: string;
  showAvatar?: boolean;
  className?: string;
  onClick?: () => void;
}

export function BaseNameDisplay({ address, showAvatar = false, className = '', onClick }: BaseNameDisplayProps) {
  const [baseName, setBaseName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      resolveBaseName();
    }
  }, [address]);

  const resolveBaseName = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/basename/resolve?address=${address}`);
      if (res.ok) {
        const data = await res.json();
        setBaseName(data.name);
        setAvatar(data.avatar);
      }
    } catch (error) {
      console.error('Failed to resolve Base name:', error);
    }
    setLoading(false);
  };

  const displayText = loading ? '...' : baseName || `${address.slice(0, 6)}...${address.slice(-4)}`;

  if (showAvatar) {
    return (
      <div className={`flex items-center gap-2 ${className}`} onClick={onClick}>
        <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center overflow-hidden">
          {avatar ? (
            <img src={avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs">👤</span>
          )}
        </div>
        <span className={baseName ? 'text-blue-400' : 'text-dial-cream/70'}>{displayText}</span>
      </div>
    );
  }

  return (
    <span className={`${baseName ? 'text-blue-400' : 'text-dial-cream/70'} ${className}`} onClick={onClick}>
      {displayText}
    </span>
  );
}

// Search component for Base names
export function BaseNameSearch({ onSelect }: { onSelect: (address: string, name: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ address: string; name: string; avatar: string | null }>>([]);
  const [searching, setSearching] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/basename/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
    setSearching(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Search Base names..."
          className="flex-1 px-3 py-2 bg-black/30 border border-blue-500/30 rounded-lg text-dial-cream text-sm"
        />
        <button onClick={search} disabled={searching} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
          {searching ? '...' : '🔍'}
        </button>
      </div>
      {results.length > 0 && (
        <div className="space-y-1">
          {results.map((r) => (
            <button
              key={r.address}
              onClick={() => onSelect(r.address, r.name)}
              className="w-full flex items-center gap-2 p-2 bg-black/20 rounded-lg hover:bg-blue-500/10"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center overflow-hidden">
                {r.avatar ? <img src={r.avatar} alt="" className="w-full h-full object-cover" /> : '👤'}
              </div>
              <div className="text-left">
                <p className="text-blue-400 text-sm">{r.name}</p>
                <p className="text-dial-cream/40 text-xs">{r.address.slice(0, 10)}...</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
