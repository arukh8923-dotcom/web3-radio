/**
 * Task 73.2 - Property-Based Tests for Serialization
 * 
 * Property 9: Content Serialization Round-Trip
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4
 */

import { describe, it, expect } from 'vitest';
import {
  serializeBroadcast,
  deserializeBroadcast,
  serializeStation,
  deserializeStation,
  serializePreferences,
  deserializePreferences,
} from '../utils/serialization';
import { ContentType } from '../types/broadcast';
import { StationCategory } from '../types/station';
import { AudioMode } from '../types/user';

// Property-based testing helpers
function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function generateRandomAddress(): string {
  const hex = '0123456789abcdef';
  const addr = Array.from({ length: 40 }, () => hex[Math.floor(Math.random() * 16)]).join('');
  return `0x${addr}`;
}

function generateRandomFrequency(): number {
  return Math.round((88.0 + Math.random() * 20) * 10) / 10; // 88.0 - 108.0
}

describe('Broadcast Serialization', () => {
  it('should round-trip serialize broadcast content', () => {
    const broadcast = {
      contentHash: '0x' + Array.from({ length: 64 }, () => 'a').join(''),
      contentType: ContentType.AUDIO,
      title: 'Test Broadcast',
      duration: 180,
      djAddress: generateRandomAddress(),
      timestamp: Date.now(),
    };

    const serialized = serializeBroadcast(broadcast);
    const deserialized = deserializeBroadcast(serialized);

    expect(deserialized.title).toBe(broadcast.title);
    expect(deserialized.contentType).toBe(broadcast.contentType);
    expect(deserialized.duration).toBe(broadcast.duration);
  });

  it('should handle special characters in broadcast metadata', () => {
    const broadcast = {
      contentHash: '0x' + Array.from({ length: 64 }, () => 'b').join(''),
      contentType: ContentType.AUDIO,
      title: 'Test "Quotes" & <Special> Characters',
      duration: 240,
      djAddress: generateRandomAddress(),
      timestamp: Date.now(),
    };

    const serialized = serializeBroadcast(broadcast);
    const deserialized = deserializeBroadcast(serialized);

    expect(deserialized.title).toBe(broadcast.title);
  });

  it('should preserve timestamp precision', () => {
    const timestamp = 1703001600000; // Specific timestamp
    const broadcast = {
      contentHash: '0x' + Array.from({ length: 64 }, () => 'c').join(''),
      contentType: ContentType.VISUAL,
      title: 'Time Test',
      duration: 120,
      djAddress: generateRandomAddress(),
      timestamp,
    };

    const serialized = serializeBroadcast(broadcast);
    const deserialized = deserializeBroadcast(serialized);

    expect(deserialized.timestamp).toBe(timestamp);
  });

  // Property-based test: Random broadcasts
  it('should round-trip any valid broadcast (property test)', () => {
    const contentTypes = [ContentType.AUDIO, ContentType.VISUAL, ContentType.GENERATIVE];
    
    for (let i = 0; i < 50; i++) {
      const broadcast = {
        contentHash: '0x' + Array.from({ length: 64 }, () => 
          '0123456789abcdef'[Math.floor(Math.random() * 16)]
        ).join(''),
        contentType: contentTypes[Math.floor(Math.random() * contentTypes.length)],
        title: generateRandomString(Math.floor(Math.random() * 100) + 1),
        duration: Math.floor(Math.random() * 3600),
        djAddress: generateRandomAddress(),
        timestamp: Date.now() - Math.floor(Math.random() * 86400000),
      };

      const serialized = serializeBroadcast(broadcast);
      const deserialized = deserializeBroadcast(serialized);

      expect(deserialized.contentHash).toBe(broadcast.contentHash);
      expect(deserialized.djAddress).toBe(broadcast.djAddress);
      expect(deserialized.timestamp).toBe(broadcast.timestamp);
    }
  });
});

describe('Station Metadata Serialization', () => {
  it('should round-trip serialize station metadata', () => {
    const metadata = {
      name: 'Test Station',
      description: 'A test radio station',
      frequency: 88.5,
      category: StationCategory.MUSIC,
      imageUrl: 'https://example.com/image.png',
      owner: generateRandomAddress(),
      djs: [generateRandomAddress()],
      isPremium: false,
      createdAt: Date.now(),
    };

    const serialized = serializeStation(metadata);
    const deserialized = deserializeStation(serialized);

    expect(deserialized.name).toBe(metadata.name);
    expect(deserialized.frequency).toBe(metadata.frequency);
    expect(deserialized.category).toBe(metadata.category);
  });

  it('should handle premium stations without subscriptionFee', () => {
    const metadata = {
      name: 'Premium Station',
      description: 'A premium radio station',
      frequency: 104.5,
      category: StationCategory.LOFI,
      imageUrl: 'https://example.com/premium.png',
      owner: generateRandomAddress(),
      djs: [generateRandomAddress(), generateRandomAddress()],
      isPremium: true,
      createdAt: Date.now(),
    };

    const serialized = serializeStation(metadata);
    const deserialized = deserializeStation(serialized);

    expect(deserialized.isPremium).toBe(true);
  });

  it('should handle premium stations with BigInt subscriptionFee', () => {
    const subscriptionFee = BigInt('1000000000000000000'); // 1 token in wei
    const metadata = {
      name: 'Premium Station with Fee',
      description: 'A premium radio station with subscription',
      frequency: 104.5,
      category: StationCategory.LOFI,
      imageUrl: 'https://example.com/premium.png',
      owner: generateRandomAddress(),
      djs: [generateRandomAddress()],
      isPremium: true,
      subscriptionFee,
      createdAt: Date.now(),
    };

    const serialized = serializeStation(metadata);
    const deserialized = deserializeStation(serialized);

    expect(deserialized.isPremium).toBe(true);
    expect(deserialized.subscriptionFee).toBe(subscriptionFee);
    expect(typeof deserialized.subscriptionFee).toBe('bigint');
  });

  // Property-based test: Random frequencies
  it('should preserve frequency precision (property test)', () => {
    const categories = Object.values(StationCategory);
    
    for (let i = 0; i < 50; i++) {
      const frequency = generateRandomFrequency();
      const metadata = {
        name: `Station ${frequency}`,
        description: 'Test',
        frequency,
        category: categories[Math.floor(Math.random() * categories.length)],
        owner: generateRandomAddress(),
        djs: [],
        isPremium: false,
        createdAt: Date.now(),
      };

      const serialized = serializeStation(metadata);
      const deserialized = deserializeStation(serialized);

      expect(deserialized.frequency).toBe(frequency);
    }
  });
});

describe('User Preferences Serialization', () => {
  it('should round-trip serialize user preferences', () => {
    const preferences = {
      wallet: generateRandomAddress(),
      equalizerSettings: {
        bass: 50,
        mid: 50,
        treble: 50,
        volume: 75,
      },
      subscribedStations: [88.5, 92.3],
      presetFavorites: [88.5, 92.3, 104.5],
      audioMode: AudioMode.STEREO,
      language: 'en',
      lastActive: Date.now(),
    };

    const serialized = serializePreferences(preferences);
    const deserialized = deserializePreferences(serialized);

    expect(deserialized.wallet).toBe(preferences.wallet);
    expect(deserialized.audioMode).toBe(preferences.audioMode);
  });

  it('should handle empty presets', () => {
    const preferences = {
      wallet: generateRandomAddress(),
      equalizerSettings: {
        bass: 50,
        mid: 50,
        treble: 50,
        volume: 50,
      },
      subscribedStations: [],
      presetFavorites: [],
      audioMode: AudioMode.MONO,
      language: 'id',
      lastActive: Date.now(),
    };

    const serialized = serializePreferences(preferences);
    const deserialized = deserializePreferences(serialized);

    expect(deserialized.presetFavorites).toEqual([]);
    expect(deserialized.audioMode).toBe(AudioMode.MONO);
  });

  // Property-based test: Random EQ values
  it('should preserve EQ settings (property test)', () => {
    for (let i = 0; i < 50; i++) {
      const equalizerSettings = {
        bass: Math.floor(Math.random() * 101),
        mid: Math.floor(Math.random() * 101),
        treble: Math.floor(Math.random() * 101),
        volume: Math.floor(Math.random() * 101),
      };

      const preferences = {
        wallet: generateRandomAddress(),
        equalizerSettings,
        subscribedStations: Array.from(
          { length: Math.floor(Math.random() * 5) }, 
          generateRandomFrequency
        ),
        presetFavorites: Array.from(
          { length: Math.floor(Math.random() * 6) }, 
          generateRandomFrequency
        ),
        audioMode: Math.random() > 0.5 ? AudioMode.STEREO : AudioMode.MONO,
        language: ['en', 'id', 'es'][Math.floor(Math.random() * 3)],
        lastActive: Date.now(),
      };

      const serialized = serializePreferences(preferences);
      const deserialized = deserializePreferences(serialized);

      expect(deserialized.equalizerSettings).toEqual(equalizerSettings);
    }
  });
});

describe('Error Handling', () => {
  it('should throw on invalid broadcast JSON', () => {
    expect(() => deserializeBroadcast('invalid json')).toThrow();
  });

  it('should throw on missing required fields', () => {
    const incomplete = JSON.stringify({ title: 'test' });
    expect(() => deserializeBroadcast(incomplete)).toThrow();
  });
});
