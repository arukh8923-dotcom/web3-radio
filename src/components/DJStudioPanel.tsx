'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import {
  StationCreator,
  BroadcastManager,
  PlaylistQueue,
  ScheduledBroadcasts,
  ShowScheduler,
} from '@/components/dj';
import { MintFrequencyNFT } from '@/components/nft';

interface DJStudioPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userFid?: number;
}

type Tab = 'mint' | 'create' | 'broadcast' | 'playlist' | 'schedule' | 'shows';

export function DJStudioPanel({ isOpen, onClose, userFid }: DJStudioPanelProps) {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>('mint');
  const [myStationId, setMyStationId] = useState<string | null>(null);
  const [showMintModal, setShowMintModal] = useState(false);
  const [ownedFrequency, setOwnedFrequency] = useState<number | null>(null);

  if (!isOpen) return null;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'mint', label: 'Claim Freq', icon: '🎫' },
    { id: 'create', label: 'Create', icon: '📻' },
    { id: 'broadcast', label: 'Broadcast', icon: '🎙️' },
    { id: 'playlist', label: 'Queue', icon: '📝' },
    { id: 'schedule', label: 'Schedule', icon: '📅' },
    { id: 'shows', label: 'Shows', icon: '🎬' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-amber-500 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-amber-500/30">
          <h2 className="text-lg font-dial text-amber-400">🎙️ DJ Studio</h2>
          <button
            onClick={onClose}
            className="text-dial-cream/60 hover:text-dial-cream text-2xl"
          >
            ×
          </button>
        </div>

        {!isConnected ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <span className="text-4xl mb-4 block">🔌</span>
              <p className="text-dial-cream/60">Connect wallet to access DJ Studio</p>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-amber-500/30 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[80px] px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/10'
                      : 'text-dial-cream/60 hover:text-dial-cream hover:bg-black/20'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'mint' && (
                <div className="space-y-4">
                  <div className="text-center py-6">
                    <div className="text-5xl mb-4">🎫</div>
                    <h3 className="text-brass text-xl font-bold mb-2">Claim Your Frequency</h3>
                    <p className="text-dial-cream/60 text-sm mb-6">
                      Own a radio frequency on Web3 Radio. Each frequency is unique and gives you the right to broadcast.
                    </p>
                    <button
                      onClick={() => setShowMintModal(true)}
                      className="preset-button px-8 py-3 text-lg"
                    >
                      🎫 Mint Frequency NFT
                    </button>
                  </div>
                  
                  {ownedFrequency && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                      <p className="text-green-400 font-bold">✓ You own {ownedFrequency.toFixed(1)} FM</p>
                      <button
                        onClick={() => setActiveTab('create')}
                        className="mt-2 text-brass text-sm hover:underline"
                      >
                        Create your station →
                      </button>
                    </div>
                  )}
                  
                  <div className="bg-black/30 rounded-lg p-4 border border-brass/20">
                    <h4 className="text-brass text-sm font-bold mb-2">📜 How it works:</h4>
                    <ul className="text-dial-cream/60 text-sm space-y-1">
                      <li>• Choose an available frequency (87.5 - 108.0 FM)</li>
                      <li>• Pay mint fee in $RADIO tokens (~$10)</li>
                      <li>• Receive your Radio License NFT</li>
                      <li>• Start broadcasting on your frequency!</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'create' && (
                <StationCreator
                  onClose={() => setActiveTab('broadcast')}
                  onSuccess={(stationId: string) => {
                    setMyStationId(stationId);
                    setActiveTab('broadcast');
                  }}
                />
              )}

              {activeTab === 'broadcast' && (
                <BroadcastManager
                  stationId={myStationId || 'demo-station'}
                  stationName="My Station"
                />
              )}

              {activeTab === 'playlist' && (
                <PlaylistQueue
                  stationId={myStationId || 'demo-station'}
                  isOwner={true}
                />
              )}

              {activeTab === 'schedule' && (
                <ScheduledBroadcasts
                  stationId={myStationId || 'demo-station'}
                  stationName="My Station"
                />
              )}

              {activeTab === 'shows' && (
                <ShowScheduler
                  stationId={myStationId || 'demo-station'}
                  stationName="My Station"
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Mint NFT Modal */}
      <MintFrequencyNFT
        isOpen={showMintModal}
        onClose={() => setShowMintModal(false)}
        userFid={userFid}
        onSuccess={(tokenId, frequency) => {
          setOwnedFrequency(frequency);
          setShowMintModal(false);
          setActiveTab('create');
        }}
      />
    </div>
  );
}
