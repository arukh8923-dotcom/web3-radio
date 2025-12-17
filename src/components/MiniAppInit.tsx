'use client';

import { useEffect, useState } from 'react';
import { initializeMiniApp, getFarcasterContext, type FarcasterContext } from '@/lib/farcaster';

export function MiniAppInit() {
  const [context, setContext] = useState<FarcasterContext | null>(null);

  useEffect(() => {
    async function init() {
      // Initialize Mini App SDK (calls ready() to hide splash)
      await initializeMiniApp();
      
      // Get context for user info
      const ctx = await getFarcasterContext();
      setContext(ctx);
      
      if (ctx.isInMiniApp) {
        console.log('Running inside Farcaster Mini App');
        if (ctx.user) {
          console.log('User:', ctx.user.username, 'FID:', ctx.user.fid);
        }
      } else {
        console.log('Running in browser mode');
      }
    }
    
    init();
  }, []);

  // This component doesn't render anything visible
  // It just initializes the Mini App SDK
  return null;
}

// Hook to get Farcaster context
export function useFarcasterContext() {
  const [context, setContext] = useState<FarcasterContext>({ isInMiniApp: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFarcasterContext().then((ctx) => {
      setContext(ctx);
      setLoading(false);
    });
  }, []);

  return { context, loading };
}
