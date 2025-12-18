'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface StereoToggleProps {
  onChange?: (mode: 'stereo' | 'mono') => void;
  audioContext?: AudioContext | null;
  sourceNode?: MediaElementAudioSourceNode | null;
  disabled?: boolean;
}

export function StereoToggle({ onChange, audioContext, sourceNode, disabled }: StereoToggleProps) {
  const [mode, setMode] = useState<'stereo' | 'mono'>('stereo');
  const channelMergerRef = useRef<ChannelMergerNode | null>(null);
  const channelSplitterRef = useRef<ChannelSplitterNode | null>(null);
  const gainNodesRef = useRef<GainNode[]>([]);
  const isConnectedRef = useRef(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('web3radio-audio-mode');
    if (saved === 'mono' || saved === 'stereo') {
      setMode(saved);
    }
  }, []);

  // Setup audio processing for mono conversion
  const setupMonoProcessing = useCallback(() => {
    if (!audioContext || !sourceNode || isConnectedRef.current) return;

    try {
      // Create channel splitter (stereo to 2 channels)
      const splitter = audioContext.createChannelSplitter(2);
      channelSplitterRef.current = splitter;

      // Create gain nodes for each channel
      const leftGain = audioContext.createGain();
      const rightGain = audioContext.createGain();
      gainNodesRef.current = [leftGain, rightGain];

      // Create channel merger (2 channels to stereo)
      const merger = audioContext.createChannelMerger(2);
      channelMergerRef.current = merger;

      // Connect: source -> splitter
      sourceNode.connect(splitter);

      // Connect: splitter channels -> gain nodes
      splitter.connect(leftGain, 0);
      splitter.connect(rightGain, 1);

      // Connect: gain nodes -> merger (both to both channels for mono)
      leftGain.connect(merger, 0, 0);
      leftGain.connect(merger, 0, 1);
      rightGain.connect(merger, 0, 0);
      rightGain.connect(merger, 0, 1);

      // Connect: merger -> destination
      merger.connect(audioContext.destination);

      isConnectedRef.current = true;
    } catch (error) {
      console.error('Failed to setup mono processing:', error);
    }
  }, [audioContext, sourceNode]);

  // Apply mono/stereo mode
  useEffect(() => {
    if (!audioContext || !sourceNode) return;

    if (mode === 'mono') {
      setupMonoProcessing();
      // Set gains for mono (average both channels)
      gainNodesRef.current.forEach((gain) => {
        gain.gain.value = 0.5;
      });
    } else {
      // For stereo, disconnect mono processing and connect directly
      if (isConnectedRef.current) {
        try {
          sourceNode.disconnect();
          sourceNode.connect(audioContext.destination);
          isConnectedRef.current = false;
        } catch (error) {
          console.error('Failed to switch to stereo:', error);
        }
      }
    }
  }, [mode, audioContext, sourceNode, setupMonoProcessing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelMergerRef.current) {
        try {
          channelMergerRef.current.disconnect();
        } catch (e) {}
      }
      if (channelSplitterRef.current) {
        try {
          channelSplitterRef.current.disconnect();
        } catch (e) {}
      }
      gainNodesRef.current.forEach((gain) => {
        try {
          gain.disconnect();
        } catch (e) {}
      });
    };
  }, []);

  const toggleMode = () => {
    const newMode = mode === 'stereo' ? 'mono' : 'stereo';
    setMode(newMode);
    localStorage.setItem('web3radio-audio-mode', newMode);
    onChange?.(newMode);
  };

  return (
    <button
      onClick={toggleMode}
      disabled={disabled}
      className={`preset-button text-xs flex items-center gap-1.5 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      title={`Audio Mode: ${mode}`}
    >
      {mode === 'stereo' ? (
        <>
          <span className="flex gap-0.5">
            <span className="w-1.5 h-3 bg-brass rounded-sm" />
            <span className="w-1.5 h-3 bg-brass rounded-sm" />
          </span>
          <span>STEREO</span>
        </>
      ) : (
        <>
          <span className="w-3 h-3 bg-brass rounded-full" />
          <span>MONO</span>
        </>
      )}
    </button>
  );
}
