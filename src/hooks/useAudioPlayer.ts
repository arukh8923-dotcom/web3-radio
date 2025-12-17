'use client';

import { create } from 'zustand';
import { useEffect, useRef } from 'react';

interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  error: string | null;
  streamUrl: string | null;
  
  // Actions
  setStreamUrl: (url: string | null) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setBuffered: (buffered: number) => void;
  setError: (error: string | null) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  buffered: 0,
  error: null,
  streamUrl: null,
  
  setStreamUrl: (url) => set({ streamUrl: url, error: null }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration: duration }),
  setBuffered: (buffered) => set({ buffered: buffered }),
  setError: (error) => set({ error: error, isPlaying: false }),
}));

// Audio Player Hook with actual audio element control
export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    isPlaying,
    currentTime,
    duration,
    buffered,
    error,
    streamUrl,
    setPlaying,
    setCurrentTime,
    setDuration,
    setBuffered,
    setError,
    setStreamUrl,
  } = useAudioStore();

  // Initialize audio element
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => setPlaying(false);
    const handleError = () => setError('Failed to load audio stream');
    const handleCanPlay = () => setError(null);
    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        setBuffered(audio.buffered.end(audio.buffered.length - 1));
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('progress', handleProgress);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('progress', handleProgress);
    };
  }, [setCurrentTime, setDuration, setPlaying, setError, setBuffered]);

  // Handle stream URL changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (streamUrl) {
      audioRef.current.src = streamUrl;
      audioRef.current.load();
    } else {
      audioRef.current.src = '';
      setPlaying(false);
    }
  }, [streamUrl, setPlaying]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(() => {
        setError('Playback failed - user interaction required');
        setPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, setError, setPlaying]);

  const play = () => {
    if (streamUrl) {
      setPlaying(true);
    }
  };

  const pause = () => {
    setPlaying(false);
  };

  const toggle = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
    }
  };

  const setMuted = (muted: boolean) => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
  };

  return {
    isPlaying,
    currentTime,
    duration,
    buffered,
    error,
    streamUrl,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    setMuted,
    setStreamUrl,
  };
}
