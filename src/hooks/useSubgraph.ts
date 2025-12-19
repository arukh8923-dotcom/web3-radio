import { useState, useEffect, useCallback } from 'react';
import {
  getTopStations,
  getRecentTips,
  getListenerStats,
  getStationById,
  getGlobalStats,
  getTipsByStation,
  getRecentSessions,
  Station,
  Tip,
  Listener,
  GlobalStats,
  Session,
} from '@/lib/subgraph';

// ============================================
// useTopStations - Get top stations by tips
// ============================================
export function useTopStations(limit = 10) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTopStations(limit);
      setStations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stations');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { stations, loading, error, refetch };
}

// ============================================
// useRecentTips - Get recent tips
// ============================================
export function useRecentTips(limit = 20) {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecentTips(limit);
      setTips(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tips');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { tips, loading, error, refetch };
}


// ============================================
// useListenerStats - Get listener stats by address
// ============================================
export function useListenerStats(address: string | undefined) {
  const [listener, setListener] = useState<Listener | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!address) {
      setListener(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getListenerStats(address);
      setListener(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listener');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { listener, loading, error, refetch };
}

// ============================================
// useStation - Get single station by ID
// ============================================
export function useStation(id: string | undefined) {
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setStation(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getStationById(id);
      setStation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch station');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { station, loading, error, refetch };
}

// ============================================
// useGlobalStats - Get global platform stats
// ============================================
export function useGlobalStats() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGlobalStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { stats, loading, error, refetch };
}

// ============================================
// useStationTips - Get tips for a station
// ============================================
export function useStationTips(stationId: string | undefined, limit = 50) {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!stationId) {
      setTips([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getTipsByStation(stationId, limit);
      setTips(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tips');
    } finally {
      setLoading(false);
    }
  }, [stationId, limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { tips, loading, error, refetch };
}

// ============================================
// useRecentSessions - Get recent broadcast sessions
// ============================================
export function useRecentSessions(limit = 10) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecentSessions(limit);
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { sessions, loading, error, refetch };
}
