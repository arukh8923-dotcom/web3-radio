'use client';

import { useState, useRef } from 'react';
import { useAccount } from 'wagmi';

interface BroadcastData {
  title: string;
  contentType: 'audio' | 'visual' | 'generative';
  file: File | null;
  duration: number;
}

interface Broadcast {
  id: string;
  title: string;
  contentHash: string;
  contentType: string;
  timestamp: number;
  listenerCount: number;
  isLive: boolean;
}

// Placeholder: upload to IPFS
async function uploadToIPFS(file: File): Promise<string> {
  // TODO: Replace with actual IPFS upload
  await new Promise(resolve => setTimeout(resolve, 1500));
  return `ipfs://Qm${Math.random().toString(36).slice(2, 48)}`;
}

// Placeholder: publish broadcast on-chain
async function publishBroadcast(params: {
  stationId: string;
  contentHash: string;
  contentType: string;
  title: string;
  djAddress: string;
}): Promise<{ success: boolean; txHash: string; broadcastId: string }> {
  // TODO: Replace with actual contract call
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    success: true,
    txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    broadcastId: `broadcast-${Date.now()}`,
  };
}

// Placeholder: get listener count
async function getListenerCount(stationId: string): Promise<number> {
  // TODO: Replace with actual API/contract call
  return Math.floor(Math.random() * 100) + 10;
}

export default function BroadcastManager({ 
  stationId,
  stationName,
  onClose 
}: { 
  stationId: string;
  stationName: string;
  onClose?: () => void;
}) {
  const { address } = useAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLive, setIsLive] = useState(false);
  const [listenerCount, setListenerCount] = useState(0);
  const [step, setStep] = useState<'idle' | 'uploading' | 'publishing' | 'live' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentBroadcast, setCurrentBroadcast] = useState<Broadcast | null>(null);
  
  const [formData, setFormData] = useState<BroadcastData>({
    title: '',
    contentType: 'audio',
    file: null,
    duration: 0,
  });


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      // Get audio duration if it's an audio file
      if (file.type.startsWith('audio/')) {
        const audio = new Audio(URL.createObjectURL(file));
        audio.onloadedmetadata = () => {
          setFormData(prev => ({ ...prev, duration: Math.floor(audio.duration) }));
        };
      }
    }
  };

  const handleStartBroadcast = async () => {
    if (!address || !formData.file || !formData.title) return;
    
    setError(null);
    
    try {
      // Step 1: Upload to IPFS
      setStep('uploading');
      const contentHash = await uploadToIPFS(formData.file);
      
      // Step 2: Publish on-chain
      setStep('publishing');
      const result = await publishBroadcast({
        stationId,
        contentHash,
        contentType: formData.contentType,
        title: formData.title,
        djAddress: address,
      });
      
      if (!result.success) {
        throw new Error('Failed to publish broadcast');
      }
      
      // Step 3: Go live
      setCurrentBroadcast({
        id: result.broadcastId,
        title: formData.title,
        contentHash,
        contentType: formData.contentType,
        timestamp: Date.now(),
        listenerCount: 0,
        isLive: true,
      });
      setIsLive(true);
      setStep('live');
      
      // Start polling listener count
      const interval = setInterval(async () => {
        const count = await getListenerCount(stationId);
        setListenerCount(count);
      }, 5000);
      
      // Initial count
      const initialCount = await getListenerCount(stationId);
      setListenerCount(initialCount);
      
      return () => clearInterval(interval);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Broadcast failed');
      setStep('error');
    }
  };

  const handleEndBroadcast = () => {
    setIsLive(false);
    setStep('idle');
    setCurrentBroadcast(null);
    setFormData({
      title: '',
      contentType: 'audio',
      file: null,
      duration: 0,
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Live broadcast view
  if (step === 'live' && currentBroadcast) {
    return (
      <div className="bg-zinc-900 rounded-xl border border-red-500/50 overflow-hidden">
        <div className="bg-gradient-to-r from-red-900/60 to-orange-900/40 px-4 py-3 border-b border-red-500/30">
          <div className="flex items-center justify-between">
            <h2 className="text-red-400 font-bold flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              LIVE - {stationName}
            </h2>
            <div className="flex items-center gap-2 text-amber-100/60 text-sm">
              <span>👥</span>
              <span>{listenerCount} listeners</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Now Playing */}
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-amber-100/40 text-xs mb-1">NOW PLAYING</div>
            <div className="text-amber-100 font-bold text-lg">{currentBroadcast.title}</div>
            <div className="text-amber-100/60 text-sm mt-1">
              {currentBroadcast.contentType.toUpperCase()} • Started {new Date(currentBroadcast.timestamp).toLocaleTimeString()}
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-400">{listenerCount}</div>
              <div className="text-amber-100/40 text-xs">Listeners</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">●</div>
              <div className="text-amber-100/40 text-xs">Signal</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-400">
                {Math.floor((Date.now() - currentBroadcast.timestamp) / 60000)}m
              </div>
              <div className="text-amber-100/40 text-xs">Duration</div>
            </div>
          </div>
          
          {/* Content Hash */}
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-amber-100/40 text-xs mb-1">Content Hash</div>
            <div className="text-amber-100 font-mono text-xs break-all">
              {currentBroadcast.contentHash}
            </div>
          </div>
          
          {/* End Broadcast */}
          <button
            onClick={handleEndBroadcast}
            className="w-full px-4 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500"
          >
            ⏹️ End Broadcast
          </button>
        </div>
      </div>
    );
  }

  // Uploading/Publishing state
  if (step === 'uploading' || step === 'publishing') {
    return (
      <div className="bg-zinc-900 rounded-xl p-6 border border-amber-900/30">
        <div className="text-center py-8">
          <div className="text-5xl mb-4 animate-pulse">
            {step === 'uploading' ? '📤' : '📡'}
          </div>
          <h3 className="text-amber-100 font-bold mb-2">
            {step === 'uploading' ? 'Uploading to IPFS...' : 'Publishing On-Chain...'}
          </h3>
          <p className="text-amber-100/60 text-sm mb-4">
            {step === 'uploading' 
              ? 'Storing your content on decentralized storage'
              : 'Recording broadcast on Base blockchain'}
          </p>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (step === 'error') {
    return (
      <div className="bg-zinc-900 rounded-xl p-6 border border-red-500/30">
        <div className="text-center py-6">
          <div className="text-5xl mb-4">❌</div>
          <h3 className="text-red-400 font-bold mb-2">Broadcast Failed</h3>
          <p className="text-amber-100/60 text-sm mb-4">{error}</p>
          <button
            onClick={() => setStep('idle')}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Idle - Upload form
  return (
    <div className="bg-zinc-900 rounded-xl border border-amber-900/30 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 px-4 py-3 border-b border-amber-900/30">
        <div className="flex items-center justify-between">
          <h2 className="text-amber-100 font-bold flex items-center gap-2">
            <span>🎙️</span> Start Broadcast
          </h2>
          <div className="text-amber-100/60 text-sm">{stationName}</div>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-amber-100/60 text-xs mb-1">Broadcast Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Evening Chill Session"
            className="w-full px-3 py-2 bg-black/30 border border-amber-900/30 rounded-lg text-amber-100 placeholder:text-amber-100/30 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Content Type */}
        <div>
          <label className="block text-amber-100/60 text-xs mb-1">Content Type</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'audio', icon: '🎵', label: 'Audio' },
              { value: 'visual', icon: '🎨', label: 'Visual' },
              { value: 'generative', icon: '✨', label: 'Generative' },
            ].map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  contentType: type.value as BroadcastData['contentType'] 
                }))}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  formData.contentType === type.value
                    ? 'bg-amber-600 text-white'
                    : 'bg-black/30 text-amber-100/60 hover:bg-black/50'
                }`}
              >
                {type.icon} {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-amber-100/60 text-xs mb-1">Content File</label>
          <input
            ref={fileInputRef}
            type="file"
            accept={formData.contentType === 'audio' ? 'audio/*' : 'image/*,video/*'}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-8 border-2 border-dashed border-amber-900/30 rounded-lg text-amber-100/60 hover:border-amber-500 hover:text-amber-100 transition-colors"
          >
            {formData.file ? (
              <div>
                <div className="text-amber-100 font-medium">{formData.file.name}</div>
                <div className="text-sm mt-1">
                  {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                  {formData.duration > 0 && ` • ${formatDuration(formData.duration)}`}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-3xl mb-2">📁</div>
                <div>Click to select file</div>
              </div>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-zinc-800 text-amber-100 rounded-lg hover:bg-zinc-700"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleStartBroadcast}
            disabled={!formData.title || !formData.file}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-lg hover:from-red-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔴 Go Live
          </button>
        </div>
      </div>
    </div>
  );
}
