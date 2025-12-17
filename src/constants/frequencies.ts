// Frequency Bands (like AM/FM/SW)
export const FREQUENCY_BANDS = {
  MUSIC: { min: 88.0, max: 99.9, name: 'Music' },
  TALK: { min: 100.0, max: 103.9, name: 'Talk' },
  NEWS: { min: 104.0, max: 105.9, name: 'News' },
  SPORTS: { min: 106.0, max: 107.9, name: 'Sports' },
  CULTURE_420: { min: 420.0, max: 420.9, name: '420' },
  AMBIENT: { min: 108.0, max: 109.9, name: 'Ambient' },
} as const;

// Special Frequencies
export const SPECIAL_FREQUENCIES = {
  ZONE_420: 420.0,
  EMERGENCY: 911.0,
} as const;

// Frequency step for tuning dial
export const FREQUENCY_STEP = 0.1;

// Get band for a frequency
export function getBandForFrequency(frequency: number): string | null {
  for (const [key, band] of Object.entries(FREQUENCY_BANDS)) {
    if (frequency >= band.min && frequency <= band.max) {
      return key;
    }
  }
  return null;
}

// Check if frequency is in 420 zone
export function is420Zone(frequency: number): boolean {
  return frequency >= FREQUENCY_BANDS.CULTURE_420.min && 
         frequency <= FREQUENCY_BANDS.CULTURE_420.max;
}

// Check if it's 4:20 time
export function is420Time(): boolean {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return (hours === 4 || hours === 16) && minutes === 20;
}

// Format frequency for display
export function formatFrequency(frequency: number): string {
  return `${frequency.toFixed(1)} FM`;
}
