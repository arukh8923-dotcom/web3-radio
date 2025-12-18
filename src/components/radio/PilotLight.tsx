'use client';

interface PilotLightProps {
  isOn: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function PilotLight({ isOn, onClick, disabled }: PilotLightProps) {
  const isClickable = onClick && !disabled;
  
  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={disabled || !onClick}
      className={`
        relative w-4 h-4 rounded-full transition-all duration-300
        ${isOn 
          ? 'bg-pilot-amber animate-pilot-pulse' 
          : disabled || !onClick
            ? 'bg-gray-700 cursor-not-allowed'
            : 'bg-gray-600 hover:bg-gray-500 cursor-pointer'
        }
      `}
      title={disabled || !onClick ? 'Connect wallet to power on' : isOn ? 'Turn off' : 'Turn on'}
    >
      {/* Glass dome effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent" />
      
      {/* Inner glow */}
      {isOn && (
        <div className="absolute inset-0 rounded-full bg-pilot-amber blur-sm" />
      )}
      
      {/* Chrome bezel */}
      <div className={`absolute -inset-0.5 rounded-full border ${disabled || !onClick ? 'border-gray-600' : 'border-brass/50'}`} />
    </button>
  );
}
