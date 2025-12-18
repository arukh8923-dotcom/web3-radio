import { BroadcastContentSchema, type BroadcastContent } from '../types/broadcast';
import { StationMetadataSchema, type StationMetadata } from '../types/station';
import { UserPreferencesSchema, type UserPreferences } from '../types/user';

/**
 * Custom JSON replacer that handles BigInt serialization
 */
function bigIntReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') {
    return { __type: 'bigint', value: value.toString() };
  }
  return value;
}

/**
 * Custom JSON reviver that handles BigInt deserialization
 */
function bigIntReviver(_key: string, value: unknown): unknown {
  if (value && typeof value === 'object' && '__type' in value) {
    const obj = value as { __type: string; value: string };
    if (obj.__type === 'bigint') {
      return BigInt(obj.value);
    }
  }
  return value;
}

/**
 * Serialize broadcast content to JSON string
 */
export function serializeBroadcast(content: BroadcastContent): string {
  const validated = BroadcastContentSchema.parse(content);
  return JSON.stringify(validated, bigIntReplacer);
}

/**
 * Deserialize JSON string to broadcast content
 */
export function deserializeBroadcast(json: string): BroadcastContent {
  const parsed = JSON.parse(json, bigIntReviver);
  return BroadcastContentSchema.parse(parsed);
}

/**
 * Serialize station metadata to JSON string
 */
export function serializeStation(metadata: StationMetadata): string {
  const validated = StationMetadataSchema.parse(metadata);
  return JSON.stringify(validated, bigIntReplacer);
}

/**
 * Deserialize JSON string to station metadata
 */
export function deserializeStation(json: string): StationMetadata {
  const parsed = JSON.parse(json, bigIntReviver);
  return StationMetadataSchema.parse(parsed);
}

/**
 * Serialize user preferences to JSON string
 */
export function serializePreferences(prefs: UserPreferences): string {
  const validated = UserPreferencesSchema.parse(prefs);
  return JSON.stringify(validated, bigIntReplacer);
}

/**
 * Deserialize JSON string to user preferences
 */
export function deserializePreferences(json: string): UserPreferences {
  const parsed = JSON.parse(json, bigIntReviver);
  return UserPreferencesSchema.parse(parsed);
}

/**
 * Safe JSON parse with fallback (supports BigInt)
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json, bigIntReviver) as T;
  } catch {
    return fallback;
  }
}
