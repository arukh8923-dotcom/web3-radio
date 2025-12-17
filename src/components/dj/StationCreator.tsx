'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

interface StationFormData {
  name: string;
  description: string;
  category: 'music' | 'talk' | 'news' | 'sports' | '420' | 'ambient';
  frequency: number;
  isPremium: boolean;
  subscriptionFee: string;
  imageUrl: string;
}

const CATEGORIES = [
  { value: 'music', label: '🎵 Music', icon: '🎵' },
  { value: 'talk', label: '🎙️ Talk', icon: '🎙️' },
  { value: 'news', label: '📰 News', icon: '📰' },
  { value: 'sports', label: '⚽ Sports', icon: '⚽' },
  { value: '420', label: '🌿 420 Zone', icon: '🌿' },
  { value: 'ambient', label: '🌊 Ambient', icon: '🌊' },
] as const;

// Placeholder: akan diganti dengan real contract deployment
async function deployStationContract(data: StationFormData, ownerAddress: string) {
  // TODO: Replace with actual contract deployment
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock response
  return {
    success: true,
    stationId: `station-${Date.now()}`,
    contractAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
    txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
  };
}

// Placeholder: save station to database
async function saveStationToDb(data: StationFormData & { 
  owner_address: string;
  contract_address?: string;
}) {
  const res = await fetch('/api/stations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      category: data.category,
      frequency: data.frequency,
      is_premium: data.isPremium,
      subscription_fee: data.subscriptionFee,
      image_url: data.imageUrl,
      owner_address: data.owner_address,
      contract_address: data.contract_address,
    }),
  });
  return res.json();
}

export default function StationCreator({ onClose, onSuccess }: { 
  onClose?: () => void;
  onSuccess?: (stationId: string) => void;
}) {
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState<'form' | 'deploying' | 'success' | 'error'>('form');
  const [error, setError] = useState<string | null>(null);
  const [deployResult, setDeployResult] = useState<{
    stationId: string;
    contractAddress: string;
    txHash: string;
  } | null>(null);
  
  const [formData, setFormData] = useState<StationFormData>({
    name: '',
    description: '',
    category: 'music',
    frequency: 88.1,
    isPremium: false,
    subscriptionFee: '0',
    imageUrl: '',
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    
    setStep('deploying');
    setError(null);
    
    try {
      // Step 1: Deploy contract (placeholder)
      const result = await deployStationContract(formData, address);
      
      if (!result.success) {
        throw new Error('Contract deployment failed');
      }
      
      // Step 2: Save to database
      await saveStationToDb({
        ...formData,
        owner_address: address,
        contract_address: result.contractAddress,
      });
      
      setDeployResult({
        stationId: result.stationId,
        contractAddress: result.contractAddress,
        txHash: result.txHash,
      });
      setStep('success');
      onSuccess?.(result.stationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create station');
      setStep('error');
    }
  };

  const handleFrequencyChange = (value: number) => {
    // Clamp between 87.5 and 108.0
    const clamped = Math.max(87.5, Math.min(108.0, value));
    // Round to 1 decimal
    const rounded = Math.round(clamped * 10) / 10;
    setFormData(prev => ({ ...prev, frequency: rounded }));
  };

  if (!isConnected) {
    return (
      <div className="bg-zinc-900 rounded-xl p-6 border border-amber-900/30">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔌</div>
          <h3 className="text-amber-100 font-bold mb-2">Connect Wallet</h3>
          <p className="text-amber-100/60 text-sm">
            Connect your wallet to create a radio station
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (step === 'success' && deployResult) {
    return (
      <div className="bg-zinc-900 rounded-xl p-6 border border-green-500/30">
        <div className="text-center py-6">
          <div className="text-5xl mb-4">📻</div>
          <h3 className="text-green-400 font-bold text-xl mb-2">Station Created!</h3>
          <p className="text-amber-100/60 text-sm mb-4">
            Your station is now live on {formData.frequency} FM
          </p>
          
          <div className="bg-black/30 rounded-lg p-4 text-left mb-4">
            <div className="text-xs text-amber-100/40 mb-1">Contract Address</div>
            <div className="text-amber-100 font-mono text-xs break-all">
              {deployResult.contractAddress}
            </div>
            <div className="text-xs text-amber-100/40 mt-3 mb-1">Transaction</div>
            <div className="text-amber-100 font-mono text-xs break-all">
              {deployResult.txHash}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-800 text-amber-100 rounded-lg hover:bg-zinc-700"
            >
              Close
            </button>
            <button
              onClick={() => {
                setStep('form');
                setFormData({
                  name: '',
                  description: '',
                  category: 'music',
                  frequency: 88.1,
                  isPremium: false,
                  subscriptionFee: '0',
                  imageUrl: '',
                });
              }}
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Deploying state
  if (step === 'deploying') {
    return (
      <div className="bg-zinc-900 rounded-xl p-6 border border-amber-900/30">
        <div className="text-center py-8">
          <div className="text-5xl mb-4 animate-pulse">📡</div>
          <h3 className="text-amber-100 font-bold mb-2">Deploying Station...</h3>
          <p className="text-amber-100/60 text-sm mb-4">
            Creating your station contract on Base
          </p>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (step === 'error') {
    return (
      <div className="bg-zinc-900 rounded-xl p-6 border border-red-500/30">
        <div className="text-center py-6">
          <div className="text-5xl mb-4">❌</div>
          <h3 className="text-red-400 font-bold mb-2">Creation Failed</h3>
          <p className="text-amber-100/60 text-sm mb-4">{error}</p>
          <button
            onClick={() => setStep('form')}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="bg-zinc-900 rounded-xl border border-amber-900/30 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 px-4 py-3 border-b border-amber-900/30">
        <h2 className="text-amber-100 font-bold flex items-center gap-2">
          <span>📻</span> Create Radio Station
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Station Name */}
        <div>
          <label className="block text-amber-100/60 text-xs mb-1">Station Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="My Awesome Station"
            required
            className="w-full px-3 py-2 bg-black/30 border border-amber-900/30 rounded-lg text-amber-100 placeholder:text-amber-100/30 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-amber-100/60 text-xs mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="What's your station about?"
            rows={2}
            className="w-full px-3 py-2 bg-black/30 border border-amber-900/30 rounded-lg text-amber-100 placeholder:text-amber-100/30 focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-amber-100/60 text-xs mb-1">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  formData.category === cat.value
                    ? 'bg-amber-600 text-white'
                    : 'bg-black/30 text-amber-100/60 hover:bg-black/50'
                }`}
              >
                {cat.icon} {cat.value}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-amber-100/60 text-xs mb-1">
            Frequency (FM)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="87.5"
              max="108.0"
              step="0.1"
              value={formData.frequency}
              onChange={e => handleFrequencyChange(parseFloat(e.target.value))}
              className="flex-1 accent-amber-500"
            />
            <div className="bg-black/50 px-3 py-1 rounded font-mono text-amber-400 min-w-[80px] text-center">
              {formData.frequency.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Premium Toggle */}
        <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
          <div>
            <div className="text-amber-100 text-sm font-medium">Premium Station</div>
            <div className="text-amber-100/40 text-xs">Require subscription to listen</div>
          </div>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, isPremium: !prev.isPremium }))}
            className={`w-12 h-6 rounded-full transition-colors ${
              formData.isPremium ? 'bg-amber-500' : 'bg-zinc-700'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              formData.isPremium ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        {/* Subscription Fee (if premium) */}
        {formData.isPremium && (
          <div>
            <label className="block text-amber-100/60 text-xs mb-1">
              Subscription Fee ($RADIO/month)
            </label>
            <input
              type="number"
              value={formData.subscriptionFee}
              onChange={e => setFormData(prev => ({ ...prev, subscriptionFee: e.target.value }))}
              placeholder="100"
              min="0"
              className="w-full px-3 py-2 bg-black/30 border border-amber-900/30 rounded-lg text-amber-100 placeholder:text-amber-100/30 focus:outline-none focus:border-amber-500"
            />
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-2 pt-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-zinc-800 text-amber-100 rounded-lg hover:bg-zinc-700"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!formData.name}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-lg hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚀 Create Station
          </button>
        </div>
      </form>
    </div>
  );
}
