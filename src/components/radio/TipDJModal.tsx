'use client';

import { useState, useMemo } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { useTokenPrice } from '@/hooks/useTokenPrice';
import { RADIO_TOKEN_ADDRESS, ERC20_ABI } from '@/lib/contracts';

interface TipDJModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationName: string;
  djAddress?: string;
}

// Tip amounts in USD (will be converted to RADIO dynamically)
const TIP_AMOUNTS_USD = [
  { usd: 0.50, label: '☕', emoji: '☕' },
  { usd: 1.00, label: '🍕', emoji: '🍕' },
  { usd: 2.50, label: '🎵', emoji: '🎵' },
  { usd: 5.00, label: '🔥', emoji: '🔥' },
];

export function TipDJModal({ isOpen, onClose, stationName, djAddress }: TipDJModalProps) {
  const { address } = useAccount();
  const { radio, radioRaw, refetch } = useTokenBalances();
  const { prices, usdToRadio, radioToUsd, formatRadioAmount, loading: priceLoading } = useTokenPrice();
  const [selectedUsd, setSelectedUsd] = useState(1.00);
  const [customUsd, setCustomUsd] = useState('');
  const [message, setMessage] = useState('');

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Calculate tip amounts dynamically based on USD price
  const tipAmounts = useMemo(() => {
    return TIP_AMOUNTS_USD.map(tip => ({
      ...tip,
      radioAmount: usdToRadio(tip.usd),
    }));
  }, [prices, usdToRadio]);

  if (!isOpen) return null;

  const tipUsd = customUsd ? parseFloat(customUsd) : selectedUsd;
  const tipAmount = usdToRadio(tipUsd);
  const tipAmountWei = parseUnits(Math.floor(tipAmount).toString(), 18);
  const hasEnoughBalance = radioRaw >= tipAmountWei;

  const handleTip = async () => {
    if (!address || !djAddress || djAddress === 'unknown') {
      alert('DJ wallet address not available');
      return;
    }

    if (!hasEnoughBalance) {
      alert(`Insufficient RADIO balance. You have ${parseFloat(radio).toFixed(2)} RADIO`);
      return;
    }

    try {
      // Direct transfer to DJ (simple approach)
      // Note: For proper revenue split, use SubscriptionManager.tip() which handles:
      // - 60/40 split for Free DJs
      // - 70/30 split for Verified DJs
      // - 80/20 split for Premium DJs
      // This requires approval first, then calling the contract
      
      writeContract({
        address: RADIO_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [djAddress as `0x${string}`, tipAmountWei],
      });
    } catch (err) {
      console.error('Failed to send tip:', err);
    }
  };

  // Handle success
  if (isSuccess && hash) {
    // Record tip in database - use token address for validation
    fetch('/api/tips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        station_name: stationName,
        tipper_address: address,
        dj_address: djAddress,
        amount: tipAmount.toString(),
        token_address: RADIO_TOKEN_ADDRESS, // Use address for API validation
        message,
        tx_hash: hash,
      }),
    }).then(() => {
      refetch();
    });
  }

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num < 1000) return num.toFixed(2);
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-brass rounded-xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brass/30">
          <div>
            <h3 className="nixie-tube text-lg">💰 TIP DJ</h3>
            <p className="text-dial-cream/50 text-xs">{stationName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-dial-cream/60 hover:text-dial-cream text-2xl"
          >
            ×
          </button>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="p-6 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h4 className="text-dial-cream font-bold text-lg mb-2">Tip Sent!</h4>
            <p className="text-dial-cream/60 text-sm mb-4">
              You tipped {tipAmount} RADIO to the DJ
            </p>
            <a
              href={`https://basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brass text-xs hover:underline"
            >
              View on BaseScan →
            </a>
            <button
              onClick={onClose}
              className="w-full mt-4 preset-button py-2"
            >
              CLOSE
            </button>
          </div>
        ) : (
          <>
            {/* Balance Display */}
            <div className="px-4 pt-4">
              <div className="flex items-center justify-between bg-black/30 rounded-lg p-2">
                <span className="text-dial-cream/60 text-xs">Your Balance:</span>
                <div className="text-right">
                  <span className="text-brass font-bold">{formatRadioAmount(parseFloat(radio))} RADIO</span>
                  <span className="text-dial-cream/50 text-xs ml-2">(~${radioToUsd(parseFloat(radio)).toFixed(2)})</span>
                </div>
              </div>
              {priceLoading && (
                <p className="text-dial-cream/40 text-xs mt-1 text-center">Loading prices...</p>
              )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Preset Amounts - USD based */}
              <div className="grid grid-cols-2 gap-2">
                {tipAmounts.map((tip) => (
                  <button
                    key={tip.usd}
                    onClick={() => {
                      setSelectedUsd(tip.usd);
                      setCustomUsd('');
                    }}
                    className={`p-3 rounded-lg text-sm transition-all ${
                      selectedUsd === tip.usd && !customUsd
                        ? 'bg-brass text-cabinet-dark'
                        : 'bg-black/30 text-dial-cream hover:bg-black/50'
                    }`}
                  >
                    <div className="text-lg">{tip.emoji}</div>
                    <div className="font-bold">${tip.usd.toFixed(2)}</div>
                    <div className="text-xs opacity-70">{formatRadioAmount(tip.radioAmount)}</div>
                  </button>
                ))}
              </div>

              {/* Custom Amount in USD */}
              <div>
                <label className="text-dial-cream/60 text-xs block mb-1">
                  Or enter custom amount (USD)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dial-cream/50">$</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={customUsd}
                      onChange={(e) => setCustomUsd(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-black/30 border border-brass/30 rounded-lg pl-7 pr-3 py-2 text-dial-cream text-sm placeholder:text-dial-cream/40 focus:outline-none focus:border-brass"
                    />
                  </div>
                  {customUsd && (
                    <div className="flex items-center text-dial-cream/60 text-xs">
                      ≈ {formatRadioAmount(usdToRadio(parseFloat(customUsd) || 0))} RADIO
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-dial-cream/60 text-xs block mb-1">
                  Message (optional)
                </label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Great vibes! 🎵"
                  maxLength={100}
                  className="w-full bg-black/30 border border-brass/30 rounded-lg px-3 py-2 text-dial-cream text-sm placeholder:text-dial-cream/40 focus:outline-none focus:border-brass"
                />
              </div>

              {/* Error Display */}
              {error && (
                <p className="text-red-400 text-xs text-center">
                  {error.message.includes('rejected') ? 'Transaction rejected' : 'Transaction failed'}
                </p>
              )}

              {/* Info */}
              <p className="text-dial-cream/40 text-xs text-center">
                📻 Tips are sent directly on-chain via Base L2
              </p>
              {prices && prices.radio_usd > 0 && (
                <p className="text-dial-cream/30 text-xs text-center">
                  1 RADIO ≈ ${prices.radio_usd.toFixed(8)} USD
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-brass/30">
              {!address ? (
                <p className="text-dial-cream/50 text-center text-sm">
                  Connect wallet to tip
                </p>
              ) : !djAddress || djAddress === 'unknown' ? (
                <p className="text-dial-cream/50 text-center text-sm">
                  DJ wallet not available
                </p>
              ) : !hasEnoughBalance ? (
                <div className="text-center">
                  <p className="text-red-400 text-sm mb-2">Insufficient RADIO balance</p>
                  <p className="text-dial-cream/50 text-xs mb-2">
                    Need {formatRadioAmount(tipAmount)} RADIO (~${tipUsd.toFixed(2)})
                  </p>
                  <a
                    href={`https://app.uniswap.org/swap?outputCurrency=${RADIO_TOKEN_ADDRESS}&chain=base`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brass text-xs hover:underline"
                  >
                    Buy RADIO on Uniswap →
                  </a>
                </div>
              ) : (
                <button
                  onClick={handleTip}
                  disabled={isPending || isConfirming || priceLoading}
                  className="w-full preset-button py-3 disabled:opacity-50"
                >
                  {isPending ? 'CONFIRM IN WALLET...' : isConfirming ? 'CONFIRMING...' : `TIP $${tipUsd.toFixed(2)} (${formatRadioAmount(tipAmount)} RADIO)`}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
