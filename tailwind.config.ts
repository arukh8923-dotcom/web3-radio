import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Retro Radio Color Palette
        'cabinet-wood': '#5D4037',
        'cabinet-dark': '#4E342E',
        'cabinet-light': '#6D4C41',
        'bakelite': '#2C1810',
        'brass': '#D4AF37',
        'dial-cream': '#F5E6D3',
        'dial-amber': '#FFB347',
        'dial-dark': '#3E2723',
        'nixie-orange': '#FF6D00',
        'nixie-glow': '#FF8C42',
        'pilot-amber': '#FFB300',
        'tuning-red': '#FF4444',
        'vu-green': '#39FF14',
        'vu-yellow': '#FFD700',
        'vu-red': '#FF4444',
        'chrome': '#C0C0C0',
        'grille-fabric': '#3D3D3D',
        // 420 Zone Colors
        'zone-420': '#7B1FA2',
        'zone-420-light': '#AB47BC',
        'zone-green': '#27AE60',
        'zone-purple': '#9B59B6',
        'lava-pink': '#FF69B4',
        'lava-orange': '#FF8C00',
        // Mood Colors
        'chill': '#4FC3F7',
        'hype': '#FF5722',
        'melancholy': '#7E57C2',
        'euphoric': '#FFD54F',
        'zen': '#81C784',
      },
      fontFamily: {
        'dial': ['Courier New', 'monospace'],
        'nixie': ['Courier New', 'monospace'],
        'retro': ['Georgia', 'serif'],
      },
      boxShadow: {
        'cabinet': 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.4)',
        'knob': '0 4px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        'nixie-glow': '0 0 10px #FF6D00, 0 0 20px #FF8C42',
        'pilot-glow': '0 0 8px #FFB300, 0 0 16px #FFD700',
      },
      animation: {
        'nixie-flicker': 'flicker 0.1s infinite',
        'pilot-pulse': 'pulse 2s ease-in-out infinite',
        'vu-bounce': 'bounce 0.3s ease-out',
        'dial-glow': 'glow 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.95' },
        },
        glow: {
          '0%': { filter: 'brightness(1)' },
          '100%': { filter: 'brightness(1.2)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
