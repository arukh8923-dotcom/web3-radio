'use client';

// Farcaster Mini App SDK - Updated for Mini App (not Frame)
// Reference: https://miniapps.farcaster.xyz/docs

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sdk: any = null;

// Dynamic import to avoid SSR issues
async function getSDK() {
  if (sdk) return sdk;
  try {
    const module = await import('@farcaster/miniapp-sdk');
    sdk = module.sdk;
    return sdk;
  } catch {
    console.warn('Farcaster SDK not available - running in browser-only mode');
    return null;
  }
}

// Types
export type FarcasterUser = {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
};

export type FarcasterContext = {
  user?: FarcasterUser;
  isInMiniApp: boolean;
  clientFid?: number;
  added?: boolean;
};

// Environment detection
export type AppEnvironment = 'farcaster' | 'browser' | 'unknown';

export function detectEnvironment(): AppEnvironment {
  if (typeof window === 'undefined') return 'unknown';
  
  // Check if inside Farcaster Mini App (iframe with specific parent)
  const isInIframe = window !== window.parent;
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  // Farcaster apps typically have specific characteristics
  if (isInIframe || userAgent.includes('farcaster') || userAgent.includes('warpcast')) {
    return 'farcaster';
  }
  
  return 'browser';
}

// Check if running inside Farcaster Mini App
export async function isInMiniApp(): Promise<boolean> {
  const sdkInstance = await getSDK();
  if (!sdkInstance) return false;
  
  try {
    // The SDK context will be available if in Mini App
    const context = await sdkInstance.context;
    return !!context;
  } catch {
    return false;
  }
}

// Initialize SDK and call ready() to hide splash screen
export async function initializeMiniApp(): Promise<boolean> {
  const sdkInstance = await getSDK();
  if (!sdkInstance) {
    console.log('SDK not available, running in browser mode');
    return false;
  }
  
  try {
    // Call ready to signal the app is loaded
    await sdkInstance.actions.ready();
    console.log('Mini App initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Mini App:', error);
    return false;
  }
}

// Get Farcaster context
export async function getFarcasterContext(): Promise<FarcasterContext> {
  const sdkInstance = await getSDK();
  if (!sdkInstance) {
    return { isInMiniApp: false };
  }

  try {
    const context = await sdkInstance.context;
    
    if (!context) {
      return { isInMiniApp: false };
    }

    return {
      isInMiniApp: true,
      user: context.user ? {
        fid: context.user.fid,
        username: context.user.username,
        displayName: context.user.displayName,
        pfpUrl: context.user.pfpUrl,
      } : undefined,
      clientFid: context.client?.clientFid,
      added: context.client?.added,
    };
  } catch {
    return { isInMiniApp: false };
  }
}

// Get Ethereum provider from Farcaster wallet
export async function getFarcasterEthereumProvider() {
  const sdkInstance = await getSDK();
  if (!sdkInstance) return null;

  try {
    const provider = await sdkInstance.wallet.ethProvider;
    return provider;
  } catch (error) {
    console.error('Failed to get Farcaster Ethereum provider:', error);
    return null;
  }
}

// Compose a cast with station info
export async function shareStation(stationName: string, frequency: number) {
  const sdkInstance = await getSDK();
  if (!sdkInstance) {
    // Fallback: open Warpcast compose in new tab
    const text = encodeURIComponent(`🎵 Listening to ${stationName} on ${frequency.toFixed(1)} FM via Web3 Radio!`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://warpcast.com/~/compose?text=${text}&embeds[]=${url}`, '_blank');
    return;
  }

  try {
    await sdkInstance.actions.openUrl(
      `https://warpcast.com/~/compose?text=${encodeURIComponent(`🎵 Listening to ${stationName} on ${frequency.toFixed(1)} FM via Web3 Radio!`)}&embeds[]=${encodeURIComponent(window.location.href)}`
    );
  } catch (error) {
    console.error('Failed to compose cast:', error);
  }
}

// View a user's Farcaster profile
export async function viewProfile(fid: number) {
  const sdkInstance = await getSDK();
  if (!sdkInstance) {
    window.open(`https://warpcast.com/~/profiles/${fid}`, '_blank');
    return;
  }

  try {
    await sdkInstance.actions.openUrl(`https://warpcast.com/~/profiles/${fid}`);
  } catch (error) {
    console.error('Failed to view profile:', error);
  }
}

// Open external URL
export async function openUrl(url: string) {
  const sdkInstance = await getSDK();
  if (!sdkInstance) {
    window.open(url, '_blank');
    return;
  }

  try {
    await sdkInstance.actions.openUrl(url);
  } catch (error) {
    console.error('Failed to open URL:', error);
  }
}

// Prompt user to add the Mini App
export async function addMiniApp(): Promise<boolean> {
  const sdkInstance = await getSDK();
  if (!sdkInstance) return false;

  try {
    const result = await sdkInstance.actions.addFrame();
    return result?.added ?? false;
  } catch {
    return false;
  }
}
