'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

interface TipDJModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationName: string;
  djAddress?: string;
}

const TIP_AMOUNTS = [
  { amount: 0.001, label: '☕ 0.001 ETH' },
  { amount: 0.005, label: '🍕 0.005 ETH' },
  { amount: 0.01, label: '🎵 0.01 ETH' },
  { amount: 0.05, label: '🔥 0.05 ETH' },
];

export function TipDJModal({ isOpen, onClose, stationName, djAddress }: TipDJModalProps) {
  const { address } = useAccount();
  const [selectedAmount, setSelectedAmount] = useState(0.001);
  const [customAmount, setCustomAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleTip = async () => {
    if (!address) return;
    
    const tipAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (isNaN(tipAmount) || tipAmount <= 0) return;

    setSending(true);
    try {
      // For MVP off-chain, just record the tip intent
      const res = await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station_name: stationName,
          tipper_address: address,
          dj_address: djAddress || 'unknown',
          amount: tipAmount.toString(),
          message,
          // tx_hash will be added when on-chain
        }),
      });

      if (res.ok) {
        alert(`Tip recorded! Amount: ${tipAmount} ETH\n\nNote: On-chain tipping coming soon with $RADIO token!`);
        onClose();
      }
    } catch (error) {
      console.error('Failed to record tip:', error);
    }
    setSending(false);
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
              Or enter custom amount (ETH)
            </label>
            <input
              type="number"
              min="0.0001"
              step="0.001"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="0.00"
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

          {/* Info */}
          <p className="text-dial-cream/40 text-xs text-center">
            💡 On-chain tipping with $RADIO token coming soon!
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-brass/30">
          {!address ? (
            <p className="text-dial-cream/50 text-center text-sm">
              Connect wallet to tip
            </p>
          ) : (
            <button
              onClick={handleTip}
              disabled={sending}
              className="w-full preset-button py-3 disabled:opacity-50"
            >
              {sending ? 'SENDING...' : `TIP ${customAmount || selectedAmount} ETH`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
