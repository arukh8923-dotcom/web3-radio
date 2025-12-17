'use client';

import { useState } from 'react';
import { FrequencyDial } from './FrequencyDial';
import { VolumeKnob } from './VolumeKnob';
import { PresetButtons } from './PresetButtons';
import { VUMeter } from './VUMeter';
import { NixieDisplay } from './NixieDisplay';
import { PilotLight } from './PilotLight';
import { SpeakerGrille } from './SpeakerGrille';
import { is420Zone } from '@/constants/frequencies';

export function RadioCabinet() {
  const [frequency, setFrequency] = useState(88.0);
  const [volume, setVolume] = useState(50);
  const [isOn, setIsOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const in420Zone = is420Zone(frequency);

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
            <PilotLight isOn={isOn} onClick={() => setIsOn(!isOn)} />
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
          onSelect={(preset) => {
            // TODO: Load preset frequency
            console.log('Selected preset:', preset);
          }}
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
            value={50} 
            onChange={() => {}}
            label="BASS"
            disabled={!isOn}
          />
          <VolumeKnob 
            value={50} 
            onChange={() => {}}
            label="TREBLE"
            disabled={!isOn}
          />
        </div>

        {/* Mute Button */}
        <button
          onClick={() => setIsMuted(!isMuted)}
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
              <p className="nixie-tube text-lg">NOW PLAYING</p>
              <p className="text-dial-cream/80 font-dial">Station {frequency.toFixed(1)} FM</p>
            </div>
            <div className="flex gap-2">
              <button className="preset-button text-xs">TIP DJ</button>
              <button className="preset-button text-xs">TUNE IN</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
