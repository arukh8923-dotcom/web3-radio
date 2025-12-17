'use client';

// Farcaster Mini App SDK - with fallback for browser-only mode
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

// Check if running inside Farcaster Mini App
export async function isInMiniApp(): Promise<boolean> {
  const sdkInstance = await getSDK();
  if (!sdkInstance) return false;
  
  try {
    return await sdkInstance.isInMiniApp();
  } catch {
    return false;
  }
}

// Initialize SDK and call ready() to hide splash screen
export async function initializeMiniApp(): Promise<boolean> {
  const sdkInstance = await getSDK();
  if (!sdkInstance) return false;
  
  try {
    const inMiniApp = await sdkInstance.isInMiniApp();
    if (inMiniApp) {
      await sdkInstance.actions.ready();
      return true;
    }
    return false;
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
    const inMiniApp = await sdkInstance.isInMiniApp();
    
    if (!inMiniApp) {
      return { isInMiniApp: false };
    }

    const context = await sdkInstance.context;
    
    return {
      isInMiniApp: true,
      user: context?.user ? {
        fid: context.user.fid,
        username: context.user.username,
        displayName: context.user.displayName,
        pfpUrl: context.user.pfpUrl,
      } : undefined,
      clientFid: context?.client?.clientFid,
      added: context?.client?.added,
    };
  } catch {
    return { isInMiniApp: false };
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
    await sdkInstance.actions.composeCast({
      text: `🎵 Listening to ${stationName} on ${frequency.toFixed(1)} FM via Web3 Radio!`,
      embeds: [window.location.href],
    });
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
    await sdkInstance.actions.viewProfile({ fid });
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
    await sdkInstance.actions.addMiniApp();
    return true;
  } catch {
    return false;
  }
}

// Quick Auth - get authenticated session
export async function getAuthToken(): Promise<string | null> {
  const sdkInstance = await getSDK();
  if (!sdkInstance) return null;

  try {
    const { token } = await sdkInstance.quickAuth.getToken();
    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

// Get Ethereum provider from Farcaster wallet
export async function getEthereumProvider() {
  const sdkInstance = await getSDK();
  if (!sdkInstance) return null;

  try {
    return await sdkInstance.wallet.getEthereumProvider();
  } catch (error) {
    console.error('Failed to get Ethereum provider:', error);
    return null;
  }
}
