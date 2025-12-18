import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================
// CLIENT-SIDE SUPABASE (Browser)
// Uses anon key - respects RLS policies
// Lazy-initialized to avoid build errors
// ============================================
let _supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('Supabase URL and Anon Key are required');
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Legacy export for backward compatibility
export const supabase = typeof window !== 'undefined' 
  ? getSupabaseClient() 
  : (null as unknown as SupabaseClient);

// ============================================
// SERVER-SIDE SUPABASE (API Routes)
// Uses service role key - bypasses RLS
// Only use in server components/API routes!
// ============================================
let _serverSupabase: SupabaseClient | null = null;

export function createServerSupabase(): SupabaseClient {
  if (!_serverSupabase) {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url) {
      throw new Error('Supabase URL is required');
    }
    
    const key = serviceKey || anonKey;
    if (!key) {
      throw new Error('Supabase key is required');
    }
    
    _serverSupabase = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _serverSupabase;
}

// ============================================
// DATABASE TYPES
// ============================================
export interface Station {
  id: string;
  frequency: number;
  name: string;
  description: string | null;
  category: 'music' | 'talk' | 'news' | 'sports' | 'lofi' | 'ambient';
  owner_address: string;
  image_url: string | null;
  stream_url: string | null;
  is_premium: boolean;
  subscription_fee: string | null;
  listener_count: number;
  signal_strength: number;
  is_live: boolean;
  contract_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Broadcast {
  id: string;
  station_id: string;
  content_hash: string;
  content_type: 'audio' | 'visual' | 'generative';
  title: string;
  duration: number;
  dj_address: string;
  blob_commitment: string | null;
  ipfs_hash: string | null;
  unlock_time: string | null;
  is_locked: boolean;
  created_at: string;
}

export interface User {
  id: string;
  wallet_address: string;
  base_name: string | null;
  farcaster_fid: number | null;
  farcaster_username: string | null;
  avatar_url: string | null;
  equalizer_bass: number;
  equalizer_mid: number;
  equalizer_treble: number;
  volume: number;
  audio_mode: 'stereo' | 'mono';
  language: string;
  created_at: string;
  last_active: string;
}

export interface SmokeSignal {
  id: string;
  station_id: string;
  sender_address: string;
  message: string;
  vibes_cost: string;
  created_at: string;
  expires_at: string;
}

export interface LiveChat {
  id: string;
  station_id: string;
  user_id: string;
  message: string;
  created_at: string;
}

export interface MoodRing {
  id: string;
  station_id: string;
  current_mood: 'chill' | 'hype' | 'melancholy' | 'euphoric' | 'zen';
  chill_count: number;
  hype_count: number;
  melancholy_count: number;
  euphoric_count: number;
  zen_count: number;
  updated_at: string;
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================
export function subscribeToChat(stationId: string, callback: (message: LiveChat) => void) {
  return supabase
    .channel(`chat:${stationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'live_chat',
        filter: `station_id=eq.${stationId}`,
      },
      (payload) => callback(payload.new as LiveChat)
    )
    .subscribe();
}

export function subscribeToMoodRing(stationId: string, callback: (mood: MoodRing) => void) {
  return supabase
    .channel(`mood:${stationId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'mood_ring',
        filter: `station_id=eq.${stationId}`,
      },
      (payload) => callback(payload.new as MoodRing)
    )
    .subscribe();
}

export function subscribeToTuneIns(stationId: string, callback: (count: number) => void) {
  return supabase
    .channel(`tune_ins:${stationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tune_ins',
        filter: `station_id=eq.${stationId}`,
      },
      async () => {
        const { count } = await supabase
          .from('tune_ins')
          .select('*', { count: 'exact', head: true })
          .eq('station_id', stationId)
          .is('tuned_out_at', null);
        callback(count || 0);
      }
    )
    .subscribe();
}
