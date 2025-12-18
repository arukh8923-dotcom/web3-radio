'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';

interface PremiumAccess {
  hasAccess: boolean;
  tier: 'none' | 'basic' | 'premium' | 'vip';
  expiresAt: Date | null;
  benefits: string[];
  loading: boolean;
}

interface Subscription {
  tier_id: string;
  tier_name: string;
  expiry_date: string;
  status: string;
}

const TIER_BENEFITS: Record<string, string[]> = {
  none: [],
  basic: ['basic-chat', 'station-presets'],
  premium: ['premium-badge', 'request-priority', 'exclusive-content', 'early-access'],
  vip: ['premium-badge', 'request-priority', 'exclusive-content', 'early-access', 'dj-access', 'vip-room', 'nft-airdrops', 'governance'],
};

export function usePremiumAccess(stationName?: string) {
  const { address } = useAccount();
  const [access, setAccess] = useState<PremiumAccess>({
    hasAccess: false,
    tier: 'none',
    expiresAt: null,
    benefits: [],
    loading: true,
  });

  const checkAccess = useCallback(async () => {
    if (!address || !stationName) {
      setAccess({
        hasAccess: false,
        tier: 'none',
        expiresAt: null,
        benefits: [],
        loading: false,
      });
      return;
    }

    try {
      const res = await fetch(
        `/api/subscriptions?subscriber=${address}&station=${encodeURIComponent(stationName)}`
      );

      if (res.ok) {
        const data = await res.json();
        const sub: Subscription | null = data.subscription;

        if (sub && sub.status === 'active') {
          const expiry = new Date(sub.expiry_date);
          const isValid = expiry > new Date();
          const tier = sub.tier_id as 'basic' | 'premium' | 'vip';

          setAccess({
            hasAccess: isValid,
            tier: isValid ? tier : 'none',
            expiresAt: isValid ? expiry : null,
            benefits: isValid ? TIER_BENEFITS[tier] || [] : [],
            loading: false,
          });
          return;
        }
      }

      setAccess({
        hasAccess: false,
        tier: 'none',
        expiresAt: null,
        benefits: [],
        loading: false,
      });
    } catch (error) {
      console.error('Failed to check premium access:', error);
      setAccess((prev) => ({ ...prev, loading: false }));
    }
  }, [address, stationName]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  // Helper functions
  const hasBenefit = useCallback(
    (benefit: string) => access.benefits.includes(benefit),
    [access.benefits]
  );

  const canAccessExclusiveContent = useCallback(
    () => hasBenefit('exclusive-content'),
    [hasBenefit]
  );

  const canAccessVIPRoom = useCallback(
    () => hasBenefit('vip-room'),
    [hasBenefit]
  );

  const hasRequestPriority = useCallback(
    () => hasBenefit('request-priority'),
    [hasBenefit]
  );

  const hasPremiumBadge = useCallback(
    () => hasBenefit('premium-badge'),
    [hasBenefit]
  );

  return {
    ...access,
    hasBenefit,
    canAccessExclusiveContent,
    canAccessVIPRoom,
    hasRequestPriority,
    hasPremiumBadge,
    refresh: checkAccess,
  };
}
