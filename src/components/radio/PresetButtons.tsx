'use client';

interface PresetButtonsProps {
  onSelect: (preset: number) => void;
  activePreset?: number;
}

export function PresetButtons({ onSelect, activePreset }: PresetButtonsProps) {
  const presets = [1, 2, 3, 4, 5, 6];

  return (
    <div className="flex gap-2">
      {presets.map((preset) => (
        <button
          key={preset}
          onClick={() => onSelect(preset)}
          className={`
            preset-button w-12 h-10 flex items-center justify-center
            ${activePreset === preset ? 'bg-brass text-cabinet-dark' : 'text-dial-cream'}
            transition-all duration-150
          `}
        >
          {preset}
        </button>
      ))}
    </div>
  );
}
