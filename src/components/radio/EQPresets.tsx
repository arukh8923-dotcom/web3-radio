'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { VolumeKnob } from './VolumeKnob';

interface EQPreset {
  id: string;
  name: string;
  bass: number;
  mid: number;
  treble: number;
  creator_address: string;
  creator_name: string | null;
  is_public: boolean;
  uses_count: number;
  created_at: string;
}

interface EQPresetsProps {
  bass: number;
  mid: number;
  treble: number;
  onApplyPreset: (bass: number, mid: number, treble: number) => void;
  disabled?: boolean;
}

// Built-in presets
const BUILT_IN_PRESETS: Omit<EQPreset, 'id' | 'creator_address' | 'creator_name' | 'is_public' | 'uses_count' | 'created_at'>[] = [
  { name: '🎸 Rock', bass: 70, mid: 50, treble: 65 },
  { name: '🎹 Jazz', bass: 55, mid: 60, treble: 50 },
  { name: '🎧 Bass Boost', bass: 85, mid: 45, treble: 40 },
  { name: '🎤 Vocal', bass: 40, mid: 70, treble: 55 },
  { name: '🌿 Chill', bass: 50, mid: 50, treble: 50 },
  { name: '🔊 Loudness', bass: 75, mid: 55, treble: 70 },
  { name: '🎻 Classical', bass: 45, mid: 55, treble: 60 },
  { name: '💥 EDM', bass: 80, mid: 40, treble: 75 },
];

export function EQPresets({ bass, mid, treble, onApplyPreset, disabled }: EQPresetsProps) {
  const { address } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'builtin' | 'community' | 'my'>('builtin');
  const [communityPresets, setCommunityPresets] = useState<EQPreset[]>([]);
  const [myPresets, setMyPresets] = useState<EQPreset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [importCode, setImportCode] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);


  // Load presets
  useEffect(() => {
    if (!isOpen) return;
    loadPresets();
  }, [isOpen, activeTab, address]);

  const loadPresets = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'community') {
        const res = await fetch('/api/eq-presets?type=community');
        if (res.ok) {
          const data = await res.json();
          setCommunityPresets(data.presets || []);
        }
      } else if (activeTab === 'my' && address) {
        const res = await fetch(`/api/eq-presets?type=my&address=${address}`);
        if (res.ok) {
          const data = await res.json();
          setMyPresets(data.presets || []);
        }
      }
    } catch (error) {
      console.error('Failed to load presets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreset = async () => {
    if (!address || !newPresetName.trim()) return;
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/eq-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPresetName.trim(),
          bass,
          mid,
          treble,
          creator_address: address,
          is_public: isPublic,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShareCode(data.share_code);
        setShowSaveModal(false);
        setNewPresetName('');
        loadPresets();
      }
    } catch (error) {
      console.error('Failed to save preset:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportPreset = async () => {
    if (!importCode.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/eq-presets/import?code=${importCode.trim()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.preset) {
          onApplyPreset(data.preset.bass, data.preset.mid, data.preset.treble);
          setShowImportModal(false);
          setImportCode('');
        }
      }
    } catch (error) {
      console.error('Failed to import preset:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreset = async (preset: EQPreset | typeof BUILT_IN_PRESETS[0]) => {
    onApplyPreset(preset.bass, preset.mid, preset.treble);
    
    // Track usage for community presets
    if ('id' in preset) {
      fetch('/api/eq-presets/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset_id: preset.id }),
      }).catch(() => {});
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    if (!address) return;
    
    try {
      await fetch(`/api/eq-presets/${presetId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      loadPresets();
    } catch (error) {
      console.error('Failed to delete preset:', error);
    }
  };

  const generateShareLink = (code: string) => {
    return `${window.location.origin}?eq=${code}`;
  };

  const copyShareLink = (code: string) => {
    navigator.clipboard.writeText(generateShareLink(code));
  };


  return (
    <>
      {/* EQ Presets Button */}
      <button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="px-3 py-1.5 bg-cabinet-dark/50 border border-brass/30 rounded-lg text-dial-cream/80 text-xs hover:bg-cabinet-dark/70 hover:border-brass/50 transition-all disabled:opacity-50"
      >
        🎛️ EQ Presets
      </button>

      {/* Main Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-cabinet-dark border-2 border-brass/50 rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-brass/30">
              <h3 className="nixie-tube text-lg">🎛️ EQ PRESETS</h3>
              <button onClick={() => setIsOpen(false)} className="text-dial-cream/50 hover:text-dial-cream">✕</button>
            </div>

            {/* Current EQ Display */}
            <div className="p-4 bg-black/30 border-b border-brass/20">
              <div className="text-dial-cream/50 text-xs mb-2">Current Settings</div>
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <div className="text-brass text-lg font-bold">{bass}</div>
                  <div className="text-dial-cream/50 text-xs">BASS</div>
                </div>
                <div className="text-center">
                  <div className="text-brass text-lg font-bold">{mid}</div>
                  <div className="text-dial-cream/50 text-xs">MID</div>
                </div>
                <div className="text-center">
                  <div className="text-brass text-lg font-bold">{treble}</div>
                  <div className="text-dial-cream/50 text-xs">TREBLE</div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 justify-center">
                <button
                  onClick={() => setShowSaveModal(true)}
                  disabled={!address}
                  className="px-3 py-1 bg-brass/20 border border-brass/50 rounded text-brass text-xs hover:bg-brass/30 disabled:opacity-50"
                >
                  💾 Save as Preset
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded text-green-400 text-xs hover:bg-green-500/30"
                >
                  📥 Import Code
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-brass/20">
              {(['builtin', 'community', 'my'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-brass border-b-2 border-brass bg-brass/10'
                      : 'text-dial-cream/50 hover:text-dial-cream/80'
                  }`}
                >
                  {tab === 'builtin' && '🎵 Built-in'}
                  {tab === 'community' && '🌐 Community'}
                  {tab === 'my' && '👤 My Presets'}
                </button>
              ))}
            </div>

            {/* Presets List */}
            <div className="p-4 overflow-y-auto max-h-[40vh]">
              {isLoading ? (
                <div className="text-center text-dial-cream/50 py-8">Loading...</div>
              ) : activeTab === 'builtin' ? (
                <div className="grid grid-cols-2 gap-2">
                  {BUILT_IN_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleApplyPreset(preset)}
                      className="p-3 bg-black/30 border border-brass/20 rounded-lg hover:border-brass/50 hover:bg-black/50 transition-all text-left"
                    >
                      <div className="text-dial-cream font-medium text-sm">{preset.name}</div>
                      <div className="text-dial-cream/50 text-xs mt-1">
                        B:{preset.bass} M:{preset.mid} T:{preset.treble}
                      </div>
                    </button>
                  ))}
                </div>
              ) : activeTab === 'community' ? (
                communityPresets.length === 0 ? (
                  <div className="text-center text-dial-cream/50 py-8">No community presets yet</div>
                ) : (
                  <div className="space-y-2">
                    {communityPresets.map((preset) => (
                      <div
                        key={preset.id}
                        className="p-3 bg-black/30 border border-brass/20 rounded-lg hover:border-brass/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-dial-cream font-medium text-sm">{preset.name}</div>
                            <div className="text-dial-cream/50 text-xs">
                              by {preset.creator_name || preset.creator_address.slice(0, 8)}... • {preset.uses_count} uses
                            </div>
                            <div className="text-dial-cream/40 text-xs mt-1">
                              B:{preset.bass} M:{preset.mid} T:{preset.treble}
                            </div>
                          </div>
                          <button
                            onClick={() => handleApplyPreset(preset)}
                            className="px-3 py-1 bg-brass/20 border border-brass/50 rounded text-brass text-xs hover:bg-brass/30"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                !address ? (
                  <div className="text-center text-dial-cream/50 py-8">Connect wallet to see your presets</div>
                ) : myPresets.length === 0 ? (
                  <div className="text-center text-dial-cream/50 py-8">No saved presets yet</div>
                ) : (
                  <div className="space-y-2">
                    {myPresets.map((preset) => (
                      <div
                        key={preset.id}
                        className="p-3 bg-black/30 border border-brass/20 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-dial-cream font-medium text-sm">
                              {preset.name}
                              {preset.is_public && <span className="ml-2 text-green-400 text-xs">🌐 Public</span>}
                            </div>
                            <div className="text-dial-cream/40 text-xs mt-1">
                              B:{preset.bass} M:{preset.mid} T:{preset.treble}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApplyPreset(preset)}
                              className="px-2 py-1 bg-brass/20 border border-brass/50 rounded text-brass text-xs hover:bg-brass/30"
                            >
                              Apply
                            </button>
                            <button
                              onClick={() => copyShareLink(preset.id)}
                              className="px-2 py-1 bg-blue-500/20 border border-blue-500/50 rounded text-blue-400 text-xs hover:bg-blue-500/30"
                            >
                              📋
                            </button>
                            <button
                              onClick={() => handleDeletePreset(preset.id)}
                              className="px-2 py-1 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-xs hover:bg-red-500/30"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Share Code Display */}
            {shareCode && (
              <div className="p-4 bg-green-500/10 border-t border-green-500/30">
                <div className="text-green-400 text-sm font-medium mb-2">✅ Preset Saved!</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generateShareLink(shareCode)}
                    readOnly
                    className="flex-1 px-3 py-2 bg-black/30 border border-green-500/30 rounded text-dial-cream text-xs"
                  />
                  <button
                    onClick={() => copyShareLink(shareCode)}
                    className="px-3 py-2 bg-green-500/20 border border-green-500/50 rounded text-green-400 text-xs hover:bg-green-500/30"
                  >
                    Copy
                  </button>
                </div>
                <button
                  onClick={() => setShareCode(null)}
                  className="mt-2 text-dial-cream/50 text-xs hover:text-dial-cream"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Save Preset Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-cabinet-dark border-2 border-brass/50 rounded-xl w-full max-w-sm p-4">
            <h4 className="nixie-tube text-base mb-4">💾 SAVE PRESET</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-dial-cream/70 text-xs mb-1">Preset Name</label>
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="My Awesome EQ"
                  className="w-full px-3 py-2 bg-black/30 border border-brass/30 rounded-lg text-dial-cream text-sm"
                  maxLength={50}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="isPublic" className="text-dial-cream/70 text-sm">
                  Share publicly (visible in Community tab)
                </label>
              </div>

              <div className="p-3 bg-black/30 rounded-lg">
                <div className="text-dial-cream/50 text-xs mb-2">Settings to save:</div>
                <div className="flex justify-around text-center">
                  <div>
                    <div className="text-brass font-bold">{bass}</div>
                    <div className="text-dial-cream/50 text-xs">BASS</div>
                  </div>
                  <div>
                    <div className="text-brass font-bold">{mid}</div>
                    <div className="text-dial-cream/50 text-xs">MID</div>
                  </div>
                  <div>
                    <div className="text-brass font-bold">{treble}</div>
                    <div className="text-dial-cream/50 text-xs">TREBLE</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-2 bg-cabinet-dark border border-brass/30 rounded-lg text-dial-cream/70 text-sm hover:bg-cabinet-dark/70"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreset}
                  disabled={!newPresetName.trim() || isSaving}
                  className="flex-1 py-2 bg-brass/20 border border-brass/50 rounded-lg text-brass text-sm hover:bg-brass/30 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Preset Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-cabinet-dark border-2 border-brass/50 rounded-xl w-full max-w-sm p-4">
            <h4 className="nixie-tube text-base mb-4">📥 IMPORT PRESET</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-dial-cream/70 text-xs mb-1">Share Code or Link</label>
                <input
                  type="text"
                  value={importCode}
                  onChange={(e) => {
                    // Extract code from URL if pasted
                    const val = e.target.value;
                    const match = val.match(/[?&]eq=([a-zA-Z0-9]+)/);
                    setImportCode(match ? match[1] : val);
                  }}
                  placeholder="Paste share code or link"
                  className="w-full px-3 py-2 bg-black/30 border border-brass/30 rounded-lg text-dial-cream text-sm"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportCode('');
                  }}
                  className="flex-1 py-2 bg-cabinet-dark border border-brass/30 rounded-lg text-dial-cream/70 text-sm hover:bg-cabinet-dark/70"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportPreset}
                  disabled={!importCode.trim() || isLoading}
                  className="flex-1 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm hover:bg-green-500/30 disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Import & Apply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
