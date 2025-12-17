# 📻 Web3 Radio

Full on-chain radio platform on Base mainnet. A Farcaster Mini App where users can discover stations, listen together, chat, send vibes, and tip DJs with crypto.

**Live Demo:** https://web3-radio-omega.vercel.app/

---

## 🎯 Konsep

Web3 Radio adalah radio online berbasis blockchain dengan tampilan retro klasik. Setiap frekuensi (88.0 - 108.0 FM) bisa memiliki stasiun yang dibuat oleh siapa saja. Pendengar bisa:
- Tune in ke stasiun favorit
- Chat real-time dengan pendengar lain
- Kirim reaksi mood (Vibes)
- Tip DJ dengan token $RADIO
- Simpan preset frekuensi favorit

---

## 🎛️ Panduan UI - Fungsi Setiap Tombol

### Header (Bagian Atas)

| Komponen | Fungsi | Cara Pakai |
|----------|--------|------------|
| **WEB3 RADIO** | Logo/judul app | - |
| **🌐 Language** | Ganti bahasa UI | Klik untuk pilih: EN, ID, 中文, 日本語, 한국어 |
| **? HELP** | Panduan singkat | Klik untuk lihat daftar fitur dan cara pakai |
| **CONNECT ▼** | Hubungkan wallet | Klik → pilih wallet (Coinbase, Farcaster, dll) |

### Bagian Utama Radio

#### 1. Tuning Dial (Slider Frekuensi)
```
◀️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ▶️
   88.0                    108.0 FM
```
- **Fungsi:** Ganti frekuensi radio
- **Cara Pakai:** Geser ke kiri/kanan atau klik posisi tertentu
- **Range:** 88.0 FM - 108.0 FM
- **Catatan:** Setiap frekuensi bisa punya stasiun berbeda. Jika ada stasiun di frekuensi tersebut, nama stasiun akan muncul

#### 2. Nixie Display
```
┌─────────────┐
│   98.5 FM   │
└─────────────┘
```
- **Fungsi:** Menampilkan frekuensi saat ini
- **Format:** XX.X FM

#### 3. Power Light (Lampu Pilot)
```
  🔴 POWER
```
- **Fungsi:** On/Off radio
- **Cara Pakai:** Klik lampu merah untuk toggle
- **Status:** Merah menyala = ON, Redup = OFF
- **Catatan:** Saat OFF, semua kontrol disabled

#### 4. VU Meters
```
  L    R
  ▓    ▓
  ▓    ▓
  ░    ▓
  ░    ░
```
- **Fungsi:** Visualisasi level audio kiri (L) dan kanan (R)
- **Catatan:** Bergerak sesuai volume, diam saat mute

#### 5. Speaker Grille
- **Fungsi:** Dekorasi visual (tampilan speaker klasik)

### Kontrol Bawah

#### 6. Preset Buttons (1-6)
```
┌───┬───┬───┬───┬───┬───┐
│ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │
└───┴───┴───┴───┴───┴───┘
```
- **Fungsi:** Simpan dan load frekuensi favorit
- **Cara Pakai:**
  - **TAP (ketuk cepat):** Load frekuensi yang tersimpan di slot tersebut
  - **HOLD (tahan 2 detik):** Simpan frekuensi saat ini ke slot tersebut
- **Indikator:** Tombol aktif akan highlight (warna berbeda)
- **Catatan:** Preset tersimpan di wallet, sync antar device

#### 7. Volume Knob
```
    VOLUME
      ◉
     ╱ ╲
```
- **Fungsi:** Atur volume suara
- **Cara Pakai:** Drag atas/bawah atau klik dan geser
- **Range:** 0 - 100

#### 8. Bass Knob
```
     BASS
      ◉
     ╱ ╲
```
- **Fungsi:** Atur bass (frekuensi rendah)
- **Cara Pakai:** Drag atas/bawah
- **Range:** 0 - 100
- **Catatan:** Setting tersimpan ke wallet

#### 9. Treble Knob
```
    TREBLE
      ◉
     ╱ ╲
```
- **Fungsi:** Atur treble (frekuensi tinggi)
- **Cara Pakai:** Drag atas/bawah
- **Range:** 0 - 100
- **Catatan:** Setting tersimpan ke wallet

#### 10. Mute Button
```
┌────────┐
│  MUTE  │
└────────┘
```
- **Fungsi:** Matikan suara sementara
- **Cara Pakai:** Klik untuk toggle
- **Status:** Merah = muted, Normal = unmuted
- **Catatan:** Volume tetap tersimpan, hanya suara yang dimatikan

### Panel Now Playing

Muncul saat radio ON, menampilkan info stasiun saat ini:

```
┌─────────────────────────────────────────┐
│ NOW PLAYING              [TIP DJ][TUNE IN]
│ Station Name                            │
│ Station description here...             │
│                                         │
│ 😌  🔥  💜  ✨  🧘    ← Vibes           │
│ ████░░░░░░ 42 reactions                 │
│                                         │
│ 🔴 15 listeners  LIVE    [💬 CHAT]      │
└─────────────────────────────────────────┘
```

#### 11. NOW PLAYING / NO SIGNAL
- **NOW PLAYING:** Ada stasiun di frekuensi ini
- **NO SIGNAL:** Tidak ada stasiun, hanya menampilkan frekuensi

#### 12. TIP DJ Button
```
┌─────────┐
│ TIP DJ  │
└─────────┘
```
- **Fungsi:** Kirim tip token $RADIO ke DJ/pemilik stasiun
- **Cara Pakai:** Klik → pilih jumlah → konfirmasi transaksi
- **Syarat:** Wallet connected, ada stasiun aktif

#### 13. TUNE IN / TUNE OUT Button
```
┌──────────┐
│ TUNE IN  │
└──────────┘
```
- **Fungsi:** Daftarkan diri sebagai pendengar aktif stasiun
- **Cara Pakai:** Klik untuk toggle
- **Status:**
  - TUNE IN (normal): Belum terdaftar sebagai pendengar
  - TUNE OUT (merah): Sudah terdaftar, klik untuk keluar
- **Syarat:** Wallet connected
- **Manfaat:** Terhitung di listener count, bisa dapat rewards

#### 14. Vibes Reactions
```
😌  🔥  💜  ✨  🧘
```
- **Fungsi:** Kirim reaksi mood ke stasiun
- **Emoji & Arti:**
  - 😌 **Chill** - Santai, rileks
  - 🔥 **Hype** - Semangat, excited
  - 💜 **Melancholy** - Dalam perasaan, sedih
  - ✨ **Euphoric** - Bahagia, senang banget
  - 🧘 **Zen** - Damai, fokus, meditatif
- **Cara Pakai:** Klik emoji untuk kirim
- **Syarat:** Wallet connected
- **Catatan:** Bisa dapat $VIBES token untuk berpartisipasi

#### 15. Mood Ring Bar
```
████████░░░░░░░░ 42 reactions
```
- **Fungsi:** Menampilkan mood kolektif pendengar
- **Visual:** Bar warna menunjukkan distribusi mood
- **Counter:** Total reaksi yang dikirim

#### 16. Listener Count
```
🔴 15 listeners  LIVE
```
- **Fungsi:** Menampilkan jumlah pendengar aktif
- **🔴 (pulse):** Indikator real-time
- **LIVE badge:** Muncul jika stasiun sedang live broadcast

#### 17. CHAT Button
```
┌──────────┐
│ 💬 CHAT  │
└──────────┘
```
- **Fungsi:** Buka live chat dengan pendengar lain
- **Cara Pakai:** Klik untuk buka modal chat
- **Fitur Chat:**
  - Real-time messaging
  - Lihat username/wallet pengirim
  - Timestamp setiap pesan
- **Syarat:** Wallet connected untuk kirim pesan (bisa baca tanpa wallet)

### Fitur Khusus: 420 Zone 🌿

Ketika frekuensi di 104.20 FM (atau sekitar 420), UI berubah ke tema khusus:

```
┌─────────────────────────────────────────┐
│ 🌿 SMOKE SIGNALS 🌿                     │
│                                         │
│ "gm frens" - 0x1234...                  │
│ "vibes only" - 0x5678...                │
│                                         │
│ [Send Smoke Signal]                     │
└─────────────────────────────────────────┘
```

- **Smoke Signals:** Pesan ephemeral (hilang setelah beberapa waktu)
- **Tema Visual:** Warna hijau/ungu khusus
- **Special Drops:** Event khusus jam 4:20 PM

---

## 🔧 Arsitektur Teknis

### Tech Stack
- **Frontend:** Next.js 16, React, TypeScript, Tailwind CSS
- **State:** Zustand dengan persist
- **Blockchain:** Base mainnet, wagmi, viem
- **Database:** Supabase (PostgreSQL + Realtime)
- **Auth:** Farcaster Mini App SDK
- **Deployment:** Vercel

### Database Schema (Supabase)

| Table | Fungsi |
|-------|--------|
| `stations` | Data stasiun (frequency, name, owner, dll) |
| `users` | Data user (wallet, farcaster info, preferences) |
| `tune_ins` | Track siapa tune in ke stasiun mana |
| `presets` | Preset frekuensi user (slot 1-6) |
| `tips` | Riwayat tip ke DJ |
| `mood_ring` | Agregasi vibes per stasiun |
| `vibes` | Individual vibe reactions |
| `live_chat` | Pesan chat per stasiun |
| `smoke_signals` | Pesan ephemeral 420 zone |

### API Endpoints

| Endpoint | Method | Fungsi |
|----------|--------|--------|
| `/api/stations` | GET | List semua stasiun |
| `/api/stations` | POST | Buat stasiun baru |
| `/api/stations/[id]` | GET | Detail stasiun |
| `/api/stations/[id]/tune` | POST | Tune in/out |
| `/api/presets` | GET/POST | Manage preset user |
| `/api/tips` | POST | Kirim tip |
| `/api/vibes` | GET/POST | Kirim/lihat vibes |
| `/api/chat` | GET/POST | Live chat |
| `/api/smoke-signals` | GET/POST | 420 zone messages |
| `/api/user/preferences` | GET/POST | EQ settings |

---

## 🚀 Development

### Prerequisites
- Node.js 18+
- pnpm
- Supabase account
- Vercel account (untuk deploy)

### Setup Lokal

```bash
# Clone repo
git clone https://github.com/arukh8923-dotcom/web3-radio.git
cd web3-radio

# Install dependencies
pnpm install

# Copy env example
cp .env.example .env.local

# Edit .env.local dengan credentials Supabase

# Run dev server
pnpm dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 📱 Farcaster Mini App

Web3 Radio adalah Farcaster Mini App. Untuk mengakses:
1. Buka Warpcast
2. Cari "Web3 Radio" atau buka link langsung
3. App akan load dalam Warpcast dengan wallet otomatis connected

### Manifest
File manifest ada di `public/.well-known/farcaster.json`

---

## 🪙 Tokenomics (Planned)

| Token | Fungsi |
|-------|--------|
| **$RADIO** | Governance, tip DJ, create station |
| **$VIBES** | Earned dari reactions, special access |

---

## 📄 License

MIT

---

## 🤝 Contributing

1. Fork repo
2. Create branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Open Pull Request

---

Built with ❤️ on Base
