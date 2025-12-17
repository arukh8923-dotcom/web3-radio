'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface ScheduledBroadcast {
  id: string;
  title: string;
  contentHash: string;
  contentType: 'audio' | 'visual' | 'generative';
  scheduledTime: number;
  unlockTime: number;
  status: 'pending' | 'ready' | 'live' | 'completed';
  stationId: string;
}

// Placeholder: get scheduled broadcasts
async function getScheduledBroadcasts(stationId: string): Promise<ScheduledBroadcast[]> {
  // TODO: Replace with actual API/contract call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const now = Date.now();
  return [
    {
      id: '1',
      title: 'Morning Wake Up Mix',
      contentHash: 'ipfs://Qm123...',
      contentType: 'audio',
      scheduledTime: now + 3600000, // 1 hour from now
      unlockTime: now + 3600000,
      status: 'pending',
      stationId,
    },
    {
      id: '2',
      title: '4:20 Special Session',
      contentHash: 'ipfs://Qm456...',
      contentType: 'audio',
      scheduledTime: now + 7200000, // 2 hours from now
      unlockTime: now + 7200000,
      status: 'pending',
      stationId,
    },
  ];
}

// Placeholder: schedule a broadcast
async function scheduleBroadcast(params: {
  stationId: string;
  title: string;
  contentHash: string;
  contentType: string;
  scheduledTime: number;
  djAddress: string;
}): Promise<{ success: boolean; broadcastId: string }> {
  // TODO: Replace with actual contract call
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    success: true,
    broadcastId: `scheduled-${Date.now()}`,
  };
}

// Placeholder: cancel scheduled broadcast
async function cancelScheduledBroadcast(broadcastId: string): Promise<boolean> {
  // TODO: Replace with actual contract call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
}

export default function ScheduledBroadcasts({ 
  stationId,
  stationName,
}: { 
  stationId: string;
  stationName: string;
}) {
  const { address } = useAccount();
  const [broadcasts, setBroadcasts] = useState<ScheduledBroadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    contentType: 'audio' as const,
    contentHash: '',
    scheduledDate: '',
    scheduledTime: '',
  });

  useEffect(() => {
    loadBroadcasts();
  }, [stationId]);

  const loadBroadcasts = async () => {
    setLoading(true);
    try {
      const data = await getScheduledBroadcasts(stationId);
      setBroadcasts(data);
    } catch (err) {
      console.error('Failed to load scheduled broadcasts:', err);
    }
    setLoading(false);
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    
    setSubmitting(true);
    try {
      const scheduledTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).getTime();
      
      await scheduleBroadcast({
        stationId,
        title: formData.title,
        contentHash: formData.contentHash || `ipfs://placeholder-${Date.now()}`,
        contentType: formData.contentType,
        scheduledTime,
        djAddress: address,
      });
      
      setShowForm(false);
      setFormData({
        title: '',
        contentType: 'audio',
        contentHash: '',
        scheduledDate: '',
        scheduledTime: '',
      });
      loadBroadcasts();
    } catch (err) {
      console.error('Failed to schedule broadcast:', err);
    }
    setSubmitting(false);
  };

  const handleCancel = async (broadcastId: string) => {
    if (!confirm('Cancel this scheduled broadcast?')) return;
    
    try {
      await cancelScheduledBroadcast(broadcastId);
      loadBroadcasts();
    } catch (err) {
      console.error('Failed to cancel broadcast:', err);
    }
  };

  const formatCountdown = (timestamp: number) => {
    const diff = timestamp - Date.now();
    if (diff <= 0) return 'Starting...';
    
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${mins}m`;
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-amber-900/30 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 px-4 py-3 border-b border-amber-900/30">
        <div className="flex items-center justify-between">
          <h2 className="text-amber-100 font-bold flex items-center gap-2">
            <span>📅</span> Scheduled Broadcasts
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-500"
          >
            {showForm ? 'Cancel' : '+ Schedule'}
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {/* Schedule Form */}
        {showForm && (
          <form onSubmit={handleSchedule} className="mb-4 p-4 bg-black/20 rounded-lg space-y-3">
            <div>
              <label className="block text-amber-100/60 text-xs mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Broadcast title"
                required
                className="w-full px-3 py-2 bg-black/30 border border-amber-900/30 rounded-lg text-amber-100 placeholder:text-amber-100/30 focus:outline-none focus:border-amber-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-amber-100/60 text-xs mb-1">Date</label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={e => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-black/30 border border-amber-900/30 rounded-lg text-amber-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-amber-100/60 text-xs mb-1">Time</label>
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={e => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-black/30 border border-amber-900/30 rounded-lg text-amber-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-amber-100/60 text-xs mb-1">Content Type</label>
              <select
                value={formData.contentType}
                onChange={e => setFormData(prev => ({ 
                  ...prev, 
                  contentType: e.target.value as 'audio' | 'visual' | 'generative'
                }))}
                className="w-full px-3 py-2 bg-black/30 border border-amber-900/30 rounded-lg text-amber-100 focus:outline-none focus:border-amber-500"
              >
                <option value="audio">🎵 Audio</option>
                <option value="visual">🎨 Visual</option>
                <option value="generative">✨ Generative</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-500 disabled:opacity-50"
            >
              {submitting ? 'Scheduling...' : '📅 Schedule Broadcast'}
            </button>
          </form>
        )}

        {/* Broadcasts List */}
        {loading ? (
          <div className="text-center py-8 text-amber-100/60">Loading...</div>
        ) : broadcasts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📭</div>
            <div className="text-amber-100/60">No scheduled broadcasts</div>
          </div>
        ) : (
          <div className="space-y-3">
            {broadcasts.map(broadcast => (
              <div
                key={broadcast.id}
                className="bg-black/20 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="text-amber-100 font-medium">{broadcast.title}</div>
                  <div className="text-amber-100/60 text-sm">
                    {formatDateTime(broadcast.scheduledTime)}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-amber-400 font-mono text-sm">
                      {formatCountdown(broadcast.scheduledTime)}
                    </div>
                    <div className={`text-xs ${
                      broadcast.status === 'pending' ? 'text-yellow-400' :
                      broadcast.status === 'ready' ? 'text-green-400' :
                      broadcast.status === 'live' ? 'text-red-400' :
                      'text-amber-100/40'
                    }`}>
                      {broadcast.status.toUpperCase()}
                    </div>
                  </div>
                  
                  {broadcast.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(broadcast.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                      title="Cancel"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
