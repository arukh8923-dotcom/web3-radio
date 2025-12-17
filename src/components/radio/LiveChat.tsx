'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import { supabase, subscribeToChat, type LiveChat as ChatMessage } from '@/lib/supabase';

interface ChatMessageWithUser extends ChatMessage {
  users?: {
    wallet_address: string;
    farcaster_username: string | null;
    avatar_url: string | null;
  };
}

interface LiveChatProps {
  stationId?: string;
  frequency: number;
  isOpen: boolean;
  onClose: () => void;
}

export function LiveChat({ stationId, frequency, isOpen, onClose }: LiveChatProps) {
  const { address } = useAccount();
  const [messages, setMessages] = useState<ChatMessageWithUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatRoomId = stationId;

  // Load initial messages
  useEffect(() => {
    if (!isOpen || !chatRoomId) return;

    async function loadMessages() {
      try {
        const res = await fetch(`/api/chat?station_id=${chatRoomId}&limit=50`);
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    }
    loadMessages();
  }, [chatRoomId, isOpen]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!isOpen || !chatRoomId) return;

    const channel = subscribeToChat(chatRoomId, (message) => {
      // Fetch user data for new message
      fetchUserForMessage(message);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatRoomId, isOpen]);

  // Fetch user data for a new realtime message
  const fetchUserForMessage = async (message: ChatMessage) => {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('wallet_address, farcaster_username, avatar_url')
        .eq('id', message.user_id)
        .single();
      
      setMessages((prev) => [...prev, { ...message, users: user || undefined }]);
    } catch {
      setMessages((prev) => [...prev, message]);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!address || !newMessage.trim() || sending || !chatRoomId) return;

    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station_id: chatRoomId,
          wallet_address: address,
          message: newMessage.trim(),
        }),
      });

      if (res.ok) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
    setSending(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-brass rounded-xl w-full max-w-md h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brass/30">
          <div>
            <h3 className="nixie-tube text-lg">💬 LIVE CHAT</h3>
            <p className="text-dial-cream/50 text-xs">
              {stationId ? `${frequency.toFixed(1)} FM` : 'No station'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-dial-cream/60 hover:text-dial-cream text-2xl"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!chatRoomId ? (
            <p className="text-dial-cream/50 text-center text-sm">
              Tune to a station to chat!
            </p>
          ) : messages.length === 0 ? (
            <p className="text-dial-cream/50 text-center text-sm">
              No messages yet. Be the first to chat!
            </p>
          ) : (
            messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-brass/30">
          {!chatRoomId ? (
            <p className="text-dial-cream/50 text-center text-sm">
              Tune to a station to enable chat
            </p>
          ) : !address ? (
            <p className="text-dial-cream/50 text-center text-sm">
              Connect wallet to chat
            </p>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                maxLength={280}
                className="flex-1 bg-black/30 border border-brass/30 rounded-lg px-3 py-2 text-dial-cream text-sm placeholder:text-dial-cream/40 focus:outline-none focus:border-brass"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                className="preset-button px-4 disabled:opacity-50"
              >
                {sending ? '...' : 'SEND'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessageWithUser }) {
  const user = message.users;
  const username = user?.farcaster_username;
  const avatar = user?.avatar_url;
  const walletShort = user?.wallet_address 
    ? `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}`
    : '???';

  return (
    <div className="flex gap-2">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-brass/30 flex items-center justify-center text-xs flex-shrink-0 overflow-hidden">
        {avatar ? (
          <Image
            src={avatar}
            alt={username || 'User'}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-brass">
            {username?.[0]?.toUpperCase() || '?'}
          </span>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-brass text-sm font-dial">
            {username ? `@${username}` : walletShort}
          </span>
          <span className="text-dial-cream/40 text-xs">
            {new Date(message.created_at).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-dial-cream/80 text-sm break-words">{message.message}</p>
      </div>
    </div>
  );
}
