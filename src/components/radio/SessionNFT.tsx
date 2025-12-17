'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Session {
  id: string;
  station_id: string;
  station_name: string;
  frequency: number;
  dj_address: string;
  dj_name: string | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  attendee_count: number;
  max_attendees: number | null;
  is_active: boolean;
  is_claimable: boolean;
  nft_image_url: string | null;
  vibes_reward: number;
}

interface UserSessionStatus {
  session_id: string;
  joined_at: string;
  attendance_minutes: number;
  eligible_for_nft: boolean;
  nft_claimed: boolean;
  nft_token_id: string | null;
}

interface SessionNFTProps {
  stationId?: string;
  frequency: number;
  isOpen: boolean;
  onClose: () => void;
}

export function SessionNFT({ stationId, frequency, isOpen, onClose }: SessionNFTProps) {
  const { address } = useAccount();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [userStatuses, setUserStatuses] = useState<Record<string, UserSessionStatus>>({});
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen, stationId, address]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (stationId) params.set('station_id', stationId);
      if (address) params.set('wallet', address);

      const res = await fetch(`/api/sessions?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
        setUserStatuses(data.user_statuses || {});
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      // Mock data for demo
      setSessions([
        {
          id: '1',
          station_id: stationId || 'demo',
          station_name: '420 Chill Zone',
          frequency: 420.0,
          dj_address: '0x1234...5678',
          dj_name: 'DJ Vibes',
          title: '4:20 PM Session',
          description: 'Daily chill session at 4:20 PM',
          start_time: new Date().toISOString(),
          end_time: null,
          duration_minutes: 60,
          attendee_count: 42,
          max_attendees: 420,
          is_active: true,
          is_claimable: false,
          nft_image_url: null,
          vibes_reward: 100,
        },
        {
          id: '2',
          station_id: stationId || 'demo',
          station_name: '420 Chill Zone',
          frequency: 420.0,
          dj_address: '0x1234...5678',
          dj_name: 'DJ Vibes',
          title: 'Morning Wake & Bake',
          description: 'Start your day right',
          start_time: new Date(Date.now() - 3600000).toISOString(),
          end_time: new Date().toISOString(),
          duration_minutes: 60,
          attendee_count: 69,
          max_attendees: null,
          is_active: false,
          is_claimable: true,
          nft_image_url: null,
          vibes_reward: 150,
        },
      ]);
    }
    setLoading(false);
  };

  const joinSession = async (sessionId: string) => {
    if (!address) return;
    setJoining(sessionId);
    try {
      const res = await fetch('/api/sessions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          wallet_address: address,
        }),
      });

      if (res.ok) {
        await loadSessions();
      }
    } catch (error) {
      console.error('Failed to join session:', error);
    }
    setJoining(null);
  };

  const claimNFT = async (sessionId: string) => {
    if (!address) return;
    setClaiming(sessionId);
    try {
      const res = await fetch('/api/sessions/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          wallet_address: address,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          alert(`🎉 Session NFT claimed!\n\nToken ID: ${data.token_id || 'Pending'}\n\nNote: On-chain minting coming soon!`);
          await loadSessions();
        } else {
          alert(data.error || 'Failed to claim NFT');
        }
      }
    } catch (error) {
      console.error('Failed to claim NFT:', error);
      alert('Failed to claim NFT');
    }
    setClaiming(null);
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeRemaining = (session: Session) => {
    if (!session.is_active) return null;
    const endTime = new Date(session.start_time).getTime() + session.duration_minutes * 60000;
    const remaining = endTime - Date.now();
    if (remaining <= 0) return 'Ending soon';
    const mins = Math.floor(remaining / 60000);
    return `${mins}m remaining`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-zone-420 rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zone-420/30 bg-zone-420/10">
          <div>
            <h3 className="nixie-tube text-lg text-zone-420">🌿 SESSION NFTs</h3>
            <p className="text-dial-cream/50 text-xs">
              Attend sessions, earn commemorative NFTs
            </p>
          </div>
          <button onClick={onClose} className="text-dial-cream/60 hover:text-dial-cream text-2xl">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin text-3xl mb-2">🌿</div>
                <p className="text-dial-cream/60 text-sm">Loading sessions...</p>
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-dial-cream/50 text-lg mb-2">No sessions available</p>
              <p className="text-dial-cream/30 text-sm">
                Check back at 4:20 for special sessions!
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {/* Active Sessions */}
              {sessions.filter(s => s.is_active).length > 0 && (
                <div>
                  <p className="text-zone-420 text-xs font-bold mb-2">🔴 LIVE NOW</p>
                  {sessions.filter(s => s.is_active).map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      userStatus={userStatuses[session.id]}
                      onJoin={() => joinSession(session.id)}
                      onClaim={() => claimNFT(session.id)}
                      onSelect={() => setSelectedSession(session)}
                      joining={joining === session.id}
                      claiming={claiming === session.id}
                      timeRemaining={getTimeRemaining(session)}
                      isConnected={!!address}
                    />
                  ))}
                </div>
              )}

              {/* Claimable Sessions */}
              {sessions.filter(s => !s.is_active && s.is_claimable).length > 0 && (
                <div>
                  <p className="text-amber-400 text-xs font-bold mb-2 mt-4">🎁 CLAIM YOUR NFT</p>
                  {sessions.filter(s => !s.is_active && s.is_claimable).map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      userStatus={userStatuses[session.id]}
                      onJoin={() => {}}
                      onClaim={() => claimNFT(session.id)}
                      onSelect={() => setSelectedSession(session)}
                      joining={false}
                      claiming={claiming === session.id}
                      timeRemaining={null}
                      isConnected={!!address}
                    />
                  ))}
                </div>
              )}

              {/* Past Sessions */}
              {sessions.filter(s => !s.is_active && !s.is_claimable).length > 0 && (
                <div>
                  <p className="text-dial-cream/50 text-xs font-bold mb-2 mt-4">📜 PAST SESSIONS</p>
                  {sessions.filter(s => !s.is_active && !s.is_claimable).map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      userStatus={userStatuses[session.id]}
                      onJoin={() => {}}
                      onClaim={() => {}}
                      onSelect={() => setSelectedSession(session)}
                      joining={false}
                      claiming={false}
                      timeRemaining={null}
                      isConnected={!!address}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zone-420/20 bg-zone-420/5 text-center">
          <p className="text-dial-cream/40 text-xs">
            🌿 Attend for 10+ minutes to earn Session NFT
          </p>
        </div>
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          userStatus={userStatuses[selectedSession.id]}
          onClose={() => setSelectedSession(null)}
          onClaim={() => claimNFT(selectedSession.id)}
          claiming={claiming === selectedSession.id}
          isConnected={!!address}
        />
      )}
    </div>
  );
}

function SessionCard({
  session,
  userStatus,
  onJoin,
  onClaim,
  onSelect,
  joining,
  claiming,
  timeRemaining,
  isConnected,
}: {
  session: Session;
  userStatus?: UserSessionStatus;
  onJoin: () => void;
  onClaim: () => void;
  onSelect: () => void;
  joining: boolean;
  claiming: boolean;
  timeRemaining: string | null;
  isConnected: boolean;
}) {
  const isJoined = !!userStatus;
  const canClaim = userStatus?.eligible_for_nft && !userStatus?.nft_claimed && session.is_claimable;
  const hasClaimed = userStatus?.nft_claimed;

  return (
    <div
      className={`rounded-lg p-3 border transition-all cursor-pointer hover:border-zone-420/50 ${
        session.is_active
          ? 'bg-zone-420/10 border-zone-420/30'
          : 'bg-black/20 border-brass/20'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        {/* NFT Preview */}
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-zone-420/30 to-purple-600/30 flex items-center justify-center text-2xl flex-shrink-0">
          {session.nft_image_url ? (
            <img src={session.nft_image_url} alt="" className="w-full h-full object-cover rounded-lg" />
          ) : (
            '🌿'
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-dial-cream font-medium text-sm truncate">{session.title}</p>
            {session.is_active && (
              <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded animate-pulse">
                LIVE
              </span>
            )}
          </div>
          <p className="text-dial-cream/50 text-xs">
            {session.dj_name || session.dj_address.slice(0, 10)}... • {session.frequency.toFixed(1)} FM
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="text-dial-cream/40">
              👥 {session.attendee_count}{session.max_attendees ? `/${session.max_attendees}` : ''}
            </span>
            <span className="text-zone-420">+{session.vibes_reward} VIBES</span>
            {timeRemaining && (
              <span className="text-amber-400">{timeRemaining}</span>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="flex flex-col gap-1">
          {session.is_active && !isJoined && isConnected && (
            <button
              onClick={(e) => { e.stopPropagation(); onJoin(); }}
              disabled={joining}
              className="px-2 py-1 bg-zone-420 text-white text-xs rounded hover:bg-zone-420-light disabled:opacity-50"
            >
              {joining ? '...' : 'JOIN'}
            </button>
          )}
          {canClaim && (
            <button
              onClick={(e) => { e.stopPropagation(); onClaim(); }}
              disabled={claiming}
              className="px-2 py-1 bg-amber-500 text-white text-xs rounded hover:bg-amber-400 disabled:opacity-50"
            >
              {claiming ? '...' : 'CLAIM'}
            </button>
          )}
          {hasClaimed && (
            <span className="text-green-400 text-xs">✓ Claimed</span>
          )}
          {isJoined && session.is_active && (
            <span className="text-zone-420 text-xs">✓ Joined</span>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionDetailModal({
  session,
  userStatus,
  onClose,
  onClaim,
  claiming,
  isConnected,
}: {
  session: Session;
  userStatus?: UserSessionStatus;
  onClose: () => void;
  onClaim: () => void;
  claiming: boolean;
  isConnected: boolean;
}) {
  const canClaim = userStatus?.eligible_for_nft && !userStatus?.nft_claimed && session.is_claimable;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
      <div className="bg-cabinet-dark border-2 border-zone-420 rounded-xl w-full max-w-sm">
        {/* NFT Preview */}
        <div className="aspect-square bg-gradient-to-br from-zone-420/30 via-purple-600/20 to-zone-420/30 flex items-center justify-center">
          {session.nft_image_url ? (
            <img src={session.nft_image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-2">🌿</div>
              <p className="text-zone-420 font-bold">{session.title}</p>
              <p className="text-dial-cream/50 text-sm">{session.frequency.toFixed(1)} FM</p>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-4 space-y-3">
          <div>
            <h4 className="text-dial-cream font-bold">{session.title}</h4>
            {session.description && (
              <p className="text-dial-cream/60 text-sm mt-1">{session.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-black/30 rounded p-2">
              <p className="text-dial-cream/50 text-xs">DJ</p>
              <p className="text-dial-cream truncate">{session.dj_name || session.dj_address.slice(0, 10)}...</p>
            </div>
            <div className="bg-black/30 rounded p-2">
              <p className="text-dial-cream/50 text-xs">Attendees</p>
              <p className="text-dial-cream">{session.attendee_count}</p>
            </div>
            <div className="bg-black/30 rounded p-2">
              <p className="text-dial-cream/50 text-xs">Duration</p>
              <p className="text-dial-cream">{session.duration_minutes} min</p>
            </div>
            <div className="bg-black/30 rounded p-2">
              <p className="text-dial-cream/50 text-xs">Reward</p>
              <p className="text-zone-420">+{session.vibes_reward} VIBES</p>
            </div>
          </div>

          {userStatus && (
            <div className="bg-zone-420/10 border border-zone-420/30 rounded-lg p-3">
              <p className="text-zone-420 text-xs font-bold mb-1">YOUR ATTENDANCE</p>
              <p className="text-dial-cream text-sm">
                {userStatus.attendance_minutes} minutes attended
              </p>
              {userStatus.nft_claimed && userStatus.nft_token_id && (
                <p className="text-green-400 text-xs mt-1">
                  NFT Token: #{userStatus.nft_token_id}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 bg-black/30 text-dial-cream text-sm rounded-lg hover:bg-black/50"
            >
              Close
            </button>
            {canClaim && isConnected && (
              <button
                onClick={onClaim}
                disabled={claiming}
                className="flex-1 px-3 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-400 disabled:opacity-50"
              >
                {claiming ? 'Claiming...' : 'Claim NFT'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
