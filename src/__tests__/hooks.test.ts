/**
 * Integration Tests for Hooks
 * 
 * Tests core hook functionality including:
 * - useRadio (Zustand store)
 * - useTokenBalances
 * - useTokenPrice
 * - usePremiumAccess
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock wagmi hooks with all required exports
vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAccount: () => ({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    }),
    usePublicClient: () => ({
      readContract: vi.fn().mockResolvedValue([true, 'OK', 1000n, 5000n, false]),
    }),
    useWalletClient: () => ({
      data: {
        sendTransaction: vi.fn().mockResolvedValue('0xmocktxhash'),
      },
    }),
    useWriteContract: () => ({
      writeContractAsync: vi.fn().mockResolvedValue('0xmocktxhash'),
    }),
    useWaitForTransactionReceipt: () => ({
      isLoading: false,
      isSuccess: true,
    }),
  };
});

// Mock contracts lib
vi.mock('@/lib/contracts', () => ({
  getRadioBalance: vi.fn().mockResolvedValue(BigInt('1000000000000000000000')), // 1000 RADIO
  getVibesBalance: vi.fn().mockResolvedValue(BigInt('500000000000000000000')), // 500 VIBES
  ERC20_ABI: [],
  RADIO_TOKEN_ADDRESS: '0xaF0741FB82633a190683c5cFb4b8546123E93B07',
  VIBES_TOKEN_ADDRESS: '0xCD6387AfA893C1Ad070c9870B5e9C4c0B7D56b07',
}));

// Mock paymaster lib
vi.mock('@/lib/paymaster', () => ({
  PAYMASTER_CONTRACT_ADDRESS: '0x6e3cbf3F9C5E8F7932cBf8CDA389b69Ad246914b',
  PAYMASTER_ABI: [],
}));

vi.mock('@/lib/cdp', () => ({
  PAYMASTER_URL: 'https://paymaster.example.com',
  canSponsorTransaction: vi.fn().mockResolvedValue(true),
}));

// Mock API lib
vi.mock('@/lib/api', () => ({
  getStationByFrequency: vi.fn().mockResolvedValue(null),
  getPresets: vi.fn().mockResolvedValue([]),
  getUserPreferences: vi.fn().mockResolvedValue({
    volume: 50,
    equalizer_bass: 50,
    equalizer_treble: 50,
  }),
  tuneIn: vi.fn().mockResolvedValue({ success: true }),
  tuneOut: vi.fn().mockResolvedValue({ success: true }),
  savePreset: vi.fn().mockResolvedValue({ success: true }),
  saveUserPreferences: vi.fn().mockResolvedValue({ success: true }),
  sendVibes: vi.fn().mockResolvedValue({ success: true }),
  getMoodRing: vi.fn().mockResolvedValue(null),
}));

describe('useRadio Hook (Zustand Store)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset Zustand store by importing fresh
    vi.resetModules();
  });

  it('should have default frequency', async () => {
    const { useRadio } = await import('@/hooks/useRadio');
    const state = useRadio.getState();
    
    expect(state.frequency).toBeDefined();
    expect(typeof state.frequency).toBe('number');
  });

  it('should have volume controls', async () => {
    const { useRadio } = await import('@/hooks/useRadio');
    const state = useRadio.getState();
    
    expect(state.volume).toBeDefined();
    expect(state.bass).toBeDefined();
    expect(state.treble).toBeDefined();
  });

  it('should have power state', async () => {
    const { useRadio } = await import('@/hooks/useRadio');
    const state = useRadio.getState();
    
    expect(typeof state.isOn).toBe('boolean');
    expect(typeof state.isMuted).toBe('boolean');
  });

  it('should have setters', async () => {
    const { useRadio } = await import('@/hooks/useRadio');
    const state = useRadio.getState();
    
    expect(typeof state.setFrequency).toBe('function');
    expect(typeof state.setVolume).toBe('function');
    expect(typeof state.setBass).toBe('function');
    expect(typeof state.setTreble).toBe('function');
    expect(typeof state.togglePower).toBe('function');
    expect(typeof state.toggleMute).toBe('function');
  });

  it('should have API actions', async () => {
    const { useRadio } = await import('@/hooks/useRadio');
    const state = useRadio.getState();
    
    expect(typeof state.loadStationByFrequency).toBe('function');
    expect(typeof state.tuneIn).toBe('function');
    expect(typeof state.tuneOut).toBe('function');
    expect(typeof state.loadPresets).toBe('function');
    expect(typeof state.savePreset).toBe('function');
    expect(typeof state.sendVibes).toBe('function');
  });

  it('should update volume via setter', async () => {
    const { useRadio } = await import('@/hooks/useRadio');
    
    const initialVolume = useRadio.getState().volume;
    
    act(() => {
      useRadio.getState().setVolume(75);
    });
    
    expect(useRadio.getState().volume).toBe(75);
  });

  it('should toggle mute', async () => {
    const { useRadio } = await import('@/hooks/useRadio');
    
    const initialMuted = useRadio.getState().isMuted;
    
    act(() => {
      useRadio.getState().toggleMute();
    });
    
    expect(useRadio.getState().isMuted).toBe(!initialMuted);
  });
});

describe('useTokenBalances Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return balance object', async () => {
    const { useTokenBalances } = await import('@/hooks/useTokenBalances');
    
    const { result } = renderHook(() => useTokenBalances());
    
    // Check immediately without waiting for async
    expect(result.current).toHaveProperty('radio');
    expect(result.current).toHaveProperty('vibes');
    expect(result.current).toHaveProperty('radioRaw');
    expect(result.current).toHaveProperty('vibesRaw');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('refetch');
  }, 10000);

  it('should have refetch function', async () => {
    const { useTokenBalances } = await import('@/hooks/useTokenBalances');
    
    const { result } = renderHook(() => useTokenBalances());
    
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should fetch balances on mount', async () => {
    const { useTokenBalances } = await import('@/hooks/useTokenBalances');
    const { getRadioBalance, getVibesBalance } = await import('@/lib/contracts');
    
    renderHook(() => useTokenBalances());
    
    await waitFor(() => {
      expect(getRadioBalance).toHaveBeenCalled();
      expect(getVibesBalance).toHaveBeenCalled();
    });
  });
});

describe('useTokenPrice Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          radio_usd: 0.001,
          vibes_usd: 0.0005,
          eth_usd: 3500,
          source: 'test',
          timestamp: Date.now(),
        },
      }),
    });
  });

  it('should fetch token prices', async () => {
    const { useTokenPrice } = await import('@/hooks/useTokenPrice');
    
    const { result } = renderHook(() => useTokenPrice());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.prices).not.toBeNull();
    expect(result.current.prices?.radio_usd).toBe(0.001);
    expect(result.current.prices?.vibes_usd).toBe(0.0005);
  });

  it('should convert USD to RADIO', async () => {
    const { useTokenPrice } = await import('@/hooks/useTokenPrice');
    
    const { result } = renderHook(() => useTokenPrice());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // $5 USD at $0.001/RADIO = 5000 RADIO
    const radioAmount = result.current.usdToRadio(5);
    expect(radioAmount).toBe(5000);
  });

  it('should convert USD to VIBES', async () => {
    const { useTokenPrice } = await import('@/hooks/useTokenPrice');
    
    const { result } = renderHook(() => useTokenPrice());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // $5 USD at $0.0005/VIBES = 10000 VIBES
    const vibesAmount = result.current.usdToVibes(5);
    expect(vibesAmount).toBe(10000);
  });

  it('should convert RADIO to USD', async () => {
    const { useTokenPrice } = await import('@/hooks/useTokenPrice');
    
    const { result } = renderHook(() => useTokenPrice());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // 1000 RADIO at $0.001/RADIO = $1
    const usdAmount = result.current.radioToUsd(1000);
    expect(usdAmount).toBe(1);
  });

  it('should format large amounts', async () => {
    const { useTokenPrice } = await import('@/hooks/useTokenPrice');
    
    const { result } = renderHook(() => useTokenPrice());
    
    expect(result.current.formatRadioAmount(1500000)).toBe('1.50M');
    expect(result.current.formatRadioAmount(2500)).toBe('2.5K');
    expect(result.current.formatRadioAmount(500)).toBe('500');
  });

  it('should have refetch function', async () => {
    const { useTokenPrice } = await import('@/hooks/useTokenPrice');
    
    const { result } = renderHook(() => useTokenPrice());
    
    expect(typeof result.current.refetch).toBe('function');
  });
});

describe('usePremiumAccess Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return access object', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ subscription: null }),
    });
    
    const { usePremiumAccess } = await import('@/hooks/usePremiumAccess');
    
    const { result } = renderHook(() => usePremiumAccess('test-station'));
    
    expect(result.current).toHaveProperty('hasAccess');
    expect(result.current).toHaveProperty('tier');
    expect(result.current).toHaveProperty('benefits');
    expect(result.current).toHaveProperty('loading');
  });

  it('should have helper functions', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ subscription: null }),
    });
    
    const { usePremiumAccess } = await import('@/hooks/usePremiumAccess');
    
    const { result } = renderHook(() => usePremiumAccess('test-station'));
    
    expect(typeof result.current.hasBenefit).toBe('function');
    expect(typeof result.current.isAdFree).toBe('function');
    expect(typeof result.current.canAccessVIPRoom).toBe('function');
    expect(typeof result.current.hasRequestPriority).toBe('function');
    expect(typeof result.current.refresh).toBe('function');
  });

  it('should return no access for no subscription', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ subscription: null }),
    });
    
    const { usePremiumAccess } = await import('@/hooks/usePremiumAccess');
    
    const { result } = renderHook(() => usePremiumAccess('test-station'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.hasAccess).toBe(false);
    expect(result.current.tier).toBe('none');
  });
});

describe('usePaymaster Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return paymaster interface', async () => {
    const { usePaymaster } = await import('@/hooks/usePaymaster');
    
    const { result } = renderHook(() => usePaymaster());
    
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(typeof result.current.checkSponsorship).toBe('function');
    expect(typeof result.current.getUserLimits).toBe('function');
    expect(typeof result.current.getStats).toBe('function');
    expect(typeof result.current.executeSponsoredTx).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });

  it('should have loading state false initially', async () => {
    const { usePaymaster } = await import('@/hooks/usePaymaster');
    
    const { result } = renderHook(() => usePaymaster());
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });
});

describe('useX402 Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return x402 interface', async () => {
    const { useX402 } = await import('@/hooks/useX402');
    
    const { result } = renderHook(() => useX402());
    
    expect(result.current).toHaveProperty('isPaying');
    expect(result.current).toHaveProperty('isConfirming');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('txHash');
    expect(typeof result.current.handlePayment).toBe('function');
    expect(typeof result.current.fetchWithPayment).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('should have default state', async () => {
    const { useX402 } = await import('@/hooks/useX402');
    
    const { result } = renderHook(() => useX402());
    
    expect(result.current.isPaying).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.txHash).toBe(null);
  });
});

describe('USD Pricing Configuration', () => {
  it('should have correct pricing tiers', async () => {
    const { USD_PRICING } = await import('@/hooks/useTokenPrice');
    
    // NFT prices
    expect(USD_PRICING.nft.frequency_mint).toBe(10);
    expect(USD_PRICING.nft.frequency_premium).toBe(50);
    
    // Subscription prices
    expect(USD_PRICING.subscription.basic).toBe(1);
    expect(USD_PRICING.subscription.premium).toBe(5);
    expect(USD_PRICING.subscription.vip).toBe(20);
    
    // Tip presets
    expect(USD_PRICING.tips.small).toBe(0.10);
    expect(USD_PRICING.tips.medium).toBe(1);
    expect(USD_PRICING.tips.large).toBe(5);
  });

  it('should have station creation prices', async () => {
    const { USD_PRICING } = await import('@/hooks/useTokenPrice');
    
    expect(USD_PRICING.station.create_basic).toBe(5);
    expect(USD_PRICING.station.create_premium).toBe(20);
  });

  it('should have vibes feature prices', async () => {
    const { USD_PRICING } = await import('@/hooks/useTokenPrice');
    
    expect(USD_PRICING.vibes.smoke_signal_5min).toBe(0.05);
    expect(USD_PRICING.vibes.request_line_stake).toBe(0.20);
  });
});
