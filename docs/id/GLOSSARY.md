# Glosarium Web3 Radio

## Panduan Lengkap Istilah, Fitur & Konsep Crypto

**Versi 1.0 | Desember 2025**

Dokumen ini menjelaskan semua terminologi yang digunakan di mini app Web3 Radio, termasuk konsep crypto, nama fitur, dan fungsinya untuk pengguna dan developer.

---

## Daftar Isi

1. [Konsep Inti](#1-konsep-inti)
2. [Token](#2-token)
3. [Fitur Radio](#3-fitur-radio)
4. [Fitur Sosial](#4-fitur-sosial)
5. [NFT & Koleksi](#5-nft--koleksi)
6. [Istilah Teknis](#6-istilah-teknis)
7. [Istilah Crypto/Web3](#7-istilah-cryptoweb3)
8. [Aksi Pengguna](#8-aksi-pengguna)
9. [Referensi Developer](#9-referensi-developer)

---

## 1. Konsep Inti

### Station (Stasiun)
**Perspektif Pengguna:** Saluran radio di frekuensi tertentu (seperti 98.1 FM) di mana DJ menyiarkan musik atau konten.

**Perspektif Developer:** Entitas database dengan `frequency`, `owner_address`, `stream_url`, dan metadata. Disimpan di tabel Supabase `stations`.

**Konteks Crypto:** Station dibuat dengan membakar token $RADIO. Pemilik station (DJ) menerima tip dan pendapatan langganan.

---

### Frequency (Frekuensi)
**Perspektif Pengguna:** Angka di dial (88.0 - 109.9 FM) yang mengidentifikasi lokasi station.

**Perspektif Developer:** Nilai float yang digunakan sebagai identifier unik untuk station. Disimpan dengan presisi 1 desimal.

**Konteks Crypto:** Range frekuensi berbeda mewakili genre berbeda (Zona Genre), masing-masing dengan pengali hadiah unik.

---

### Tune In / Tune Out
**Perspektif Pengguna:** "Tune In" berarti Anda aktif mendengarkan dan dihitung sebagai pendengar. "Tune Out" berarti Anda berhenti mendengarkan.

**Perspektif Developer:** Panggilan API ke `/api/tune-in` dan `/api/tune-out` yang memperbarui `listener_count` dan melacak sesi mendengarkan.

**Konteks Crypto:** Tune in GRATIS (tidak perlu token). Saat tune in, pengguna mendapat hadiah $VIBES seiring waktu.

---

### Zona Genre
**Perspektif Pengguna:** Bagian berbeda dari dial FM yang didedikasikan untuk genre musik tertentu.

**Perspektif Developer:** Didefinisikan di `src/constants/frequencies.ts` sebagai objek `FREQUENCY_BANDS`.

**Konteks Crypto:** Setiap zona genre memiliki range BPM dan pengali hadiah berbeda.

| Zona | Frekuensi | Genre | Range BPM |
|------|-----------|-------|-----------|
| 88.0-91.9 | Hip-Hop | 85-115 |
| 92.0-95.9 | Electronic | 120-150 |
| 96.0-99.9 | Rock | 100-140 |
| 100.0-103.9 | Jazz | 60-120 |
| 104.0-105.9 | Lo-Fi | 70-90 |
| 106.0-107.9 | Ambient | 60-80 |
| 108.0-109.9 | World | Variabel |

---

### Golden Hour
**Perspektif Pengguna:** Waktu event spesial (6-8 PM setiap hari) ketika hadiah digandakan dan konten eksklusif dirilis.

**Perspektif Developer:** Pengecekan berbasis waktu di `src/constants/frequencies.ts` via fungsi `isGoldenHour()`.

**Konteks Crypto:** Pengali 2x $VIBES selama Golden Hour. Drop komunitas dan event spesial.

---

## 2. Token

### $RADIO
**Perspektif Pengguna:** Token utama untuk governance dan nilai. Digunakan untuk tip, langganan, dan membuat station.

**Perspektif Developer:** Token ERC-20 di Base. Alamat kontrak di `src/constants/addresses.ts`.

**Konteks Crypto:**
- **Total Suplai:** 100B (tetap via Clanker)
- **Kegunaan:** Tip, Langganan, Pembuatan Station, Governance
- **Cara Mendapat:** Beli di DEX (Uniswap V4)
- **Mekanisme Bakar:** Pembuatan station membakar $RADIO

---

### $VIBES
**Perspektif Pengguna:** Token sosial yang didapat melalui aktivitas. Digunakan untuk fitur sosial seperti Smoke Signal dan Request Line.

**Perspektif Developer:** Token ERC-20 di Base. Kontrak wrapper menangani logika earning/spending.

**Konteks Crypto:**
- **Total Suplai:** 100B (tetap via Clanker)
- **Kegunaan:** Smoke Signal, Request Line, Mood Boost, Fitur Kustom
- **Cara Mendapat:** Dapatkan melalui mendengarkan, reaksi, achievement
- **Mekanisme Bakar:** Fitur sosial membakar $VIBES (deflasi)

---

### Creator Vault
**Perspektif Pengguna:** Cadangan token project yang digunakan untuk hadiah dan pengembangan.

**Perspektif Developer:** Kontrak vault Clanker yang menyimpan 30% dari total suplai dengan jadwal vesting.

**Konteks Crypto:**
- **Jumlah:** 30B token (30% dari suplai)
- **Lockup:** Minimum 7 hari
- **Vesting:** Rilis linear 180 hari
- **Tujuan:** Hadiah komunitas, hadiah DJ, tim, treasury

---

### Liquidity Pool (LP) / Pool Likuiditas
**Perspektif Pengguna:** Tempat Anda bisa beli/jual token di DEX.

**Perspektif Developer:** Pool Uniswap V4 yang dibuat otomatis oleh Clanker.

**Konteks Crypto:**
- **Jumlah:** 70B token (70% dari suplai)
- **Status:** Terkunci selamanya (tidak mungkin rug pull)
- **Trading:** Dipasangkan dengan WETH untuk trading

---

## 3. Fitur Radio

### Tombol Preset (1-6)
**Perspektif Pengguna:** Simpan station favorit Anda. Ketuk untuk memuat, tahan lama untuk menyimpan frekuensi saat ini.

**Perspektif Developer:** Disimpan di tabel Supabase `presets`, terhubung ke alamat wallet. Maksimal 6 preset per pengguna.

**Konteks Crypto:** Tidak ada biaya token. Preset tersinkron antar perangkat saat wallet terhubung.

---

### Dial Tuning
**Perspektif Pengguna:** Kontrol utama untuk mengubah frekuensi. Geser kiri/kanan untuk menemukan station.

**Perspektif Developer:** Komponen React di `src/components/radio/FrequencyDial.tsx`. Memperbarui state `frequency` di hook `useRadio`.

**Konteks Crypto:** Tidak ada biaya token untuk tuning. Menemukan station gratis.

---

### Auto Scan
**Perspektif Pengguna:** Otomatis memindai frekuensi untuk menemukan station aktif.

**Perspektif Developer:** Komponen di `src/components/radio/AutoScan.tsx`. Query API untuk station dalam range frekuensi.

**Konteks Crypto:** Tidak ada biaya token. Membantu pengguna menemukan station baru.

---

### Band Selector
**Perspektif Pengguna:** Filter station berdasarkan genre/kategori.

**Perspektif Developer:** Komponen di `src/components/radio/BandSelector.tsx`. Memfilter konstanta `FREQUENCY_BANDS`.

**Konteks Crypto:** Tidak ada biaya token. Band berbeda mungkin memiliki pengali hadiah berbeda.

---

### VU Meter
**Perspektif Pengguna:** Indikator visual yang menunjukkan level audio (channel L/R).

**Perspektif Developer:** Komponen di `src/components/radio/VUMeter.tsx`. Animasi berdasarkan state volume.

**Konteks Crypto:** Murni visual, tidak ada interaksi token.

---

### Nixie Display
**Perspektif Pengguna:** Tampilan bergaya retro yang menunjukkan frekuensi saat ini.

**Perspektif Developer:** Komponen di `src/components/radio/NixieDisplay.tsx`. Tampilan numerik dengan styling CSS.

**Konteks Crypto:** Murni visual, tidak ada interaksi token.

---

### Sleep Timer
**Perspektif Pengguna:** Otomatis mematikan radio setelah waktu yang ditentukan.

**Perspektif Developer:** Komponen di `src/components/radio/SleepTimer.tsx`. Menggunakan `setTimeout` untuk memicu power off.

**Konteks Crypto:** Tidak ada biaya token. Berguna untuk mendengarkan sebelum tidur.

---

### Alarm Clock
**Perspektif Pengguna:** Bangun dengan station favorit Anda pada waktu yang ditentukan.

**Perspektif Developer:** Komponen di `src/components/radio/AlarmClock.tsx`. Menggunakan notifikasi browser dan audio.

**Konteks Crypto:** Tidak ada biaya token.

---

## 4. Fitur Sosial

### Mood Ring
**Perspektif Pengguna:** Menunjukkan mood/vibe kolektif semua pendengar di station. Bereaksi untuk berkontribusi pada mood.

**Perspektif Developer:** 
- Tipe di `src/types/vibes.ts` (`MoodRing`, enum `Mood`)
- Komponen di `src/components/radio/MoodRingDisplay.tsx`
- Endpoint API `/api/mood-ring`

**Konteks Crypto:**
- **Biaya:** GRATIS untuk melihat, dapat 5 $VIBES per reaksi
- **Mood:** CHILL, HYPE, MELANCHOLY, EUPHORIC, ZEN
- **Bonus:** +3 $VIBES untuk mencocokkan mood station

---

### Smoke Signal
**Perspektif Pengguna:** Kirim pesan sementara yang menghilang setelah waktu tertentu. Seperti siaran ephemeral ke semua pendengar.

**Perspektif Developer:**
- Tipe di `src/types/vibes.ts` (`SmokeSignal`)
- Komponen di `src/components/radio/SmokeSignals.tsx`
- Pesan disimpan dengan `expiryTime` dan otomatis dihapus

**Konteks Crypto:**
- **Biaya:** 10-100 $VIBES tergantung durasi
- **Bakar:** 100% biaya dibakar (deflasi)
- **Durasi:** 5 menit, 15 menit, 1 jam, 4 jam

---

### Request Line
**Perspektif Pengguna:** Request lagu atau konten dari DJ. Stake $VIBES untuk menunjukkan keseriusan.

**Perspektif Developer:**
- Tipe di `src/types/vibes.ts` (`SongRequest`)
- Komponen di `src/components/radio/RequestLine.tsx`
- Stake ditahan di escrow sampai dipenuhi atau kedaluwarsa

**Konteks Crypto:**
- **Stake:** 50 $VIBES (dapat dikembalikan jika dipenuhi)
- **Boost Prioritas:** +25 $VIBES (dibakar)
- **Kedaluwarsa:** 50% dibakar, 50% dikembalikan

---

### Live Chat
**Perspektif Pengguna:** Chat real-time dengan pendengar lain di station yang sama.

**Perspektif Developer:**
- Komponen di `src/components/radio/LiveChat.tsx`
- Menggunakan Supabase Realtime untuk update langsung
- Pesan disimpan di tabel `chat_messages`

**Konteks Crypto:**
- **Biaya:** GRATIS untuk chat
- **Earning:** Achievement 500 $VIBES untuk 100 pesan

---

### Backstage Room (sebelumnya Hotbox)
**Perspektif Pengguna:** Ruang privat dengan token-gate untuk pendengar VIP. Tahan minimum $VIBES untuk akses.

**Perspektif Developer:**
- Tipe di `src/types/vibes.ts` (`BackstageRoom`)
- Komponen di `src/components/radio/HotboxRoom.tsx`
- Pengecekan saldo token via panggilan kontrak

**Konteks Crypto:**
- **Akses:** Tahan 100-1000 $VIBES (tidak dibelanjakan, hanya ditahan)
- **Tier:** Publik (100), Premium (500), VIP (1000)
- **Event Eksklusif:** Mungkin memerlukan biaya masuk

---

### Aux Pass
**Perspektif Pengguna:** Sistem antrian untuk menjadi DJ tamu. Ambil kontrol station sementara.

**Perspektif Developer:**
- Tipe di `src/types/vibes.ts` (`AuxPassQueue`)
- Komponen di `src/components/radio/AuxPass.tsx`
- Antrian dikelola di database dengan timer sesi

**Konteks Crypto:**
- **Gabung Antrian:** GRATIS
- **Lewati Posisi:** 50 $VIBES
- **Lewati ke Depan:** 200 $VIBES
- **Perpanjang Sesi:** 100 $VIBES per 5 menit

---

### Community Drops
**Perspektif Pengguna:** Airdrop acak $VIBES ke pendengar aktif. Harus tune in untuk eligible!

**Perspektif Developer:**
- Tipe di `src/types/vibes.ts` (`CommunityDrop`)
- Komponen di `src/components/radio/CommunityDrops.tsx`
- Menggunakan Chainlink VRF untuk pemilihan acak

**Konteks Crypto:**
- **Eligibilitas:** Harus tune in
- **Hadiah:** 50-200 $VIBES per drop
- **Frekuensi:** Mingguan + event spesial

---

### Sistem Referral
**Perspektif Pengguna:** Undang teman dengan kode unik Anda. Keduanya dapat $VIBES saat mereka bergabung.

**Perspektif Developer:**
- Komponen di `src/components/radio/ReferralSystem.tsx`
- Kode dihasilkan dari alamat wallet
- Dilacak di tabel `referrals`

**Konteks Crypto:**
- **Anda Dapat:** 50 $VIBES per referral
- **Teman Dapat:** 50 $VIBES bonus
- **Milestone:** 1000 $VIBES untuk 10 referral

---

## 5. NFT & Koleksi

### Session NFT
**Perspektif Pengguna:** NFT bukti kehadiran untuk sesi DJ spesial. Koleksi yang membuktikan Anda hadir.

**Perspektif Developer:**
- Tipe di `src/types/vibes.ts` (`SessionNFT`, `SessionMetadata`)
- Komponen di `src/components/radio/SessionNFT.tsx`
- Kontrak ERC-721 di Base

**Konteks Crypto:**
- **Minting:** Otomatis untuk peserta sesi
- **Metadata:** Station, DJ, waktu, jumlah peserta
- **Achievement:** 1000 $VIBES untuk mengoleksi 5 NFT

---

### Achievement
**Perspektif Pengguna:** Badge dan hadiah untuk menyelesaikan milestone. Bonus $VIBES satu kali.

**Perspektif Developer:**
- Komponen di `src/components/radio/ListenerAchievements.tsx`
- Disimpan di tabel Supabase `achievements`
- Dicek via API pada aksi yang relevan

**Konteks Crypto:**
| Achievement | Persyaratan | Hadiah |
|-------------|-------------|--------|
| Tune Pertama | Tune-in pertama | 88 $VIBES |
| Pendengar Reguler | Streak 7 hari | 108 $VIBES |
| Penggemar Setia | Streak 30 hari | 1000 $VIBES |
| Master Mood | Gunakan semua 5 mood | 250 $VIBES |
| Kupu-kupu Sosial | 100 pesan chat | 500 $VIBES |

---

## 6. Istilah Teknis

### Supabase
**Perspektif Pengguna:** (Tidak terlihat oleh pengguna)

**Perspektif Developer:** Backend-as-a-Service yang menyediakan database PostgreSQL, autentikasi, dan subscription realtime. Digunakan untuk semua penyimpanan data.

**Konteks Crypto:** Penyimpanan data off-chain. Data on-chain disinkronkan via indexer.

---

### Subgraph
**Perspektif Pengguna:** (Tidak terlihat oleh pengguna)

**Perspektif Developer:** Indexer protokol The Graph untuk data blockchain. Didefinisikan di folder `subgraph/`. Mengindeks pembuatan station, tip, langganan.

**Konteks Crypto:** Memungkinkan query efisien event on-chain tanpa panggilan RPC langsung.

---

### Wagmi / Viem
**Perspektif Pengguna:** (Tidak terlihat oleh pengguna)

**Perspektif Developer:** Library React hooks (Wagmi) dan library TypeScript Ethereum (Viem) untuk koneksi wallet dan interaksi kontrak.

**Konteks Crypto:** Menangani semua koneksi wallet, penandatanganan transaksi, dan panggilan kontrak.

---

### Base (Network)
**Perspektif Pengguna:** Jaringan blockchain tempat Web3 Radio beroperasi. Biaya rendah, transaksi cepat.

**Perspektif Developer:** Ethereum L2 oleh Coinbase. Chain ID: 8453. RPC di environment variables.

**Konteks Crypto:**
- **Biaya Gas:** Sangat rendah (~$0.001 per transaksi)
- **Kecepatan:** ~2 detik waktu blok
- **Bridge:** bridge.base.org untuk deposit ETH

---

## 7. Istilah Crypto/Web3

### Wallet
**Perspektif Pengguna:** Identitas digital dan penyimpanan token Anda. Hubungkan untuk akses semua fitur.

**Perspektif Developer:** Alamat Ethereum. Didukung: Coinbase Wallet, MetaMask, WalletConnect, Farcaster.

**Konteks Crypto:** Diperlukan untuk tip, langganan, earning $VIBES. Tidak diperlukan untuk mendengarkan dasar.

---

### Gas Fees (Biaya Gas)
**Perspektif Pengguna:** Biaya transaksi kecil yang dibayar ke jaringan. Sangat murah di Base.

**Perspektif Developer:** Diestimasi via Viem, dibayar dalam ETH. Biasanya <$0.01 di Base.

**Konteks Crypto:** Pengguna membayar gas untuk: tip, langganan, pembuatan station, minting NFT.

---

### DEX (Decentralized Exchange)
**Perspektif Pengguna:** Tempat Anda bisa beli/jual token $RADIO dan $VIBES.

**Perspektif Developer:** Uniswap V4 di Base. Alamat pool di konstanta.

**Konteks Crypto:** Tidak perlu KYC. Trading langsung dari wallet.

---

### Clanker
**Perspektif Pengguna:** Platform yang men-deploy token kita dengan likuiditas bawaan.

**Perspektif Developer:** Token factory di Base. Membuat ERC-20 dengan pool Uniswap V4.

**Konteks Crypto:**
- **Suplai Tetap:** 100B token (tidak bisa diubah)
- **LP Terkunci:** Selamanya (tidak mungkin rug pull)
- **Creator Vault:** 30% dengan vesting

---

### Vesting
**Perspektif Pengguna:** Token dirilis bertahap seiring waktu, tidak sekaligus.

**Perspektif Developer:** Rilis linear dari kontrak vault Clanker selama 180 hari.

**Konteks Crypto:** Mencegah tim dumping token. Membangun kepercayaan.

---

### Burn (Bakar)
**Perspektif Pengguna:** Token dihancurkan secara permanen, mengurangi total suplai.

**Perspektif Developer:** Panggilan ke fungsi `burn()` pada kontrak token.

**Konteks Crypto:** Mekanisme deflasi. Smoke Signal, request gagal membakar $VIBES.

---

### Farcaster
**Perspektif Pengguna:** Jaringan sosial terdesentralisasi. Hubungkan untuk identitas terverifikasi dan bonus hadiah.

**Perspektif Developer:** Integrasi via Farcaster Auth Kit. FID disimpan di profil pengguna.

**Konteks Crypto:** Pengguna Farcaster terverifikasi dapat hadiah 1.5x $VIBES.

---

## 8. Aksi Pengguna

### Tip DJ
**Aksi:** Kirim token $RADIO langsung ke DJ sebagai apresiasi.

**Biaya:** Variabel (pengguna pilih jumlah)

**Token:** $RADIO

**Alur:** Pengguna → Wallet DJ (100% ke DJ)

---

### Subscribe (Berlangganan)
**Aksi:** Langganan bulanan ke station untuk benefit premium.

**Biaya:** 100-500 $RADIO/bulan tergantung tier

**Token:** $RADIO

**Benefit:** Chat prioritas, konten eksklusif, badge

---

### Create Station (Buat Station)
**Aksi:** Luncurkan station radio Anda sendiri di frekuensi yang tersedia.

**Biaya:** 1000 $RADIO (dibakar)

**Token:** $RADIO

**Hasil:** Anda menjadi DJ, bisa broadcast, terima tip

---

### Send Reaction (Kirim Reaksi)
**Aksi:** Ekspresikan mood Anda dan berkontribusi ke Mood Ring station.

**Biaya:** GRATIS (dapat 5 $VIBES)

**Token:** $VIBES (didapat)

**Batas:** 20 reaksi per hari

---

### Send Smoke Signal
**Aksi:** Broadcast pesan sementara ke semua pendengar station.

**Biaya:** 10-100 $VIBES (dibakar)

**Token:** $VIBES

**Durasi:** 5 menit sampai 4 jam

---

### Request Song (Request Lagu)
**Aksi:** Request konten dari DJ dengan stake $VIBES.

**Biaya:** 50 $VIBES stake (dapat dikembalikan jika dipenuhi)

**Token:** $VIBES

**Hasil:** Dipenuhi = stake dikembalikan, Kedaluwarsa = 50% dibakar

---

## 9. Referensi Developer

### File Kunci

| File | Tujuan |
|------|--------|
| `src/hooks/useRadio.ts` | Manajemen state radio utama (Zustand) |
| `src/constants/frequencies.ts` | Band frekuensi, pengali BPM |
| `src/types/vibes.ts` | Tipe TypeScript untuk fitur $VIBES |
| `src/lib/api.ts` | Fungsi client API |
| `src/lib/contracts.ts` | ABI dan alamat kontrak |
| `src/constants/addresses.ts` | Alamat kontrak per jaringan |

### Endpoint API

| Endpoint | Method | Tujuan |
|----------|--------|--------|
| `/api/stations` | GET | Daftar semua station |
| `/api/stations/[freq]` | GET | Dapatkan station berdasarkan frekuensi |
| `/api/tune-in` | POST | Daftarkan pendengar |
| `/api/tune-out` | POST | Batalkan pendaftaran pendengar |
| `/api/presets` | GET/POST | Preset pengguna |
| `/api/mood-ring` | GET/POST | Data mood station |
| `/api/achievements` | GET | Achievement pengguna |
| `/api/referrals` | GET/POST | Sistem referral |

### Tabel Database (Supabase)

| Tabel | Tujuan |
|-------|--------|
| `stations` | Data station radio |
| `presets` | Preset tersimpan pengguna |
| `listening_sessions` | Lacak tune-in/out |
| `chat_messages` | Pesan live chat |
| `achievements` | Achievement pengguna |
| `subscriptions` | Langganan station |
| `referrals` | Pelacakan referral |

### Smart Contract

| Kontrak | Tujuan |
|---------|--------|
| `RadioToken` | $RADIO ERC-20 |
| `VibesToken` | $VIBES ERC-20 |
| `RadioCoreRegistry` | Registry station |
| `VibesWrapper` | Logika earning/spending $VIBES |

---

## Kartu Referensi Cepat

### Untuk Pengguna

| Saya ingin... | Biaya | Token |
|---------------|-------|-------|
| Dengarkan radio | GRATIS | - |
| Simpan preset | GRATIS | - |
| Chat dengan pendengar | GRATIS | - |
| Kirim reaksi mood | GRATIS (dapat 5) | $VIBES |
| Tip DJ | Variabel | $RADIO |
| Berlangganan station | 100-500/bulan | $RADIO |
| Kirim Smoke Signal | 10-100 | $VIBES |
| Request lagu | 50 stake | $VIBES |
| Buat station | 1000 (dibakar) | $RADIO |

### Untuk Developer

| Fitur | Hook/Komponen | API |
|-------|---------------|-----|
| State radio | `useRadio` | - |
| Saldo token | `useTokenBalances` | - |
| Wallet | `useAccount` (wagmi) | - |
| Station | `RadioCabinet` | `/api/stations` |
| Chat | `LiveChat` | Supabase Realtime |
| Mood Ring | `MoodRingDisplay` | `/api/mood-ring` |

---

**Terakhir Diperbarui:** Desember 2025
