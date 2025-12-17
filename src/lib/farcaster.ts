import { sdk } from '@farcaster/miniapp-sdk';

// Re-export SDK for convenience
export { sdk };

// Types from Farcaster SDK
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

// Get Farcaster context
export async function getFarcasterContext(): Promise<FarcasterContext> {
  try {
    const isInMiniApp = await sdk.isInMiniApp();
    
    if (!isInMiniApp) {
      return { isInMiniApp: false };
    }

    // sdk.context is a Promise, need to await it
    const context = await sdk.context;
    
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

// Compose a cast with station info
export async function shareStation(stationName: string, frequency: number) {
  try {
    await sdk.actions.composeCast({
      text: `🎵 Listening to ${stationName} on ${frequency.toFixed(1)} FM via Web3 Radio!`,
      embeds: [window.location.href],
    });
  } catch (error) {
    console.error('Failed to compose cast:', error);
  }
}

// View a user's Farcaster profile
export async function viewProfile(fid: number) {
  try {
    await sdk.actions.viewProfile({ fid });
  } catch (error) {
    console.error('Failed to view profile:', error);
  }
}

// Open external URL
export async function openUrl(url: string) {
  try {
    await sdk.actions.openUrl(url);
  } catch (error) {
    console.error('Failed to open URL:', error);
  }
}

// Prompt user to add the Mini App
export async function addMiniApp() {
  try {
    await sdk.actions.addMiniApp();
    return true;
  } catch {
    return false;
  }
}

// Quick Auth - get authenticated session
export async function getAuthToken() {
  try {
    const { token } = await sdk.quickAuth.getToken();
    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}
