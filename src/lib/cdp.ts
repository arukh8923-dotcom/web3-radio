/**
 * Coinbase Developer Platform (CDP) Configuration
 * 
 * This module provides utilities for:
 * - CDP RPC endpoint
 * - Paymaster for gas sponsorship
 * - Server-side CDP API calls
 */

// CDP RPC Endpoint (uses Client API Key - public)
export const CDP_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC_URL || 
  'https://api.developer.coinbase.com/rpc/v1/base/Bd7wK6GJCwMkutyz7HSEjBhMUqI2AZig';

// Paymaster URL for gas sponsorship
export const PAYMASTER_URL = process.env.NEXT_PUBLIC_PAYMASTER_URL || CDP_RPC_URL;

// OnchainKit API Key
export const ONCHAINKIT_API_KEY = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || '';

// CDP API credentials (server-side only)
export const CDP_API_KEY_ID = process.env.CDP_API_KEY_ID || '';
export const CDP_API_KEY_SECRET = process.env.CDP_API_KEY_SECRET || '';

// Check if CDP is configured
export function isCDPConfigured(): boolean {
  return !!ONCHAINKIT_API_KEY;
}

// Check if Paymaster is available
export function isPaymasterAvailable(): boolean {
  return !!PAYMASTER_URL && isCDPConfigured();
}

/**
 * Create CDP API headers for server-side requests
 * Uses API Key ID and Secret for authentication
 */
export function createCDPHeaders(): HeadersInit {
  if (!CDP_API_KEY_ID || !CDP_API_KEY_SECRET) {
    throw new Error('CDP API credentials not configured');
  }
  
  return {
    'Content-Type': 'application/json',
    'CB-ACCESS-KEY': CDP_API_KEY_ID,
    'CB-ACCESS-SIGN': CDP_API_KEY_SECRET,
  };
}

/**
 * Paymaster configuration for sponsored transactions
 * Used with wagmi/viem for gasless transactions
 */
export const paymasterConfig = {
  url: PAYMASTER_URL,
  // Policy ID can be configured in CDP dashboard
  // Leave empty to use default policy
  policyId: '',
};

/**
 * Get Paymaster and Data for a transaction
 * This is used to sponsor gas fees for users
 */
export async function getPaymasterData(userOperation: {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
}) {
  if (!isPaymasterAvailable()) {
    throw new Error('Paymaster not available');
  }

  const response = await fetch(PAYMASTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'pm_sponsorUserOperation',
      params: [
        userOperation,
        process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID || '',
      ],
    }),
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message || 'Paymaster error');
  }

  return data.result;
}

/**
 * Check if a transaction can be sponsored
 * Returns true if the transaction is eligible for gas sponsorship
 */
export async function canSponsorTransaction(
  to: string,
  data: string,
  value: string = '0x0'
): Promise<boolean> {
  if (!isPaymasterAvailable()) {
    return false;
  }

  try {
    const response = await fetch(PAYMASTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'pm_validateSponsorshipPolicies',
        params: [
          {
            to,
            data,
            value,
          },
        ],
      }),
    });

    const result = await response.json();
    return !result.error && result.result?.sponsorable === true;
  } catch {
    return false;
  }
}
