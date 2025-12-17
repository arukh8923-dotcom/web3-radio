'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useConnect, useDisconnect, type Connector } from 'wagmi';
import Image from 'next/image';

interface FarcasterProfile {
  fid: number | null;
  username: string | null;
  pfp: string | null;
  displayName?: string;
}

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [fcProfile, setFcProfile] = useState<FarcasterProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Farcaster profile when wallet connects
  useEffect(() => {
    if (!address) {
      setFcProfile(null);
      return;
    }

    async function fetchProfile() {
      setLoadingProfile(true);
      try {
        const res = await fetch(`/api/farcaster?address=${address}`);
        const data = await res.json();
        setFcProfile(data);
      } catch (error) {
        console.error('Failed to fetch Farcaster profile:', error);
      }
      setLoadingProfile(false);
    }
    fetchProfile();
  }, [address]);

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
    const displayName = fcProfile?.username 
      ? `@${fcProfile.username}` 
      : `${address.slice(0, 4)}...${address.slice(-3)}`;

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="preset-button text-xs flex items-center gap-2"
        >
          {fcProfile?.pfp ? (
            <Image
              src={fcProfile.pfp}
              alt="PFP"
              width={20}
              height={20}
              className="rounded-full"
            />
          ) : (
            <span className="w-2 h-2 rounded-full bg-green-500" />
          )}
          {loadingProfile ? '...' : displayName}
          <span>▼</span>
        </button>
        
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 bg-cabinet-dark border border-brass rounded-lg shadow-xl z-50 min-w-[200px]">
            <div className="p-3 border-b border-brass/30">
              <div className="flex items-center gap-3">
                {fcProfile?.pfp ? (
                  <Image
                    src={fcProfile.pfp}
                    alt="PFP"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brass/30 flex items-center justify-center">
                    <span className="text-brass">?</span>
                  </div>
                )}
                <div>
                  {fcProfile?.username ? (
                    <>
                      <p className="text-dial-cream font-dial">@{fcProfile.username}</p>
                      <p className="text-dial-cream/50 text-xs">FID: {fcProfile.fid}</p>
                    </>
                  ) : (
                    <p className="text-dial-cream/60 text-xs">No Farcaster linked</p>
                  )}
                </div>
              </div>
              <p className="text-dial-cream/40 text-xs mt-2 font-mono">
                {address.slice(0, 10)}...{address.slice(-8)}
              </p>
            </div>
            <button
              onClick={() => {
                disconnect();
                setIsOpen(false);
                setFcProfile(null);
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
