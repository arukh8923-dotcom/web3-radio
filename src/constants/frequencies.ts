// Frequency Bands (like AM/FM/SW) - Music/Beat Theme
export const FREQUENCY_BANDS = {
  // Genre-based zones (FM range 88-108)
  HIPHOP: { min: 88.0, max: 91.9, name: 'Hip-Hop', bpm: '85-115' },
  ELECTRONIC: { min: 92.0, max: 95.9, name: 'Electronic', bpm: '120-150' },
  ROCK: { min: 96.0, max: 99.9, name: 'Rock', bpm: '100-140' },
  JAZZ: { min: 100.0, max: 103.9, name: 'Jazz', bpm: '60-120' },
  LOFI: { min: 104.0, max: 105.9, name: 'Lo-Fi', bpm: '70-90' },
  AMBIENT: { min: 106.0, max: 107.9, name: 'Ambient', bpm: '60-80' },
  WORLD: { min: 108.0, max: 109.9, name: 'World', bpm: 'Variable' },
} as const;

// Special Frequencies
export const SPECIAL_FREQUENCIES = {
  GOLDEN_HOUR: 98.8, // Special event frequency (FM range)
  EMERGENCY: 911.0,
} as const;

// Frequency step for tuning dial
export const FREQUENCY_STEP = 0.1;

// BPM-based reward multipliers
export const BPM_MULTIPLIERS = {
  SLOW: { min: 60, max: 90, multiplier: 1.0, name: 'Chill' },
  MEDIUM: { min: 91, max: 120, multiplier: 1.2, name: 'Groove' },
  FAST: { min: 121, max: 150, multiplier: 1.5, name: 'Hype' },
  INTENSE: { min: 151, max: 200, multiplier: 2.0, name: 'Drop' },
} as const;

// Special bonus amounts (FM range inspired)
export const VIBES_BONUSES = {
  FIRST_TUNE: 88,      // First tune-in bonus
  GOLDEN_HOUR: 98,     // Golden Hour event bonus
  STREAK_BONUS: 108,   // Listening streak bonus
  DROP_EVENT: 200,     // Special "Drop" event bonus
} as const;

// Get band for a frequency
export function getBandForFrequency(frequency: number): string | null {
  for (const [key, band] of Object.entries(FREQUENCY_BANDS)) {
    if (frequency >= band.min && frequency <= band.max) {
      return key;
    }
  }
  return null;
}

// Check if frequency is in special zone (Golden Hour zone)
export function isGoldenHourZone(frequency: number): boolean {
  return frequency >= 98.0 && frequency <= 99.9;
}

// Legacy alias for compatibility
export function is420Zone(frequency: number): boolean {
  return isGoldenHourZone(frequency);
}

// Check if it's Golden Hour time (peak listening hours)
export function isGoldenHour(): boolean {
  const now = new Date();
  const hours = now.getHours();
  // Golden Hour: 6-8 PM (peak listening time)
  return hours >= 18 && hours <= 20;
}

// Get BPM multiplier for rewards
export function getBPMMultiplier(bpm: number): { multiplier: number; name: string } {
  for (const tier of Object.values(BPM_MULTIPLIERS)) {
    if (bpm >= tier.min && bpm <= tier.max) {
      return { multiplier: tier.multiplier, name: tier.name };
    }
  }
  return { multiplier: 1.0, name: 'Standard' };
}

// Format frequency for display
export function formatFrequency(frequency: number): string {
  return `${frequency.toFixed(1)} FM`;
}

// Get genre info for a frequency
export function getGenreInfo(frequency: number): { name: string; bpm: string } | null {
  for (const band of Object.values(FREQUENCY_BANDS)) {
    if (frequency >= band.min && frequency <= band.max) {
      return { name: band.name, bpm: band.bpm };
    }
  }
  return null;
}
