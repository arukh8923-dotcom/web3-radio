// Neynar API client for Farcaster data
const NEYNAR_API_URL = 'https://api.neynar.com/v2';

interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  follower_count: number;
  following_count: number;
  verifications: string[];
  active_status: string;
}

interface NeynarUserResponse {
  users: NeynarUser[];
}

// Get user by FID
export async function getUserByFid(fid: number): Promise<NeynarUser | null> {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    console.warn('NEYNAR_API_KEY not set');
    return null;
  }

  try {
    const res = await fetch(`${NEYNAR_API_URL}/farcaster/user/bulk?fids=${fid}`, {
      headers: {
        'accept': 'application/json',
        'x-api-key': apiKey,
      },
    });

    if (!res.ok) return null;

    const data: NeynarUserResponse = await res.json();
    return data.users[0] || null;
  } catch (error) {
    console.error('Neynar API error:', error);
    return null;
  }
}

// Get user by username
export async function getUserByUsername(username: string): Promise<NeynarUser | null> {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`${NEYNAR_API_URL}/farcaster/user/by_username?username=${username}`, {
      headers: {
        'accept': 'application/json',
        'x-api-key': apiKey,
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.user || null;
  } catch (error) {
    console.error('Neynar API error:', error);
    return null;
  }
}

// Search users
export async function searchUsers(query: string, limit = 10): Promise<NeynarUser[]> {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(`${NEYNAR_API_URL}/farcaster/user/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
      headers: {
        'accept': 'application/json',
        'x-api-key': apiKey,
      },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.result?.users || [];
  } catch (error) {
    console.error('Neynar API error:', error);
    return [];
  }
}

// Verify wallet is connected to FID
export async function verifyWalletFid(address: string, fid: number): Promise<boolean> {
  const user = await getUserByFid(fid);
  if (!user) return false;
  
  return user.verifications.some(
    (v) => v.toLowerCase() === address.toLowerCase()
  );
}

export type { NeynarUser };
