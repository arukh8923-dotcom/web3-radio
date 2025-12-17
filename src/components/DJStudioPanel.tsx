'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import StationCreator from '@/components/dj/StationCreator';
import { BroadcastManager } from '@/components/dj/BroadcastManager';
import { PlaylistQueue } from '@/components/dj/PlaylistQueue';
import { ScheduledBroadcasts } from '@/components/dj/ScheduledBroadcasts';
import { ShowScheduler } from '@/components/dj/ShowScheduler';

interface DJStudioPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'create' | 'broadcast' | 'playlist' | 'schedule' | 'shows';

export function DJStudioPanel({ isOpen, onClose }: DJStudioPanelProps) {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [myStationId, setMyStationId] = useState<string | null>(null);

  if (!isOpen) return null;

  const tabs: { id: Tab; label: string; icon: string }[] = [
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
              {activeTab === 'create' && (
                <StationCreator
                  onClose={() => setActiveTab('broadcast')}
                  onSuccess={(stationId) => {
                    setMyStationId(stationId);
                    setActiveTab('broadcast');
                  }}
                />
              )}

              {activeTab === 'broadcast' && (
                <BroadcastManager
                  stationId={myStationId || 'demo-station'}
                  isOwner={true}
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
                  isOwner={true}
                />
              )}

              {activeTab === 'shows' && (
                <ShowScheduler
                  stationId={myStationId || 'demo-station'}
                  isOwner={true}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
