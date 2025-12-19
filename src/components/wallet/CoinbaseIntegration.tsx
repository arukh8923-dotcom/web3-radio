'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

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

export function CoinbaseIntegration({ isOpen, onClose }: CoinbaseIntegrationProps) {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'nfts' | 'buy'>('nfts');

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

  // DEX links for buying tokens
  const DEX_LINKS = {
    RADIO: 'https://app.uniswap.org/swap?outputCurrency=0xaF0741FB82633a190683c5cFb4b8546123E93B07&chain=base',
    VIBES: 'https://app.uniswap.org/swap?outputCurrency=0xCD6387AfA893C1Ad070c9870B5e9C4c0B7D56b07&chain=base',
    ETH: 'https://app.uniswap.org/swap?outputCurrency=ETH&chain=base',
  };

  const openDEX = (token: 'RADIO' | 'VIBES' | 'ETH') => {
    window.open(DEX_LINKS[token], '_blank');
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
              <h3 className="text-blue-400 font-bold">Coinbase</h3>
              <p className="text-dial-cream/50 text-xs">Wallet & NFTs</p>
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
            My NFTs
          </button>
          <button
            onClick={() => setActiveTab('buy')}
            className={`flex-1 py-2 text-sm ${activeTab === 'buy' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-dial-cream/50'}`}
          >
            Buy Crypto
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
              <p className="text-dial-cream/60 text-sm text-center">
                Swap tokens on Uniswap (Base)
              </p>
              
              <TokenSwapOption
                token="RADIO"
                name="$RADIO"
                description="Platform governance token"
                icon="📻"
                onSwap={() => openDEX('RADIO')}
              />
              
              <TokenSwapOption
                token="VIBES"
                name="$VIBES"
                description="Rewards & utility token"
                icon="✨"
                onSwap={() => openDEX('VIBES')}
              />
              
              <TokenSwapOption
                token="ETH"
                name="ETH"
                description="For gas fees on Base"
                icon="⟠"
                onSwap={() => openDEX('ETH')}
              />

              <div className="p-3 bg-blue-600/10 rounded-lg text-center">
                <p className="text-dial-cream/50 text-xs">
                  Powered by Uniswap • Decentralized Exchange
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

function TokenSwapOption({ token, name, description, icon, onSwap }: {
  token: string;
  name: string;
  description: string;
  icon: string;
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
        <span className="text-blue-400 text-sm">Swap →</span>
      </div>
    </button>
  );
}
