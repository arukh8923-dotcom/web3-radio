'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Subscription {
  id: string;
  stationId: string;
  stationName: string;
  frequency: number;
  startDate: number;
  expiryDate: number;
  tier: 'basic' | 'premium' | 'vip';
  price: string;
  autoRenew: boolean;
}

interface SubscriptionTier {
  id: 'basic' | 'premium' | 'vip';
  name: string;
  price: string;
  duration: number; // days
  features: string[];
  icon: string;
}

const TIERS: SubscriptionTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: '10',
    duration: 30,
    features: ['Basic chat access', 'Station presets'],
    icon: '🎵',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '25',
    duration: 30,
    features: ['Premium chat badge', 'Request priority', 'Exclusive content', 'Early access'],
    icon: '⭐',
  },
  {
    id: 'vip',
    name: 'VIP',
    price: '50',
    duration: 30,
    features: ['All Premium features', 'Direct DJ chat', 'VIP badge', 'Exclusive NFT drops', 'Backstage access'],
    icon: '👑',
  },
];

// Get user subscriptions from API
async function getUserSubscriptions(walletAddress: string): Promise<Subscription[]> {
  try {
    const res = await fetch(`/api/subscriptions?subscriber=${walletAddress}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.subscriptions || []).map((sub: any) => ({
      id: sub.id,
      stationId: sub.station_id,
      stationName: sub.station_name || 'Unknown Station',
      frequency: 88.1, // Default frequency
      startDate: new Date(sub.start_date || sub.created_at).getTime(),
      expiryDate: new Date(sub.expiry_date).getTime(),
      tier: sub.tier_id as 'basic' | 'premium' | 'vip',
      price: sub.price || '0',
      autoRenew: sub.auto_renew || false,
    }));
  } catch {
    return [];
  }
}

// Purchase subscription via API
async function purchaseSubscription(params: {
  stationId: string;
  tier: string;
  walletAddress: string;
}): Promise<{ success: boolean; txHash: string; subscriptionId: string }> {
  try {
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        station_id: params.stationId,
        subscriber_address: params.walletAddress,
        tier_id: params.tier,
        tier_name: params.tier,
        duration_days: 30,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, txHash: data.subscription?.tx_hash || 'pending', subscriptionId: data.subscription?.id || '' };
    }
    return { success: false, txHash: '', subscriptionId: '' };
  } catch {
    return { success: false, txHash: '', subscriptionId: '' };
  }
}

// Cancel subscription via API
async function cancelSubscription(subscriptionId: string, walletAddress: string): Promise<boolean> {
  try {
    const res = await fetch('/api/subscriptions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription_id: subscriptionId, subscriber_address: walletAddress }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Toggle auto-renew via API (not implemented yet - placeholder)
async function toggleAutoRenew(subscriptionId: string, enabled: boolean): Promise<boolean> {
  // TODO: Implement auto-renew toggle when backend supports it
  console.log('Auto-renew toggle not yet implemented:', subscriptionId, enabled);
  return true;
}

export function SubscriptionManager({ 
  stationId,
  stationName,
  frequency,
  isOpen,
  onClose,
}: { 
  stationId?: string;
  stationName?: string;
  frequency?: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { address } = useAccount();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [view, setView] = useState<'list' | 'purchase'>('list');

  useEffect(() => {
    if (address && isOpen) {
      loadSubscriptions();
    }
  }, [address, isOpen]);

  const loadSubscriptions = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const subs = await getUserSubscriptions(address);
      setSubscriptions(subs);
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    }
    setLoading(false);
  };

  const handlePurchase = async () => {
    if (!address || !selectedTier || !stationId) return;
    
    setPurchasing(true);
    try {
      const result = await purchaseSubscription({
        stationId,
        tier: selectedTier.id,
        walletAddress: address,
      });
      
      if (result.success) {
        setView('list');
        setSelectedTier(null);
        loadSubscriptions();
      }
    } catch (err) {
      console.error('Failed to purchase:', err);
    }
    setPurchasing(false);
  };

  const handleCancel = async (subId: string) => {
    if (!address) return;
    if (!confirm('Cancel this subscription? You will lose access at the end of the billing period.')) return;
    
    try {
      await cancelSubscription(subId, address);
      loadSubscriptions();
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  };

  const handleToggleAutoRenew = async (subId: string, currentValue: boolean) => {
    try {
      await toggleAutoRenew(subId, !currentValue);
      loadSubscriptions();
    } catch (err) {
      console.error('Failed to toggle auto-renew:', err);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (expiryDate: number) => {
    const diff = expiryDate - Date.now();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  };

  const currentSub = subscriptions.find(s => s.stationId === stationId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-amber-900/30 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-amber-900/30">
          <div>
            <h3 className="text-amber-100 font-bold text-lg">
              {view === 'purchase' ? '🎫 Subscribe' : '📋 My Subscriptions'}
            </h3>
            {stationName && view === 'purchase' && (
              <p className="text-amber-100/50 text-sm">{stationName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-amber-100/60 hover:text-amber-100 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!address ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔗</div>
              <p className="text-amber-100/60">Connect wallet to manage subscriptions</p>
            </div>
          ) : view === 'purchase' ? (
            /* Purchase View */
            <div className="space-y-3">
              {TIERS.map(tier => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier)}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    selectedTier?.id === tier.id
                      ? 'bg-amber-600/20 border-2 border-amber-500'
                      : 'bg-black/20 border border-transparent hover:border-amber-900/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{tier.icon}</span>
                      <span className="text-amber-100 font-bold">{tier.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-bold">{tier.price} $RADIO</div>
                      <div className="text-amber-100/40 text-xs">/month</div>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="text-amber-100/60 text-sm flex items-center gap-2">
                        <span className="text-green-400">✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
              
              {/* Current subscription notice */}
              {currentSub && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-blue-300 text-sm">
                    ℹ️ You already have a {currentSub.tier} subscription to this station. 
                    Upgrading will extend your access.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-amber-100/60">Loading...</div>
              ) : subscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-amber-100/60">No active subscriptions</p>
                </div>
              ) : (
                subscriptions.map(sub => {
                  const daysLeft = getDaysRemaining(sub.expiryDate);
                  const isExpiringSoon = daysLeft <= 7;
                  
                  return (
                    <div
                      key={sub.id}
                      className={`bg-black/20 rounded-lg p-4 ${
                        isExpiringSoon ? 'border border-yellow-500/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-amber-100 font-medium">{sub.stationName}</div>
                          <div className="text-amber-100/60 text-sm">{sub.frequency} FM</div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                          sub.tier === 'vip' ? 'bg-purple-500/20 text-purple-300' :
                          sub.tier === 'premium' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-zinc-500/20 text-zinc-300'
                        }`}>
                          {sub.tier.toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-amber-100/40">Expires</span>
                        <span className={isExpiringSoon ? 'text-yellow-400' : 'text-amber-100/60'}>
                          {formatDate(sub.expiryDate)} ({daysLeft} days)
                        </span>
                      </div>
                      
                      {isExpiringSoon && (
                        <div className="bg-yellow-500/10 rounded p-2 mb-3">
                          <p className="text-yellow-400 text-xs">
                            ⚠️ Expiring soon! Renew to keep your benefits.
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleToggleAutoRenew(sub.id, sub.autoRenew)}
                          className={`text-xs px-2 py-1 rounded ${
                            sub.autoRenew 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-zinc-500/20 text-zinc-400'
                          }`}
                        >
                          {sub.autoRenew ? '🔄 Auto-renew ON' : 'Auto-renew OFF'}
                        </button>
                        <button
                          onClick={() => handleCancel(sub.id)}
                          className="text-red-400 text-xs hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-amber-900/30">
          {view === 'purchase' ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setView('list');
                  setSelectedTier(null);
                }}
                className="flex-1 px-4 py-3 bg-zinc-800 text-amber-100 rounded-lg hover:bg-zinc-700"
              >
                Back
              </button>
              <button
                onClick={handlePurchase}
                disabled={!selectedTier || purchasing}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-lg hover:from-amber-500 hover:to-orange-500 disabled:opacity-50"
              >
                {purchasing ? 'Processing...' : `Subscribe ${selectedTier?.price || ''} $RADIO`}
              </button>
            </div>
          ) : stationId ? (
            <button
              onClick={() => setView('purchase')}
              className="w-full px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-lg hover:from-amber-500 hover:to-orange-500"
            >
              🎫 Subscribe to {stationName}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
