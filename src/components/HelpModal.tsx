'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Language = 'en' | 'id';

const CONTENT = {
  en: {
    title: 'Welcome to Web3 Radio',
    subtitle: 'Full On-Chain Radio on Base',
    sections: [
      {
        icon: '📻',
        title: 'Tune Stations',
        desc: 'Drag the frequency dial to find stations. Each frequency can have a unique station.',
      },
      {
        icon: '🎚️',
        title: 'Controls',
        desc: 'Adjust Volume, Bass, and Treble knobs. Your settings are saved automatically.',
      },
      {
        icon: '🔢',
        title: 'Presets',
        desc: 'Tap preset buttons (1-6) to load. Hold to save current frequency.',
      },
      {
        icon: '📡',
        title: 'Tune In',
        desc: 'Connect wallet and click "TUNE IN" to join a station as a listener.',
      },
      {
        icon: '💜',
        title: 'Send Vibes',
        desc: 'React with mood emojis to share your vibes with other listeners.',
      },
      {
        icon: '💰',
        title: 'Tip DJs',
        desc: 'Support your favorite DJs with $RADIO tokens.',
      },
      {
        icon: '🌿',
        title: '420 Zone',
        desc: 'Click "420" button for special frequency with unique vibes.',
      },
    ],
    gotIt: 'Got it!',
    dontShow: "Don't show again",
  },
  id: {
    title: 'Selamat Datang di Web3 Radio',
    subtitle: 'Radio On-Chain di Base',
    sections: [
      {
        icon: '📻',
        title: 'Cari Stasiun',
        desc: 'Geser dial frekuensi untuk mencari stasiun. Setiap frekuensi bisa punya stasiun unik.',
      },
      {
        icon: '🎚️',
        title: 'Kontrol',
        desc: 'Atur knob Volume, Bass, dan Treble. Pengaturan tersimpan otomatis.',
      },
      {
        icon: '🔢',
        title: 'Preset',
        desc: 'Tap tombol preset (1-6) untuk load. Tahan untuk simpan frekuensi saat ini.',
      },
      {
        icon: '📡',
        title: 'Tune In',
        desc: 'Hubungkan wallet dan klik "TUNE IN" untuk bergabung sebagai pendengar.',
      },
      {
        icon: '💜',
        title: 'Kirim Vibes',
        desc: 'React dengan emoji mood untuk berbagi vibes dengan pendengar lain.',
      },
      {
        icon: '💰',
        title: 'Tip DJ',
        desc: 'Dukung DJ favorit kamu dengan token $RADIO.',
      },
      {
        icon: '🌿',
        title: 'Zona 420',
        desc: 'Klik tombol "420" untuk frekuensi spesial dengan vibes unik.',
      },
    ],
    gotIt: 'Mengerti!',
    dontShow: 'Jangan tampilkan lagi',
  },
};
