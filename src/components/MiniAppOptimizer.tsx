'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  detectEnvironment, 
  getFarcasterContext, 
  initializeMiniApp,
  type FarcasterContext,
  type AppEnvironment 
} from '@/lib/farcaster';

/**
 * Task 63.1 - Farcaster Mini App Optimization
 * 
 * Reference: https://miniapps.farcaster.xyz/docs (November 2025+)
 * 
 * Mini App constraints & best practices:
 * - Call sdk.actions.ready() ASAP to hide splash screen
 * - Use sdk.wallet.ethProvider for wallet interactions
 * - Optimize for mobile-first (Warpcast is primarily mobile)
 * - Handle both Mini App and browser contexts gracefully
 * - Use sdk.context for user info (FID, username, pfp)
 */

export type MiniAppState = {
  isInitialized: boolean;
  isInMiniApp: boolean;
  environment: AppEnvironment;
  context: FarcasterContext | null;
  error: string | null;
};

// Hook for Mini App optimization
export function useMiniAppOptimization() {
  const [state, setState] = useState<MiniAppState>({
    isInitialized: false,
    isInMiniApp: false,
    environment: 'unknown',
    context: null,
    error: null,
  });

  useEffect(() => {
    async function init() {
      try {
        // Detect environment first
        const env = detectEnvironment();
        
        // Try to initialize Mini App
        const initialized = await initializeMiniApp();
        
        // Get context if in Mini App
        let context: FarcasterContext | null = null;
        if (initialized) {
          context = await getFarcasterContext();
        }

        setState({
          isInitialized: true,
          isInMiniApp: initialized && context?.isInMiniApp === true,
          environment: env,
          context,
          error: null,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          isInitialized: true,
          error: error instanceof Error ? error.message : 'Failed to initialize',
        }));
      }
    }

    init();
  }, []);

  return state;
}

// Optimized rendering hints for Mini App context
export function useMiniAppRenderHints() {
  const { isInMiniApp, environment } = useMiniAppOptimization();
  
  return {
    // Reduce animations in Mini App for better performance
    shouldReduceAnimations: isInMiniApp,
    // Use simplified UI in Mini App
    shouldUseCompactUI: isInMiniApp,
    // Mobile-first layout
    isMobileContext: isInMiniApp || environment === 'farcaster',
    // Touch-optimized controls
    useTouchControls: isInMiniApp,
    // Larger tap targets for mobile
    minTapTarget: isInMiniApp ? 44 : 32,
  };
}

// Component wrapper for Mini App optimized content
export function MiniAppOptimizer({ 
  children,
  compactFallback,
  className = '',
}: { 
  children: React.ReactNode;
  compactFallback?: React.ReactNode;
  className?: string;
}) {
  const { isInMiniApp, isInitialized } = useMiniAppOptimization();
  const { shouldReduceAnimations, shouldUseCompactUI } = useMiniAppRenderHints();
  
  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-pulse text-brass">Loading...</div>
      </div>
    );
  }
  
  // Use compact fallback if in Mini App and provided
  if (isInMiniApp && shouldUseCompactUI && compactFallback) {
    return <>{compactFallback}</>;
  }
  
  return (
    <div 
      className={`
        ${className}
        ${shouldReduceAnimations ? 'reduce-motion' : ''}
        ${shouldUseCompactUI ? 'compact-ui' : ''}
      `}
    >
      {children}
    </div>
  );
}

// Mini App aware button with proper tap targets
export function MiniAppButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  className?: string;
}) {
  const { minTapTarget, useTouchControls } = useMiniAppRenderHints();
  
  const baseStyles = `
    min-h-[${minTapTarget}px] 
    min-w-[${minTapTarget}px]
    ${useTouchControls ? 'touch-manipulation' : ''}
    transition-all duration-200
    font-oswald
  `;
  
  const variantStyles = {
    primary: 'bg-brass text-wood-dark hover:bg-brass/90 active:scale-95',
    secondary: 'bg-wood border border-brass text-brass hover:bg-wood-dark',
    ghost: 'bg-transparent text-brass hover:bg-brass/10',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
        px-4 py-3 rounded-lg
      `}
      style={{ minHeight: minTapTarget, minWidth: minTapTarget }}
    >
      {children}
    </button>
  );
}

// Compact radio controls for Mini App
export function MiniAppRadioControls({
  frequency,
  stationName,
  isPlaying,
  onPlayPause,
  onTuneUp,
  onTuneDown,
}: {
  frequency: number;
  stationName: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  onTuneUp: () => void;
  onTuneDown: () => void;
}) {
  const { isInMiniApp } = useMiniAppOptimization();
  
  // Only render in Mini App context
  if (!isInMiniApp) return null;
  
  return (
    <div className="mini-app-controls p-4 bg-wood-dark/95 backdrop-blur rounded-xl border border-brass/30">
      {/* Station Info - Compact */}
      <div className="text-center mb-4">
        <div className="text-3xl font-oswald text-dial-glow font-bold">
          {frequency.toFixed(1)} FM
        </div>
        <div className="text-sm text-brass/80 truncate max-w-[200px] mx-auto">
          {stationName || 'Scanning...'}
        </div>
      </div>
      
      {/* Controls Row */}
      <div className="flex items-center justify-center gap-3">
        <MiniAppButton onClick={onTuneDown} variant="secondary">
          ◀
        </MiniAppButton>
        
        <MiniAppButton 
          onClick={onPlayPause} 
          variant="primary"
          className="px-8"
        >
          {isPlaying ? '⏸️' : '▶️'}
        </MiniAppButton>
        
        <MiniAppButton onClick={onTuneUp} variant="secondary">
          ▶
        </MiniAppButton>
      </div>
    </div>
  );
}

// User info display for Mini App
export function MiniAppUserInfo() {
  const { context, isInMiniApp } = useMiniAppOptimization();
  
  if (!isInMiniApp || !context?.user) return null;
  
  return (
    <div className="flex items-center gap-2 p-2 bg-wood-dark/50 rounded-lg">
      {context.user.pfpUrl && (
        <img 
          src={context.user.pfpUrl} 
          alt={context.user.displayName || context.user.username || 'User'}
          className="w-8 h-8 rounded-full"
        />
      )}
      <div className="text-sm">
        <div className="text-brass font-medium">
          {context.user.displayName || context.user.username}
        </div>
        <div className="text-brass/60 text-xs">
          FID: {context.user.fid}
        </div>
      </div>
    </div>
  );
}

export default MiniAppOptimizer;
