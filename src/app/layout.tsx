import type { Metadata } from 'next';
import { Providers } from './providers';
import { MiniAppInit } from '@/components/MiniAppInit';
import './globals.css';

const baseUrl = 'https://web3-radio-omega.vercel.app';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Web3 Radio',
    description: 'Decentralized radio where every tune, tip, and vibe is on-chain. Tip DJs with RADIO tokens, earn VIBES rewards.',
    icons: {
      icon: `${baseUrl}/icon.svg`,
      apple: `${baseUrl}/icon.svg`,
    },
    openGraph: {
      title: 'Web3 Radio',
      description: 'Decentralized radio where every tune, tip, and vibe is on-chain. Tip DJs with RADIO tokens, earn VIBES rewards.',
      url: baseUrl,
      siteName: 'Web3 Radio',
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Web3 Radio - On-chain radio on Base',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Web3 Radio',
      description: 'Decentralized radio where every tune, tip, and vibe is on-chain. Tip DJs with RADIO tokens, earn VIBES rewards.',
      images: [`${baseUrl}/og-image.png`],
    },
    other: {
      'base:app_id': '6944a5eed19763ca26ddc48e',
      'fc:miniapp': JSON.stringify({
        version: 'next',
        imageUrl: `${baseUrl}/og-image.png`,
        button: {
          title: 'Tune In',
          action: {
            type: 'launch_frame',
            name: 'Web3 Radio',
            url: baseUrl,
            splashImageUrl: `${baseUrl}/splash.svg`,
            splashBackgroundColor: '#1a1410',
          },
        },
      }),
    },
  };
}

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
