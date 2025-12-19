'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useSwap, SwapToken } from '@/hooks/useSwap';

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
  const [activeTab, setActiveTab] = useState<'nfts' | 'buy' | 'swap'>('nfts');
  
  // Swap state
  const [swapAmount, setSwapAmount] = useState('');
  const [tokenIn, setTokenIn] = useState<SwapToken>('ETH');
  const [tokenOut, setTokenOut] = useState<SwapToken>('RADIO');
  const { 
    swap, 
    getQuote,
    isSwapping, 
    isQuoting,
    isConfirming, 
    txHash, 
    error: swapError, 
    quote,
    getBalance,
  } = useSwap();

  // Debounced quote fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (swapAmount && parseFloat(swapAmount) > 0 && tokenIn !== tokenOut) {
        getQuote(tokenIn, tokenOut, swapAmount);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [swapAmount, tokenIn, tokenOut, getQuote]);

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

  // DEX links for buying tokens - using GeckoTerminal pools
  const DEX_LINKS = {
    RADIO: 'https://www.geckoterminal.com/base/pools/0xbb3b7ca4c9b0ea77f857679fcbbe7b04af7ecb79b5f188fd25820cfd07286650',
    VIBES: 'https://www.geckoterminal.com/base/pools/0xd5c5b28f553c2dd95000768a58bf4bff06c3c17dab57ae79d55e341eb45e6873',
    ETH: 'https://app.uniswap.org/swap?chain=base',
  };

  const openDEX = (token: 'RADIO' | 'VIBES' | 'ETH') => {
    window.open(DEX_LINKS[token], '_blank');
  };

  const handleSwap = async () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) return;
    
    const result = await swap({
      tokenIn,
      tokenOut,
      amountIn: swapAmount,
      slippage: 5,
    });
    
    if (result) {
      setSwapAmount('');
    }
  };

  const swapTokens = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
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
            Swap
          </button>
          <button
            onClick={() => setActiveTab('buy')}
            className={`flex-1 py-2 text-sm ${activeTab === 'buy' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-dial-cream/50'}`}
          >
            DEX Links
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
          ) : activeTab === 'swap' ? (
            <div className="space-y-4">
              <p className="text-dial-cream/60 text-sm text-center">
                Swap directly via Uniswap V3
              </p>
              
              {/* From Token */}
              <div className="bg-black/30 rounded-lg p-3 border border-blue-600/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-dial-cream/50 text-xs">From</span>
                  <span className="text-dial-cream/40 text-xs">
                    Balance: {parseFloat(getBalance(tokenIn)).toFixed(4)} {tokenIn}
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-dial-cream text-xl outline-none"
                  />
                  <select
                    value={tokenIn}
                    onChange={(e) => setTokenIn(e.target.value as SwapToken)}
                    className="bg-blue-800 text-white rounded-lg px-3 py-1 outline-none border border-blue-500"
                  >
                    <option value="ETH" className="bg-blue-800 text-white">ETH</option>
                    <option value="RADIO" className="bg-blue-800 text-white">RADIO</option>
                    <option value="VIBES" className="bg-blue-800 text-white">VIBES</option>
                  </select>
                </div>
              </div>

              {/* Swap Direction Button */}
              <div className="flex justify-center">
                <button
                  onClick={swapTokens}
                  className="bg-blue-600/20 hover:bg-blue-600/40 rounded-full p-2 transition-colors"
                >
                  <span className="text-xl">⇅</span>
                </button>
              </div>

              {/* To Token */}
              <div className="bg-black/30 rounded-lg p-3 border border-blue-600/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-dial-cream/50 text-xs">To (estimated)</span>
                  <span className="text-dial-cream/40 text-xs">
                    Balance: {parseFloat(getBalance(tokenOut)).toFixed(4)} {tokenOut}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 text-dial-cream text-xl">
                    {isQuoting ? (
                      <span className="text-dial-cream/50 animate-pulse">Loading...</span>
                    ) : quote ? (
                      parseFloat(quote).toFixed(4)
                    ) : (
                      <span className="text-dial-cream/50">~</span>
                    )}
                  </div>
                  <select
                    value={tokenOut}
                    onChange={(e) => setTokenOut(e.target.value as SwapToken)}
                    className="bg-blue-800 text-white rounded-lg px-3 py-1 outline-none border border-blue-500"
                  >
                    <option value="RADIO" className="bg-blue-800 text-white">RADIO</option>
                    <option value="VIBES" className="bg-blue-800 text-white">VIBES</option>
                    <option value="ETH" className="bg-blue-800 text-white">ETH</option>
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {swapError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-2 text-red-400 text-xs">
                  {swapError}
                </div>
              )}

              {/* Success Message */}
              {txHash && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-2 text-green-400 text-xs">
                  <p>Transaction submitted!</p>
                  <a 
                    href={`https://basescan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    View on BaseScan
                  </a>
                </div>
              )}

              {/* Swap Button */}
              <button
                onClick={handleSwap}
                disabled={isSwapping || isConfirming || !swapAmount || tokenIn === tokenOut}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/30 disabled:cursor-not-allowed rounded-lg text-dial-cream font-bold transition-colors"
              >
                {isSwapping ? 'Swapping...' : isConfirming ? 'Confirming...' : 'Swap'}
              </button>

              <div className="p-3 bg-blue-600/10 rounded-lg text-center">
                <p className="text-dial-cream/50 text-xs">
                  Powered by Uniswap V3 • 1% pool fee • 5% slippage
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-dial-cream/60 text-sm text-center">
                View pools on GeckoTerminal
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
                  GeckoTerminal • Decentralized Exchange
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
