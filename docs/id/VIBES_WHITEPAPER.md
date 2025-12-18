# Whitepaper Token $VIBES

## Token Sosial & Engagement Web3 Radio

**Versi 1.1 | Desember 2025**

---

## Ringkasan Eksekutif

$VIBES adalah token sosial dan engagement untuk ekosistem Web3 Radio. Berbeda dengan $RADIO yang berfokus pada governance dan utilitas, $VIBES dirancang untuk mendorong engagement, interaksi sosial, dan pembangunan komunitas musik. Token ini dapat diperoleh melalui aktivitas dan dibelanjakan untuk fitur sosial.

---

## 1. Pendahuluan

### 1.1 Visi

$VIBES menciptakan ekonomi sosial di mana engagement dihargai dan komunitas dapat berinteraksi dengan cara yang menyenangkan dan bermakna. Terinspirasi dari kultur musik dan bahasa universal beat, $VIBES membawa elemen komunitas, pengalaman bersama, dan ikatan sosial ke dalam Web3 Radio.

### 1.2 Mengapa $VIBES?

Web3 Radio membutuhkan sistem dual-token karena:

| Aspek | $RADIO | $VIBES |
|-------|--------|--------|
| **Tujuan** | Governance & Nilai | Sosial & Engagement |
| **Cara Mendapat** | Beli di DEX | Distribusi dari Creator Vault |
| **Suplai** | Tetap 100B | Tetap 100B |
| **Target Pengguna** | Investor, DJ | Pendengar Aktif |
| **Pengeluaran** | Langganan, Tip | Fitur Sosial |

### 1.3 Integrasi Tema Musik/Beat

$VIBES mengintegrasikan kultur musik dengan:
- Pengali hadiah berbasis BPM
- Zona genre di seluruh dial FM
- Event Golden Hour (jam puncak mendengarkan)
- Sistem Mood Ring untuk vibe kolektif
- Penemuan musik berbasis komunitas

---

## 2. Gambaran Token

### 2.1 Informasi Dasar

| Parameter | Nilai |
|-----------|-------|
| **Nama Token** | Radio Vibes |
| **Simbol** | VIBES |
| **Jaringan** | Base Mainnet |
| **Standar Token** | ERC-20 |
| **Desimal** | 18 |
| **Total Suplai** | 100.000.000.000 VIBES (100B) |
| **Tipe Suplai** | Tetap (Non-mintable, Burnable) |

### 2.2 Deployment via Clanker

$VIBES akan di-deploy menggunakan **Clanker** (clanker.world), token deployer native Farcaster di Base.

**Apa itu Clanker?**
Clanker adalah platform deployment token yang membuat token ERC-20 dengan likuiditas bawaan di Uniswap V4. Semua token Clanker memiliki suplai tetap 100 miliar token yang tidak bisa diubah atau di-mint setelah deployment.

**Karakteristik Token Clanker:**
- **Suplai Tetap:** 100.000.000.000 token (tidak bisa diubah)
- **Non-mintable:** Tidak ada token baru yang bisa dibuat setelah deployment
- **Burnable:** Token bisa dibakar via fungsi `burn()`
- **Likuiditas Terkunci:** LP NFT terkunci selamanya di Clanker LP Locker (tidak ada fungsi withdraw)

**Konfigurasi Clanker:**

| Fitur | Konfigurasi |
|-------|-------------|
| **Jaringan** | Base Mainnet |
| **Tipe Pool** | Recommended (10 ETH starting mcap) |
| **Fee** | Recommended (Dynamic) |
| **Quote Token** | WETH |
| **Reward Type** | Both (WETH + VIBES) |
| **Creator Rewards** | 100% LP fees |

**Konfigurasi Creator Vault:**

| Parameter | Nilai |
|-----------|-------|
| **Vault Percentage** | 30% (30B token) |
| **Lockup Period** | 7 hari (minimum) |
| **Vesting Period** | 180 hari (linear) |

**Distribusi Token saat TGE:**

| Alokasi | Jumlah | Pemegang | Status |
|---------|--------|----------|--------|
| **Liquidity Pool** | 70B (70%) | Uniswap V4 Pool | Terkunci selamanya untuk trading |
| **Creator Vault** | 30B (30%) | Clanker Vault Contract → Tim | Dapat diklaim setelah vesting |

**Catatan Penting:**
- 70B di Liquidity Pool **bukan milik siapa-siapa** - menyediakan likuiditas pasar dan terkunci selamanya
- 30B di Creator Vault **milik tim project** tapi terkunci di vault contract Clanker sampai vesting selesai
- Tim harus **klaim** token dari vault (tidak otomatis dikirim ke wallet)
- Creator mendapat **100% LP trading fees** sebagai passive income

**Integrasi Tema Musik:**

Meskipun suplai tetap 100B dari Clanker tidak bisa dikustomisasi, tema musik terintegrasi mendalam ke dalam $VIBES melalui:

| Elemen | Integrasi Musik |
|--------|-----------------|
| **Event Golden Hour** | Bonus 88-108 VIBES saat jam puncak (6-8 PM) |
| **Hadiah Achievement** | Milestone 88, 98, 108 VIBES (range FM) |
| **Drop Mingguan** | Airdrop komunitas 50-200 VIBES |
| **Pengali BPM** | BPM lebih tinggi = hadiah lebih besar |
| **Zona Genre** | Hadiah berbeda per frekuensi genre |
| **Mood Ring** | Meter vibe kolektif station |

*"100 Miliar VIBES untuk vibes baik tanpa batas - dengan kultur musik di setiap interaksi"*

### 2.3 Arsitektur Kontrak

```
┌─────────────────────────────────────────────────────────┐
│                   EKOSISTEM $VIBES                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐      ┌─────────────────┐           │
│  │  Token Clanker  │      │  VibesWrapper   │           │
│  │  (Base ERC-20)  │◄────►│  (Non-mintable) │           │
│  └─────────────────┘      └────────┬────────┘           │
│                                    │                     │
│      ┌─────────────────────────────┼─────────────────┐  │
│      │              │              │              │   │  │
│      ▼              ▼              ▼              ▼   │  │
│  ┌────────┐   ┌──────────┐   ┌──────────┐   ┌───────┐│  │
│  │ Modul  │   │  Modul   │   │  Mood    │   │ Modul ││  │
│  │Earning │   │Spending  │   │  Ring    │   │ Bakar ││  │
│  └────────┘   └──────────┘   └──────────┘   └───────┘│  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Tokenomics

### 3.1 Distribusi Total Suplai

```
Total Suplai: 100.000.000.000 VIBES (100 Miliar)

██████████████████████████████████████████  Pool Likuiditas: 70% (70B)
████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░  Creator Vault: 30% (30B)
```

**Pembagian Otomatis Clanker:**
| Alokasi | Persentase | Jumlah | Status |
|---------|------------|--------|--------|
| **Pool Likuiditas** | 70% | 70.000.000.000 | Terkunci selamanya di Uniswap V4 |
| **Creator Vault** | 30% | 30.000.000.000 | Untuk penggunaan project |

### 3.2 Alokasi Creator Vault (30B)

30B token Creator Vault akan didistribusikan oleh tim:

| Sub-Alokasi | % dari Vault | Jumlah | Tujuan |
|-------------|--------------|--------|--------|
| **Hadiah Komunitas** | 50% | 15.000.000.000 | Hadiah mendengarkan, event Golden Hour |
| **Pool Hadiah DJ** | 30% | 9.000.000.000 | Airdrop, achievement, referral |
| **Tim** | 10% | 3.000.000.000 | Kompensasi tim inti |
| **Treasury** | 10% | 3.000.000.000 | Dana pengembangan |

### 3.3 Jadwal Vesting

| Alokasi | Lockup | Vesting | Rilis |
|---------|--------|---------|-------|
| Pool Likuiditas (70B) | Selamanya | N/A | Terkunci di Uniswap V4 |
| Creator Vault (30B) | 7 hari min | 180 hari | Linear setelah lockup |

### 3.4 Jadwal Rilis Token

```
TGE (Hari 0):     70.000.000.000 (70%) - Pool Likuiditas aktif
Hari 1-7:         0 VIBES              - Creator Vault terkunci (minimum)
Hari 8-187:       ~166.666.667/hari    - Creator Vault vesting (180 hari)
Hari 187:         100.000.000.000 (100%) - Sepenuhnya unlock (~6 bulan)
```

**Catatan:** Token Pool Likuiditas terkunci selamanya. Creator mendapat 100% LP trading fees sebagai passive income.

---

## 4. Mekanisme Earning

### 4.1 Hadiah Mendengarkan

Dapatkan VIBES hanya dengan mendengarkan Web3 Radio.

| Aktivitas | Hadiah | Batas |
|-----------|--------|-------|
| Per 10 menit tune in | 1 VIBES | 100/hari |
| Tune-in pertama hari ini | 88 VIBES | 1/hari |
| Mendengarkan 1 jam terus-menerus | 10 VIBES bonus | 5/hari |

**Pengali Golden Hour:** Hadiah 2x selama Golden Hour (6-8 PM)

### 4.2 Reaksi Mood

Ekspresikan mood Anda dan dapatkan VIBES.

```
Mood Tersedia:
🧘 CHILL     - Santai, damai
🔥 HYPE      - Bersemangat, energik  
💜 MELANCHOLY - Penuh pikiran, emosional
✨ EUPHORIC  - Bahagia, transenden
🍃 ZEN       - Meditatif, seimbang
```

| Aktivitas | Hadiah | Batas |
|-----------|--------|-------|
| Kirim reaksi | 5 VIBES | 20/hari |
| Cocok dengan mood station | +3 VIBES bonus | - |
| Streak mood (5 berturut-turut) | +10 VIBES | - |

### 4.3 Hadiah Berbasis BPM

Track dengan tempo lebih tinggi menghasilkan lebih banyak VIBES:

| Range BPM | Pengali | Nama Tier |
|-----------|---------|-----------|
| 60-90 BPM | 1.0x | Chill |
| 91-120 BPM | 1.2x | Groove |
| 121-150 BPM | 1.5x | Hype |
| 151-200 BPM | 2.0x | Drop |

### 4.4 Event Spesial

Berpartisipasi dalam event spesial untuk bonus VIBES.

| Event | Hadiah | Frekuensi |
|-------|--------|-----------|
| Kehadiran Golden Hour | 98 VIBES | Harian (6-8 PM) |
| Drop komunitas mingguan | 50-200 VIBES | Mingguan |
| Kehadiran broadcast spesial | 100-1000 VIBES | Variabel |
| Event liburan | Variabel | Musiman |

### 4.5 Achievement

Buka achievement untuk hadiah VIBES satu kali.

| Achievement | Persyaratan | Hadiah |
|-------------|-------------|--------|
| Tune Pertama | Tune-in station pertama | 88 VIBES |
| Pendengar Reguler | Streak 7 hari | 108 VIBES |
| Penggemar Setia | Streak 30 hari | 1.000 VIBES |
| Master Mood | Gunakan semua 5 mood | 250 VIBES |
| Kupu-kupu Sosial | 100 pesan chat | 500 VIBES |
| Tipper | Tip pertama dikirim | 200 VIBES |
| Kolektor | Miliki 5 Session NFT | 1.000 VIBES |

### 4.6 Referral

Undang teman dan dapatkan VIBES.

| Milestone | Hadiah |
|-----------|--------|
| Teman bergabung | 50 VIBES |
| Minggu pertama teman aktif | 100 VIBES |
| Teman berlangganan | 200 VIBES |
| 10 referral sukses | 1.000 VIBES bonus |

---

## 5. Mekanisme Spending

### 5.1 Smoke Signal

Kirim pesan sementara yang menghilang setelah waktu tertentu.

| Durasi | Biaya | Visibilitas |
|--------|-------|-------------|
| 5 menit | 10 VIBES | Seluruh station |
| 15 menit | 25 VIBES | Seluruh station |
| 1 jam | 50 VIBES | Seluruh station |
| 4 jam | 100 VIBES | Seluruh station |

**Mekanisme:** 100% dibakar (deflasi)

### 5.2 Request Line

Request lagu atau konten dari DJ.

| Aksi | Biaya | Mekanisme |
|------|-------|-----------|
| Kirim request | 50 VIBES stake | Dapat dikembalikan |
| Boost prioritas | +25 VIBES | Dibakar |
| Request dipenuhi | Stake dikembalikan | - |
| Request kedaluwarsa | 50% dibakar, 50% dikembalikan | - |

### 5.3 Mood Boost

Perkuat dampak reaksi Anda.

| Level Boost | Biaya | Efek |
|-------------|-------|------|
| Bobot 2x | 25 VIBES | Dampak mood ganda |
| Bobot 5x | 50 VIBES | Dampak mood 5x |
| Bobot 10x | 100 VIBES | Dampak mood 10x |

### 5.4 Fitur Kustom

Buka opsi personalisasi.

| Fitur | Biaya | Durasi |
|-------|-------|--------|
| Reaksi emoji kustom | 100 VIBES | Permanen |
| Badge chat | 200 VIBES | 30 hari |
| Frame profil | 150 VIBES | 30 hari |
| Warna username | 100 VIBES | 30 hari |

### 5.5 Akses Backstage Room

Masuk ruang privat dengan token-gate.

| Tipe Ruang | Saldo Minimum | Pengeluaran |
|------------|---------------|-------------|
| Backstage Publik | 100 VIBES | Tidak ada (tahan) |
| Backstage Premium | 500 VIBES | Tidak ada (tahan) |
| Backstage VIP | 1.000 VIBES | Tidak ada (tahan) |
| Event Eksklusif | Variabel | Biaya masuk |

### 5.6 Prioritas Aux Pass

Lompati antrian untuk kontrol DJ.

| Aksi | Biaya |
|------|-------|
| Gabung antrian | Gratis |
| Lewati 1 posisi | 50 VIBES |
| Lewati ke depan | 200 VIBES |
| Perpanjang sesi +5 menit | 100 VIBES |

---

## 6. Ekonomi Bakar vs Transfer

### 6.1 Dibakar (Deflasi)

Aksi ini secara permanen menghapus VIBES dari sirkulasi:

| Aksi | Tingkat Bakar |
|------|---------------|
| Smoke Signal | 100% |
| Buka emoji kustom | 100% |
| Request gagal (sebagian) | 50% |
| Boost prioritas | 100% |

### 6.2 Ditransfer (Sirkulasi)

Aksi ini memindahkan VIBES antar pengguna:

| Aksi | Penerima |
|------|----------|
| Request dipenuhi | DJ |
| Biaya masuk Backstage | Pembuat ruang |
| Prioritas Aux Pass | Treasury station |
| Tiket event | Penyelenggara event |

### 6.3 Dinamika Suplai

```
TGE:              70B (70%) - Pool Likuiditas (terkunci selamanya)
Bulan 1:          70B (70%) - Creator Vault masih terkunci
Bulan 3:          85B (85%) - Vault 50% vested
Bulan 6:          100B (100%) - Sepenuhnya unlock

Tekanan Deflasi: Pembakaran via burn() mengurangi total suplai seiring waktu
```

### 6.4 Pendapatan Creator

Token creator mendapat passive income dari trading:
- **100% LP fees** dari pool Uniswap V4 (via deployment clanker.world)
- **Clanker platform fee:** 20% dari LP fees (terpisah dari creator rewards)
- Dapat diklaim di: `clanker.world/clanker/TOKEN_ADDRESS/admin`

**Catatan:** Fee 20% Clanker dikenakan terpisah di level pool, tidak dipotong dari creator rewards.

---

## 7. Sistem Mood Ring

### 7.1 Gambaran

Mood Ring adalah indikator mood kolektif untuk setiap station, ditentukan oleh reaksi pendengar.

### 7.2 Perhitungan Mood

```
Mood Station = Rata-rata Tertimbang dari Reaksi Terbaru

Faktor Bobot:
- Kebaruan (lebih baru = bobot lebih tinggi)
- Level boost (boost berbayar meningkatkan bobot)
- Reputasi pengguna (pengguna aktif = bobot lebih tinggi)
```

### 7.3 Efek Mood

| Mood | Efek Visual | Efek Audio |
|------|-------------|------------|
| CHILL | Cahaya biru sejuk | Undertone ambient |
| HYPE | Merah/oranye berdenyut | Penekanan beat |
| MELANCHOLY | Kabut ungu | Peningkatan reverb |
| EUPHORIC | Kilau pelangi | Boost kecerahan |
| ZEN | Aura hijau lembut | Pengurangan noise |

### 7.4 Hadiah Mood

Mencocokkan mood station memberikan bonus VIBES:

- Cocok mood: +3 VIBES per reaksi
- Kontributor pergeseran mood: +10 VIBES (jika reaksi Anda menggeser mood)
- Streak mood: +5 VIBES per kecocokan berturut-turut

---

## 8. Mekanisme Anti-Penyalahgunaan

### 8.1 Pembatasan Rate

| Aksi | Batas | Cooldown |
|------|-------|----------|
| Reaksi | 20/hari | Reset 00:00 UTC |
| Smoke Signal | 10/hari | 1 jam antar signal |
| Request Line | 5/hari | 30 menit antar request |
| Hadiah mendengarkan | 100 VIBES/hari | Terus-menerus |

### 8.2 Resistensi Sybil

1. **Verifikasi Farcaster** - Akun terverifikasi dapat hadiah 1.5x
2. **Saldo Minimum** - Beberapa fitur membutuhkan kepemilikan VIBES
3. **Skor Aktivitas** - Engagement historis mempengaruhi pengali
4. **Attestation** - Attestation EAS untuk pengguna terpercaya

### 8.3 Periode Cooldown

- Akun baru: Cooldown 24 jam sebelum earning
- Penarikan besar: Penundaan 1 jam
- Aktivitas mencurigakan: Jeda earning sementara

---

## 9. Implementasi Teknis

### 9.1 Smart Contract

**VibesTokenWrapper.sol**
```solidity
contract VibesTokenWrapper {
    IERC20 public immutable vibesToken;
    
    // Fungsi inti
    function react(uint256 freq, Mood mood) external;
    function sendSignal(uint256 freq, string calldata msg, uint256 duration) external;
    function spendVibes(uint256 amount, string calldata action) external;
    
    // Fungsi view
    function getMoodRing(uint256 freq) external view returns (Mood);
}
```

### 9.2 Enum Mood

```solidity
enum Mood {
    CHILL,      // 0
    HYPE,       // 1
    MELANCHOLY, // 2
    EUPHORIC,   // 3
    ZEN         // 4
}
```

### 9.3 Event

```solidity
event Reaction(address indexed listener, uint256 indexed frequency, Mood mood);
event MoodRingUpdated(uint256 indexed frequency, Mood newMood);
event VibesSpent(address indexed user, uint256 amount, string action);
event VibesBurned(address indexed user, uint256 amount, string reason);
event SignalSent(uint256 indexed signalId, address indexed sender, uint256 expiryTime);
```

---

## 10. Peta Jalan (2026)

### Q1 2026: Peluncuran
- [ ] Deploy $VIBES via Clanker di Base
- [ ] Konfigurasi Creator Vault & Airdrop vesting
- [ ] Luncurkan kontrak VibesWrapper
- [ ] Aktifkan earning dasar (mendengarkan, reaksi)
- [ ] Mood Ring v1

### Q2 2026: Fitur Sosial
- [ ] Smoke Signal
- [ ] Request Line
- [ ] Backstage Room
- [ ] Sistem achievement

### Q3 2026: Fitur Lanjutan
- [ ] Sistem Aux Pass
- [ ] Marketplace fitur kustom
- [ ] Event mood cross-station
- [ ] Drop komunitas via Chainlink VRF

### Q4 2026: Ekosistem
- [ ] Integrasi pihak ketiga
- [ ] Staking VIBES untuk hadiah boost
- [ ] Partisipasi governance (advisory)
- [ ] Fitur mobile-first

---

## 11. Perbandingan: $RADIO vs $VIBES

| Aspek | $RADIO | $VIBES |
|-------|--------|--------|
| **Penggunaan Utama** | Governance, Nilai | Sosial, Engagement |
| **Cara Mendapat** | Beli di DEX | Dapatkan melalui aktivitas |
| **Total Suplai** | 100B (Clanker fixed) | 100B (Clanker fixed) |
| **Creator Vault** | 30B (30%) | 30B (30%) |
| **Mekanisme Bakar** | Peluncuran station | Fitur sosial |
| **Governance** | Hak voting penuh | Hanya advisory |
| **Target Audiens** | Investor, DJ | Pendengar aktif |
| **Proposisi Nilai** | Penyimpan nilai | Token utilitas |

---

## 12. Kesimpulan

$VIBES menciptakan ekonomi sosial yang menyenangkan dan engaging dalam Web3 Radio. Dengan menghargai partisipasi aktif dan mengaktifkan fitur sosial, $VIBES memastikan bahwa anggota komunitas yang paling engaged diakui dan dihargai. Mekanisme pembakaran menciptakan tekanan deflasi jangka panjang sementara hadiah bertema musik membuat earning menjadi menyenangkan dan intuitif.

Bersama dengan $RADIO, sistem dual-token menciptakan ekosistem seimbang di mana investor nilai dan peserta aktif dapat berkembang.

---

## Disclaimer Hukum

Whitepaper ini hanya untuk tujuan informasi dan tidak merupakan nasihat keuangan, rekomendasi investasi, atau ajakan untuk membeli token. Token $VIBES adalah token utilitas yang dirancang untuk digunakan dalam platform Web3 Radio dan tidak boleh dianggap sebagai sekuritas. Investasi cryptocurrency membawa risiko signifikan. Silakan lakukan riset sendiri sebelum berpartisipasi.

---

**Kontak:**
- Website: [web3radio.fm]
- Farcaster: [@web3radio]
- GitHub: [github.com/web3radio]

**Terakhir Diperbarui:** Desember 2025
