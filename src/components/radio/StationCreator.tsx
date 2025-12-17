'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

interface StationFormData {
  name: string;
  description: string;
  category: 'music' | 'talk' | 'news' | 'sports' | '420' | 'ambient';
  frequency: number;
  isPremium: boolean;
  subscriptionFee: number;
}

interface StationCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (stationId: string) => void;
}

export function StationCreator({ isOpen, onClose, onCreated }: StationCreatorProps) {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StationFormData>({
    name: '',
    description: '',
    category: 'music',
    frequency: 88.1,
    isPremium: false,
    subscriptionFee: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setLoading(true);
    try {
      const res = await fetch('/api/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ownerAddress: address,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onCreated?.(data.stationId);
        onClose();
      }
    } catch (error) {
      console.error('Failed to create station:', error);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-green-500/50 rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-green-500/30">
          <h3 className="text-green-400 font-bold">📻 Create Station</h3>
          <button onClick={onClose} className="text-dial-cream/60 hover:text-dial-cream">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-dial-cream/80 text-sm mb-1">Station Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-green-500/30 rounded-lg text-dial-cream"
              placeholder="My Awesome Station"
              required
            />
          </div>

          <div>
            <label className="block text-dial-cream/80 text-sm mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-green-500/30 rounded-lg text-dial-cream resize-none"
              rows={3}
              placeholder="What's your station about?"
            />
          </div>

          <div>
            <label className="block text-dial-cream/80 text-sm mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as StationFormData['category'] })}
              className="w-full px-3 py-2 bg-black/30 border border-green-500/30 rounded-lg text-dial-cream"
            >
              <option value="music">🎵 Music</option>
              <option value="talk">🎙️ Talk</option>
              <option value="news">📰 News</option>
              <option value="sports">⚽ Sports</option>
              <option value="420">🌿 420</option>
              <option value="ambient">🌊 Ambient</option>
            </select>
          </div>

          <div>
            <label className="block text-dial-cream/80 text-sm mb-1">Frequency (FM)</label>
            <input
              type="number"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-black/30 border border-green-500/30 rounded-lg text-dial-cream"
              min={88.0}
              max={108.0}
              step={0.1}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPremium"
              checked={formData.isPremium}
              onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isPremium" className="text-dial-cream/80">Premium Station</label>
          </div>

          {formData.isPremium && (
            <div>
              <label className="block text-dial-cream/80 text-sm mb-1">Subscription Fee (RADIO/month)</label>
              <input
                type="number"
                value={formData.subscriptionFee}
                onChange={(e) => setFormData({ ...formData, subscriptionFee: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-black/30 border border-green-500/30 rounded-lg text-dial-cream"
                min={0}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !formData.name}
            className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-lg"
          >
            {loading ? 'Creating...' : '🚀 Create Station'}
          </button>
        </form>
      </div>
    </div>
  );
}
