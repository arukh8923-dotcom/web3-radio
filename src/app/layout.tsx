import type { Metadata } from 'next';
import { Providers } from './providers';
import { MiniAppInit } from '@/components/MiniAppInit';
import './globals.css';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://web3-radio-omega.vercel.app';

// Farcaster Mini App embed configuration
const miniAppEmbed = {
  version: '1',
  imageUrl: `${APP_URL}/og-image.png`,
  button: {
    title: '📻 Open Radio',
    action: {
      type: 'launch_frame',
      name: 'Web3 Radio',
      url: APP_URL,
      splashImageUrl: `${APP_URL}/icon.png`,
      splashBackgroundColor: '#1a1410',
    },
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: 'Web3 Radio - Decentralized Radio on Base',
  description: 'Full on-chain radio experience with retro vibes. Tune in, tip DJs with $RADIO.',
  openGraph: {
    title: 'Web3 Radio',
    description: 'Decentralized radio on Base mainnet',
    url: APP_URL,
    siteName: 'Web3 Radio',
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Web3 Radio - Decentralized Radio on Base',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Radio',
    description: 'Decentralized radio on Base mainnet',
    images: [`${APP_URL}/og-image.png`],
  },
  other: {
    'fc:miniapp': JSON.stringify(miniAppEmbed),
    'base:app_id': '6944a5eed19763ca26ddc48e',
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
