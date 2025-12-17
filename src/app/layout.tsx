import type { Metadata } from 'next';
import { Providers } from './providers';
import { MiniAppInit } from '@/components/MiniAppInit';
import './globals.css';

// Farcaster Mini App embed configuration
const miniAppEmbed = {
  version: '1',
  imageUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://web3-radio-omega.vercel.app'}/og-image.png`,
  button: {
    title: '📻 Open Radio',
    action: {
      type: 'launch_frame',
      name: 'Web3 Radio',
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://web3-radio-omega.vercel.app',
      splashImageUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://web3-radio-omega.vercel.app'}/icon.png`,
      splashBackgroundColor: '#1a1410',
    },
  },
};

export const metadata: Metadata = {
  title: 'Web3 Radio - Decentralized Radio on Base',
  description: 'Full on-chain radio experience with retro vibes. Tune in, tip DJs with $RADIO.',
  openGraph: {
    title: 'Web3 Radio',
    description: 'Decentralized radio on Base mainnet',
    images: ['/og-image.png'],
  },
  other: {
    'fc:miniapp': JSON.stringify(miniAppEmbed),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen transition-colors duration-300">
        <Providers>
          <MiniAppInit />
          {children}
        </Providers>
      </body>
    </html>
  );
}
