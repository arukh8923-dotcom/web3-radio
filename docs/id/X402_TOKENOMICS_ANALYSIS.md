# Analisis Tokenomics Web3 Radio x402

## Informasi Token

### Token $RADIO
- **Contract**: `0xaF0741FB82633a190683c5cFb4b8546123E93B07`
- **Total Supply**: 100.000.000.000 (100B)
- **Creator Vault (Dev)**: 30% = 30.000.000.000 (30B) - unlock setelah 7 hari
- **Liquidity Pool**: 70% = 70.000.000.000 (70B) - terkunci selamanya di Uniswap V4
- **Harga Saat Ini**: ~$0.00000028 (dinamis, diambil dari GeckoTerminal/DexScreener)
- **FDV**: ~$28.000

### Token $VIBES
- **Contract**: `0xCD6387AfA893C1Ad070c9870B5e9C4c0B5D56b07`
- **Total Supply**: 100.000.000.000 (100B)
- **Creator Vault (Dev)**: 30% = 30.000.000.000 (30B) - unlock setelah 7 hari
- **Liquidity Pool**: 70% = 70.000.000.000 (70B) - terkunci selamanya di Uniswap V4
- **Harga Saat Ini**: ~$0.00000028 (dinamis, diambil dari GeckoTerminal/DexScreener)
- **FDV**: ~$28.000

### Sumber Data Harga
Harga diambil secara dinamis dari beberapa sumber dengan fallback:
1. **GeckoTerminal** (utama) - `api.geckoterminal.com`
2. **DexScreener** (cadangan) - `api.dexscreener.com`
3. **Fallback** - $0.0000003 jika semua API gagal

---

## Pricing Dinamis Berbasis USD

Semua harga di Web3 Radio ditetapkan dalam **USD** dan dikonversi ke jumlah token secara dinamis berdasarkan harga pasar saat ini. Ini memastikan:
- Harga konsisten terlepas dari volatilitas token
- Nilai yang adil untuk pengguna
- Pendapatan yang dapat diprediksi untuk DJ dan platform

### API Endpoint
```
GET /api/token/price

Response:
{
  "radio_usd": 0.00000028,
  "vibes_usd": 0.00000028,
  "eth_usd": 3500,
  "source": "geckoterminal",
  "timestamp": 1734567890000
}
```

---

## Analisis Fitur Project

### Fitur Menggunakan $RADIO (Token Utilitas/Pembayaran)
| Fitur | Deskripsi | Harga USD | Jumlah Token (di $0.00000028) |
|-------|-----------|-----------|-------------------------------|
| **Subscription Basic** | Dengar tanpa iklan | $1/bulan | ~3.57M RADIO |
| **Subscription Premium** | Fitur premium | $5/bulan | ~17.86M RADIO |
| **Subscription VIP** | Semua fitur + VIP | $20/bulan | ~71.43M RADIO |
| **Tip Kecil** | Tip kecil ke DJ | $0.10 | ~357K RADIO |
| **Tip Sedang** | Tip sedang | $1 | ~3.57M RADIO |
| **Tip Besar** | Tip besar | $5 | ~17.86M RADIO |
| **Buat Station** | Buat station basic | $5 | ~17.86M RADIO |
| **Frequency NFT** | Mint kepemilikan frequency | $10 | ~35.71M RADIO |
| **Recording NFT** | Mint rekaman | $5 | ~17.86M RADIO |

### Fitur Menggunakan $VIBES (Token Sosial/Reward)
| Fitur | Deskripsi | Setara USD | Jumlah Token |
|-------|-----------|------------|--------------|
| **Smoke Signal 5mnt** | Pesan sementara | $0.05 | ~178K VIBES |
| **Smoke Signal 10mnt** | Pesan lebih lama | $0.10 | ~357K VIBES |
| **Request Line Stake** | Request lagu | $0.20 | ~714K VIBES |
| **Masuk Hotbox** | Akses ruang VIP | $5 saldo | ~17.86M VIBES |
| **Aux Pass Join** | Antrian DJ | $0.50 | ~1.78M VIBES |
| **Mood Reaction** | Kirim reaksi | GRATIS | Dapat 100 VIBES |
| **Bonus Tune-in** | Bonus harian | - | Dapat 1K VIBES |
| **Reward Dengar** | Per 10 menit | - | Dapat 500 VIBES |
| **Golden Hour** | Bonus 4:20 | - | Dapat 5K VIBES |

---

## Kalkulasi Token Bulanan (Rata-rata 100 User/Hari)

### Asumsi
- **User Aktif**: 100/hari rata-rata
- **Durasi Bulan**: 30 hari
- **Total Sesi User**: 3.000/bulan (100 × 30)
- **Rata-rata Sesi**: 30 menit
- **Tingkat Engagement Aktif**: 40% (user yang berinteraksi lebih dari mendengarkan)
- **Harga Token**: $0.00000028 per RADIO/VIBES

---

## Distribusi $VIBES (Rewards - Platform Membayar)

### Reward VIBES Harian Per User (Diperbarui)
| Aktivitas | VIBES/Aksi | Aksi/User/Hari | Total Harian | Nilai USD |
|-----------|------------|----------------|--------------|-----------|
| Bonus Tune-in | 1.000 | 1 | 1.000 | $0.00028 |
| Mendengarkan (per 10 mnt) | 500 | 3 | 1.500 | $0.00042 |
| Kirim Mood/Vibe | 100 | 2 | 200 | $0.000056 |
| Bonus Golden Hour | 5.000 | 0.2 (20% chance) | 1.000 | $0.00028 |
| Unlock Achievement | 10.000 | 0.1 | 1.000 | $0.00028 |
| Bonus Referral | 50.000 | 0.05 | 2.500 | $0.0007 |
| **Total Harian/User** | | | **~7.200 VIBES** | **~$0.002** |

### Pengeluaran VIBES Bulanan (Platform Bayar)
```
Harian: 100 user × 7.200 VIBES = 720.000 VIBES (~$0.20)
Bulanan: 720.000 × 30 = 21.600.000 VIBES (~$6.05)

Dengan buffer 2x untuk event spesial: ~50.000.000 VIBES/bulan (~$14)
```

---

## Konsumsi $VIBES (User Belanja - Platform Terima Kembali)

### Pengeluaran VIBES Harian Per User Aktif (40% engagement)
| Aktivitas | VIBES/Aksi | Aksi/User/Hari | Total Harian | Nilai USD |
|-----------|------------|----------------|--------------|-----------|
| Smoke Signal (5 mnt) | 178.000 | 0.5 | 89.000 | $0.025 |
| Smoke Signal (10 mnt) | 357.000 | 0.2 | 71.400 | $0.02 |
| Stake Request Line | 714.000 | 0.1 | 71.400 | $0.02 |
| Aux Pass Join | 1.780.000 | 0.05 | 89.000 | $0.025 |
| **Total Harian/User Aktif** | | | **~320.800 VIBES** | **~$0.09** |

### Pemasukan VIBES Bulanan (Platform Terima)
```
User aktif: 100 × 40% = 40 user
Harian: 40 user × 320.800 VIBES = 12.832.000 VIBES (~$3.59)
Bulanan: 12.832.000 × 30 = 384.960.000 VIBES (~$107.79)
```

### Arus VIBES Bersih
```
Pengeluaran: 50.000.000 VIBES/bulan (~$14)
Pemasukan:  384.960.000 VIBES/bulan (~$107.79)
Bersih:     +334.960.000 VIBES/bulan (POSITIF - berkelanjutan!)
```

---

## Analisis Arus $RADIO (Pricing Berbasis USD)

### $RADIO TIDAK didistribusikan oleh platform
User harus BELI $RADIO dari pool Uniswap untuk menggunakan fitur.

### Estimasi Penggunaan $RADIO Per User Aktif (Berbasis USD)
| Aktivitas | Harga USD | Jumlah RADIO | Frekuensi/Bulan | USD Bulanan |
|-----------|-----------|--------------|-----------------|-------------|
| Tip DJ (kecil) | $0.10 | ~357K | 5 | $0.50 |
| Tip DJ (sedang) | $1.00 | ~3.57M | 2 | $2.00 |
| Subscription Basic | $1.00 | ~3.57M | 1 | $1.00 |
| Buat Station | $5.00 | ~17.86M | 0.1 | $0.50 |
| **Bulanan/User Aktif** | | | | **~$4.00** |

### Pendapatan $RADIO Platform (Fee)
Jika platform ambil fee 5% dari transaksi:
```
User aktif: 40
Volume bulanan: 40 × $4.00 = $160 USD
Fee platform (5%): $8 USD/bulan
```

---

## Strategi Alokasi Creator Vault 30B

### Alokasi $VIBES (30B Tersedia)
| Tujuan | Alokasi | Jumlah | Durasi |
|--------|---------|--------|--------|
| Pool Reward User | 50% | 15.000.000.000 | ~300 bulan dengan 50M/bulan |
| Insentif DJ | 20% | 6.000.000.000 | Bonus DJ, kompetisi |
| Marketing/Airdrop | 15% | 4.500.000.000 | Kampanye pertumbuhan |
| Tim | 10% | 3.000.000.000 | Vesting 3 tahun |
| Treasury | 5% | 1.500.000.000 | Darurat/kemitraan |

**Dengan burn rate 50M VIBES/bulan, pool reward bertahan 300 bulan (25 tahun)**
Ini SANGAT berkelanjutan!

### Alokasi $RADIO (30B Tersedia)
| Tujuan | Alokasi | Jumlah | Durasi |
|--------|---------|--------|--------|
| Pengembangan Ekosistem | 40% | 12.000.000.000 | Grant, integrasi |
| Tim | 20% | 6.000.000.000 | Vesting 3 tahun |
| Marketing | 20% | 6.000.000.000 | Kemitraan, listing |
| Treasury | 15% | 4.500.000.000 | Operasional |
| Likuiditas Awal | 5% | 1.500.000.000 | Boost likuiditas DEX |

---

## Strategi Integrasi x402

x402 memungkinkan micropayment dalam **USDC** langsung via protokol HTTP 402. Ini menyediakan:
- Harga USD stabil (tanpa volatilitas token)
- Settlement instan di Base
- Tidak perlu popup wallet (server-managed wallets)
- Kompatibel dengan AI agent

### Kasus Penggunaan Micropayment x402 (USDC)
| Fitur | Jumlah Pembayaran | Deskripsi |
|-------|-------------------|-----------|
| Stream Premium | $0.001/menit | Bayar-per-menit konten premium |
| Jam Tanpa Iklan | $0.01/jam | Skip iklan selama 1 jam |
| NFT High-Res | $0.01 | Download gambar NFT resolusi tinggi |
| Download Rekaman | $0.05 | Download rekaman DVR |
| Tip DJ Langsung | $0.10+ | Tip DJ via x402 |
| Konten Eksklusif | $0.50+ | Akses broadcast eksklusif |

### Alur Pendapatan x402
```
Request User → 402 Payment Required → User Sign → CDP Facilitator → USDC ke Penerima

Pembagian Pendapatan:
- Tip DJ: 95% ke DJ, 5% platform
- Konten Premium: 80% ke DJ, 20% platform
- Download NFT: 100% ke platform
```

---

## Ringkasan: Kebutuhan Token 1 Bulan

### $VIBES (Platform Distribusikan)
| Kategori | Jumlah | Nilai USD |
|----------|--------|-----------|
| Reward User | 21.600.000 | ~$6 |
| Bonus DJ | 10.000.000 | ~$2.80 |
| Event Spesial | 18.400.000 | ~$5.15 |
| **Total Bulanan** | **50.000.000 VIBES** | **~$14** |

### $RADIO (Platform Terima sebagai Fee)
| Kategori | Nilai USD |
|----------|-----------|
| Fee Transaksi (5%) | $8 |
| Fee x402 | $2 |
| **Total Pendapatan Bulanan** | **~$10** |

---

## Analisis Keberlanjutan

### Keberlanjutan VIBES
- **Tersedia**: 15B (pool reward)
- **Burn Bulanan**: 50M
- **Runway**: 300 bulan (~25 tahun)
- **Status**: ✅ SANGAT BERKELANJUTAN

### Keberlanjutan RADIO
- **Model**: User beli dari market, platform ambil fee
- **Tidak perlu distribusi platform**
- **Status**: ✅ MANDIRI

---

## Rekomendasi

1. **Mulai Konservatif**: Mulai dengan rate reward rendah, tingkatkan berdasarkan pertumbuhan
2. **Reward Dinamis**: Sesuaikan reward VIBES berdasarkan aktivitas user
3. **Mekanisme Burn**: Pertimbangkan burn sebagian VIBES yang diterima untuk menjaga nilai
4. **Tier Premium x402**: Implementasi bayar-per-menit untuk konten premium
5. **Revenue Share DJ**: 95% ke DJ, 5% fee platform untuk semua transaksi RADIO

---

## Alamat Contract

```typescript
// src/lib/contracts.ts
RADIO_TOKEN: '0xaF0741FB82633a190683c5cFb4b8546123E93B07'
VIBES_TOKEN: '0xCD6387AfA893C1Ad070c9870B5e9C4c0B5D56b07'
```

---

## Konfigurasi Pricing

Lihat `src/hooks/useTokenPrice.ts` untuk konfigurasi pricing berbasis USD:

```typescript
export const USD_PRICING = {
  subscription: { basic: 1, premium: 5, vip: 20 },
  tips: { small: 0.10, medium: 1, large: 5, mega: 10 },
  nft: { frequency_mint: 10, recording_mint: 5 },
  station: { create_basic: 5, create_premium: 20 },
  // ... dll
}
```
