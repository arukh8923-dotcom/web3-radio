// API Client for Web3 Radio

const API_BASE = '/api';

// Types
export interface Station {
  id: string;
  frequency: number;
  name: string;
  description: string | null;
  category: 'music' | 'talk' | 'news' | 'sports' | '420' | 'ambient';
  owner_address: string;
  image_url: string | null;
  stream_url: string | null;
  is_premium: boolean;
  listener_count: number;
  signal_strength: number;
  is_live: boolean;
}

export interface Preset {
  id: string;
  wallet_address: string;
  slot: number;
  station_id: string | null;
  frequency: number | null;
  stations?: Station;
}

export interface UserPreferences {
  wallet_address: string;
  equalizer_bass: number;
  equalizer_mid: number;
  equalizer_treble: number;
  volume: number;
  audio_mode: 'stereo' | 'mono';
}

export interface MoodRing {
  current_mood: 'chill' | 'hype' | 'melancholy' | 'euphoric' | 'zen';
  chill_count: number;
  hype_count: number;
  melancholy_count: number;
  euphoric_count: number;
  zen_count: number;
}

// Stations API
export async function getStations(params?: {
  category?: string;
  frequency?: number;
  search?: string;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.frequency) searchParams.set('frequency', params.frequency.toString());
  if (params?.search) searchParams.set('search', params.search);
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const res = await fetch(`${API_BASE}/stations?${searchParams}`);
  const data = await res.json();
  return data.stations as Station[];
}


export async function getStation(id: string) {
  const res = await fetch(`${API_BASE}/stations/${id}`);
  const data = await res.json();
  return data.station as Station;
}

export async function getStationByFrequency(frequency: number) {
  const stations = await getStations({ frequency });
  return stations[0] || null;
}

// Tune In/Out API
export async function tuneIn(stationId: string, walletAddress: string) {
  const res = await fetch(`${API_BASE}/stations/${stationId}/tune`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet_address: walletAddress }),
  });
  return res.json();
}

export async function tuneOut(stationId: string, walletAddress: string) {
  const res = await fetch(
    `${API_BASE}/stations/${stationId}/tune?wallet_address=${walletAddress}`,
    { method: 'DELETE' }
  );
  return res.json();
}

// Presets API
export async function getPresets(walletAddress: string) {
  const res = await fetch(`${API_BASE}/presets?wallet_address=${walletAddress}`);
  const data = await res.json();
  return data.presets as Preset[];
}

export async function savePreset(
  walletAddress: string,
  slot: number,
  stationId?: string,
  frequency?: number
) {
  const res = await fetch(`${API_BASE}/presets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wallet_address: walletAddress,
      slot,
      station_id: stationId,
      frequency,
    }),
  });
  return res.json();
}

// User Preferences API
export async function getUserPreferences(walletAddress: string) {
  const res = await fetch(`${API_BASE}/user/preferences?wallet_address=${walletAddress}`);
  const data = await res.json();
  return data.preferences as UserPreferences;
}

export async function saveUserPreferences(preferences: Partial<UserPreferences> & { wallet_address: string }) {
  const res = await fetch(`${API_BASE}/user/preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });
  return res.json();
}

// Tips API
export async function recordTip(params: {
  station_id: string;
  tipper_address: string;
  dj_address: string;
  amount: string;
  tx_hash: string;
  token_address?: string;
}) {
  const res = await fetch(`${API_BASE}/tips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}

// Vibes/Mood API
export async function getMoodRing(stationId: string) {
  const res = await fetch(`${API_BASE}/vibes?station_id=${stationId}`);
  const data = await res.json();
  return data.mood_ring as MoodRing;
}

export async function sendVibes(
  stationId: string,
  walletAddress: string,
  mood: 'chill' | 'hype' | 'melancholy' | 'euphoric' | 'zen'
) {
  const res = await fetch(`${API_BASE}/vibes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      station_id: stationId,
      wallet_address: walletAddress,
      mood,
    }),
  });
  return res.json();
}

// Broadcasts API
export async function getBroadcasts(stationId?: string, current?: boolean) {
  const params = new URLSearchParams();
  if (stationId) params.set('station_id', stationId);
  if (current) params.set('current', 'true');

  const res = await fetch(`${API_BASE}/broadcasts?${params}`);
  const data = await res.json();
  return data.broadcasts;
}
