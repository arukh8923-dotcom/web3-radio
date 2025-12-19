// Web3 Radio Subgraph Client

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || '';

export interface Station {
  id: string;
  frequency: string;
  owner: string;
  name: string;
  description?: string;
  category: string;
  isPremium: boolean;
  listenerCount: string;
  totalTips: string;
  signalStrength: string;
  createdAt: string;
}

export interface Tip {
  id: string;
  from: string;
  to: string;
  amount: string;
  timestamp: string;
  txHash: string;
  station: { id: string; name: string };
}

export interface Listener {
  id: string;
  address: string;
  totalListeningTime: string;
  totalTipsSent: string;
  vibesBalance: string;
  firstTuneIn: string;
  lastActive: string;
}

export interface Session {
  id: string;
  frequency: string;
  startTime: string;
  endTime: string;
  dj: string;
  attendeeCount: string;
}

export interface GlobalStats {
  totalStations: string;
  totalListeners: string;
  totalBroadcasts: string;
  totalTipsVolume: string;
  totalVibesMinted: string;
}

async function querySubgraph<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  if (!SUBGRAPH_URL) {
    throw new Error('Subgraph URL not configured');
  }

  const response = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  
  if (json.errors) {
    throw new Error(json.errors[0]?.message || 'Subgraph query failed');
  }

  return json.data;
}


// ============================================
// QUERY FUNCTIONS
// ============================================

export async function getTopStations(limit = 10): Promise<Station[]> {
  const query = `
    query TopStations($limit: Int!) {
      stations(first: $limit, orderBy: totalTips, orderDirection: desc) {
        id
        frequency
        owner
        name
        description
        category
        isPremium
        listenerCount
        totalTips
        signalStrength
        createdAt
      }
    }
  `;
  const data = await querySubgraph<{ stations: Station[] }>(query, { limit });
  return data.stations;
}

export async function getRecentTips(limit = 20): Promise<Tip[]> {
  const query = `
    query RecentTips($limit: Int!) {
      tips(first: $limit, orderBy: timestamp, orderDirection: desc) {
        id
        from
        to
        amount
        timestamp
        txHash
        station {
          id
          name
        }
      }
    }
  `;
  const data = await querySubgraph<{ tips: Tip[] }>(query, { limit });
  return data.tips;
}

export async function getListenerStats(address: string): Promise<Listener | null> {
  const query = `
    query ListenerStats($id: ID!) {
      listener(id: $id) {
        id
        address
        totalListeningTime
        totalTipsSent
        vibesBalance
        firstTuneIn
        lastActive
      }
    }
  `;
  const data = await querySubgraph<{ listener: Listener | null }>(query, { id: address.toLowerCase() });
  return data.listener;
}

export async function getStationById(id: string): Promise<Station | null> {
  const query = `
    query Station($id: ID!) {
      station(id: $id) {
        id
        frequency
        owner
        name
        description
        category
        isPremium
        listenerCount
        totalTips
        signalStrength
        createdAt
      }
    }
  `;
  const data = await querySubgraph<{ station: Station | null }>(query, { id: id.toLowerCase() });
  return data.station;
}

export async function getGlobalStats(): Promise<GlobalStats | null> {
  const query = `
    query GlobalStats {
      globalStats(id: "global") {
        totalStations
        totalListeners
        totalBroadcasts
        totalTipsVolume
        totalVibesMinted
      }
    }
  `;
  const data = await querySubgraph<{ globalStats: GlobalStats | null }>(query);
  return data.globalStats;
}

export async function getTipsByStation(stationId: string, limit = 50): Promise<Tip[]> {
  const query = `
    query StationTips($stationId: String!, $limit: Int!) {
      tips(first: $limit, where: { station: $stationId }, orderBy: timestamp, orderDirection: desc) {
        id
        from
        to
        amount
        timestamp
        txHash
      }
    }
  `;
  const data = await querySubgraph<{ tips: Tip[] }>(query, { stationId: stationId.toLowerCase(), limit });
  return data.tips;
}

export async function getRecentSessions(limit = 10): Promise<Session[]> {
  const query = `
    query RecentSessions($limit: Int!) {
      sessions(first: $limit, orderBy: startTime, orderDirection: desc) {
        id
        frequency
        startTime
        endTime
        dj
        attendeeCount
      }
    }
  `;
  const data = await querySubgraph<{ sessions: Session[] }>(query, { limit });
  return data.sessions;
}
