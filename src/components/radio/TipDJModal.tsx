'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { RADIO_TOKEN_ADDRESS, ERC20_ABI } from '@/lib/contracts';

interface TipDJModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationName: string;
  djAddress?: string;
}

// Tip amounts in RADIO tokens
const TIP_AMOUNTS = [
  { amount: 100, label: '☕ 100 RADIO' },
  { amount: 500, label: '🍕 500 RADIO' },
  { amount: 1000, label: '🎵 1K RADIO' },
  { amount: 5000, label: '🔥 5K RADIO' },
];

export function TipDJModal({ isOpen, onClose, stationName, djAddress }: TipDJModalProps) {
  const { address } = useAccount();
  const { radio, radioRaw, refetch } = useTokenBalances();
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  if (!isOpen) return null;

  const tipAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
  const tipAmountWei = parseUnits(tipAmount.toString(), 18);
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
    // Record tip in database
    fetch('/api/tips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        station_name: stationName,
        tipper_address: address,
        dj_address: djAddress,
        amount: tipAmount.toString(),
        token: 'RADIO',
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
                <span className="text-brass font-bold">{formatBalance(radio)} RADIO</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Preset Amounts */}
              <div className="grid grid-cols-2 gap-2">
                {TIP_AMOUNTS.map((tip) => (
                  <button
                    key={tip.amount}
                    onClick={() => {
                      setSelectedAmount(tip.amount);
                      setCustomAmount('');
                    }}
                    className={`p-3 rounded-lg text-sm transition-all ${
                      selectedAmount === tip.amount && !customAmount
                        ? 'bg-brass text-cabinet-dark'
                        : 'bg-black/30 text-dial-cream hover:bg-black/50'
                    }`}
                  >
                    {tip.label}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div>
                <label className="text-dial-cream/60 text-xs block mb-1">
                  Or enter custom amount (RADIO)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-black/30 border border-brass/30 rounded-lg px-3 py-2 text-dial-cream text-sm placeholder:text-dial-cream/40 focus:outline-none focus:border-brass"
                />
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
                  disabled={isPending || isConfirming}
                  className="w-full preset-button py-3 disabled:opacity-50"
                >
                  {isPending ? 'CONFIRM IN WALLET...' : isConfirming ? 'CONFIRMING...' : `TIP ${tipAmount} RADIO`}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
