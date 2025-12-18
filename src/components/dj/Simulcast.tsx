'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Station {
  id: string;
  name: string;
  frequency: number;
  listenerCount: number;
  owner: string;
}

interface SimulcastSession {
  id: string;
  hostStationId: string;
  hostStationName: string;
  participatingStations: Station[];
  totalListeners: number;
  status: 'pending' | 'active' | 'ended';
  startTime: number;
}

// Placeholder: get available stations for simulcast
async function getAvailableStations(excludeId: string): Promise<Station[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: '2', name: 'Chill FM', frequency: 92.5, listenerCount: 45, owner: 'chillfm.base' },
    { id: '3', name: 'Bass Station', frequency: 95.0, listenerCount: 78, owner: 'bassmaster.base' },
    { id: '4', name: '420 Radio', frequency: 104.2, listenerCount: 120, owner: 'vibes420.base' },
  ];
}

// Placeholder: get active simulcast
async function getActiveSimulcast(stationId: string): Promise<SimulcastSession | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return null;
}

// Placeholder: request simulcast
async function requestSimulcast(params: {
  hostStationId: string;
  targetStationIds: string[];
  djAddress: string;
}): Promise<{ success: boolean; sessionId: string }> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { success: true, sessionId: `simulcast-${Date.now()}` };
}

// Placeholder: approve simulcast request
async function approveSimulcast(sessionId: string, stationId: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
}

// Placeholder: end simulcast
async function endSimulcast(sessionId: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
}

export default function Simulcast({ 
  stationId,
  stationName,
}: { 
  stationId: string;
  stationName: string;
}) {
  const { address } = useAccount();
  const [availableStations, setAvailableStations] = useState<Station[]>([]);
  const [selectedStations, setSelectedStations] = useState<string[]>([]);
  const [activeSession, setActiveSession] = useState<SimulcastSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<SimulcastSession[]>([]);

  useEffect(() => {
    loadData();
  }, [stationId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stations, session] = await Promise.all([
        getAvailableStations(stationId),
        getActiveSimulcast(stationId),
      ]);
      setAvailableStations(stations);
      setActiveSession(session);
    } catch (err) {
      console.error('Failed to load simulcast data:', err);
    }
    setLoading(false);
  };

  const handleToggleStation = (id: string) => {
    setSelectedStations(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const handleRequestSimulcast = async () => {
    if (!address || selectedStations.length === 0) return;
    
    setRequesting(true);
    try {
      const result = await requestSimulcast({
        hostStationId: stationId,
        targetStationIds: selectedStations,
        djAddress: address,
      });
      
      if (result.success) {
        // Show pending state
        const selectedStationData = availableStations.filter(s => 
          selectedStations.includes(s.id)
        );
        setActiveSession({
          id: result.sessionId,
          hostStationId: stationId,
          hostStationName: stationName,
          participatingStations: selectedStationData,
          totalListeners: selectedStationData.reduce((acc, s) => acc + s.listenerCount, 0),
          status: 'pending',
          startTime: Date.now(),
        });
        setSelectedStations([]);
      }
    } catch (err) {
      console.error('Failed to request simulcast:', err);
    }
    setRequesting(false);
  };

  const handleEndSimulcast = async () => {
    if (!activeSession) return;
    
    try {
      await endSimulcast(activeSession.id);
      setActiveSession(null);
    } catch (err) {
      console.error('Failed to end simulcast:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-xl p-6 border border-amber-900/30">
        <div className="text-center py-4 text-amber-100/60">Loading...</div>
      </div>
    );
  }

  // Active simulcast view
  if (activeSession) {
    return (
      <div className="bg-zinc-900 rounded-xl border border-purple-500/30 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 px-4 py-3 border-b border-purple-500/30">
          <div className="flex items-center justify-between">
            <h2 className="text-purple-300 font-bold flex items-center gap-2">
              <span className={activeSession.status === 'active' ? 'animate-pulse' : ''}>📡</span>
              Simulcast {activeSession.status === 'active' ? 'LIVE' : 'Pending'}
            </h2>
            <div className="text-amber-100/60 text-sm">
              👥 {activeSession.totalListeners} total listeners
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Status */}
          <div className={`p-3 rounded-lg ${
            activeSession.status === 'active' 
              ? 'bg-green-500/10 border border-green-500/30' 
              : 'bg-yellow-500/10 border border-yellow-500/30'
          }`}>
            <div className={`text-sm ${
              activeSession.status === 'active' ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {activeSession.status === 'active' 
                ? '🟢 Broadcasting to all stations'
                : '⏳ Waiting for station approvals...'}
            </div>
          </div>

          {/* Participating Stations */}
          <div>
            <div className="text-amber-100/40 text-xs uppercase mb-2">
              Participating Stations
            </div>
            <div className="space-y-2">
              {activeSession.participatingStations.map(station => (
                <div
                  key={station.id}
                  className="bg-black/20 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="text-amber-100">{station.name}</div>
                    <div className="text-amber-100/60 text-sm">{station.frequency} FM</div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-100/60 text-sm">
                      👥 {station.listenerCount}
                    </div>
                    <div className="text-green-400 text-xs">Connected</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* End Button */}
          <button
            onClick={handleEndSimulcast}
            className="w-full px-4 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500"
          >
            ⏹️ End Simulcast
          </button>
        </div>
      </div>
    );
  }

  // Setup view
  return (
    <div className="bg-zinc-900 rounded-xl border border-amber-900/30 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 px-4 py-3 border-b border-amber-900/30">
        <h2 className="text-amber-100 font-bold flex items-center gap-2">
          <span>📡</span> Cross-Station Simulcast
        </h2>
      </div>
      
      <div className="p-4 space-y-4">
        <p className="text-amber-100/60 text-sm">
          Broadcast simultaneously to multiple stations. Select stations to invite:
        </p>

        {/* Available Stations */}
        {availableStations.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">📻</div>
            <div className="text-amber-100/60 text-sm">No stations available</div>
          </div>
        ) : (
          <div className="space-y-2">
            {availableStations.map(station => (
              <button
                key={station.id}
                onClick={() => handleToggleStation(station.id)}
                className={`w-full p-3 rounded-lg flex items-center justify-between transition-all ${
                  selectedStations.includes(station.id)
                    ? 'bg-purple-500/20 border border-purple-500/50'
                    : 'bg-black/20 border border-transparent hover:border-amber-900/30'
                }`}
              >
                <div className="text-left">
                  <div className="text-amber-100">{station.name}</div>
                  <div className="text-amber-100/60 text-sm">{station.frequency} FM</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-amber-100/40 text-sm">
                    👥 {station.listenerCount}
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedStations.includes(station.id)
                      ? 'bg-purple-500 border-purple-500'
                      : 'border-amber-100/30'
                  }`}>
                    {selectedStations.includes(station.id) && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Summary */}
        {selectedStations.length > 0 && (
          <div className="bg-purple-500/10 rounded-lg p-3">
            <div className="text-purple-300 text-sm">
              Selected {selectedStations.length} station(s) • 
              ~{availableStations
                .filter(s => selectedStations.includes(s.id))
                .reduce((acc, s) => acc + s.listenerCount, 0)} additional listeners
            </div>
          </div>
        )}

        {/* Request Button */}
        <button
          onClick={handleRequestSimulcast}
          disabled={selectedStations.length === 0 || requesting}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {requesting ? 'Sending Requests...' : '📡 Start Simulcast'}
        </button>
      </div>
    </div>
  );
}
