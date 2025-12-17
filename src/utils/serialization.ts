import { BroadcastContentSchema, type BroadcastContent } from '../types/broadcast';
import { StationMetadataSchema, type StationMetadata } from '../types/station';
import { UserPreferencesSchema, type UserPreferences } from '../types/user';

/**
 * Serialize broadcast content to JSON string
 */
export function serializeBroadcast(content: BroadcastContent): string {
  // Validate before serializing
  const validated = BroadcastContentSchema.parse(content);
  return JSON.stringify(validated);
}

/**
 * Deserialize JSON string to broadcast content
 */
export function deserializeBroadcast(json: string): BroadcastContent {
  const parsed = JSON.parse(json);
  return BroadcastContentSchema.parse(parsed);
}

/**
 * Serialize station metadata to JSON string
 */
export function serializeStation(metadata: StationMetadata): string {
  const validated = StationMetadataSchema.parse(metadata);
  return JSON.stringify(validated);
}

/**
 * Deserialize JSON string to station metadata
 */
export function deserializeStation(json: string): StationMetadata {
  const parsed = JSON.parse(json);
  return StationMetadataSchema.parse(parsed);
}

/**
 * Serialize user preferences to JSON string
 */
export function serializePreferences(prefs: UserPreferences): string {
  const validated = UserPreferencesSchema.parse(prefs);
  return JSON.stringify(validated);
}

/**
 * Deserialize JSON string to user preferences
 */
export function deserializePreferences(json: string): UserPreferences {
  const parsed = JSON.parse(json);
  return UserPreferencesSchema.parse(parsed);
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
