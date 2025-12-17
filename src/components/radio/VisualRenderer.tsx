'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface GenerativeParams {
  seed: number;
  colorPalette: string[];
  waveformType: 'sine' | 'square' | 'sawtooth' | 'noise';
  bpm: number;
}

interface VisualRendererProps {
  audioData?: Uint8Array;
  generativeParams?: GenerativeParams;
  contentHash?: string;
  ipfsHash?: string;
  isPlaying: boolean;
  mode: 'waveform' | 'generative' | 'media';
}

export function VisualRenderer({
  audioData,
  generativeParams,
  contentHash,
  ipfsHash,
  isPlaying,
  mode,
}: VisualRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  // Load media from IPFS if needed
  useEffect(() => {
    if (mode === 'media' && ipfsHash) {
      const gateway = 'https://ipfs.io/ipfs/';
      setMediaUrl(`${gateway}${ipfsHash}`);
    }
  }, [mode, ipfsHash]);

  // Waveform visualization
  const drawWaveform = useCallback((ctx: CanvasRenderingContext2D, data: Uint8Array) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    ctx.fillStyle = 'rgba(26, 26, 46, 0.3)';
    ctx.fillRect(0, 0, width, height);
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#4ade80';
    ctx.beginPath();
    
    const sliceWidth = width / data.length;
    let x = 0;
    
    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 128.0;
      const y = (v * height) / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }, []);

  // Generative art visualization
  const drawGenerative = useCallback((ctx: CanvasRenderingContext2D, params: GenerativeParams, time: number) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const { seed, colorPalette, waveformType, bpm } = params;
    
    // Clear with fade effect
    ctx.fillStyle = 'rgba(26, 26, 46, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    // Seeded random
    const seededRandom = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };
    
    const beatInterval = 60000 / bpm;
    const beatPhase = (time % beatInterval) / beatInterval;
    
    // Draw based on waveform type
    const numShapes = 20;
    for (let i = 0; i < numShapes; i++) {
      const r = seededRandom(seed + i);
      const color = colorPalette[Math.floor(r * colorPalette.length)];
      
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3 + beatPhase * 0.4;
      
      const x = (seededRandom(seed + i * 2) * width + time * 0.05) % width;
      const y = seededRandom(seed + i * 3) * height;
      
      switch (waveformType) {
        case 'sine':
          const sineY = y + Math.sin(time * 0.002 + i) * 30;
          ctx.beginPath();
          ctx.arc(x, sineY, 10 + beatPhase * 20, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'square':
          const size = 20 + beatPhase * 30;
          ctx.fillRect(x - size/2, y - size/2, size, size);
          break;
        case 'sawtooth':
          ctx.beginPath();
          ctx.moveTo(x, y - 20);
          ctx.lineTo(x + 20, y + 20);
          ctx.lineTo(x - 20, y + 20);
          ctx.closePath();
          ctx.fill();
          break;
        case 'noise':
          for (let j = 0; j < 5; j++) {
            const nx = x + (seededRandom(seed + i + j + time * 0.001) - 0.5) * 50;
            const ny = y + (seededRandom(seed + i + j * 2 + time * 0.001) - 0.5) * 50;
            ctx.beginPath();
            ctx.arc(nx, ny, 5, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
      }
    }
    
    ctx.globalAlpha = 1;
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let startTime = Date.now();
    
    const animate = () => {
      if (!isPlaying && mode !== 'generative') {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      const time = Date.now() - startTime;
      
      if (mode === 'waveform' && audioData) {
        drawWaveform(ctx, audioData);
      } else if (mode === 'generative' && generativeParams) {
        drawGenerative(ctx, generativeParams, time);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, mode, audioData, generativeParams, drawWaveform, drawGenerative]);

  if (mode === 'media' && mediaUrl) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <img 
          src={mediaUrl} 
          alt="Broadcast visual" 
          className="w-full h-full object-contain"
          onError={() => setMediaUrl(null)}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-cabinet-dark rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        className="w-full h-full"
      />
      {!isPlaying && mode === 'waveform' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <p className="text-dial-cream/50">Paused</p>
        </div>
      )}
      {contentHash && (
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-dial-cream/50 font-mono">
          {contentHash.slice(0, 10)}...
        </div>
      )}
    </div>
  );
}

// Preset generative params for different moods
export const GENERATIVE_PRESETS: Record<string, GenerativeParams> = {
  chill: {
    seed: 420,
    colorPalette: ['#4ade80', '#22d3ee', '#818cf8', '#a78bfa'],
    waveformType: 'sine',
    bpm: 80,
  },
  hype: {
    seed: 808,
    colorPalette: ['#f43f5e', '#fb923c', '#facc15', '#f472b6'],
    waveformType: 'square',
    bpm: 140,
  },
  zen: {
    seed: 108,
    colorPalette: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef'],
    waveformType: 'sine',
    bpm: 60,
  },
  psychedelic: {
    seed: 42069,
    colorPalette: ['#4ade80', '#f472b6', '#facc15', '#22d3ee', '#f43f5e'],
    waveformType: 'noise',
    bpm: 120,
  },
};
