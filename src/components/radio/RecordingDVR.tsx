'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

interface Recording {
  id: string;
  stationId: string;
  stationName: string;
  frequency: number;
  startTime: number;
  endTime: number | null;
  duration: number;
  status: 'recording' | 'completed' | 'minting';
  nftTokenId?: string;
}

interface RecordingDVRProps {
  stationId?: string;
  stationName?: string;
  frequency: number;
  isLive?: boolean;
}

export function RecordingDVR({ stationId, stationName, frequency, isLive }: RecordingDVRProps) {
  const { address } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [activeRecording, setActiveRecording] = useState<Recording | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load recordings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('web3radio-recordings');
    if (saved) {
      setRecordings(JSON.parse(saved));
    }
  }, []);

  // Save recordings to localStorage
  useEffect(() => {
    localStorage.setItem('web3radio-recordings', JSON.stringify(recordings));
  }, [recordings]);

  // Recording timer
  useEffect(() => {
    if (activeRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeRecording]);

  const startRecording = () => {
    if (!stationId || !stationName) return;

    const newRecording: Recording = {
      id: Date.now().toString(),
      stationId,
      stationName,
      frequency,
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      status: 'recording',
    };

    setActiveRecording(newRecording);
    setRecordingTime(0);
  };

  const stopRecording = () => {
    if (!activeRecording) return;

    const completedRecording: Recording = {
      ...activeRecording,
      endTime: Date.now(),
      duration: recordingTime,
      status: 'completed',
    };

    setRecordings([completedRecording, ...recordings]);
    setActiveRecording(null);
  };

  const mintRecordingNFT = async (recordingId: string) => {
    // Update status to minting
    setRecordings(recordings.map((r) =>
      r.id === recordingId ? { ...r, status: 'minting' as const } : r
    ));

    // TODO: Implement actual NFT minting via smart contract
    // For now, simulate with timeout
    setTimeout(() => {
      setRecordings(recordings.map((r) =>
        r.id === recordingId
          ? { ...r, status: 'completed' as const, nftTokenId: `NFT-${recordingId}` }
          : r
      ));
    }, 2000);
  };

  const deleteRecording = (id: string) => {
    setRecordings(recordings.filter((r) => r.id !== id));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative">
      {/* Record Button */}
      <button
        onClick={() => {
          if (activeRecording) {
            stopRecording();
          } else if (stationId && isLive) {
            startRecording();
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className={`preset-button text-xs flex items-center gap-1 ${
          activeRecording ? 'bg-tuning-red animate-pulse' : ''
        }`}
        title={activeRecording ? 'Stop Recording' : 'Recording DVR'}
      >
        {activeRecording ? (
          <>
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>REC {formatDuration(recordingTime)}</span>
          </>
        ) : (
          <>⏺ DVR</>
        )}
      </button>

      {isOpen && !activeRecording && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 bottom-full mb-2 bg-cabinet-dark border border-brass rounded-lg shadow-xl z-50 w-80">
            <div className="p-3 border-b border-brass/30 flex items-center justify-between">
              <h3 className="text-brass font-dial text-sm">⏺ Recording DVR</h3>
              {stationId && isLive && (
                <button
                  onClick={() => {
                    startRecording();
                    setIsOpen(false);
                  }}
                  className="preset-button text-xs bg-tuning-red"
                >
                  ⏺ START REC
                </button>
              )}
            </div>

            {/* Recordings List */}
            <div className="max-h-64 overflow-y-auto">
              {recordings.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-dial-cream/50 text-xs">No recordings yet</p>
                  {!stationId && (
                    <p className="text-dial-cream/30 text-xs mt-1">
                      Tune to a live station to start recording
                    </p>
                  )}
                </div>
              ) : (
                recordings.map((recording) => (
                  <div
                    key={recording.id}
                    className="p-3 border-b border-brass/10 hover:bg-black/20"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-dial-cream font-dial text-sm truncate">
                          {recording.stationName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-dial-cream/50 mt-1">
                          <span>{recording.frequency.toFixed(1)} FM</span>
                          <span>•</span>
                          <span>{formatDuration(recording.duration)}</span>
                        </div>
                        <p className="text-dial-cream/30 text-xs mt-1">
                          {formatDate(recording.startTime)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 ml-2">
                        {recording.nftTokenId ? (
                          <span className="text-xs text-brass px-2 py-1 bg-brass/20 rounded">
                            NFT ✓
                          </span>
                        ) : recording.status === 'minting' ? (
                          <span className="text-xs text-dial-cream/50 px-2 py-1">
                            Minting...
                          </span>
                        ) : (
                          <button
                            onClick={() => mintRecordingNFT(recording.id)}
                            disabled={!address}
                            className="preset-button text-xs px-2 py-1 disabled:opacity-50"
                          >
                            MINT NFT
                          </button>
                        )}
                        <button
                          onClick={() => deleteRecording(recording.id)}
                          className="text-tuning-red/70 hover:text-tuning-red text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {!address && recordings.length > 0 && (
              <p className="p-2 text-center text-dial-cream/40 text-xs border-t border-brass/30">
                Connect wallet to mint recordings as NFTs
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
