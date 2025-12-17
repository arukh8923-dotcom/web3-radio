'use client';

import { useEffect } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useRadio } from '@/hooks/useRadio';

interface AudioPlayerProps {
  stationId?: string;
  streamUrl?: string;
}

export function AudioPlayer({ stationId, streamUrl }: AudioPlayerProps) {
  const { 
    isPlaying, 
    currentTime, 
    duration, 
    error,
    play, 
    pause, 
    toggle,
    setVolume,
    setMuted,
    setStreamUrl,
  } = useAudioPlayer();
  
  const { volume, isMuted, isOn } = useRadio();

  // Sync volume with radio state
  useEffect(() => {
    setVolume(volume);
  }, [volume, setVolume]);

  // Sync mute with radio state
  useEffect(() => {
    setMuted(isMuted);
  }, [isMuted, setMuted]);

  // Handle stream URL
  useEffect(() => {
    if (isOn && streamUrl) {
      setStreamUrl(streamUrl);
    } else {
      setStreamUrl(null);
    }
  }, [isOn, streamUrl, setStreamUrl]);

  // Auto-pause when radio is off
  useEffect(() => {
    if (!isOn) {
      pause();
    }
  }, [isOn, pause]);

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg p-2">
      {/* Play/Pause Button */}
      <button
        onClick={toggle}
        disabled={!streamUrl || !isOn}
        className="w-10 h-10 flex items-center justify-center text-lg bg-brass/20 hover:bg-brass/30 rounded-full text-brass disabled:opacity-50 transition-colors"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
      
      <div className="flex-1 min-w-0">
        {/* Progress Bar */}
        <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-brass rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Time Display */}
        <div className="flex justify-between text-[10px] text-dial-cream/50 mt-0.5 font-dial">
          <span>{formatTime(currentTime)}</span>
          {error ? (
            <span className="text-tuning-red/70 truncate mx-2">{error}</span>
          ) : (
            <span>{formatTime(duration)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
