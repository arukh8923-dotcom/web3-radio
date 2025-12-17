'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useConnect, useDisconnect, type Connector } from 'wagmi';

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <button className="preset-button text-xs" disabled>
        WALLET
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="preset-button text-xs flex items-center gap-1"
        >
          <span className="w-2 h-2 rounded-full bg-green-500" />
          {address.slice(0, 4)}...{address.slice(-3)}
          <span className="ml-1">▼</span>
        </button>
        
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 bg-cabinet-dark border border-brass rounded-lg shadow-xl z-50 min-w-[160px]">
            <div className="p-3 border-b border-brass/30">
              <p className="text-dial-cream/60 text-xs">Connected</p>
              <p className="text-dial-cream text-sm font-mono">
                {address.slice(0, 8)}...{address.slice(-6)}
              </p>
            </div>
            <button
              onClick={() => {
                disconnect();
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-tuning-red hover:bg-black/30 transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="preset-button text-xs"
        disabled={isPending}
      >
        {isPending ? 'CONNECTING...' : 'CONNECT ▼'}
      </button>
      
      {isOpen && !isPending && (
        <div className="absolute right-0 top-full mt-2 bg-cabinet-dark border border-brass rounded-lg shadow-xl z-50 min-w-[180px]">
          <p className="px-3 py-2 text-dial-cream/60 text-xs border-b border-brass/30">
            Select Wallet
          </p>
          {connectors.map((connector: Connector) => (
            <button
              key={connector.uid}
              onClick={() => {
                connect({ connector });
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-dial-cream hover:bg-black/30 transition-colors flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-brass" />
              {connector.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
