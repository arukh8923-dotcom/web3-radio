'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { useTokenPrice } from '@/hooks/useTokenPrice';
import { RADIO_TOKEN_ADDRESS, ERC20_ABI } from '@/lib/contracts';
import {
  STATION_NFT_ADDRESS,
  STATION_NFT_ABI,
  STATION_CATEGORIES,
  frequencyToContract,
  formatFrequency,
  isValidFrequency,
  isPremiumFrequency,
} from '@/lib/stationNFT';

interface MintFrequencyNFTProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (tokenId: number, frequency: number) => void;
  defaultFrequency?: number;
  userFid?: number;
}

export function MintFrequencyNFT({ 
  isOpen, 
  onClose, 
  onSuccess,
  defaultFrequency,
  userFid = 0,
}: MintFrequencyNFTProps) {
  const { address } = useAccount();
  const { radio, radioRaw, refetch: refetchBalance } = useTokenBalances();
  const { formatRadioAmount, radioToUsd } = useTokenPrice();
  
  // Form state
  const [frequency, setFrequency] = useState(defaultFrequency?.toString() || '88.1');
  const [stationName, setStationName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('music');
  const [step, setStep] = useState<'form' | 'approve' | 'mint' | 'success'>('form');
  
  // Contract reads
  const { data: mintFee } = useReadContract({
    address: STATION_NFT_ADDRESS,
    abi: STATION_NFT_ABI,
    functionName: 'getMintFee',
    args: [BigInt(frequencyToContract(parseFloat(frequency) || 88.1))],
  });

  const { data: isAvailable } = useReadContract({
    address: STATION_NFT_ADDRESS,
    abi: STATION_NFT_ABI,
    functionName: 'isFrequencyAvailable',
    args: [BigInt(frequencyToContract(parseFloat(frequency) || 88.1))],
  });

  const { data: allowance } = useReadContract({
    address: RADIO_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, STATION_NFT_ADDRESS],
  });

  // Contract writes
  const { writeContract: approve, data: approveHash, isPending: isApproving } = useWriteContract();
  const { writeContract: mint, data: mintHash, isPending: isMinting } = useWriteContract();
  
  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isSuccess: mintSuccess, data: mintReceipt } = useWaitForTransactionReceipt({ hash: mintHash });

  // Handle approve success
  useEffect(() => {
    if (approveSuccess) {
      setStep('mint');
      handleMint();
    }
  }, [approveSuccess]);

  // Handle mint success
  useEffect(() => {
    if (mintSuccess && mintReceipt) {
      setStep('success');
      refetchBalance();
      // Extract tokenId from logs if needed
      const tokenId = 1; // TODO: parse from receipt
      onSuccess?.(tokenId, parseFloat(frequency));
    }
  }, [mintSuccess, mintReceipt]);

  const handleApprove = () => {
    if (!mintFee || !address) return;
    
    setStep('approve');
    approve({
      address: RADIO_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [STATION_NFT_ADDRESS, mintFee],
    });
  };

  const handleMint = () => {
    if (!address) return;
    
    const contractFreq = frequencyToContract(parseFloat(frequency));
    
    mint({
      address: STATION_NFT_ADDRESS,
      abi: STATION_NFT_ABI,
      functionName: 'mintFrequency',
      args: [
        BigInt(contractFreq),
        stationName,
        description,
        category,
        BigInt(userFid),
      ],
    });
  };

  const handleSubmit = () => {
    if (!mintFee || !allowance) return;
    
    // Check if we need approval
    if (allowance < mintFee) {
      handleApprove();
    } else {
      setStep('mint');
      handleMint();
    }
  };

  const canMint = () => {
    if (!address || !mintFee || !isAvailable) return false;
    if (!stationName.trim()) return false;
    if (!isValidFrequency(parseFloat(frequency))) return false;
    if (radioRaw < mintFee) return false;
    return true;
  };

  const formatFee = () => {
    if (!mintFee) return '...';
    const amount = Number(formatUnits(mintFee, 18));
    const usd = radioToUsd(amount);
    return `${formatRadioAmount(amount)} RADIO (~$${usd.toFixed(2)})`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-brass rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brass/30 sticky top-0 bg-cabinet-dark">
          <div>
            <h3 className="nixie-tube text-lg">📻 MINT FREQUENCY NFT</h3>
            <p className="text-dial-cream/50 text-xs">Claim your radio frequency</p>
          </div>
          <button onClick={onClose} className="text-dial-cream/60 hover:text-dial-cream text-2xl">
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          {step === 'success' ? (
            /* Success View */
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h4 className="text-brass text-xl font-bold mb-2">Frequency Claimed!</h4>
              <p className="text-dial-cream/70 mb-4">
                You now own <span className="text-brass font-bold">{formatFrequency(frequencyToContract(parseFloat(frequency)))}</span>
              </p>
              <p className="text-dial-cream/50 text-sm mb-6">
                Station: {stationName}
              </p>
              <button
                onClick={onClose}
                className="preset-button px-6 py-2"
              >
                Done
              </button>
            </div>
          ) : step === 'approve' || step === 'mint' ? (
            /* Processing View */
            <div className="text-center py-8">
              <div className="animate-spin text-4xl mb-4">📻</div>
              <h4 className="text-brass text-lg mb-2">
                {step === 'approve' ? 'Approving RADIO...' : 'Minting NFT...'}
              </h4>
              <p className="text-dial-cream/60 text-sm">
                {step === 'approve' 
                  ? 'Please confirm the approval in your wallet'
                  : 'Please confirm the mint transaction'}
              </p>
            </div>
          ) : (
            /* Form View */
            <>
              {/* Balance Display */}
              <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
                <span className="text-dial-cream/60 text-sm">Your RADIO Balance:</span>
                <span className="text-brass font-bold">{formatRadioAmount(parseFloat(radio))} RADIO</span>
              </div>

              {/* Frequency Input */}
              <div>
                <label className="block text-dial-cream/70 text-sm mb-2">Frequency</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="87.5"
                    max="108.0"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="flex-1 bg-black/30 border border-brass/30 rounded-lg px-4 py-3 text-dial-cream text-xl font-bold focus:border-brass outline-none"
                    placeholder="88.1"
                  />
                  <span className="flex items-center text-dial-cream/50 text-lg">FM</span>
                </div>
                {/* Frequency status */}
                <div className="mt-2 text-sm">
                  {!isValidFrequency(parseFloat(frequency)) ? (
                    <span className="text-red-400">❌ Invalid frequency (87.5-108.0 or 420.0)</span>
                  ) : isAvailable === false ? (
                    <span className="text-red-400">❌ Frequency already claimed</span>
                  ) : isAvailable === true ? (
                    <span className="text-green-400">✓ Frequency available!</span>
                  ) : (
                    <span className="text-dial-cream/50">Checking availability...</span>
                  )}
                </div>
                {isPremiumFrequency(parseFloat(frequency)) && (
                  <div className="mt-2 bg-purple-500/20 border border-purple-500/30 rounded-lg p-2">
                    <span className="text-purple-400 text-sm">🌿 Premium 420 Frequency - Higher mint fee</span>
                  </div>
                )}
              </div>

              {/* Station Name */}
              <div>
                <label className="block text-dial-cream/70 text-sm mb-2">Station Name *</label>
                <input
                  type="text"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  className="w-full bg-black/30 border border-brass/30 rounded-lg px-4 py-3 text-dial-cream focus:border-brass outline-none"
                  placeholder="My Awesome Station"
                  maxLength={50}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-dial-cream/70 text-sm mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/30 border border-brass/30 rounded-lg px-4 py-3 text-dial-cream focus:border-brass outline-none resize-none"
                  placeholder="What's your station about?"
                  rows={3}
                  maxLength={200}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-dial-cream/70 text-sm mb-2">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {STATION_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.value)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        category === cat.value
                          ? 'bg-brass text-cabinet-dark font-bold'
                          : 'bg-black/30 text-dial-cream/70 hover:bg-black/50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mint Fee */}
              <div className="bg-black/30 rounded-lg p-4 border border-brass/30">
                <div className="flex justify-between items-center">
                  <span className="text-dial-cream/70">Mint Fee:</span>
                  <span className="text-brass font-bold">{formatFee()}</span>
                </div>
                {mintFee && radioRaw < mintFee && (
                  <p className="text-red-400 text-sm mt-2">
                    ⚠️ Insufficient RADIO balance
                  </p>
                )}
              </div>

              {/* Mint Button */}
              <button
                onClick={handleSubmit}
                disabled={!canMint() || isApproving || isMinting}
                className="w-full preset-button py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!address
                  ? 'Connect Wallet'
                  : !canMint()
                  ? 'Cannot Mint'
                  : isApproving
                  ? 'Approving...'
                  : isMinting
                  ? 'Minting...'
                  : `Mint ${formatFrequency(frequencyToContract(parseFloat(frequency)))}`}
              </button>

              <p className="text-dial-cream/40 text-xs text-center">
                Payment in $RADIO • On Base L2 • Created by @ukhy89
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MintFrequencyNFT;
