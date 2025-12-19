'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { CONTRACTS } from '@/constants/addresses';

interface NFT {
  token_id: string;
  contract_address: string;
  name: string;
  description: string | null;
  image_url: string | null;
  collection_name: string;
}

interface CoinbaseIntegrationProps {
  isOpen: boolean;
  onClose: () => void;
}

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export function CoinbaseIntegration({ isOpen, onClose }: CoinbaseIntegrationProps) {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'nfts' | 'swap'>('nfts');

  // Get balances
  const { data: ethBalance } = useBalance({ address });
  const { data: radioBalance } = useReadContract({
    address: CONTRACTS.RADIO_TOKEN,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });
  const { data: vibesBalance } = useReadContract({
    address: CONTRACTS.VIBES_TOKEN,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (isOpen && address) {
      loadNFTs();
    }
  }, [isOpen, address]);

  const loadNFTs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/coinbase/nfts?address=${address}`);
      if (res.ok) {
        const data = await res.json();
        setNfts(data.nfts || []);
      }
    } catch (error) {
      console.error('Failed to load NFTs:', error);
    }
    setLoading(false);
  };

  // DEX links - GeckoTerminal pools (Clanker deployed tokens)
  const DEX_LINKS = {
    RADIO: 'https://www.geckoterminal.com/base/pools/0xbb3b7ca4c9b0ea77f857679fcbbe7b04af7ecb79b5f188fd25820cfd07286650',
    VIBES: 'https://www.geckoterminal.com/base/pools/0xd5c5b28f553c2dd95000768a58bf4bff06c3c17dab57ae79d55e341eb45e6873',
  };

  const openDEX = (token: 'RADIO' | 'VIBES') => {
    window.open(DEX_LINKS[token], '_blank');
  };

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0';
    const formatted = parseFloat(formatUnits(balance, 18));
    if (formatted >= 1000000) return (formatted / 1000000).toFixed(2) + 'M';
    if (formatted >= 1000) return (formatted / 1000).toFixed(2) + 'K';
    return formatted.toFixed(2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-blue-600 rounded-xl w-full max-w-md max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-600/30 bg-gradient-to-r from-blue-900/30 to-blue-800/30">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💎</span>
            <div>
              <h3 className="text-blue-400 font-bold">Wallet</h3>
              <p className="text-dial-cream/50 text-xs">NFTs & Swap</p>
            </div>
          </div>
          <button onClick={onClose} className="text-dial-cream/60 hover:text-dial-cream text-2xl">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-blue-600/20">
          <button
            onClick={() => setActiveTab('nfts')}
            className={`flex-1 py-2 text-sm ${activeTab === 'nfts' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-dial-cream/50'}`}
          >
            NFTs
          </button>
          <button
            onClick={() => setActiveTab('swap')}
            className={`flex-1 py-2 text-sm ${activeTab === 'swap' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-dial-cream/50'}`}
          >
            Swap Tokens
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'nfts' ? (
            loading ? (
              <div className="text-center py-8">
                <div className="animate-spin text-3xl mb-2">💎</div>
                <p className="text-dial-cream/50">Loading NFTs...</p>
              </div>
            ) : nfts.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl">🖼️</span>
                <p className="text-dial-cream/50 mt-4">No NFTs found</p>
                <p className="text-dial-cream/40 text-xs">Your Web3 Radio NFTs will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {nfts.map((nft) => (
                  <NFTCard key={`${nft.contract_address}-${nft.token_id}`} nft={nft} />
                ))}
              </div>
            )
          ) : (
            <div className="space-y-4">
              {/* Balances */}
              <div className="bg-black/30 rounded-lg p-3 border border-blue-600/20">
                <p className="text-dial-cream/50 text-xs mb-2">Your Balances</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-dial-cream">⟠ ETH</span>
                    <span className="text-dial-cream">{ethBalance ? parseFloat(formatUnits(ethBalance.value, 18)).toFixed(4) : '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dial-cream">📻 RADIO</span>
                    <span className="text-dial-cream">{formatBalance(radioBalance as bigint)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dial-cream">✨ VIBES</span>
                    <span className="text-dial-cream">{formatBalance(vibesBalance as bigint)}</span>
                  </div>
                </div>
              </div>

              <p className="text-dial-cream/60 text-sm text-center">
                Swap on GeckoTerminal (Clanker pools)
              </p>
              
              <TokenSwapOption
                name="$RADIO"
                description="Platform governance token"
                icon="📻"
                balance={formatBalance(radioBalance as bigint)}
                onSwap={() => openDEX('RADIO')}
              />
              
              <TokenSwapOption
                name="$VIBES"
                description="Rewards & utility token"
                icon="✨"
                balance={formatBalance(vibesBalance as bigint)}
                onSwap={() => openDEX('VIBES')}
              />

              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-xs">
                  💡 RADIO & VIBES are Clanker tokens. Swap via GeckoTerminal for best rates.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NFTCard({ nft }: { nft: NFT }) {
  return (
    <div className="bg-black/20 rounded-lg overflow-hidden border border-blue-600/20">
      <div className="aspect-square bg-blue-600/10 flex items-center justify-center">
        {nft.image_url ? (
          <img src={nft.image_url} alt={nft.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">🖼️</span>
        )}
      </div>
      <div className="p-2">
        <p className="text-dial-cream text-xs font-medium truncate">{nft.name}</p>
        <p className="text-dial-cream/40 text-xs truncate">{nft.collection_name}</p>
      </div>
    </div>
  );
}

function TokenSwapOption({ name, description, icon, balance, onSwap }: {
  name: string;
  description: string;
  icon: string;
  balance: string;
  onSwap: () => void;
}) {
  return (
    <button
      onClick={onSwap}
      className="w-full p-3 bg-black/20 rounded-lg border border-blue-600/20 hover:border-blue-400/50 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <p className="text-dial-cream font-medium">{name}</p>
          <p className="text-dial-cream/50 text-xs">{description}</p>
        </div>
        <div className="text-right">
          <p className="text-dial-cream/40 text-xs">{balance}</p>
          <span className="text-blue-400 text-sm">Swap →</span>
        </div>
      </div>
    </button>
  );
}
