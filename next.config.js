/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ipfs.io' },
      { protocol: 'https', hostname: 'gateway.pinata.cloud' },
    ],
  },
  // Enable Turbopack for Next.js 16
  turbopack: {},
  // Webpack config for fallback (used when not using Turbopack)
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false,
      crypto: false,
    };
    config.externals.push(
      'pino-pretty', 
      'lokijs', 
      'encoding',
      '@react-native-async-storage/async-storage'
    );
    return config;
  },
};

module.exports = nextConfig;
