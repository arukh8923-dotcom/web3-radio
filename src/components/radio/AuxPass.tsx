'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface QueueMember {
  wallet_address: string;
  display_name: string | null;
  avatar_url: string | null;
  position: number;
  joined_at: string;
  vibes_balance: number;
}

interface AuxPassState {
  station_id: string;
  station_name: string;
  frequency: number;
  current_holder: QueueMember | null;
  session_start: string | null;
  session_duration: number; // seconds
  time_remaining: number; // seconds
  queue: QueueMember[];
  min_vibes_required: number;
  is_active: boolean;
}

interface AuxPassProps {
  stationId?: string;
  frequency?: number;
  isOpen: boolean;
  onClose: () => void;
  onBroadcast?: () => void;
}

export function AuxPass({ stationId, frequency, isOpen, onClose, onBroadcast }: AuxPassProps) {
  const { address } = useAccount();
  const [auxState, setAuxState] = useState<AuxPassState | null>(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [passing, setPassing] = useState(false);
  const [userVibes, setUserVibes] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (isOpen && stationId) {
      loadAuxState();
    }
  }, [isOpen, stationId]);

  // Countdown timer
  useEffect(() => {
    if (!auxState?.current_holder || !auxState.session_start) return;

    const interval = setInterval(() => {
      const sessionStart = new Date(auxState.session_start!).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - sessionStart) / 1000);
      const remaining = Math.max(0, auxState.session_duration - elapsed);
      setTimeRemaining(remaining);

      // Auto-refresh when time runs out
      if (remaining === 0) {
        loadAuxState();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [auxState?.current_holder, auxState?.session_start, auxState?.session_duration]);

  const loadAuxState = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (stationId) params.set('station_id', stationId);
      if (address) params.set('wallet', address);

      const res = await fetch(`/api/auxpass?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAuxState(data.aux_state);
        setUserVibes(data.user_vibes || 0);
        if (data.aux_state?.time_remaining) {
          setTimeRemaining(data.aux_state.time_remaining);
        }
      }
    } catch (error) {
      console.error('Failed to load aux state:', error);
    }
    setLoading(false);
  };

  const joinQueue = async () => {
    if (!address || !stationId) return;
    setJoining(true);
    try {
      const res = await fetch('/api/auxpass/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ station_id: stationId, wallet_address: address }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await loadAuxState();
        } else {
          alert(data.error || 'Failed to join queue');
        }
      }
    } catch (error) {
      console.error('Failed to join queue:', error);
    }
    setJoining(false);
  };

  const leaveQueue = async () => {
    if (!address || !stationId) return;
    setLeaving(true);
    try {
      const res = await fetch('/api/auxpass/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ station_id: stationId, wallet_address: address }),
      });
      if (res.ok) {
        await loadAuxState();
      }
    } catch (error) {
      console.error('Failed to leave queue:', error);
    }
    setLeaving(false);
  };

  const passAux = async () => {
    if (!address || !stationId) return;
    setPassing(true);
    try {
      const res = await fetch('/api/auxpass/pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ station_id: stationId, wallet_address: address }),
      });
      if (res.ok) {
        await loadAuxState();
      }
    } catch (error) {
      console.error('Failed to pass aux:', error);
    }
    setPassing(false);
  };

  const isInQueue = auxState?.queue.some(m => m.wallet_address.toLowerCase() === address?.toLowerCase());
  const isCurrentHolder = auxState?.current_holder?.wallet_address.toLowerCase() === address?.toLowerCase();
  const canJoin = userVibes >= (auxState?.min_vibes_required || 0);
  const queuePosition = auxState?.queue.findIndex(m => m.wallet_address.toLowerCase() === address?.toLowerCase());

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-zone-420 rounded-xl w-full max-w-md max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zone-420/30 bg-gradient-to-r from-purple-900/30 to-zone-420/20">
          <div>
            <h3 className="nixie-tube text-lg text-zone-420">🎤 PASS THE AUX</h3>
            <p className="text-dial-cream/50 text-xs">
              {auxState?.station_name || 'Station'} • {frequency?.toFixed(1) || auxState?.frequency?.toFixed(1)} FM
            </p>
          </div>
          <button onClick={onClose} className="text-dial-cream/60 hover:text-dial-cream text-2xl">×</button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-pulse text-4xl mb-2">🎤</div>
              <p className="text-dial-cream/50">Loading...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Current Holder Section */}
            <div className="p-4 border-b border-zone-420/20 bg-black/30">
              <p className="text-dial-cream/60 text-xs mb-2">CURRENT AUX HOLDER</p>
              {auxState?.current_holder ? (
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-zone-420 to-purple-600 flex items-center justify-center text-2xl flex-shrink-0 ring-2 ring-zone-420 ring-offset-2 ring-offset-cabinet-dark">
                    {auxState.current_holder.avatar_url ? (
                      <img src={auxState.current_holder.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : '🎧'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-dial-cream font-bold truncate">
                      {auxState.current_holder.display_name || `${auxState.current_holder.wallet_address.slice(0, 6)}...${auxState.current_holder.wallet_address.slice(-4)}`}
                    </p>
                    <p className="text-zone-420 text-sm">{auxState.current_holder.vibes_balance.toLocaleString()} VIBES</p>
                  </div>
                  <div className="text-right">
                    <p className="text-dial-cream/40 text-xs">Time Left</p>
                    <p className={`text-2xl font-mono ${timeRemaining < 60 ? 'text-red-400 animate-pulse' : 'text-zone-420'}`}>
                      {formatTime(timeRemaining)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-dial-cream/50 text-lg">🎤 Aux is FREE!</p>
                  <p className="text-dial-cream/40 text-xs mt-1">Join queue to grab it</p>
                </div>
              )}

              {/* Holder Controls */}
              {isCurrentHolder && (
                <div className="mt-4 space-y-2">
                  <div className="flex gap-2">
                    {onBroadcast && (
                      <button
                        onClick={onBroadcast}
                        className="flex-1 px-4 py-2 bg-zone-420 text-white rounded-lg hover:bg-zone-420-light font-medium"
                      >
                        🎙️ Broadcast Now
                      </button>
                    )}
                    <button
                      onClick={passAux}
                      disabled={passing}
                      className="px-4 py-2 bg-purple-600/30 text-purple-300 rounded-lg hover:bg-purple-600/50 disabled:opacity-50"
                    >
                      {passing ? '...' : '➡️ Pass'}
                    </button>
                  </div>
                  <p className="text-dial-cream/40 text-xs text-center">
                    You have the aux! Broadcast or pass to next in queue.
                  </p>
                </div>
              )}
            </div>

            {/* Queue Section */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-dial-cream/60 text-xs">QUEUE ({auxState?.queue.length || 0})</p>
                <p className="text-dial-cream/40 text-xs">Min: {auxState?.min_vibes_required?.toLocaleString() || 0} VIBES</p>
              </div>

              {auxState?.queue && auxState.queue.length > 0 ? (
                <div className="space-y-2">
                  {auxState.queue.map((member, index) => (
                    <QueueMemberCard
                      key={member.wallet_address}
                      member={member}
                      position={index + 1}
                      isCurrentUser={member.wallet_address.toLowerCase() === address?.toLowerCase()}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-dial-cream/40">Queue is empty</p>
                  <p className="text-dial-cream/30 text-xs mt-1">Be the first to join!</p>
                </div>
              )}
            </div>

            {/* User Status & Actions */}
            {address && (
              <div className="p-4 border-t border-zone-420/20 bg-black/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-dial-cream/60 text-xs">Your VIBES</span>
                  <span className={`font-bold ${canJoin ? 'text-zone-420' : 'text-red-400'}`}>
                    {userVibes.toLocaleString()} VIBES
                  </span>
                </div>

                {isCurrentHolder ? (
                  <div className="text-center py-2 bg-zone-420/20 rounded-lg">
                    <p className="text-zone-420 font-medium">🎤 You have the AUX!</p>
                  </div>
                ) : isInQueue ? (
                  <div className="space-y-2">
                    <div className="text-center py-2 bg-purple-600/20 rounded-lg">
                      <p className="text-purple-300">
                        Queue Position: <span className="font-bold">#{(queuePosition || 0) + 1}</span>
                      </p>
                    </div>
                    <button
                      onClick={leaveQueue}
                      disabled={leaving}
                      className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50"
                    >
                      {leaving ? 'Leaving...' : 'Leave Queue'}
                    </button>
                  </div>
                ) : canJoin ? (
                  <button
                    onClick={joinQueue}
                    disabled={joining}
                    className="w-full px-4 py-2 bg-zone-420 text-white rounded-lg hover:bg-zone-420-light disabled:opacity-50 font-medium"
                  >
                    {joining ? 'Joining...' : '🎤 Join Queue'}
                  </button>
                ) : (
                  <div className="text-center">
                    <p className="text-red-400 text-sm">
                      Need {(auxState?.min_vibes_required || 0) - userVibes} more VIBES to join
                    </p>
                    <p className="text-dial-cream/40 text-xs mt-1">
                      Earn VIBES by reacting and participating!
                    </p>
                  </div>
                )}
              </div>
            )}

            {!address && (
              <div className="p-4 border-t border-zone-420/20 bg-black/20 text-center">
                <p className="text-dial-cream/50">Connect wallet to join queue</p>
              </div>
            )}
          </>
        )}

        {/* Info Footer */}
        <div className="p-3 border-t border-zone-420/10 bg-zone-420/5">
          <p className="text-dial-cream/40 text-xs text-center">
            🎤 Each holder gets {Math.floor((auxState?.session_duration || 300) / 60)} minutes to broadcast
          </p>
        </div>
      </div>
    </div>
  );
}

function QueueMemberCard({ member, position, isCurrentUser }: { member: QueueMember; position: number; isCurrentUser: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
      isCurrentUser 
        ? 'bg-zone-420/20 border border-zone-420/40' 
        : 'bg-black/20 border border-transparent hover:border-zone-420/20'
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        position === 1 ? 'bg-zone-420 text-white' : 'bg-dial-cream/10 text-dial-cream/60'
      }`}>
        {position}
      </div>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zone-420/40 to-purple-600/40 flex items-center justify-center flex-shrink-0">
        {member.avatar_url ? (
          <img src={member.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className="text-lg">👤</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`truncate ${isCurrentUser ? 'text-zone-420 font-medium' : 'text-dial-cream'}`}>
          {member.display_name || `${member.wallet_address.slice(0, 6)}...${member.wallet_address.slice(-4)}`}
          {isCurrentUser && <span className="text-xs ml-1">(You)</span>}
        </p>
        <p className="text-dial-cream/50 text-xs">{member.vibes_balance.toLocaleString()} VIBES</p>
      </div>
      {position === 1 && (
        <span className="px-2 py-0.5 bg-zone-420/30 text-zone-420 text-xs rounded">Next</span>
      )}
    </div>
  );
}
