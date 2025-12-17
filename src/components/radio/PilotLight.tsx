'use client';

interface PilotLightProps {
  isOn: boolean;
  onClick?: () => void;
}

export function PilotLight({ isOn, onClick }: PilotLightProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative w-4 h-4 rounded-full transition-all duration-300
        ${isOn 
          ? 'bg-pilot-amber animate-pilot-pulse' 
          : 'bg-gray-600'
        }
      `}
    >
      {/* Glass dome effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent" />
      
      {/* Inner glow */}
      {isOn && (
        <div className="absolute inset-0 rounded-full bg-pilot-amber blur-sm" />
      )}
      
      {/* Chrome bezel */}
      <div className="absolute -inset-0.5 rounded-full border border-brass/50" />
    </button>
  );
}
