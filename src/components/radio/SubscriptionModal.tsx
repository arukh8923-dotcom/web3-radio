'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Subscription {
  id: string;
  stationId: string;
  stationName: string;
  expiresAt: number;
  tier: 'basic' | 'premium' | 'vip';
  autoRenew: boolean;
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationId: string;
  stationName: string;
  subscriptionFee?: number;
}

const TIERS = [
  { id: 'basic', name: 'Basic', price: 10, duration: 30, features: ['Basic chat access', 'Station presets'] },
  { id: 'premium', name: 'Premium', price: 25, duration: 30, features: ['Premium chat badge', 'Request priority', 'Exclusive content', 'Early access'] },
  { id: 'vip', name: 'VIP', price: 50, duration: 30, features: ['All Premium features', 'Direct DJ access', 'VIP room access', 'NFT airdrops', 'Governance voting'] },
];

// Get subscription status from API
async function getSubscription(stationId: string, walletAddress: string): Promise<Subscription | null> {
  try {
    const res = await fetch(`/api/subscriptions?subscriber=${walletAddress}&station_id=${stationId}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.subscription) {
      return {
        id: data.subscription.id,
        stationId: data.subscription.station_id || stationId,
        stationName: data.subscription.station_name,
        expiresAt: new Date(data.subscription.expiry_date).getTime(),
        tier: data.subscription.tier_id as 'basic' | 'premium' | 'vip',
        autoRenew: data.subscription.auto_renew || false,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Purchase subscription via API (actual payment handled by SubscriptionPanel)
async function purchaseSubscription(params: {
  stationId: string;
  walletAddress: string;
  tier: string;
  duration: number;
}): Promise<{ success: boolean; txHash: string; expiresAt: number }> {
  // This is a simplified version - actual on-chain payment is in SubscriptionPanel
  const expiresAt = Date.now() + params.duration * 24 * 60 * 60 * 1000;
  try {
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        station_id: params.stationId,
        subscriber_address: params.walletAddress,
        tier_id: params.tier,
        tier_name: params.tier,
        duration_days: params.duration,
        expiry_date: new Date(expiresAt).toISOString(),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, txHash: data.subscription?.tx_hash || 'pending', expiresAt };
    }
    return { success: false, txHash: '', expiresAt: 0 };
  } catch {
    return { success: false, txHash: '', expiresAt: 0 };
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

export function SubscriptionModal({ isOpen, onClose, stationId, stationName }: SubscriptionModalProps) {
  const { address } = useAccount();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selectedTier, setSelectedTier] = useState('premium');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && address) {
      loadSubscription();
    }
  }, [isOpen, address, stationId]);

  const loadSubscription = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const sub = await getSubscription(stationId, address);
      setSubscription(sub);
    } catch (err) {
      console.error('Failed to load subscription:', err);
    }
    setLoading(false);
  };

  const handlePurchase = async () => {
    if (!address) return;
    
    setPurchasing(true);
    try {
      const tier = TIERS.find(t => t.id === selectedTier)!;
      const result = await purchaseSubscription({
        stationId,
        walletAddress: address,
        tier: selectedTier,
        duration: tier.duration,
      });
      
      if (result.success) {
        setTxHash(result.txHash);
        setSubscription({
          id: `sub-${Date.now()}`,
          stationId,
          stationName,
          expiresAt: result.expiresAt,
          tier: selectedTier as Subscription['tier'],
          autoRenew: false,
        });
        setStep('success');
      }
    } catch (err) {
      console.error('Failed to purchase:', err);
    }
    setPurchasing(false);
  };

  const handleCancel = async () => {
    if (!subscription) return;
    if (!confirm('Cancel your subscription? You will lose access when it expires.')) return;
    
    try {
      await cancelSubscription(subscription.id, address);
      setSubscription(null);
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  };

  const formatExpiry = (timestamp: number) => {
    const days = Math.ceil((timestamp - Date.now()) / (24 * 60 * 60 * 1000));
    if (days <= 0) return 'Expired';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-amber-900/30 rounded-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-amber-900/30 bg-gradient-to-r from-amber-900/40 to-orange-900/40">
          <div>
            <h3 className="text-amber-100 font-bold">⭐ Subscribe</h3>
            <p className="text-amber-100/50 text-xs">{stationName}</p>
          </div>
          <button onClick={onClose} className="text-amber-100/60 hover:text-amber-100 text-2xl">×</button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-8 text-amber-100/60">Loading...</div>
          ) : !address ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔗</div>
              <p className="text-amber-100/60">Connect wallet to subscribe</p>
            </div>
          ) : subscription ? (
            /* Active Subscription View */
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg p-4 border border-amber-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-400 font-bold uppercase">{subscription.tier}</span>
                  <span className="text-green-400 text-sm">Active</span>
                </div>
                <div className="text-amber-100/60 text-sm">{formatExpiry(subscription.expiresAt)}</div>
              </div>
              
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-amber-100/40 text-xs mb-2">Your Benefits</div>
                <ul className="space-y-1">
                  {TIERS.find(t => t.id === subscription.tier)?.features.map((f, i) => (
                    <li key={i} className="text-amber-100/80 text-sm flex items-center gap-2">
                      <span className="text-green-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-zinc-800 text-amber-100 rounded-lg hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
                >
                  Upgrade
                </button>
              </div>
            </div>
          ) : step === 'success' ? (
            /* Success View */
            <div className="text-center py-6">
              <div className="text-5xl mb-4">🎉</div>
              <h4 className="text-amber-100 font-bold text-lg mb-2">Subscribed!</h4>
              <p className="text-amber-100/60 text-sm mb-4">
                You now have {selectedTier} access to {stationName}
              </p>
              {txHash && (
                <div className="bg-black/20 rounded-lg p-3 mb-4">
                  <div className="text-amber-100/40 text-xs mb-1">Transaction</div>
                  <div className="text-amber-100 font-mono text-xs break-all">{txHash}</div>
                </div>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
              >
                Done
              </button>
            </div>
          ) : (
            /* Tier Selection */
            <div className="space-y-4">
              <div className="space-y-2">
                {TIERS.map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`w-full p-4 rounded-lg text-left transition-all ${
                      selectedTier === tier.id
                        ? 'bg-amber-600/20 border-2 border-amber-500'
                        : 'bg-black/20 border-2 border-transparent hover:border-amber-900/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-amber-100 font-bold">{tier.name}</span>
                      <span className="text-amber-400">{tier.price} $RADIO/mo</span>
                    </div>
                    <ul className="space-y-1">
                      {tier.features.map((f, i) => (
                        <li key={i} className="text-amber-100/60 text-xs flex items-center gap-1">
                          <span className="text-amber-400">•</span> {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
              
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-lg hover:from-amber-500 hover:to-orange-500 disabled:opacity-50"
              >
                {purchasing ? 'Processing...' : `Subscribe for ${TIERS.find(t => t.id === selectedTier)?.price} $RADIO`}
              </button>
              
              <p className="text-amber-100/40 text-xs text-center">
                💡 Subscription is stored on-chain. Cancel anytime.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
