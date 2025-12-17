'use client';

interface VUMeterProps {
  label: string;
  value: number; // 0-100
}

export function VUMeter({ label, value }: VUMeterProps) {
  // Map value to needle rotation (-45 to 45 degrees)
  const rotation = (value / 100) * 90 - 45;

  return (
    <div className="flex flex-col items-center">
      {/* Meter Face */}
      <div className="relative w-24 h-16 bg-dial-cream rounded-t-full overflow-hidden">
        {/* Scale markings */}
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <svg viewBox="0 0 100 50" className="w-full h-full">
            {/* Scale arc */}
            <path
              d="M 10 45 A 40 40 0 0 1 90 45"
              fill="none"
              stroke="#3E2723"
              strokeWidth="1"
            />
            {/* Scale numbers */}
            <text x="15" y="40" fontSize="6" fill="#3E2723">-20</text>
            <text x="35" y="25" fontSize="6" fill="#3E2723">-10</text>
            <text x="48" y="20" fontSize="6" fill="#3E2723">0</text>
            <text x="60" y="25" fontSize="6" fill="#D32F2F">+3</text>
            <text x="78" y="40" fontSize="6" fill="#D32F2F">+6</text>
            
            {/* Red zone */}
            <path
              d="M 65 35 A 25 25 0 0 1 85 45"
              fill="none"
              stroke="#D32F2F"
              strokeWidth="3"
            />
          </svg>
        </div>

        {/* Needle */}
        <div 
          className="absolute bottom-0 left-1/2 w-0.5 h-12 bg-dial-dark origin-bottom vu-needle"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-vu-red rounded-full" />
        </div>

        {/* Pivot point */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-dial-dark rounded-full" />
      </div>

      {/* Label */}
      <div className="bg-cabinet-dark px-3 py-1 rounded-b">
        <span className="text-xs font-dial text-dial-cream/70">{label}</span>
      </div>
    </div>
  );
}
