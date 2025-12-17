// The Graph Subgraph Client for Web3 Radio

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || 
  'https://api.studio.thegraph.com/query/YOUR_ID/web3radio/version/latest';

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function query<T>(queryString: string, variables?: Record<string, unknown>): Promise<T | null> {
  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: queryString, variables }),
    });
    
    const result: GraphQLResponse<T> = await response.json();
    
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return null;
    }
    
    return result.data || null;
  } catch (error) {
    console.error('Subgraph query failed:', error);
    return null;
  }
}

// Station queries
export async function getStations(first = 20, orderBy = 'listenerCount', orderDirection = 'desc') {
  const result = await query<{ stations: Station[] }>(`
    query GetStations($first: Int!, $orderBy: String!, $orderDirection: String!) {
      stations(first: $first, orderBy: $orderBy, orderDirection: $orderDirection) {
        id
        frequency
        owner
        name
        category
        isPremium
        listenerCount
        totalTips
        signalStrength
        createdAt
      }
    }
  `, { first, orderBy, orderDirection });
  
  return result?.stations || [];
}

export async function getStationByFrequency(frequency: string) {
  const result = await query<{ stations: Station[] }>(`
    query GetStation($frequency: BigInt!) {
      stations(where: { frequency: $frequency }) {
        id
        frequency
        owner
        name
        description
        category
        isPremium
        subscriptionFee
        listenerCount
        totalTips
        signalStrength
        createdAt
        broadcasts(first: 10, orderBy: timestamp, orderDirection: desc) {
          id
          contentHash
          contentType
          title
          dj
          timestamp
        }
      }
    }
  `, { frequency });
  
  return result?.stations[0] || null;
}

// Listener queries
export async function getListener(address: string) {
  const result = await query<{ listener: Listener }>(`
    query GetListener($id: ID!) {
      listener(id: $id) {
        id
        address
        totalListeningTime
        totalTipsSent
        vibesBalance
        firstTuneIn
        lastActive
        subscribedStations {
          id
          station { id name frequency }
          endTime
          isActive
        }
        achievements {
          id
          achievementType
          name
          unlockedAt
        }
      }
    }
  `, { id: address.toLowerCase() });
  
  return result?.listener || null;
}

// Leaderboard queries
export async function getDJLeaderboard(first = 20) {
  const result = await query<{ djs: DJ[] }>(`
    query GetDJLeaderboard($first: Int!) {
      djs(first: $first, orderBy: totalTipsReceived, orderDirection: desc, where: { isActive: true }) {
        id
        address
        station { id name frequency }
        totalBroadcasts
        totalTipsReceived
      }
    }
  `, { first });
  
  return result?.djs || [];
}

// Session queries
export async function getActiveSessions() {
  const result = await query<{ sessions: Session[] }>(`
    query GetActiveSessions {
      sessions(where: { mintingClosed: false }, orderBy: startTime, orderDirection: desc) {
        id
        frequency
        startTime
        dj
        attendeeCount
      }
    }
  `);
  
  return result?.sessions || [];
}

// Global stats
export async function getGlobalStats() {
  const result = await query<{ globalStats: GlobalStats }>(`
    query GetGlobalStats {
      globalStats(id: "global") {
        totalStations
        totalListeners
        totalBroadcasts
        totalTipsVolume
        totalVibesMinted
      }
    }
  `);
  
  return result?.globalStats || null;
}

// Recent activity
export async function getRecentTips(first = 10) {
  const result = await query<{ tips: Tip[] }>(`
    query GetRecentTips($first: Int!) {
      tips(first: $first, orderBy: timestamp, orderDirection: desc) {
        id
        from
        to
        amount
        timestamp
        txHash
      }
    }
  `, { first });
  
  return result?.tips || [];
}

// Types
interface Station {
  id: string;
  frequency: string;
  owner: string;
  name: string;
  description?: string;
  category: string;
  isPremium: boolean;
  subscriptionFee?: string;
  listenerCount: string;
  totalTips: string;
  signalStrength: string;
  createdAt: string;
  broadcasts?: Broadcast[];
}

interface Broadcast {
  id: string;
  contentHash: string;
  contentType: string;
  title?: string;
  dj: string;
  timestamp: string;
}

interface Listener {
  id: string;
  address: string;
  totalListeningTime: string;
  totalTipsSent: string;
  vibesBalance: string;
  firstTuneIn: string;
  lastActive: string;
  subscribedStations?: Subscription[];
  achievements?: Achievement[];
}

interface Subscription {
  id: string;
  station: { id: string; name: string; frequency: string };
  endTime: string;
  isActive: boolean;
}

interface Achievement {
  id: string;
  achievementType: string;
  name: string;
  unlockedAt: string;
}

interface DJ {
  id: string;
  address: string;
  station: { id: string; name: string; frequency: string };
  totalBroadcasts: string;
  totalTipsReceived: string;
}

interface Session {
  id: string;
  frequency: string;
  startTime: string;
  dj: string;
  attendeeCount: string;
}

interface Tip {
  id: string;
  from: string;
  to: string;
  amount: string;
  timestamp: string;
  txHash: string;
}

interface GlobalStats {
  totalStations: string;
  totalListeners: string;
  totalBroadcasts: string;
  totalTipsVolume: string;
  totalVibesMinted: string;
}
