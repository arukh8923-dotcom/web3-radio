import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Lazy-initialized Supabase client for server-side use
 * Avoids build errors when env vars are missing
 */
let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabase;
}

export function requireSupabase(): SupabaseClient {
  const db = getSupabase();
  if (!db) {
    throw new Error('Database not configured');
  }
  return db;
}
