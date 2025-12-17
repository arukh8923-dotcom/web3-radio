'use client';

import { useState, useEffect } from 'react';

interface ReceptionQualityProps {
  signalStrength: number; // 0-100
  isLive?: boolean;
}

export function ReceptionQuality({ signalStrength, isLive }: ReceptionQualityProps) {
  const [quality, setQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (signalStrength >= 80) {
      setQuality('excellent');
    } else if (signalStrength >= 60) {
      setQuality('good');
    } else if (signalStrength >= 40) {
      setQuality('fair');
    } else {
      setQuality('poor');
    }
  }, [signalStrength]);

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

              {quality === 'poor' && (
                <p className="text-tuning-red/80 text-xs mt-2">
                  ⚠️ Weak signal. Try adjusting frequency.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
