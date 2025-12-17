import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Web3 Radio - Decentralized Radio on Base',
  description: 'Full on-chain radio experience with retro vibes. Tune in, tip DJs, earn $VIBES.',
  openGraph: {
    title: 'Web3 Radio',
    description: 'Decentralized radio on Base mainnet',
    images: ['/og-image.png'],
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
      <body className="bg-cabinet-dark min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
