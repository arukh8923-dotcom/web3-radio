'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { RADIO_TOKEN_ADDRESS, ERC20_ABI } from '@/lib/contracts';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number; // in RADIO tokens
  duration: number; // days
  benefits: string[];
  icon: string;
}

interface Subscription {
  id: string;
  station_name: string;
  tier_id: string;
  tier_name: string;
  subscriber_address: string;
  start_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'cancelled';
  auto_renew: boolean;
  tx_hash?: string;
}

interface SubscriptionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stationName: string;
  stationAddress?: string;
}

// Subscription tiers priced in RADIO tokens
const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 500, // 500 RADIO/month
    duration: 30,
    benefits: ['Ad-free listening', 'Basic chat access'],
    icon: '📻',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 1500, // 1,500 RADIO/month
    duration: 30,
    benefits: ['Ad-free listening', 'Premium chat badge', 'Request priority', 'Exclusive content'],
    icon: '⭐',
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 5000, // 5,000 RADIO/month
    duration: 30,
    benefits: ['All Premium benefits', 'Direct DJ access', 'VIP room access', 'NFT airdrops', 'Governance voting'],
    icon: '👑',
  },
];

export function SubscriptionPanel({ isOpen, onClose, stationName, stationAddress }: SubscriptionPanelProps) {
  const { address } = useAccount();
  const { radio, radioRaw, refetch } = useTokenBalances();
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRenewalPrompt, setShowRenewalPrompt] = useState(false);
  const [pendingTier, setPendingTier] = useState<SubscriptionTier | null>(null);

  const { writeContract, data: hash, isPending, reset } = useWriteContract();
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isOpen && address) {
      loadSubscription();
    }
  }, [isOpen, address, stationName]);

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && hash && pendingTier) {
      const startDate = new Date();
      const expiryDate = new Date(startDate.getTime() + pendingTier.duration * 24 * 60 * 60 * 1000);

      fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station_name: stationName,
          station_address: stationAddress,
          tier_id: pendingTier.id,
          tier_name: pendingTier.name,
          subscriber_address: address,
          price: pendingTier.price.toString(),
          token: 'RADIO',
          duration_days: pendingTier.duration,
          start_date: startDate.toISOString(),
          expiry_date: expiryDate.toISOString(),
          tx_hash: hash,
          auto_renew: false,
        }),
      }).then(async () => {
        await loadSubscription();
        setSelectedTier(null);
        setPendingTier(null);
        refetch();
        reset();
      });
    }
  }, [isSuccess, hash, pendingTier, stationName, stationAddress, address, refetch, reset]);

  const loadSubscription = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/subscriptions?subscriber=${address}&station=${encodeURIComponent(stationName)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.subscription) {
          setActiveSubscription(data.subscription);
          const expiry = new Date(data.subscription.expiry_date);
          const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          if (daysLeft <= 7 && daysLeft > 0) {
            setShowRenewalPrompt(true);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
    setLoading(false);
  };

  const handlePurchase = async (tier: SubscriptionTier) => {
    if (!address || !stationAddress) return;

    const priceWei = parseUnits(tier.price.toString(), 18);
    if (radioRaw < priceWei) {
      alert(`Insufficient RADIO. You need ${tier.price} RADIO but have ${parseFloat(radio).toFixed(2)}`);
      return;
    }

    setPendingTier(tier);

    try {
      // Transfer RADIO to station owner
      writeContract({
        address: RADIO_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [stationAddress as `0x${string}`, priceWei],
      });
    } catch (error) {
      console.error('Failed to purchase subscription:', error);
      setPendingTier(null);
    }
  };

  const handleRenew = async () => {
    if (!activeSubscription) return;
    const tier = SUBSCRIPTION_TIERS.find((t) => t.id === activeSubscription.tier_id);
    if (tier) {
      await handlePurchase(tier);
      setShowRenewalPrompt(false);
    }
  };

  const handleCancel = async () => {
    if (!activeSubscription || !address) return;
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_id: activeSubscription.id,
          subscriber_address: address,
        }),
      });

      if (res.ok) {
        alert('Subscription cancelled. You will retain access until the expiry date.');
        await loadSubscription();
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  const getTimeRemaining = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num < 1000) return num.toFixed(0);
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-brass rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brass/30 sticky top-0 bg-cabinet-dark">
          <div>
            <h3 className="nixie-tube text-lg">🎫 SUBSCRIPTION</h3>
            <p className="text-dial-cream/50 text-xs">{stationName}</p>
          </div>
          <button onClick={onClose} className="text-dial-cream/60 hover:text-dial-cream text-2xl">
            ×
          </button>
        </div>

        {/* Balance Display */}
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between bg-black/30 rounded-lg p-2">
            <span className="text-dial-cream/60 text-xs">Your RADIO Balance:</span>
            <span className="text-brass font-bold">{formatBalance(radio)} RADIO</span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin text-2xl mb-2">📻</div>
              <p className="text-dial-cream/60 text-sm">Loading...</p>
            </div>
          ) : activeSubscription && activeSubscription.status === 'active' ? (
            /* Active Subscription View */
            <div className="space-y-4">
              {showRenewalPrompt && (
                <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-3">
                  <p className="text-amber-400 text-sm font-medium">⚠️ Subscription expiring soon!</p>
                  <p className="text-dial-cream/60 text-xs mt-1">Renew now to keep your benefits.</p>
                  <button
                    onClick={handleRenew}
                    disabled={isPending || isConfirming}
                    className="mt-2 bg-amber-500 text-black px-3 py-1 rounded text-xs font-medium hover:bg-amber-400 disabled:opacity-50"
                  >
                    {isPending ? 'Confirm...' : isConfirming ? 'Processing...' : 'Renew Now'}
                  </button>
                </div>
              )}

              <div className="bg-black/30 rounded-lg p-4 border border-brass/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {SUBSCRIPTION_TIERS.find((t) => t.id === activeSubscription.tier_id)?.icon || '📻'}
                    </span>
                    <div>
                      <p className="text-dial-cream font-medium">{activeSubscription.tier_name}</p>
                      <p className="text-dial-cream/50 text-xs">Active Subscription</p>
                    </div>
                  </div>
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">ACTIVE</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dial-cream/60">Started</span>
                    <span className="text-dial-cream">{new Date(activeSubscription.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dial-cream/60">Expires</span>
                    <span className="text-dial-cream">{new Date(activeSubscription.expiry_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dial-cream/60">Time Left</span>
                    <span className="text-amber-400 font-medium">{getTimeRemaining(activeSubscription.expiry_date)}</span>
                  </div>
                  {activeSubscription.tx_hash && (
                    <a
                      href={`https://basescan.org/tx/${activeSubscription.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brass text-xs hover:underline block"
                    >
                      View transaction →
                    </a>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-brass/20">
                  <p className="text-dial-cream/60 text-xs mb-2">Your Benefits:</p>
                  <ul className="space-y-1">
                    {SUBSCRIPTION_TIERS.find((t) => t.id === activeSubscription.tier_id)?.benefits.map((benefit, i) => (
                      <li key={i} className="text-dial-cream text-xs flex items-center gap-2">
                        <span className="text-green-400">✓</span> {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={handleRenew} disabled={isPending || isConfirming} className="flex-1 preset-button py-2 text-sm disabled:opacity-50">
                  {isPending || isConfirming ? '...' : '🔄 Renew'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg py-2 text-sm hover:bg-red-500/30"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Subscription Tiers Selection */
            <div className="space-y-3">
              <p className="text-dial-cream/60 text-sm text-center">Subscribe for premium access to {stationName}</p>

              {SUBSCRIPTION_TIERS.map((tier) => {
                const priceWei = parseUnits(tier.price.toString(), 18);
                const canAfford = radioRaw >= priceWei;

                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTier(selectedTier?.id === tier.id ? null : tier)}
                    className={`bg-black/30 rounded-lg p-4 border cursor-pointer transition-all ${
                      selectedTier?.id === tier.id ? 'border-brass bg-brass/10' : 'border-brass/30 hover:border-brass/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{tier.icon}</span>
                        <div>
                          <p className="text-dial-cream font-medium">{tier.name}</p>
                          <p className="text-dial-cream/50 text-xs">{tier.duration} days</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${canAfford ? 'text-brass' : 'text-red-400'}`}>{tier.price.toLocaleString()} RADIO</p>
                      </div>
                    </div>

                    <ul className="space-y-1 mt-3">
                      {tier.benefits.map((benefit, i) => (
                        <li key={i} className="text-dial-cream/70 text-xs flex items-center gap-2">
                          <span className="text-brass">•</span> {benefit}
                        </li>
                      ))}
                    </ul>

                    {selectedTier?.id === tier.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePurchase(tier);
                        }}
                        disabled={isPending || isConfirming || !address || !canAfford || !stationAddress}
                        className="w-full mt-3 preset-button py-2 text-sm disabled:opacity-50"
                      >
                        {!canAfford
                          ? 'Insufficient RADIO'
                          : isPending
                          ? 'Confirm in wallet...'
                          : isConfirming
                          ? 'Processing...'
                          : `Subscribe for ${tier.price.toLocaleString()} RADIO`}
                      </button>
                    )}
                  </div>
                );
              })}

              {!address && (
                <p className="text-dial-cream/50 text-center text-sm mt-4">Connect wallet to subscribe</p>
              )}

              {!stationAddress && address && (
                <p className="text-dial-cream/50 text-center text-sm mt-4">Station wallet not configured</p>
              )}

              <p className="text-dial-cream/40 text-xs text-center mt-4">📻 Payments are on-chain via Base L2</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
