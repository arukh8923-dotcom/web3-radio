'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface DownloadedContent {
  id: string;
  station_id: string;
  station_name: string;
  title: string;
  duration: number;
  downloaded_at: string;
  expires_at: string;
  size_mb: number;
  is_expired: boolean;
}

interface PendingSync {
  type: 'listen' | 'reaction' | 'tip';
  data: Record<string, unknown>;
  timestamp: string;
}

interface OfflineModeProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayOffline?: (contentId: string) => void;
}

export function OfflineMode({ isOpen, onClose, onPlayOffline }: OfflineModeProps) {
  const { address } = useAccount();
  const [downloads, setDownloads] = useState<DownloadedContent[]>([]);
  const [pendingSync, setPendingSync] = useState<PendingSync[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageLimit] = useState(500); // MB

  useEffect(() => {
    setIsOnline(navigator.onLine);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    
    loadDownloads();
    loadPendingSync();
    
    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  const loadDownloads = () => {
    // Load from localStorage/IndexedDB
    const stored = localStorage.getItem('web3radio_downloads');
    if (stored) {
      const parsed = JSON.parse(stored);
      setDownloads(parsed);
      setStorageUsed(parsed.reduce((sum: number, d: DownloadedContent) => sum + d.size_mb, 0));
    }
  };

  const loadPendingSync = () => {
    const stored = localStorage.getItem('web3radio_pending_sync');
    if (stored) {
      setPendingSync(JSON.parse(stored));
    }
  };

  const syncNow = async () => {
    if (!isOnline || pendingSync.length === 0) return;
    setSyncing(true);
    
    try {
      // Sync each pending item
      for (const item of pendingSync) {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      }
      
      // Clear pending
      localStorage.removeItem('web3radio_pending_sync');
      setPendingSync([]);
    } catch (error) {
      console.error('Sync failed:', error);
    }
    
    setSyncing(false);
  };

  const deleteDownload = (id: string) => {
    const updated = downloads.filter(d => d.id !== id);
    setDownloads(updated);
    localStorage.setItem('web3radio_downloads', JSON.stringify(updated));
    setStorageUsed(updated.reduce((sum, d) => sum + d.size_mb, 0));
  };

  const clearExpired = () => {
    const now = new Date();
    const valid = downloads.filter(d => new Date(d.expires_at) > now);
    setDownloads(valid);
    localStorage.setItem('web3radio_downloads', JSON.stringify(valid));
    setStorageUsed(valid.reduce((sum, d) => sum + d.size_mb, 0));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-cyan-500 rounded-xl w-full max-w-md max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/30">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{isOnline ? '🌐' : '📴'}</span>
            <div>
              <h3 className="text-cyan-400 font-bold">Offline Mode</h3>
              <p className={`text-xs ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-dial-cream/60 hover:text-dial-cream text-2xl">×</button>
        </div>

        {/* Storage Bar */}
        <div className="p-3 border-b border-cyan-500/20 bg-black/20">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-dial-cream/60">Storage Used</span>
            <span className="text-cyan-400">{storageUsed.toFixed(1)} / {storageLimit} MB</span>
          </div>
          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 transition-all" style={{ width: `${(storageUsed / storageLimit) * 100}%` }} />
          </div>
        </div>

        {/* Pending Sync */}
        {pendingSync.length > 0 && (
          <div className="p-3 border-b border-cyan-500/20 bg-amber-500/10">
            <div className="flex items-center justify-between">
              <span className="text-amber-400 text-sm">{pendingSync.length} items pending sync</span>
              <button onClick={syncNow} disabled={!isOnline || syncing} className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded disabled:opacity-50">
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          </div>
        )}

        {/* Downloads */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-dial-cream/60 text-xs">DOWNLOADED CONTENT</p>
            <button onClick={clearExpired} className="text-red-400 text-xs hover:underline">Clear Expired</button>
          </div>

          {downloads.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">📥</span>
              <p className="text-dial-cream/50 mt-4">No downloads yet</p>
              <p className="text-dial-cream/40 text-xs">Download broadcasts for offline listening</p>
            </div>
          ) : (
            <div className="space-y-2">
              {downloads.map((item) => (
                <DownloadCard key={item.id} item={item} onPlay={() => onPlayOffline?.(item.id)} onDelete={() => deleteDownload(item.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DownloadCard({ item, onPlay, onDelete }: { item: DownloadedContent; onPlay: () => void; onDelete: () => void }) {
  const isExpired = new Date(item.expires_at) < new Date();
  
  return (
    <div className={`p-3 rounded-lg border ${isExpired ? 'bg-red-500/10 border-red-500/20 opacity-60' : 'bg-black/20 border-cyan-500/20'}`}>
      <div className="flex items-center gap-3">
        <button onClick={onPlay} disabled={isExpired} className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center disabled:opacity-50">
          {isExpired ? '⏰' : '▶️'}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-dial-cream text-sm truncate">{item.title}</p>
          <p className="text-dial-cream/50 text-xs">{item.station_name} • {Math.floor(item.duration / 60)}min</p>
        </div>
        <div className="text-right">
          <p className="text-dial-cream/40 text-xs">{item.size_mb.toFixed(1)} MB</p>
          <button onClick={onDelete} className="text-red-400 text-xs hover:underline">Delete</button>
        </div>
      </div>
      {isExpired && <p className="text-red-400 text-xs mt-2">Expired - re-download to listen</p>}
    </div>
  );
}

// Helper to queue offline actions
export function queueOfflineAction(type: 'listen' | 'reaction' | 'tip', data: Record<string, unknown>) {
  const pending = JSON.parse(localStorage.getItem('web3radio_pending_sync') || '[]');
  pending.push({ type, data, timestamp: new Date().toISOString() });
  localStorage.setItem('web3radio_pending_sync', JSON.stringify(pending));
}
