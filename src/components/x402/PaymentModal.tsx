'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { useTokenPrice } from '@/hooks/useTokenPrice';
import { useX402, formatPaymentAmount } from '@/hooks/useX402';
import { REVENUE_SPLIT, DJTier } from '@/lib/x402';

interface PaymentInfo {
  token: 'RADIO' | 'VIBES';
  tokenAddress: string;
  amount: string;
  recipient: string;
  treasury: string;
  split: { dj: number; treasury: number };
  description: string;
  expiresAt: number;
  network: string;
  chainId: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (txHash: string) => void;
  paymentInfo: PaymentInfo;
}

export function PaymentModal({ isOpen, onClose, onSuccess, paymentInfo }: PaymentModalProps) {
  const { address } = useAccount();
  const { radio, vibes, radioRaw, vibesRaw } = useTokenBalances();
  const { prices, formatRadioAmount, formatVibesAmount } = useTokenPrice();
  const { handlePayment, isPaying, isConfirming, error } = useX402();

  if (!isOpen) return null;

  const isRadio = paymentInfo.token === 'RADIO';
  const balance = isRadio ? radioRaw : vibesRaw;
  const balanceFormatted = isRadio ? formatRadioAmount(parseFloat(radio)) : formatVibesAmount(parseFloat(vibes));
  const amountNeeded = BigInt(paymentInfo.amount);
  const hasEnoughBalance = balance >= amountNeeded;

  // Calculate USD value
  const tokenPrice = isRadio ? prices?.radio_usd : prices?.vibes_usd;
  const usdValue = tokenPrice ? Number(paymentInfo.amount) * tokenPrice : 0;

  // Calculate split amounts
  const djAmount = (amountNeeded * BigInt(paymentInfo.split.dj)) / BigInt(100);
  const treasuryAmount = amountNeeded - djAmount;

  const handlePay = async () => {
    const txHash = await handlePayment(paymentInfo);
    if (txHash) {
      onSuccess(txHash);
    }
  };

  const timeRemaining = Math.max(0, paymentInfo.expiresAt - Math.floor(Date.now() / 1000));
  const isExpired = timeRemaining <= 0;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-brass rounded-xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brass/30">
          <div>
            <h3 className="nixie-tube text-lg">💳 PAYMENT REQUIRED</h3>
            <p className="text-dial-cream/50 text-xs">x402 Micropayment</p>
          </div>
          <button onClick={onClose} className="text-dial-cream/60 hover:text-dial-cream text-2xl">
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Description */}
          <div className="bg-black/30 rounded-lg p-3">
            <p className="text-dial-cream text-sm">{paymentInfo.description}</p>
          </div>

          {/* Amount */}
          <div className="text-center py-4">
            <p className="text-brass text-3xl font-bold">
              {formatPaymentAmount(paymentInfo.amount, paymentInfo.token)}
            </p>
            {usdValue > 0 && (
              <p className="text-dial-cream/50 text-sm">≈ ${usdValue.toFixed(4)} USD</p>
            )}
          </div>

          {/* Revenue Split */}
          <div className="bg-black/20 rounded-lg p-3 space-y-2">
            <p className="text-dial-cream/60 text-xs">Revenue Split:</p>
            <div className="flex justify-between text-sm">
              <span className="text-dial-cream/70">DJ ({paymentInfo.split.dj}%)</span>
              <span className="text-green-400">
                {formatPaymentAmount(djAmount.toString(), paymentInfo.token)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dial-cream/70">Platform ({paymentInfo.split.treasury}%)</span>
              <span className="text-brass">
                {formatPaymentAmount(treasuryAmount.toString(), paymentInfo.token)}
              </span>
            </div>
          </div>

          {/* Balance */}
          <div className="flex justify-between items-center bg-black/30 rounded-lg p-3">
            <span className="text-dial-cream/60 text-sm">Your Balance:</span>
            <span className={`font-bold ${hasEnoughBalance ? 'text-green-400' : 'text-red-400'}`}>
              {balanceFormatted} {paymentInfo.token}
            </span>
          </div>

          {/* Expiry Warning */}
          {!isExpired && timeRemaining < 60 && (
            <p className="text-amber-400 text-xs text-center">
              ⏱️ Expires in {timeRemaining}s
            </p>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {!address ? (
              <p className="text-dial-cream/50 text-center text-sm">
                Connect wallet to pay
              </p>
            ) : isExpired ? (
              <p className="text-red-400 text-center text-sm">
                Payment request expired
              </p>
            ) : !hasEnoughBalance ? (
              <div className="text-center">
                <p className="text-red-400 text-sm mb-2">Insufficient {paymentInfo.token} balance</p>
                <a
                  href={`https://app.uniswap.org/swap?outputCurrency=${paymentInfo.tokenAddress}&chain=base`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brass text-xs hover:underline"
                >
                  Buy {paymentInfo.token} on Uniswap →
                </a>
              </div>
            ) : (
              <button
                onClick={handlePay}
                disabled={isPaying || isConfirming}
                className="w-full preset-button py-3 disabled:opacity-50"
              >
                {isPaying ? 'CONFIRM IN WALLET...' : isConfirming ? 'CONFIRMING...' : 'PAY NOW'}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2 text-dial-cream/60 hover:text-dial-cream text-sm"
            >
              Cancel
            </button>
          </div>

          {/* Info */}
          <p className="text-dial-cream/30 text-xs text-center">
            Powered by x402 Protocol • Base L2
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
