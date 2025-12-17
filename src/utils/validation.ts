import { isAddress } from 'viem';
import { FREQUENCY_BANDS } from '../constants/frequencies';

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return isAddress(address);
}

/**
 * Validate frequency is within valid range
 */
export function isValidFrequency(frequency: number): boolean {
  // Check all bands
  for (const band of Object.values(FREQUENCY_BANDS)) {
    if (frequency >= band.min && frequency <= band.max) {
      return true;
    }
  }
  return false;
}

/**
 * Validate station name
 */
export function isValidStationName(name: string): boolean {
  return name.length >= 1 && name.length <= 100;
}

/**
 * Validate broadcast title
 */
export function isValidBroadcastTitle(title: string): boolean {
  return title.length >= 1 && title.length <= 200;
}

/**
 * Validate equalizer value (0-100)
 */
export function isValidEqualizerValue(value: number): boolean {
  return value >= 0 && value <= 100 && Number.isInteger(value);
}

/**
 * Validate preset number (1-6)
 */
export function isValidPresetNumber(num: number): boolean {
  return num >= 1 && num <= 6 && Number.isInteger(num);
}

/**
 * Validate smoke signal message
 */
export function isValidSmokeSignal(message: string): boolean {
  return message.length >= 1 && message.length <= 280; // Twitter-like limit
}

/**
 * Validate content hash (bytes32)
 */
export function isValidContentHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Validate IPFS hash
 */
export function isValidIpfsHash(hash: string): boolean {
  // CIDv0 or CIDv1
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash) || 
         /^b[a-z2-7]{58}$/.test(hash);
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .slice(0, 1000); // Limit length
}
