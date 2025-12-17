'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface AdSlot {
  id: string;
  station_id: string;
  position: 'pre-roll' | 'mid-roll' | 'banner';
  duration: number;
  price_per_day: number;
  current_sponsor: string | null;
  sponsor_name: string | null;
  content_url: string | null;
  impressions: number;
  clicks: number;
  start_date: string | null;
  end_date: string | null;
}

interface AdSponsorshipProps {
  stationId: string;
  stationName: string;
  isOwner: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function AdSponsorship({ stationId, stationName, isOwner, isOpen, onClose }: AdSponsorshipProps) {
  const { address } = useAccount();
  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AdSlot | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [activeTab, setActiveTab] = useState<'slots' | 'stats'>('slots');

  useEffect(() => {
    if (isOpen && stationId) {
      loadSlots();
    }
  }, [isOpen, stationId]);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ads/slots?station_id=${stationId}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
      }
    } catch (error) {
      console.error('Failed to load ad slots:', error);
    }
    setLoading(false);
  };

  const purchaseSlot = async (slotId: string, days: number, contentUrl: string) => {
    if (!address) return;
    setPurchasing(true);
    try {
      const res = await fetch('/api/ads/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_id: slotId,
          sponsor_address: address,
          days,
          content_url: contentUrl,
        }),
      });
      if (res.ok) {
        await loadSlots();
        setSelectedSlot(null);
      }
    } catch (error) {
      console.error('Failed to purchase slot:', error);
    }
    setPurchasing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-amber-500 rounded-xl w-full max-w-md max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-amber-500/30">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📢</span>
            <div>
              <h3 className="text-amber-400 font-bold">Sponsorship</h3>
              <p className="text-dial-cream/50 text-xs">{stationName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-dial-cream/60 hover:text-dial-cream text-2xl">×</button>
        </div>

        <div className="flex border-b border-amber-500/20">
          <button onClick={() => setActiveTab('slots')} className={`flex-1 py-2 text-sm ${activeTab === 'slots' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-dial-cream/50'}`}>
            Ad Slots
          </button>
          {isOwner && (
            <button onClick={() => setActiveTab('stats')} className={`flex-1 py-2 text-sm ${activeTab === 'stats' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-dial-cream/50'}`}>
              Revenue
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin text-3xl">📢</div>
            </div>
          ) : activeTab === 'slots' ? (
            <div className="space-y-3">
              {slots.map((slot) => (
                <SlotCard key={slot.id} slot={slot} onSelect={() => setSelectedSlot(slot)} />
              ))}
            </div>
          ) : (
            <RevenueStats slots={slots} />
          )}
        </div>

        {selectedSlot && (
          <PurchaseModal slot={selectedSlot} onClose={() => setSelectedSlot(null)} onPurchase={purchaseSlot} purchasing={purchasing} />
        )}
      </div>
    </div>
  );
}

function SlotCard({ slot, onSelect }: { slot: AdSlot; onSelect: () => void }) {
  const isAvailable = !slot.current_sponsor;
  return (
    <div className={`p-3 rounded-lg border ${isAvailable ? 'bg-amber-500/10 border-amber-500/30' : 'bg-black/20 border-brass/20'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-dial-cream font-medium capitalize">{slot.position.replace('-', ' ')}</span>
        <span className={`px-2 py-0.5 text-xs rounded ${isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {isAvailable ? 'Available' : 'Booked'}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-dial-cream/50">
        <span>{slot.duration}s • {slot.impressions.toLocaleString()} impressions</span>
        <span className="text-amber-400">{slot.price_per_day} $RADIO/day</span>
      </div>
      {isAvailable && (
        <button onClick={onSelect} className="w-full mt-2 py-1.5 bg-amber-500/20 text-amber-400 text-xs rounded hover:bg-amber-500/30">
          Purchase Slot
        </button>
      )}
    </div>
  );
}

function PurchaseModal({ slot, onClose, onPurchase, purchasing }: { slot: AdSlot; onClose: () => void; onPurchase: (id: string, days: number, url: string) => void; purchasing: boolean }) {
  const [days, setDays] = useState(7);
  const [contentUrl, setContentUrl] = useState('');
  const totalCost = slot.price_per_day * days;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
      <div className="bg-cabinet-dark border-2 border-amber-500 rounded-xl w-full max-w-sm p-4">
        <h4 className="text-amber-400 font-bold mb-4">Purchase Ad Slot</h4>
        <div className="space-y-3">
          <div>
            <label className="text-dial-cream/60 text-xs">Duration (days)</label>
            <input type="number" value={days} onChange={(e) => setDays(parseInt(e.target.value) || 1)} min={1} max={30} className="w-full mt-1 px-3 py-2 bg-black/30 border border-amber-500/30 rounded text-dial-cream" />
          </div>
          <div>
            <label className="text-dial-cream/60 text-xs">Content URL (IPFS/HTTP)</label>
            <input type="text" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} placeholder="ipfs://... or https://..." className="w-full mt-1 px-3 py-2 bg-black/30 border border-amber-500/30 rounded text-dial-cream text-sm" />
          </div>
          <div className="p-2 bg-amber-500/10 rounded text-center">
            <p className="text-amber-400 font-bold">{totalCost} $RADIO</p>
            <p className="text-dial-cream/50 text-xs">Total cost for {days} days</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 px-3 py-2 bg-black/30 text-dial-cream text-sm rounded-lg">Cancel</button>
          <button onClick={() => onPurchase(slot.id, days, contentUrl)} disabled={!contentUrl || purchasing} className="flex-1 px-3 py-2 bg-amber-500 text-white text-sm rounded-lg disabled:opacity-50">
            {purchasing ? '...' : 'Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RevenueStats({ slots }: { slots: AdSlot[] }) {
  const totalImpressions = slots.reduce((sum, s) => sum + s.impressions, 0);
  const totalClicks = slots.reduce((sum, s) => sum + s.clicks, 0);
  const activeSlots = slots.filter(s => s.current_sponsor).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-black/20 rounded-lg">
          <p className="text-dial-cream/50 text-xs">Active Sponsors</p>
          <p className="text-dial-cream font-bold text-lg">{activeSlots}/{slots.length}</p>
        </div>
        <div className="p-3 bg-black/20 rounded-lg">
          <p className="text-dial-cream/50 text-xs">Total Impressions</p>
          <p className="text-dial-cream font-bold text-lg">{totalImpressions.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-black/20 rounded-lg">
          <p className="text-dial-cream/50 text-xs">Total Clicks</p>
          <p className="text-dial-cream font-bold text-lg">{totalClicks.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-black/20 rounded-lg">
          <p className="text-dial-cream/50 text-xs">CTR</p>
          <p className="text-dial-cream font-bold text-lg">{totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0}%</p>
        </div>
      </div>
    </div>
  );
}
