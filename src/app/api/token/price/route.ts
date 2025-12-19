import { NextResponse } from 'next/server';

const RADIO_ADDRESS = '0xaF0741FB82633a190683c5cFb4b8546123E93B07';
const VIBES_ADDRESS = '0xCD6387AfA893C1Ad070c9870B5e9C4c0B7D56b07';

// Pool addresses for more reliable price fetching
const RADIO_POOL = '0xbb3b7ca4c9b0ea77f857679fcbbe7b04af7ecb79b5f188fd25820cfd07286650';
const VIBES_POOL = '0xd5c5b28f553c2dd95000768a58bf4bff06c3c17dab57ae79d55e341eb45e6873';

// Fallback prices if all APIs fail
const FALLBACK_PRICES = {
  radio: 0.0000003, // $0.0000003
  vibes: 0.0000003,
  eth: 3500, // ETH price in USD
};

interface TokenPrice {
  radio_usd: number;
  vibes_usd: number;
  eth_usd: number;
  source: string;
  timestamp: number;
}

// Cache prices for 60 seconds
let cachedPrices: TokenPrice | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 1000; // 60 seconds

// Fetch price from GeckoTerminal using pool address (more reliable)
async function fetchFromGeckoTerminalPool(poolAddress: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/base/pools/${poolAddress}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    // Pool data has base_token_price_usd for the token price
    const price = parseFloat(data?.data?.attributes?.base_token_price_usd);
    return isNaN(price) ? null : price;
  } catch {
    return null;
  }
}

// Fallback: fetch by token address
async function fetchFromGeckoTerminalToken(address: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/base/tokens/${address}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const price = parseFloat(data?.data?.attributes?.price_usd);
    return isNaN(price) ? null : price;
  } catch {
    return null;
  }
}

async function fetchFromDexScreener(address: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const price = parseFloat(data?.pairs?.[0]?.priceUsd);
    return isNaN(price) ? null : price;
  } catch {
    return null;
  }
}

async function fetchEthPrice(): Promise<number> {
  try {
    // Use CoinGecko for ETH price
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return FALLBACK_PRICES.eth;
    const data = await res.json();
    return data?.ethereum?.usd || FALLBACK_PRICES.eth;
  } catch {
    return FALLBACK_PRICES.eth;
  }
}

async function getTokenPrices(): Promise<TokenPrice> {
  // Check cache
  if (cachedPrices && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedPrices;
  }

  let radioPrice: number | null = null;
  let vibesPrice: number | null = null;
  let source = 'fallback';

  // Try GeckoTerminal pool addresses first (most reliable)
  const [poolRadio, poolVibes] = await Promise.all([
    fetchFromGeckoTerminalPool(RADIO_POOL),
    fetchFromGeckoTerminalPool(VIBES_POOL),
  ]);
  
  radioPrice = poolRadio;
  vibesPrice = poolVibes;
  
  if (radioPrice !== null && vibesPrice !== null) {
    source = 'geckoterminal-pool';
  } else {
    // Fallback to token address lookup
    if (radioPrice === null) {
      radioPrice = await fetchFromGeckoTerminalToken(RADIO_ADDRESS);
    }
    if (vibesPrice === null) {
      vibesPrice = await fetchFromGeckoTerminalToken(VIBES_ADDRESS);
    }
    
    if (radioPrice !== null || vibesPrice !== null) {
      source = 'geckoterminal-token';
    } else {
      // Last resort: DexScreener
      if (radioPrice === null) {
        radioPrice = await fetchFromDexScreener(RADIO_ADDRESS);
      }
      if (vibesPrice === null) {
        vibesPrice = await fetchFromDexScreener(VIBES_ADDRESS);
      }
      
      if (radioPrice !== null || vibesPrice !== null) {
        source = 'dexscreener';
      }
    }
  }

  const ethPrice = await fetchEthPrice();

  const prices: TokenPrice = {
    radio_usd: radioPrice ?? FALLBACK_PRICES.radio,
    vibes_usd: vibesPrice ?? FALLBACK_PRICES.vibes,
    eth_usd: ethPrice,
    source,
    timestamp: Date.now(),
  };

  // Update cache
  cachedPrices = prices;
  cacheTimestamp = Date.now();

  return prices;
}

export async function GET() {
  try {
    const prices = await getTokenPrices();
    
    return NextResponse.json({
      success: true,
      data: prices,
      // Helper calculations
      helpers: {
        // How many tokens for $1 USD
        radio_per_dollar: 1 / prices.radio_usd,
        vibes_per_dollar: 1 / prices.vibes_usd,
        // Market info
        radio_fdv: prices.radio_usd * 100_000_000_000, // 100B supply
        vibes_fdv: prices.vibes_usd * 100_000_000_000,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching token prices:', error);
    return NextResponse.json({
      success: false,
      data: {
        radio_usd: FALLBACK_PRICES.radio,
        vibes_usd: FALLBACK_PRICES.vibes,
        eth_usd: FALLBACK_PRICES.eth,
        source: 'fallback',
        timestamp: Date.now(),
      },
      error: 'Failed to fetch prices, using fallback',
    });
  }
}
