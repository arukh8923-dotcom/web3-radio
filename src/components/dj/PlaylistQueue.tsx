'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface QueueItem {
  id: string;
  title: string;
  artist?: string;
  contentHash: string;
  duration: number;
  addedBy: string;
  position: number;
  status: 'queued' | 'playing' | 'played';
}

// Placeholder: get queue
async function getQueue(stationId: string): Promise<QueueItem[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: '1', title: 'Sunset Vibes', artist: 'DJ Chill', contentHash: 'ipfs://QmExampleHash1', duration: 245, addedBy: 'djchill.base', position: 0, status: 'playing' },
    { id: '2', title: 'Night Drive', artist: 'LoFi Master', contentHash: 'ipfs://QmExampleHash2', duration: 312, addedBy: 'lofimaster.base', position: 1, status: 'queued' },
    { id: '3', title: 'Morning Coffee', artist: 'Ambient Soul', contentHash: 'ipfs://QmExampleHash3', duration: 198, addedBy: 'ambientsoul.base', position: 2, status: 'queued' },
  ];
}

// Placeholder: add to queue
async function addToQueue(stationId: string, item: Partial<QueueItem>): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
}

// Placeholder: reorder queue
async function reorderQueue(stationId: string, itemId: string, newPosition: number): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
}

// Placeholder: remove from queue
async function removeFromQueue(stationId: string, itemId: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
}

// Placeholder: skip to next
async function skipToNext(stationId: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
}

export default function PlaylistQueue({ 
  stationId,
  isOwner = false,
}: { 
  stationId: string;
  isOwner?: boolean;
}) {
  const { address } = useAccount();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
  const [newItem, setNewItem] = useState({
    title: '',
    artist: '',
    contentHash: '',
  });

  useEffect(() => {
    loadQueue();
    // Poll for updates
    const interval = setInterval(loadQueue, 10000);
    return () => clearInterval(interval);
  }, [stationId]);

  const loadQueue = async () => {
    try {
      const data = await getQueue(stationId);
      setQueue(data);
    } catch (err) {
      console.error('Failed to load queue:', err);
    }
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    
    try {
      await addToQueue(stationId, {
        title: newItem.title,
        artist: newItem.artist,
        contentHash: newItem.contentHash || `ipfs://placeholder-${Date.now()}`,
        addedBy: address,
      });
      setNewItem({ title: '', artist: '', contentHash: '' });
      setShowAddForm(false);
      loadQueue();
    } catch (err) {
      console.error('Failed to add to queue:', err);
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeFromQueue(stationId, itemId);
      loadQueue();
    } catch (err) {
      console.error('Failed to remove from queue:', err);
    }
  };

  const handleSkip = async () => {
    try {
      await skipToNext(stationId);
      loadQueue();
    } catch (err) {
      console.error('Failed to skip:', err);
    }
  };

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;
  };

  const handleDrop = async (targetId: string) => {
    if (!draggedItem || draggedItem === targetId) return;
    
    const targetItem = queue.find(q => q.id === targetId);
    if (!targetItem) return;
    
    try {
      await reorderQueue(stationId, draggedItem, targetItem.position);
      loadQueue();
    } catch (err) {
      console.error('Failed to reorder:', err);
    }
    setDraggedItem(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTrack = queue.find(q => q.status === 'playing');
  const upNext = queue.filter(q => q.status === 'queued');
  const totalDuration = upNext.reduce((acc, item) => acc + item.duration, 0);

  return (
    <div className="bg-zinc-900 rounded-xl border border-amber-900/30 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 px-4 py-3 border-b border-amber-900/30">
        <div className="flex items-center justify-between">
          <h2 className="text-amber-100 font-bold flex items-center gap-2">
            <span>📋</span> Queue
            <span className="text-amber-100/40 font-normal text-sm">
              ({upNext.length} tracks • {formatDuration(totalDuration)})
            </span>
          </h2>
          {isOwner && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-500"
            >
              {showAddForm ? 'Cancel' : '+ Add'}
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Now Playing */}
        {currentTrack && (
          <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl animate-pulse">🎵</span>
                </div>
                <div>
                  <div className="text-xs text-amber-400 uppercase">Now Playing</div>
                  <div className="text-amber-100 font-medium">{currentTrack.title}</div>
                  {currentTrack.artist && (
                    <div className="text-amber-100/60 text-sm">{currentTrack.artist}</div>
                  )}
                </div>
              </div>
              {isOwner && (
                <button
                  onClick={handleSkip}
                  className="px-3 py-1 bg-zinc-800 text-amber-100 text-sm rounded-lg hover:bg-zinc-700"
                >
                  Skip ⏭️
                </button>
              )}
            </div>
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleAdd} className="bg-black/20 rounded-lg p-3 space-y-2">
            <input
              type="text"
              value={newItem.title}
              onChange={e => setNewItem(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Track title"
              required
              className="w-full px-3 py-2 bg-black/30 border border-amber-900/30 rounded-lg text-amber-100 placeholder:text-amber-100/30 focus:outline-none focus:border-amber-500 text-sm"
            />
            <input
              type="text"
              value={newItem.artist}
              onChange={e => setNewItem(prev => ({ ...prev, artist: e.target.value }))}
              placeholder="Artist (optional)"
              className="w-full px-3 py-2 bg-black/30 border border-amber-900/30 rounded-lg text-amber-100 placeholder:text-amber-100/30 focus:outline-none focus:border-amber-500 text-sm"
            />
            <button
              type="submit"
              className="w-full px-3 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-500"
            >
              Add to Queue
            </button>
          </form>
        )}

        {/* Queue List */}
        {loading ? (
          <div className="text-center py-4 text-amber-100/60">Loading...</div>
        ) : upNext.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">📭</div>
            <div className="text-amber-100/60 text-sm">Queue is empty</div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-amber-100/40 text-xs uppercase mb-2">Up Next</div>
            {upNext.map((item, index) => (
              <div
                key={item.id}
                draggable={isOwner}
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDrop={() => handleDrop(item.id)}
                className={`bg-black/20 rounded-lg p-3 flex items-center gap-3 ${
                  isOwner ? 'cursor-grab active:cursor-grabbing' : ''
                } ${draggedItem === item.id ? 'opacity-50' : ''}`}
              >
                <div className="text-amber-100/40 font-mono text-sm w-6">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-amber-100 truncate">{item.title}</div>
                  {item.artist && (
                    <div className="text-amber-100/60 text-sm truncate">{item.artist}</div>
                  )}
                </div>
                <div className="text-amber-100/40 text-sm">
                  {formatDuration(item.duration)}
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
