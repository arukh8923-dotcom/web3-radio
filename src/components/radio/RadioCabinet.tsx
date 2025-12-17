'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { FrequencyDial } from './FrequencyDial';
import { VolumeKnob } from './VolumeKnob';
import { PresetButtons } from './PresetButtons';
import { VUMeter } from './VUMeter';
import { NixieDisplay } from './NixieDisplay';
import { PilotLight } from './PilotLight';
import { SpeakerGrille } from './SpeakerGrille';
import { MoodRingDisplay } from './MoodRingDisplay';
import { LiveChat } from './LiveChat';
import { SmokeSignals } from './SmokeSignals';
import { is420Zone } from '@/constants/frequencies';
import { useRadio } from '@/hooks/useRadio';

export function RadioCabinet() {
  const { address } = useAccount();
  const {
    frequency,
    volume,
    bass,
    treble,
    isOn,
    isMuted,
    isTunedIn,
    currentStation,
    presets,
    moodRing,
    setFrequency,
    setVolume,
    setBass,
    setTreble,
    togglePower,
    toggleMute,
    setWalletAddress,
    tuneIn,
    tuneOut,
    savePreset,
    loadPreset,
    savePreferences,
  } = useRadio();

  // Sync wallet address
  useEffect(() => {
    setWalletAddress(address || null);
  }, [address, setWalletAddress]);

  // Save preferences when EQ changes
  useEffect(() => {
    if (address) {
      const timeout = setTimeout(() => savePreferences(), 1000);
      return () => clearTimeout(timeout);
    }
  }, [volume, bass, treble, address, savePreferences]);

  const [chatOpen, setChatOpen] = useState(false);
  
  const in420Zone = is420Zone(frequency);
  const activePreset = presets.find(p => p.frequency === frequency)?.slot;

  return (
    <div className={`radio-cabinet w-full max-w-4xl p-6 md:p-8 ${in420Zone ? 'zone-420' : ''}`}>
      {/* Top Section - Dial and Display */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Frequency Dial */}
        <div className="flex-1">
          <FrequencyDial 
            frequency={frequency} 
            onChange={setFrequency}
            disabled={!isOn}
          />
        </div>

        {/* Nixie Display */}
        <div className="flex flex-col items-center gap-4">
          <NixieDisplay value={frequency.toFixed(1)} label="FM" />
          <div className="flex items-center gap-4">
            <PilotLight isOn={isOn} onClick={togglePower} />
            <span className="text-dial-cream/70 text-sm font-dial">POWER</span>
          </div>
        </div>

        {/* VU Meters */}
        <div className="flex gap-4">
          <VUMeter label="L" value={isOn && !isMuted ? volume * 0.8 : 0} />
          <VUMeter label="R" value={isOn && !isMuted ? volume * 0.85 : 0} />
        </div>
      </div>

      {/* Speaker Grille */}
      <SpeakerGrille />

      {/* Bottom Section - Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-6">
        {/* Preset Buttons */}
        <PresetButtons 
          onSelect={loadPreset}
          onLongPress={savePreset}
          activePreset={activePreset}
        />

        {/* Volume and EQ Knobs */}
        <div className="flex items-center gap-6">
          <VolumeKnob 
            value={volume} 
            onChange={setVolume}
            label="VOLUME"
            disabled={!isOn}
          />
          <VolumeKnob 
            value={bass} 
            onChange={setBass}
            label="BASS"
            disabled={!isOn}
          />
          <VolumeKnob 
            value={treble} 
            onChange={setTreble}
            label="TREBLE"
            disabled={!isOn}
          />
        </div>

        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className={`preset-button ${isMuted ? 'bg-tuning-red' : ''}`}
          disabled={!isOn}
        >
          {isMuted ? 'UNMUTE' : 'MUTE'}
        </button>
      </div>

      {/* Now Playing Info */}
      {isOn && (
        <div className="mt-6 p-4 bg-black/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="nixie-tube text-lg">
                {currentStation ? 'NOW PLAYING' : 'NO SIGNAL'}
              </p>
              <p className="text-dial-cream/80 font-dial">
                {currentStation?.name || `${frequency.toFixed(1)} FM`}
              </p>
              {currentStation?.description && (
                <p className="text-dial-cream/50 text-sm mt-1">
                  {currentStation.description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {currentStation && (
                <>
                  <button 
                    className="preset-button text-xs"
                    onClick={() => {/* TODO: Open tip modal */}}
                  >
                    TIP DJ
                  </button>
                  <button 
                    className={`preset-button text-xs ${isTunedIn ? 'bg-tuning-red' : ''}`}
                    onClick={isTunedIn ? tuneOut : tuneIn}
                    disabled={!address}
                  >
                    {isTunedIn ? 'TUNE OUT' : 'TUNE IN'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mood Ring */}
          {currentStation && moodRing && (
            <MoodRingDisplay moodRing={moodRing} stationId={currentStation.id} />
          )}

          {/* Listener Count & Chat Button */}
          {currentStation && (
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-dial-cream/60 text-sm">
                <span className="w-2 h-2 rounded-full bg-tuning-red animate-pulse" />
                <span>{currentStation.listener_count} listeners</span>
                {currentStation.is_live && (
                  <span className="ml-2 px-2 py-0.5 bg-tuning-red/20 text-tuning-red text-xs rounded">
                    LIVE
                  </span>
                )}
              </div>
              <button
                onClick={() => setChatOpen(true)}
                className="preset-button text-xs"
              >
                💬 CHAT
              </button>
            </div>
          )}

          {/* Smoke Signals (420 Zone) */}
          {currentStation && in420Zone && (
            <SmokeSignals stationId={currentStation.id} />
          )}
        </div>
      )}

      {/* Live Chat Modal */}
      {currentStation && (
        <LiveChat
          stationId={currentStation.id}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
