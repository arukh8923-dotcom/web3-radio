'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface QualityMetric {
  timestamp: number;
  signalStrength: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface ReceptionQualityProps {
  signalStrength: number; // 0-100
  isLive?: boolean;
  onReconnect?: () => void;
  backupSources?: string[];
}

// Max metrics to store (last 30 minutes at 1 per minute)
const MAX_METRICS = 30;

export function ReceptionQuality({ signalStrength, isLive, onReconnect, backupSources = [] }: ReceptionQualityProps) {
  const [quality, setQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [showDetails, setShowDetails] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [metrics, setMetrics] = useState<QualityMetric[]>([]);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate quality from signal strength
  useEffect(() => {
    let newQuality: 'excellent' | 'good' | 'fair' | 'poor';
    if (signalStrength >= 80) {
      newQuality = 'excellent';
    } else if (signalStrength >= 60) {
      newQuality = 'good';
    } else if (signalStrength >= 40) {
      newQuality = 'fair';
    } else {
      newQuality = 'poor';
    }
    setQuality(newQuality);

    // Record metric
    setMetrics((prev) => {
      const newMetric: QualityMetric = {
        timestamp: Date.now(),
        signalStrength,
        quality: newQuality,
      };
      const updated = [...prev, newMetric].slice(-MAX_METRICS);
      return updated;
    });
  }, [signalStrength]);

  // Auto-reconnect on poor signal
  useEffect(() => {
    if (quality === 'poor' && !isReconnecting && reconnectAttempts < 3) {
      reconnectTimeoutRef.current = setTimeout(() => {
        handleReconnect();
      }, 5000); // Wait 5 seconds before auto-reconnect
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [quality, isReconnecting, reconnectAttempts]);

  // Reset reconnect attempts when signal improves
  useEffect(() => {
    if (quality !== 'poor') {
      setReconnectAttempts(0);
    }
  }, [quality]);

  const handleReconnect = useCallback(async () => {
    setIsReconnecting(true);
    setReconnectAttempts((prev) => prev + 1);

    try {
      // Try backup source if available
      if (backupSources.length > 0 && currentSourceIndex < backupSources.length - 1) {
        setCurrentSourceIndex((prev) => prev + 1);
      }

      // Call parent reconnect handler
      if (onReconnect) {
        await onReconnect();
      }
    } finally {
      setIsReconnecting(false);
    }
  }, [onReconnect, backupSources, currentSourceIndex]);

  // Calculate average quality over time
  const getAverageSignal = () => {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + m.signalStrength, 0);
    return Math.round(sum / metrics.length);
  };

  // Get quality distribution
  const getQualityDistribution = () => {
    const dist = { excellent: 0, good: 0, fair: 0, poor: 0 };
    metrics.forEach((m) => dist[m.quality]++);
    return dist;
  };

  const getQualityColor = () => {
    switch (quality) {
      case 'excellent': return 'text-vu-green';
      case 'good': return 'text-brass';
      case 'fair': return 'text-vu-yellow';
      case 'poor': return 'text-tuning-red';
    }
  };

  const getQualityBars = () => {
    const bars = quality === 'excellent' ? 4 : quality === 'good' ? 3 : quality === 'fair' ? 2 : 1;
    return Array(4).fill(0).map((_, i) => (
      <div
        key={i}
        className={`w-1 rounded-sm transition-all ${
          i < bars ? getQualityColor().replace('text-', 'bg-') : 'bg-dial-cream/20'
        }`}
        style={{ height: `${(i + 1) * 4}px` }}
      />
    ));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-end gap-0.5 p-1 hover:bg-black/20 rounded transition-colors"
        title={`Signal: ${quality}`}
      >
        {getQualityBars()}
      </button>

      {showDetails && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDetails(false)} />
          <div className="absolute right-0 bottom-full mb-2 bg-cabinet-dark border border-brass rounded-lg shadow-xl z-50 w-48 p-3">
            <h4 className="text-brass font-dial text-xs mb-2">📶 Reception Quality</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-dial-cream/60 text-xs">Signal</span>
                <span className={`text-sm font-dial ${getQualityColor()}`}>
                  {signalStrength}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-dial-cream/60 text-xs">Status</span>
                <span className={`text-xs uppercase ${getQualityColor()}`}>
                  {quality}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-dial-cream/60 text-xs">Stream</span>
                <span className={`text-xs ${isLive ? 'text-vu-green' : 'text-dial-cream/40'}`}>
                  {isLive ? '● LIVE' : '○ OFFLINE'}
                </span>
              </div>

              {/* Signal Strength Bar */}
              <div className="mt-2">
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${getQualityColor().replace('text-', 'bg-')}`}
                    style={{ width: `${signalStrength}%` }}
                  />
                </div>
              </div>

              {/* Historical Metrics */}
              {metrics.length > 5 && (
                <div className="mt-3 pt-2 border-t border-brass/20">
                  <p className="text-dial-cream/50 text-[10px] mb-1">Last {metrics.length} readings</p>
                  <div className="flex items-end gap-0.5 h-8">
                    {metrics.slice(-20).map((m, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-t transition-all ${
                          m.quality === 'excellent' ? 'bg-vu-green' :
                          m.quality === 'good' ? 'bg-brass' :
                          m.quality === 'fair' ? 'bg-vu-yellow' : 'bg-tuning-red'
                        }`}
                        style={{ height: `${m.signalStrength}%` }}
                        title={`${m.signalStrength}%`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-dial-cream/40 mt-1">
                    <span>Avg: {getAverageSignal()}%</span>
                    <span>{metrics.length} samples</span>
                  </div>
                </div>
              )}

              {/* Reconnect Controls */}
              {quality === 'poor' && (
                <div className="mt-3 pt-2 border-t border-tuning-red/30">
                  <p className="text-tuning-red/80 text-xs mb-2">
                    ⚠️ Weak signal detected
                  </p>
                  <button
                    onClick={handleReconnect}
                    disabled={isReconnecting}
                    className="w-full py-1.5 bg-tuning-red/20 border border-tuning-red/50 rounded text-tuning-red text-xs hover:bg-tuning-red/30 disabled:opacity-50"
                  >
                    {isReconnecting ? '🔄 Reconnecting...' : '🔄 Reconnect'}
                  </button>
                  {reconnectAttempts > 0 && (
                    <p className="text-dial-cream/40 text-[10px] mt-1 text-center">
                      Attempts: {reconnectAttempts}/3
                    </p>
                  )}
                  {backupSources.length > 1 && (
                    <p className="text-dial-cream/40 text-[10px] mt-1 text-center">
                      Source: {currentSourceIndex + 1}/{backupSources.length}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
