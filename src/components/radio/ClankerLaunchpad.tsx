'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface StationToken {
  address: string;
  symbol: string;
  name: string;
  total_supply: string;
  holder_count: number;
  price_usd: number;
  market_cap: number;
  liquidity: number;
  created_at: string;
  clanker_url: string;
}

interface TokenHolder {
  wallet_address: string;
  display_name: string | null;
  balance: string;
  percentage: number;
}

interface ClankerLaunchpadProps {
  stationId: string;
  stationName: string;
  isOwner: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function ClankerLaunchpad({
  stationId,
  stationName,
  isOwner,
  isOpen,
  onClose,
}: ClankerLaunchpadProps) {
  const { address } = useAccount();
  const [token, setToken] = useState<StationToken | null>(null);
  const [holders, setHolders] = useState<TokenHolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'holders' | 'perks'>('info');
  const [tokenName, setTokenName] = useState(`${stationName} Token`);
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [initialSupply, setInitialSupply] = useState('1000000');

  useEffect(() => {
    if (isOpen && stationId) {
      loadToken();
    }
  }, [isOpen, stationId]);

  const loadToken = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clanker/token?station_id=${stationId}`);
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setHolders(data.holders || []);
      }
    } catch (error) {
      console.error('Failed to load token:', error);
    }
    setLoading(false);
  };

  const deployToken = async () => {
    if (!address || !tokenSymbol.trim()) return;
    setDeploying(true);
    try {
      const res = await fetch('/api/clanker/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station_id: stationId,
          name: tokenName.trim(),
          symbol: tokenSymbol.trim().toUpperCase(),
          initial_supply: initialSupply,
          deployer_address: address,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) await loadToken();
        else alert(data.error || 'Failed to deploy');
      }
    } catch (error) {
      console.error('Failed to deploy:', error);
    }
    setDeploying(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-blue-500 rounded-xl w-full max-w-md max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-blue-500/30">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <h3 className="text-blue-400 font-bold">Clanker Launchpad</h3>
          </div>
          <button onClick={onClose} className="text-dial-cream/60 hover:text-dial-cream text-2xl">×</button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="animate-spin text-4xl">🚀</div>
          </div>
        ) : token ? (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-center mb-4">
              <p className="text-dial-cream font-bold text-lg">{token.name}</p>
              <p className="text-blue-400">${token.symbol}</p>
              <p className="text-dial-cream/50 text-sm">{token.holder_count} holders</p>
            </div>
            <a href={token.clanker_url} target="_blank" rel="noopener noreferrer" className="block w-full py-2 bg-blue-600 text-white text-center rounded-lg">
              Trade on Clanker →
            </a>
          </div>
        ) : isOwner ? (
          <div className="flex-1 p-4 space-y-4">
            <div className="text-center">
              <span className="text-4xl">🚀</span>
              <p className="text-dial-cream font-bold mt-2">Launch Station Token</p>
            </div>
            <input type="text" value={tokenName} onChange={(e) => setTokenName(e.target.value)} placeholder="Token Name" className="w-full px-3 py-2 bg-black/30 border border-blue-500/30 rounded-lg text-dial-cream" />
            <input type="text" value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())} placeholder="SYMBOL" maxLength={10} className="w-full px-3 py-2 bg-black/30 border border-blue-500/30 rounded-lg text-dial-cream uppercase" />
            <button onClick={deployToken} disabled={!tokenSymbol.trim() || deploying} className="w-full py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 font-bold">
              {deploying ? 'Deploying...' : '🚀 Deploy Token'}
            </button>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4 text-center">
            <div>
              <span className="text-4xl">🎵</span>
              <p className="text-dial-cream/60 mt-4">No token deployed yet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
