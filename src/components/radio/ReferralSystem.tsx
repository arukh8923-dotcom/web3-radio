'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface ReferralStats {
  referral_code: string;
  total_referrals: number;
  active_referrals: number;
  total_vibes_earned: number;
  pending_vibes: number;
  referral_link: string;
}

interface Referral {
  id: string;
  referred_address: string;
  referred_name: string | null;
  joined_at: string;
  is_active: boolean;
  vibes_earned: number;
}

interface ReferralSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReferralSystem({ isOpen, onClose }: ReferralSystemProps) {
  const { address } = useAccount();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [applyCode, setApplyCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [hasReferrer, setHasReferrer] = useState(false);

  useEffect(() => {
    if (isOpen && address) {
      loadReferralData();
    }
  }, [isOpen, address]);

  const loadReferralData = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/referrals?wallet=${address}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setReferrals(data.referrals || []);
        setHasReferrer(data.has_referrer || false);
      }
    } catch (error) {
      console.error('Failed to load referral data:', error);
      // Generate placeholder stats
      const code = generateReferralCode(address);
      setStats({
        referral_code: code,
        total_referrals: 0,
        active_referrals: 0,
        total_vibes_earned: 0,
        pending_vibes: 0,
        referral_link: `${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${code}`,
      });
    }
    setLoading(false);
  };

  const generateReferralCode = (addr: string): string => {
    // Generate a short code from wallet address
    return `W3R-${addr.slice(2, 6).toUpperCase()}${addr.slice(-4).toUpperCase()}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const applyReferralCode = async () => {
    if (!address || !applyCode.trim() || hasReferrer) return;
    setApplying(true);
    try {
      const res = await fetch('/api/referrals/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: address,
          referral_code: applyCode.trim().toUpperCase(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          alert('🎉 Referral code applied! Rewards will be distributed when $VIBES launches.');
          setHasReferrer(true);
          setApplyCode('');
        } else {
          alert(data.error || 'Invalid referral code');
        }
      }
    } catch (error) {
      console.error('Failed to apply code:', error);
      alert('Failed to apply referral code');
    }
    setApplying(false);
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-brass rounded-xl w-full max-w-md max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brass/30">
          <div>
            <h3 className="nixie-tube text-lg">🔗 REFERRAL PROGRAM</h3>
            <p className="text-dial-cream/50 text-xs">
              Invite friends • Earn VIBES rewards on-chain
            </p>
          </div>
          <button onClick={onClose} className="text-dial-cream/60 hover:text-dial-cream text-2xl">
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin text-2xl mb-2">🔗</div>
              <p className="text-dial-cream/60 text-sm">Loading...</p>
            </div>
          </div>
        ) : !address ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-dial-cream/60 text-center">
              Connect wallet to access referral program
            </p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="p-4 border-b border-brass/20">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/30 rounded-lg p-3 text-center">
                    <p className="text-brass text-2xl font-bold">{stats.total_referrals}</p>
                    <p className="text-dial-cream/50 text-xs">Total Referrals</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 text-center">
                    <p className="text-brass text-2xl font-bold">{stats.active_referrals}</p>
                    <p className="text-dial-cream/50 text-xs">Active Users</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 text-center opacity-50">
                    <p className="text-green-400/50 text-lg font-bold">--</p>
                    <p className="text-dial-cream/30 text-xs">VIBES (Soon)</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 text-center opacity-50">
                    <p className="text-amber-400/50 text-lg font-bold">--</p>
                    <p className="text-dial-cream/30 text-xs">Pending (Soon)</p>
                  </div>
                </div>
              </div>
            )}

            {/* Your Referral Code */}
            {stats && (
              <div className="p-4 border-b border-brass/20">
                <p className="text-dial-cream/60 text-xs mb-2">YOUR REFERRAL CODE</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-black/40 border border-brass/30 rounded-lg px-3 py-2">
                    <p className="nixie-tube text-lg text-center">{stats.referral_code}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(stats.referral_code)}
                    className="px-3 py-2 bg-brass/20 text-brass rounded-lg hover:bg-brass/30 transition-colors"
                  >
                    {copied ? '✓' : '📋'}
                  </button>
                </div>

                {/* Share Link */}
                <div className="mt-3">
                  <p className="text-dial-cream/60 text-xs mb-1">SHARE LINK</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={stats.referral_link}
                      readOnly
                      className="flex-1 px-2 py-1.5 bg-black/30 border border-brass/30 rounded text-dial-cream/70 text-xs"
                    />
                    <button
                      onClick={() => copyToClipboard(stats.referral_link)}
                      className="px-2 py-1.5 bg-brass text-cabinet-dark text-xs rounded hover:bg-brass/80"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Social Share */}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      const text = `Join me on Web3 Radio! Use my referral code ${stats.referral_code} to earn bonus VIBES 🎧`;
                      window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="flex-1 px-3 py-2 bg-purple-600/20 text-purple-400 text-xs rounded-lg hover:bg-purple-600/30"
                  >
                    Share on Farcaster
                  </button>
                  <button
                    onClick={() => {
                      const text = `Join me on Web3 Radio! Use my referral code ${stats.referral_code} to earn bonus VIBES 🎧 ${stats.referral_link}`;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600/20 text-blue-400 text-xs rounded-lg hover:bg-blue-600/30"
                  >
                    Share on X
                  </button>
                </div>
              </div>
            )}

            {/* Apply Referral Code (if no referrer) */}
            {!hasReferrer && (
              <div className="p-4 border-b border-brass/20 bg-brass/5">
                <p className="text-dial-cream/60 text-xs mb-2">HAVE A REFERRAL CODE?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={applyCode}
                    onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. W3R-XXXX)"
                    className="flex-1 px-2 py-1.5 bg-black/30 border border-brass/30 rounded text-dial-cream text-sm placeholder:text-dial-cream/30"
                  />
                  <button
                    onClick={applyReferralCode}
                    disabled={!applyCode.trim() || applying}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded disabled:opacity-50"
                  >
                    {applying ? '...' : 'Apply'}
                  </button>
                </div>
                <p className="text-dial-cream/40 text-xs mt-1">
                  Both you and your referrer earn 50 VIBES!
                </p>
              </div>
            )}

            {/* Referrals List */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-dial-cream/60 text-xs mb-2">YOUR REFERRALS</p>
              {referrals.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-dial-cream/40 text-sm">No referrals yet</p>
                  <p className="text-dial-cream/30 text-xs mt-1">
                    Share your code to start earning!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between p-2 bg-black/20 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${referral.is_active ? 'bg-green-400' : 'bg-dial-cream/30'}`} />
                        <div>
                          <p className="text-dial-cream text-sm">
                            {referral.referred_name || truncateAddress(referral.referred_address)}
                          </p>
                          <p className="text-dial-cream/40 text-xs">
                            Joined {new Date(referral.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 text-sm">+{referral.vibes_earned}</p>
                        <p className="text-dial-cream/40 text-xs">VIBES</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rewards Info */}
            <div className="p-4 border-t border-brass/20 bg-black/20">
              <p className="text-brass text-xs font-bold mb-2">🎁 REFERRAL REWARDS</p>
              <div className="space-y-1 text-dial-cream/60 text-xs">
                <p>• You earn <span className="text-green-400">50 VIBES</span> when someone uses your code</p>
                <p>• Your friend also gets <span className="text-green-400">50 VIBES</span> bonus</p>
                <p>• Earn <span className="text-green-400">10 VIBES</span> for each hour they listen</p>
                <p>• <span className="text-purple-400">Rewards tracked on Base L2</span></p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
