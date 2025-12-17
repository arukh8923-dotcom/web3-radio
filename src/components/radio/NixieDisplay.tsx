'use client';

interface NixieDisplayProps {
  value: string;
  label?: string;
}

export function NixieDisplay({ value, label }: NixieDisplayProps) {
  const digits = value.split('');

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-1 bg-black/80 p-3 rounded-lg">
        {digits.map((digit, index) => (
          <div
            key={index}
            className="relative w-8 h-12 flex items-center justify-center"
          >
            {/* Tube glass effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-900/10 to-transparent rounded" />
            
            {/* Digit */}
            <span className="nixie-tube text-4xl animate-tube-flicker">
              {digit}
            </span>
            
            {/* Tube base */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-gradient-to-t from-gray-700 to-gray-600 rounded-t" />
          </div>
        ))}
      </div>
      
      {label && (
        <span className="mt-2 text-xs font-dial text-nixie-orange/70 tracking-widest">
          {label}
        </span>
      )}
    </div>
  );
}
