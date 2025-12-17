'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

interface Room {
  id: string;
  name: string;
  description: string | null;
  station_id: string;
  station_name: string;
  frequency: number;
  creator_address: string;
  creator_name: string | null;
  token_gate_address: string | null;
  token_gate_symbol: string | null;
  min_balance: number;
  member_count: number;
  max_members: number | null;
  is_active: boolean;
  is_private: boolean;
  created_at: string;
}

interface RoomMember {
  wallet_address: string;
  display_name: string | null;
  avatar_url: string | null;
  joined_at: string;
  is_creator: boolean;
}

interface ChatMessage {
  id: string;
  sender_address: string;
  sender_name: string | null;
  message: string;
  created_at: string;
}

interface HotboxRoomProps {
  stationId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function HotboxRoom({ stationId, isOpen, onClose }: HotboxRoomProps) {
  const { address } = useAccount();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [roomChat, setRoomChat] = useState<ChatMessage[]>([]);
  const [joining, setJoining] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRooms();
    }
  }, [isOpen, stationId]);

  useEffect(() => {
    if (selectedRoom && address) {
      loadRoomDetails(selectedRoom.id);
    }
  }, [selectedRoom, address]);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (stationId) params.set('station_id', stationId);
      if (address) params.set('wallet', address);

      const res = await fetch(`/api/hotbox?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
        setUserBalance(data.user_balance || 0);
      }
    } catch (error) {
      console.error('Failed to load rooms:', error);
      setRooms([]);
      setUserBalance(500);
    }
    setLoading(false);
  };

  const loadRoomDetails = async (roomId: string) => {
    try {
      const res = await fetch(`/api/hotbox/${roomId}?wallet=${address}`);
      if (res.ok) {
        const data = await res.json();
        setRoomMembers(data.members || []);
        setRoomChat(data.chat || []);
      }
    } catch (error) {
      console.error('Failed to load room details:', error);
      setRoomMembers([]);
      setRoomChat([]);
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!address) return;
    setJoining(roomId);
    try {
      const res = await fetch('/api/hotbox/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId, wallet_address: address }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const room = rooms.find(r => r.id === roomId);
          if (room) setSelectedRoom(room);
          await loadRooms();
        } else {
          alert(data.error || 'Failed to join room');
        }
      }
    } catch (error) {
      console.error('Failed to join room:', error);
    }
    setJoining(null);
  };

  const leaveRoom = async () => {
    if (!address || !selectedRoom) return;
    try {
      await fetch('/api/hotbox/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: selectedRoom.id, wallet_address: address }),
      });
      setSelectedRoom(null);
      await loadRooms();
    } catch (error) {
      console.error('Failed to leave room:', error);
    }
  };

  const canJoinRoom = (room: Room) => {
    if (!room.token_gate_address) return true;
    return userBalance >= room.min_balance;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-zone-420 rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-zone-420/30 bg-zone-420/10">
          <div>
            <h3 className="nixie-tube text-lg text-zone-420">🔥 HOTBOX ROOMS</h3>
            <p className="text-dial-cream/50 text-xs">Token-gated private listening rooms</p>
          </div>
          <button onClick={onClose} className="text-dial-cream/60 hover:text-dial-cream text-2xl">×</button>
        </div>

        {selectedRoom ? (
          <RoomView room={selectedRoom} members={roomMembers} chat={roomChat} onLeave={leaveRoom} onBack={() => setSelectedRoom(null)} currentAddress={address} />
        ) : (
          <>
            {address && (
              <div className="p-3 border-b border-zone-420/20 bg-black/20 flex items-center justify-between">
                <span className="text-dial-cream/60 text-xs">Your VIBES Balance</span>
                <span className="text-zone-420 font-bold">{userBalance.toLocaleString()} VIBES</span>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin text-3xl mb-2">🔥</div>
                </div>
              ) : rooms.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-dial-cream/50">No rooms available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rooms.map((room) => (
                    <RoomCard key={room.id} room={room} canJoin={canJoinRoom(room)} userBalance={userBalance} onJoin={() => joinRoom(room.id)} joining={joining === room.id} isConnected={!!address} />
                  ))}
                </div>
              )}
            </div>
            {address && (
              <div className="p-3 border-t border-zone-420/20">
                <button onClick={() => setShowCreateForm(true)} className="w-full px-4 py-2 bg-zone-420/20 text-zone-420 rounded-lg hover:bg-zone-420/30">+ Create Hotbox Room</button>
              </div>
            )}
          </>
        )}
        {showCreateForm && <CreateRoomModal stationId={stationId} onClose={() => setShowCreateForm(false)} onCreated={() => { setShowCreateForm(false); loadRooms(); }} />}
      </div>
    </div>
  );
}


function RoomCard({ room, canJoin, userBalance, onJoin, joining, isConnected }: { room: Room; canJoin: boolean; userBalance: number; onJoin: () => void; joining: boolean; isConnected: boolean }) {
  const needsMore = room.min_balance - userBalance;
  return (
    <div className={`rounded-lg p-4 border transition-all ${canJoin ? 'bg-zone-420/10 border-zone-420/30 hover:border-zone-420/50' : 'bg-black/20 border-brass/20 opacity-70'}`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-zone-420/40 to-purple-600/40 flex items-center justify-center text-xl flex-shrink-0">{room.is_private ? '🔒' : '🔥'}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-dial-cream font-medium truncate">{room.name}</p>
            {room.is_private && <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">Private</span>}
          </div>
          {room.description && <p className="text-dial-cream/50 text-xs mt-0.5 line-clamp-1">{room.description}</p>}
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="text-dial-cream/40">👥 {room.member_count}{room.max_members ? `/${room.max_members}` : ''}</span>
            {room.token_gate_symbol && <span className={canJoin ? 'text-zone-420' : 'text-red-400'}>🎫 {room.min_balance.toLocaleString()} {room.token_gate_symbol}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isConnected ? (canJoin ? <button onClick={onJoin} disabled={joining} className="px-3 py-1.5 bg-zone-420 text-white text-xs rounded hover:bg-zone-420-light disabled:opacity-50">{joining ? '...' : 'ENTER'}</button> : <div className="text-right"><span className="text-red-400 text-xs">Need {needsMore.toLocaleString()} more</span><p className="text-dial-cream/30 text-xs">{room.token_gate_symbol}</p></div>) : <span className="text-dial-cream/40 text-xs">Connect wallet</span>}
        </div>
      </div>
    </div>
  );
}

function RoomView({ room, members, chat, onLeave, onBack, currentAddress }: { room: Room; members: RoomMember[]; chat: ChatMessage[]; onLeave: () => void; onBack: () => void; currentAddress?: string }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat]);

  const sendMessage = async () => {
    if (!message.trim() || !currentAddress) return;
    setSending(true);
    try {
      await fetch('/api/hotbox/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ room_id: room.id, wallet_address: currentAddress, message: message.trim() }) });
      setMessage('');
    } catch (error) { console.error('Failed to send message:', error); }
    setSending(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-3 border-b border-zone-420/20 bg-zone-420/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-dial-cream/60 hover:text-dial-cream">←</button>
          <div><p className="text-dial-cream font-medium">{room.name}</p><p className="text-dial-cream/50 text-xs">{members.length} members • {room.frequency.toFixed(1)} FM</p></div>
        </div>
        <button onClick={onLeave} className="px-2 py-1 text-red-400 text-xs hover:bg-red-400/10 rounded">Leave</button>
      </div>
      <div className="p-2 border-b border-zone-420/10 bg-black/20 flex items-center gap-1 overflow-x-auto">
        {members.slice(0, 10).map((m) => <div key={m.wallet_address} className="flex-shrink-0 w-8 h-8 rounded-full bg-zone-420/30 flex items-center justify-center text-xs" title={m.display_name || m.wallet_address}>{m.avatar_url ? <img src={m.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : m.display_name?.[0]?.toUpperCase() || '👤'}</div>)}
        {members.length > 10 && <span className="text-dial-cream/40 text-xs ml-1">+{members.length - 10}</span>}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {chat.length === 0 ? <p className="text-dial-cream/40 text-center text-sm py-4">No messages yet</p> : chat.map((msg) => (
          <div key={msg.id} className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-zone-420/30 flex items-center justify-center text-xs flex-shrink-0">{msg.sender_name?.[0]?.toUpperCase() || '👤'}</div>
            <div><div className="flex items-baseline gap-2"><span className="text-zone-420 text-xs font-medium">{msg.sender_name || `${msg.sender_address.slice(0, 6)}...`}</span><span className="text-dial-cream/30 text-xs">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div><p className="text-dial-cream/80 text-sm">{msg.message}</p></div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="p-3 border-t border-zone-420/20 flex gap-2">
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." className="flex-1 px-3 py-2 bg-black/30 border border-zone-420/30 rounded-lg text-dial-cream text-sm placeholder:text-dial-cream/30" />
        <button onClick={sendMessage} disabled={!message.trim() || sending} className="px-4 py-2 bg-zone-420 text-white text-sm rounded-lg disabled:opacity-50">Send</button>
      </div>
      {room.token_gate_address && <div className="p-2 bg-amber-500/10 border-t border-amber-500/20 text-center"><p className="text-amber-400/80 text-xs">⚠️ Keep {room.min_balance.toLocaleString()} {room.token_gate_symbol} to stay in room</p></div>}
    </div>
  );
}

function CreateRoomModal({ stationId, onClose, onCreated }: { stationId?: string; onClose: () => void; onCreated: () => void }) {
  const { address } = useAccount();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minBalance, setMinBalance] = useState(100);
  const [maxMembers, setMaxMembers] = useState<number | ''>('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !address) return;
    setCreating(true);
    try {
      const res = await fetch('/api/hotbox', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), description: description.trim() || null, station_id: stationId, creator_address: address, min_balance: minBalance, max_members: maxMembers || null, is_private: isPrivate }) });
      if (res.ok) onCreated(); else alert('Failed to create room');
    } catch (error) { console.error('Failed to create room:', error); }
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
      <div className="bg-cabinet-dark border-2 border-zone-420 rounded-xl w-full max-w-sm p-4">
        <h4 className="text-zone-420 font-bold mb-4">Create Hotbox Room</h4>
        <div className="space-y-3">
          <div><label className="text-dial-cream/60 text-xs">Room Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="VIP Lounge" className="w-full mt-1 px-3 py-2 bg-black/30 border border-zone-420/30 rounded text-dial-cream text-sm" /></div>
          <div><label className="text-dial-cream/60 text-xs">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this room about?" rows={2} className="w-full mt-1 px-3 py-2 bg-black/30 border border-zone-420/30 rounded text-dial-cream text-sm resize-none" /></div>
          <div><label className="text-dial-cream/60 text-xs">Min VIBES to Enter</label><input type="number" value={minBalance} onChange={(e) => setMinBalance(parseInt(e.target.value) || 0)} min={0} className="w-full mt-1 px-3 py-2 bg-black/30 border border-zone-420/30 rounded text-dial-cream text-sm" /></div>
          <div><label className="text-dial-cream/60 text-xs">Max Members (optional)</label><input type="number" value={maxMembers} onChange={(e) => setMaxMembers(e.target.value ? parseInt(e.target.value) : '')} min={2} placeholder="Unlimited" className="w-full mt-1 px-3 py-2 bg-black/30 border border-zone-420/30 rounded text-dial-cream text-sm" /></div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="rounded border-zone-420/30" /><span className="text-dial-cream/70 text-sm">Private room (invite only)</span></label>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 px-3 py-2 bg-black/30 text-dial-cream text-sm rounded-lg">Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim() || creating} className="flex-1 px-3 py-2 bg-zone-420 text-white text-sm rounded-lg disabled:opacity-50">{creating ? 'Creating...' : 'Create Room'}</button>
        </div>
      </div>
    </div>
  );
}
