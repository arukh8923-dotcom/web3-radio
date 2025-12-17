import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = [
  // Listening achievements
  { id: 'first_tune', name: 'First Tune', description: 'Tune into your first station', icon: '📻', category: 'listening', requirement: 1, rarity: 'common', stat_key: 'stations_visited' },
  { id: 'hour_listener', name: 'Hour Listener', description: 'Listen for 1 hour total', icon: '⏰', category: 'listening', requirement: 1, rarity: 'common', stat_key: 'total_listening_hours' },
  { id: 'day_listener', name: 'Day Listener', description: 'Listen for 24 hours total', icon: '🌅', category: 'listening', requirement: 24, rarity: 'uncommon', stat_key: 'total_listening_hours' },
  { id: 'week_listener', name: 'Week Listener', description: 'Listen for 168 hours total', icon: '📅', category: 'listening', requirement: 168, rarity: 'rare', stat_key: 'total_listening_hours' },
  { id: 'radio_addict', name: 'Radio Addict', description: 'Listen for 1000 hours total', icon: '🎧', category: 'listening', requirement: 1000, rarity: 'legendary', stat_key: 'total_listening_hours' },
  
  // Explorer achievements
  { id: 'explorer', name: 'Explorer', description: 'Visit 5 different stations', icon: '🔍', category: 'explorer', requirement: 5, rarity: 'common', stat_key: 'stations_visited' },
  { id: 'wanderer', name: 'Wanderer', description: 'Visit 25 different stations', icon: '🗺️', category: 'explorer', requirement: 25, rarity: 'uncommon', stat_key: 'stations_visited' },
  { id: 'globe_trotter', name: 'Globe Trotter', description: 'Visit 100 different stations', icon: '🌍', category: 'explorer', requirement: 100, rarity: 'epic', stat_key: 'stations_visited' },
  { id: 'genre_master', name: 'Genre Master', description: 'Listen to all genres', icon: '🎵', category: 'explorer', requirement: 6, rarity: 'rare', stat_key: 'unique_genres' },
  
  // Social achievements
  { id: 'first_chat', name: 'First Words', description: 'Send your first chat message', icon: '💬', category: 'social', requirement: 1, rarity: 'common', stat_key: 'messages_sent' },
  { id: 'chatterbox', name: 'Chatterbox', description: 'Send 100 chat messages', icon: '🗣️', category: 'social', requirement: 100, rarity: 'uncommon', stat_key: 'messages_sent' },
  { id: 'first_tip', name: 'Generous Soul', description: 'Send your first tip', icon: '💰', category: 'social', requirement: 1, rarity: 'common', stat_key: 'tips_sent' },
  { id: 'big_tipper', name: 'Big Tipper', description: 'Send 50 tips', icon: '💎', category: 'social', requirement: 50, rarity: 'rare', stat_key: 'tips_sent' },
  { id: 'whale', name: 'Whale', description: 'Send 500 tips', icon: '🐋', category: 'social', requirement: 500, rarity: 'legendary', stat_key: 'tips_sent' },
  
  // Collector achievements
  { id: 'first_recording', name: 'Archivist', description: 'Record your first broadcast', icon: '📼', category: 'collector', requirement: 1, rarity: 'common', stat_key: 'broadcasts_recorded' },
  { id: 'collector', name: 'Collector', description: 'Record 10 broadcasts', icon: '📚', category: 'collector', requirement: 10, rarity: 'uncommon', stat_key: 'broadcasts_recorded' },
  { id: 'hoarder', name: 'Hoarder', description: 'Record 100 broadcasts', icon: '🏛️', category: 'collector', requirement: 100, rarity: 'epic', stat_key: 'broadcasts_recorded' },
  
  // Special achievements
  { id: 'zone_420', name: '420 Enthusiast', description: 'Tune into 420 zone 10 times', icon: '🌿', category: 'special', requirement: 10, rarity: 'rare', stat_key: 'zone_420_visits' },
  { id: 'streak_7', name: 'Week Streak', description: 'Listen 7 days in a row', icon: '🔥', category: 'special', requirement: 7, rarity: 'rare', stat_key: 'consecutive_days' },
  { id: 'streak_30', name: 'Month Streak', description: 'Listen 30 days in a row', icon: '⚡', category: 'special', requirement: 30, rarity: 'epic', stat_key: 'consecutive_days' },
];

// GET /api/achievements - Get user achievements
export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ error: 'wallet required' }, { status: 400 });
  }

  const walletLower = wallet.toLowerCase();

  try {
    // Get user stats
    const stats = await getUserStats(supabase, walletLower);

    // Get unlocked achievements from DB
    const { data: unlockedAchievements } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('wallet_address', walletLower);

    const unlockedMap = new Map(unlockedAchievements?.map(a => [a.achievement_id, a]) || []);

    // Build achievements list with progress
    const achievements = ACHIEVEMENT_DEFINITIONS.map(def => {
      const unlocked = unlockedMap.get(def.id);
      const progress = stats[def.stat_key as keyof typeof stats] || 0;
      const isUnlocked = unlocked || progress >= def.requirement;

      return {
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        category: def.category,
        requirement: def.requirement,
        rarity: def.rarity,
        progress: Math.min(progress, def.requirement),
        unlocked: isUnlocked,
        unlocked_at: unlocked?.unlocked_at || (isUnlocked ? new Date().toISOString() : null),
        nft_minted: unlocked?.nft_minted || false,
      };
    });

    // Auto-unlock new achievements
    const newlyUnlocked = achievements.filter(a => 
      a.unlocked && !unlockedMap.has(a.id)
    );

    if (newlyUnlocked.length > 0) {
      await supabase.from('user_achievements').insert(
        newlyUnlocked.map(a => ({
          wallet_address: walletLower,
          achievement_id: a.id,
          unlocked_at: new Date().toISOString(),
          nft_minted: false,
        }))
      );
    }

    return NextResponse.json({
      achievements,
      stats,
      unlocked_count: achievements.filter(a => a.unlocked).length,
      total_count: achievements.length,
    });
  } catch (error) {
    console.error('Achievements error:', error);
    return NextResponse.json({ 
      achievements: ACHIEVEMENT_DEFINITIONS.map(def => ({
        ...def,
        progress: 0,
        unlocked: false,
        unlocked_at: null,
        nft_minted: false,
      })),
      stats: getDefaultStats(),
    });
  }
}

async function getUserStats(supabase: ReturnType<typeof createServerSupabase>, wallet: string) {
  const stats = getDefaultStats();

  try {
    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id, created_at')
      .eq('wallet_address', wallet)
      .single();

    if (!user) return stats;

    // Count tips sent
    const { count: tipsCount } = await supabase
      .from('tips')
      .select('*', { count: 'exact', head: true })
      .eq('tipper_address', wallet);
    stats.tips_sent = tipsCount || 0;

    // Count messages sent
    const { count: messagesCount } = await supabase
      .from('live_chat')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    stats.messages_sent = messagesCount || 0;

    // Count recordings
    const { count: recordingsCount } = await supabase
      .from('recordings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    stats.broadcasts_recorded = recordingsCount || 0;

    // Count unique stations visited (from tune_ins or listening_history)
    const { data: tuneIns } = await supabase
      .from('tune_ins')
      .select('station_id')
      .eq('wallet_address', wallet);
    const uniqueStations = new Set(tuneIns?.map(t => t.station_id) || []);
    stats.stations_visited = uniqueStations.size;

    // Get listening hours from user preferences or calculate
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('total_listening_minutes')
      .eq('user_id', user.id)
      .single();
    stats.total_listening_hours = (prefs?.total_listening_minutes || 0) / 60;

    // Count unique genres
    const { data: stationsData } = await supabase
      .from('stations')
      .select('category')
      .in('id', Array.from(uniqueStations));
    const uniqueGenres = new Set(stationsData?.map(s => s.category).filter(Boolean) || []);
    stats.unique_genres = uniqueGenres.size;

  } catch (error) {
    console.error('Error fetching stats:', error);
  }

  return stats;
}

function getDefaultStats() {
  return {
    total_listening_hours: 0,
    stations_visited: 0,
    tips_sent: 0,
    messages_sent: 0,
    broadcasts_recorded: 0,
    requests_made: 0,
    consecutive_days: 0,
    unique_genres: 0,
    zone_420_visits: 0,
  };
}
