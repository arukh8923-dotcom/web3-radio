'use client';

import { useAccount, useConnect, useDisconnect, type Connector } from 'wagmi';

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-dial-cream/70 text-sm font-dial">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="preset-button text-xs"
        >
          DISCONNECT
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector: Connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="preset-button text-xs"
        >
          {isPending ? 'CONNECTING...' : connector.name.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
