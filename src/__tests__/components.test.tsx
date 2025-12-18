/**
 * Task 73.1 - Component Tests
 * 
 * Tests for core radio UI components with correct props
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock wagmi hooks
vi.mock('wagmi', async () => {
  const actual = await vi.importActual('wagmi');
  return {
    ...actual,
    useAccount: () => ({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    }),
    useBalance: () => ({
      data: { value: BigInt(1000000000000000000), formatted: '1.0' },
    }),
    useReadContract: () => ({
      data: undefined,
      isLoading: false,
    }),
    useWriteContract: () => ({
      writeContract: vi.fn(),
      isPending: false,
    }),
    useWaitForTransactionReceipt: () => ({
      isLoading: false,
      isSuccess: false,
    }),
    useConfig: () => ({}),
  };
});

// Mock useRadio hook
vi.mock('@/hooks/useRadio', () => ({
  useRadio: () => ({
    sendVibes: vi.fn(),
  }),
}));

// Mock Farcaster SDK
vi.mock('@/lib/farcaster', () => ({
  detectEnvironment: () => 'browser',
  getFarcasterContext: () => Promise.resolve({ isInMiniApp: false }),
  initializeMiniApp: () => Promise.resolve(false),
}));

// Test wrapper with providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('FrequencyDial Component', () => {
  it('should render current frequency', async () => {
    const { FrequencyDial } = await import('@/components/radio/FrequencyDial');
    
    render(
      <TestWrapper>
        <FrequencyDial 
          frequency={88.5} 
          onChange={() => {}} 
        />
      </TestWrapper>
    );

    expect(screen.getByText(/88\.5/)).toBeInTheDocument();
  });

  it('should display FM suffix', async () => {
    const { FrequencyDial } = await import('@/components/radio/FrequencyDial');
    
    render(
      <TestWrapper>
        <FrequencyDial 
          frequency={104.5} 
          onChange={() => {}} 
        />
      </TestWrapper>
    );

    const fmElements = screen.getAllByText(/FM/);
    expect(fmElements.length).toBeGreaterThan(0);
  });

  it('should call onChange when + button clicked', async () => {
    const { FrequencyDial } = await import('@/components/radio/FrequencyDial');
    const onChange = vi.fn();
    
    render(
      <TestWrapper>
        <FrequencyDial 
          frequency={88.5} 
          onChange={onChange} 
        />
      </TestWrapper>
    );

    const plusButton = screen.getByText('+');
    fireEvent.click(plusButton);
    expect(onChange).toHaveBeenCalled();
  });

  it('should call onChange when - button clicked', async () => {
    const { FrequencyDial } = await import('@/components/radio/FrequencyDial');
    const onChange = vi.fn();
    
    render(
      <TestWrapper>
        <FrequencyDial 
          frequency={90.0} 
          onChange={onChange} 
        />
      </TestWrapper>
    );

    const minusButton = screen.getByText('−');
    fireEvent.click(minusButton);
    expect(onChange).toHaveBeenCalled();
  });

  it('should have 420 zone button', async () => {
    const { FrequencyDial } = await import('@/components/radio/FrequencyDial');
    const onChange = vi.fn();
    
    render(
      <TestWrapper>
        <FrequencyDial 
          frequency={88.5} 
          onChange={onChange} 
        />
      </TestWrapper>
    );

    const zoneButton = screen.getByText('420');
    expect(zoneButton).toBeInTheDocument();
    fireEvent.click(zoneButton);
    expect(onChange).toHaveBeenCalledWith(420.0);
  });
});

describe('VolumeKnob Component', () => {
  it('should render volume label', async () => {
    const { VolumeKnob } = await import('@/components/radio/VolumeKnob');
    
    render(
      <TestWrapper>
        <VolumeKnob 
          value={75} 
          onChange={() => {}} 
          label="Volume"
        />
      </TestWrapper>
    );

    expect(screen.getByText(/Volume/)).toBeInTheDocument();
  });
});

describe('PresetButtons Component', () => {
  it('should render all 6 preset buttons', async () => {
    const { PresetButtons } = await import('@/components/radio/PresetButtons');
    
    render(
      <TestWrapper>
        <PresetButtons 
          onSelect={() => {}}
          activePreset={1}
        />
      </TestWrapper>
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('should show tap/hold instructions', async () => {
    const { PresetButtons } = await import('@/components/radio/PresetButtons');
    
    render(
      <TestWrapper>
        <PresetButtons 
          onSelect={() => {}}
        />
      </TestWrapper>
    );

    expect(screen.getByText(/Tap to load/)).toBeInTheDocument();
    expect(screen.getByText(/Hold to save/)).toBeInTheDocument();
  });

  it('should call onSelect on mouseUp after mouseDown', async () => {
    const { PresetButtons } = await import('@/components/radio/PresetButtons');
    const onSelect = vi.fn();
    
    render(
      <TestWrapper>
        <PresetButtons 
          onSelect={onSelect}
        />
      </TestWrapper>
    );

    const button2 = screen.getByText('2');
    fireEvent.mouseDown(button2);
    fireEvent.mouseUp(button2);
    expect(onSelect).toHaveBeenCalledWith(2);
  });
});

describe('ReceptionQuality Component', () => {
  it('should render signal indicator', async () => {
    const { ReceptionQuality } = await import('@/components/radio/ReceptionQuality');
    
    const { container } = render(
      <TestWrapper>
        <ReceptionQuality 
          signalStrength={85}
        />
      </TestWrapper>
    );

    const button = container.querySelector('button[title*="Signal"]');
    expect(button).toBeInTheDocument();
  });

  it('should show excellent signal for high strength', async () => {
    const { ReceptionQuality } = await import('@/components/radio/ReceptionQuality');
    
    const { container } = render(
      <TestWrapper>
        <ReceptionQuality 
          signalStrength={85}
        />
      </TestWrapper>
    );

    const button = container.querySelector('button[title="Signal: excellent"]');
    expect(button).toBeInTheDocument();
  });

  it('should show good signal for medium-high strength', async () => {
    const { ReceptionQuality } = await import('@/components/radio/ReceptionQuality');
    
    const { container } = render(
      <TestWrapper>
        <ReceptionQuality 
          signalStrength={65}
        />
      </TestWrapper>
    );

    const button = container.querySelector('button[title="Signal: good"]');
    expect(button).toBeInTheDocument();
  });

  it('should show poor signal for low strength', async () => {
    const { ReceptionQuality } = await import('@/components/radio/ReceptionQuality');
    
    const { container } = render(
      <TestWrapper>
        <ReceptionQuality 
          signalStrength={20}
        />
      </TestWrapper>
    );

    const button = container.querySelector('button[title="Signal: poor"]');
    expect(button).toBeInTheDocument();
  });
});

describe('MoodRingDisplay Component', () => {
  it('should render VIBES label', async () => {
    const { MoodRingDisplay } = await import('@/components/radio/MoodRingDisplay');
    
    render(
      <TestWrapper>
        <MoodRingDisplay 
          moodRing={null}
          stationId="test-station"
        />
      </TestWrapper>
    );

    const vibesLabels = screen.getAllByText(/VIBES/);
    expect(vibesLabels.length).toBeGreaterThan(0);
  });

  it('should render mood emoji buttons', async () => {
    const { MoodRingDisplay } = await import('@/components/radio/MoodRingDisplay');
    
    const { container } = render(
      <TestWrapper>
        <MoodRingDisplay 
          moodRing={null}
          stationId="test-station"
        />
      </TestWrapper>
    );

    const hypeButtons = container.querySelectorAll('button[title="Vote hype"]');
    const zenButtons = container.querySelectorAll('button[title="Vote zen"]');
    const chillButtons = container.querySelectorAll('button[title="Vote chill"]');
    
    expect(hypeButtons.length).toBeGreaterThan(0);
    expect(zenButtons.length).toBeGreaterThan(0);
    expect(chillButtons.length).toBeGreaterThan(0);
  });

  it('should show reaction count', async () => {
    const { MoodRingDisplay } = await import('@/components/radio/MoodRingDisplay');
    
    render(
      <TestWrapper>
        <MoodRingDisplay 
          moodRing={{
            chill_count: 5,
            hype_count: 3,
            melancholy_count: 2,
            euphoric_count: 1,
            zen_count: 4,
            current_mood: 'chill',
          }}
          stationId="test-station"
        />
      </TestWrapper>
    );

    expect(screen.getByText(/15 reactions/)).toBeInTheDocument();
  });
});

describe('SleepTimer Component', () => {
  it('should render sleep button', async () => {
    const { SleepTimer } = await import('@/components/radio/SleepTimer');
    
    render(
      <TestWrapper>
        <SleepTimer 
          onSleep={() => {}}
        />
      </TestWrapper>
    );

    expect(screen.getByText(/SLEEP/)).toBeInTheDocument();
  });

  it('should have sleep timer button with title', async () => {
    const { SleepTimer } = await import('@/components/radio/SleepTimer');
    
    const { container } = render(
      <TestWrapper>
        <SleepTimer 
          onSleep={() => {}}
        />
      </TestWrapper>
    );

    const button = container.querySelector('button[title="Sleep Timer"]');
    expect(button).toBeInTheDocument();
  });

  it('should show timer options when clicked', async () => {
    const { SleepTimer } = await import('@/components/radio/SleepTimer');
    
    render(
      <TestWrapper>
        <SleepTimer 
          onSleep={() => {}}
        />
      </TestWrapper>
    );

    const sleepButton = screen.getByText(/SLEEP/);
    fireEvent.click(sleepButton);

    expect(screen.getByText('5 min')).toBeInTheDocument();
    expect(screen.getByText('15 min')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
    expect(screen.getByText('1 hour')).toBeInTheDocument();
  });
});
