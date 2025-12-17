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
import { TipDJModal } from './TipDJModal';
import { SubscriptionPanel } from './SubscriptionPanel';
import { SleepTimer } from './SleepTimer';
import { AutoScan } from './AutoScan';
import { BandSelector } from './BandSelector';
import { NowPlayingDetail } from './NowPlayingDetail';
import { AudioPlayer } from './AudioPlayer';
import { AlarmClock } from './AlarmClock';
import { RecordingDVR } from './RecordingDVR';
import { RequestLine } from './RequestLine';
import { ReceptionQuality } from './ReceptionQuality';
import { StereoToggle } from './StereoToggle';
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

  // Load station on mount and when frequency changes
  useEffect(() => {
    if (isOn) {
      useRadio.getState().loadStationByFrequency(frequency);
    }
  }, [frequency, isOn]);

  // Save preferences when EQ changes
  useEffect(() => {
    if (address) {
      const timeout = setTimeout(() => savePreferences(), 1000);
      return () => clearTimeout(timeout);
    }
  }, [volume, bass, treble, address, savePreferences]);

  const [chatOpen, setChatOpen] = useState(false);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);
  const [currentBand, setCurrentBand] = useState('all');
  
  const in420Zone = is420Zone(frequency);
  const activePreset = presets?.find(p => p.frequency === frequency)?.slot;

  // Sleep timer handler
  const handleSleep = () => {
    if (isOn) {
      togglePower();
    }
  };

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

      {/* Speaker Grille with Audio Player overlay */}
      <div className="relative">
        <SpeakerGrille />
        {/* Audio Player - only show if there's a stream */}
        {isOn && currentStation && (currentStation as any).stream_url && (
          <div className="absolute bottom-2 left-2 right-2">
            <AudioPlayer 
              stationId={currentStation.id} 
              streamUrl={(currentStation as any).stream_url} 
            />
          </div>
        )}
      </div>

      {/* Bottom Section - Controls */}
      <div className="flex flex-col gap-4 mt-6">
        {/* Row 1: Presets and Knobs */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {/* Preset Buttons */}
          <PresetButtons 
            onSelect={loadPreset}
            onLongPress={savePreset}
            activePreset={activePreset}
          />

          {/* Volume and EQ Knobs */}
          <div className="flex items-center gap-4 md:gap-6">
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
        </div>

        {/* Row 2: Mute, Sleep, Alarm, Stereo */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={toggleMute}
            className={`preset-button ${isMuted ? 'bg-tuning-red' : ''}`}
            disabled={!isOn}
          >
            {isMuted ? 'UNMUTE' : 'MUTE'}
          </button>
          <StereoToggle disabled={!isOn} />
          <SleepTimer onSleep={handleSleep} />
          <AlarmClock />
        </div>
      </div>

      {/* Auto Scan & Band Controls */}
      {isOn && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <BandSelector currentBand={currentBand} onBandChange={setCurrentBand} />
          <AutoScan
            currentFrequency={frequency}
            onFrequencyChange={setFrequency}
            onStationFound={setFrequency}
            disabled={!isOn}
          />
        </div>
      )}

      {/* Now Playing Info */}
      {isOn && (
        <div className="mt-6 p-4 bg-black/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div 
              className={currentStation ? 'cursor-pointer hover:opacity-80' : ''}
              onClick={() => currentStation && setNowPlayingOpen(true)}
            >
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
              {currentStation && (
                <p className="text-brass/60 text-xs mt-1">Click for details →</p>
              )}
            </div>
            <div className="flex gap-2">
              {currentStation && (
                <>
                  <RecordingDVR
                    stationId={currentStation.id}
                    stationName={currentStation.name}
                    frequency={frequency}
                    isLive={currentStation.is_live}
                  />
                  <button 
                    className="preset-button text-xs"
                    onClick={() => setTipModalOpen(true)}
                  >
                    TIP DJ
                  </button>
                  <button 
                    className="preset-button text-xs"
                    onClick={() => setSubscriptionOpen(true)}
                  >
                    🎫 SUB
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

          {/* Chat & Info Row - Always visible */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-dial-cream/60 text-sm">
              {currentStation ? (
                <>
                  <ReceptionQuality 
                    signalStrength={currentStation.signal_strength} 
                    isLive={currentStation.is_live} 
                  />
                  <span>{currentStation.listener_count} listeners</span>
                  {currentStation.is_live && (
                    <span className="px-2 py-0.5 bg-tuning-red/20 text-tuning-red text-xs rounded">
                      LIVE
                    </span>
                  )}
                </>
              ) : (
                <span>Tune to find stations</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <RequestLine stationId={currentStation?.id} disabled={!currentStation} />
              <button
                onClick={() => setChatOpen(true)}
                className="preset-button text-xs"
              >
                💬 CHAT
              </button>
            </div>
          </div>

          {/* Smoke Signals (420 Zone) */}
          {currentStation && in420Zone && (
            <SmokeSignals stationId={currentStation.id} />
          )}
        </div>
      )}

      {/* Live Chat Modal */}
      <LiveChat
        stationId={currentStation?.id}
        frequency={frequency}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      {/* Tip DJ Modal */}
      <TipDJModal
        isOpen={tipModalOpen}
        onClose={() => setTipModalOpen(false)}
        stationName={currentStation?.name || 'Unknown Station'}
        djAddress={currentStation?.owner_address}
      />

      {/* Now Playing Detail Modal */}
      <NowPlayingDetail
        station={currentStation}
        isOpen={nowPlayingOpen}
        onClose={() => setNowPlayingOpen(false)}
      />

      {/* Subscription Panel */}
      <SubscriptionPanel
        isOpen={subscriptionOpen}
        onClose={() => setSubscriptionOpen(false)}
        stationName={currentStation?.name || 'Unknown Station'}
        stationAddress={currentStation?.owner_address}
      />
    </div>
  );
}
