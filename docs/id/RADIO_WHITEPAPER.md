# Whitepaper Token $RADIO

## Token Governance & Utilitas Web3 Radio

**Versi 1.0 | Desember 2025**

---

## Ringkasan Eksekutif

$RADIO adalah token governance dan utilitas utama untuk ekosistem Web3 Radio, platform radio terdesentralisasi pertama yang berjalan sepenuhnya on-chain di Base mainnet. Token ini memberikan hak governance, akses premium, dan mekanisme tipping untuk mendukung ekonomi kreator dalam ekosistem radio Web3.

---

## 1. Pendahuluan

### 1.1 Visi

Web3 Radio mentransformasi industri radio tradisional ke era Web3, di mana setiap station adalah smart contract, setiap broadcast adalah event on-chain, dan setiap interaksi adalah transaksi blockchain. Token $RADIO menjadi tulang punggung ekonomi dari ekosistem ini.

### 1.2 Permasalahan

Radio tradisional menghadapi beberapa masalah:
- **Sentralisasi** - Konten dikontrol oleh korporasi besar
- **Monetisasi tidak adil** - DJ dan kreator mendapat bagian kecil dari pendapatan
- **Kurangnya kepemilikan** - Pendengar tidak memiliki stake dalam platform
- **Tidak ada governance** - Komunitas tidak bisa mempengaruhi arah platform

### 1.3 Solusi

Token $RADIO menyelesaikan masalah ini dengan:
- **Governance terdesentralisasi** - Pemegang token menentukan arah platform
- **Monetisasi langsung** - Tip langsung ke DJ tanpa perantara
- **Kepemilikan komunitas** - Pemegang token adalah stakeholder platform
- **Ekonomi transparan** - Semua transaksi on-chain dan dapat diverifikasi

---

## 2. Gambaran Token

### 2.1 Informasi Dasar

| Parameter | Nilai |
|-----------|-------|
| **Nama Token** | Web3 Radio |
| **Simbol** | RADIO |
| **Jaringan** | Base Mainnet |
| **Standar Token** | ERC-20 |
| **Desimal** | 18 |
| **Total Suplai** | 100.000.000.000 RADIO (100B) |
| **Tipe Suplai** | Tetap (Non-mintable, Burnable) |

### 2.2 Deployment via Clanker

$RADIO akan di-deploy menggunakan **Clanker**, token deployer native Farcaster di Base.

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
| **Reward Type** | Both (WETH + RADIO) |
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

**Keuntungan:**
- Integrasi native Farcaster & penemuan sosial
- Likuiditas Uniswap V4 bawaan (terkunci selamanya)
- 100% LP fees sebagai passive income creator
- Lockup & vesting on-chain via Creator Vault
- Tidak perlu beli token - 30% dialokasikan ke creator

### 2.3 Arsitektur Kontrak

```
┌─────────────────────────────────────────────────────────┐
│                   EKOSISTEM $RADIO                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐      ┌─────────────────┐           │
│  │  Token Clanker  │      │  RadioWrapper   │           │
│  │  (Base ERC-20)  │◄────►│  (Extended)     │           │
│  └─────────────────┘      └────────┬────────┘           │
│                                    │                     │
│           ┌────────────────────────┼────────────────┐   │
│           │                        │                │   │
│           ▼                        ▼                ▼   │
│  ┌─────────────┐         ┌─────────────┐   ┌───────────┐│
│  │   Sistem    │         │  Manajer    │   │  Modul    ││
│  │   Tipping   │         │ Langganan   │   │Governance ││
│  └─────────────┘         └─────────────┘   └───────────┘│
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Tokenomics

### 3.1 Distribusi Total Suplai

```
Total Suplai: 100.000.000.000 RADIO (100 Miliar)

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
| **Hadiah Komunitas** | 50% | 15.000.000.000 | Hadiah pendengar, airdrop, kampanye |
| **Pool Hadiah DJ** | 30% | 9.000.000.000 | Insentif kreator, hadiah broadcast |
| **Tim** | 10% | 3.000.000.000 | Kompensasi tim inti |
| **Treasury** | 10% | 3.000.000.000 | Dana pengembangan dikontrol DAO |

### 3.3 Jadwal Vesting

| Alokasi | Lockup | Vesting | Rilis |
|---------|--------|---------|-------|
| Pool Likuiditas (70B) | Selamanya | N/A | Terkunci di Uniswap V4 |
| Creator Vault (30B) | 7 hari min | 180 hari | Linear setelah lockup |

### 3.4 Jadwal Rilis Token

```
TGE (Hari 0):     70.000.000.000 (70%) - Pool Likuiditas aktif
Hari 1-7:         0 RADIO              - Creator Vault terkunci (minimum)
Hari 8-187:       ~166.666.667/hari    - Creator Vault vesting (180 hari)
Hari 187:         100.000.000.000 (100%) - Sepenuhnya unlock (~6 bulan)
```

**Catatan:** Token Pool Likuiditas terkunci selamanya. Creator mendapat 100% LP trading fees sebagai passive income.

---

## 4. Utilitas & Kasus Penggunaan

### 4.1 Sistem Tipping

DJ dan kreator dapat menerima tip langsung dari pendengar.

```solidity
function tip(address dj, uint256 amount, uint256 stationFrequency) external;
```

**Struktur Biaya:**
- Biaya platform: 2%
- DJ menerima: 98%

**Contoh:**
- Pendengar memberi tip 100 RADIO
- DJ menerima 98 RADIO
- Treasury menerima 2 RADIO

### 4.2 Langganan Premium

Pendengar dapat berlangganan ke station premium untuk akses eksklusif.

| Tier | Harga (RADIO/bulan) | Manfaat |
|------|---------------------|---------|
| Basic | 100 | Chat room eksklusif, emoji kustom |
| Premium | 300 | + Prioritas request lagu, badge subscriber |
| VIP | 1.000 | + Akses langsung DJ, NFT drop, boost governance |

**Diskon Tahunan:** 17% (harga 10 bulan untuk 12 bulan)

### 4.3 Peluncuran Token Station

DJ dapat meluncurkan token station mereka sendiri.

- **Biaya:** 1.000 RADIO (dibakar)
- **Manfaat:** Token kustom untuk ekonomi spesifik station
- **Mekanisme:** Tekanan deflasi pada suplai

### 4.4 Voting Governance

Pemegang token dapat berpartisipasi dalam governance.

```solidity
function vote(uint256 proposalId, bool support) external;
// Bobot: 1 RADIO = 1 suara
```

---

## 5. Governance

### 5.1 Kekuatan Governance

Pemegang $RADIO dapat voting untuk:

1. **Parameter Protokol**
   - Penyesuaian biaya platform (rentang 1-5%)
   - Tier harga langganan
   - Tingkat emisi hadiah

2. **Manajemen Treasury**
   - Alokasi dana pengembangan
   - Anggaran pemasaran
   - Hibah komunitas

3. **Proposal Fitur**
   - Pengembangan fitur baru
   - Persetujuan kemitraan
   - Upgrade kontrak

### 5.2 Persyaratan Voting

| Tipe Proposal | Kuorum | Persetujuan | Periode Voting |
|---------------|--------|-------------|----------------|
| Perubahan Parameter | 5% | 51% | 3 hari |
| Treasury < 10k RADIO | 10% | 51% | 5 hari |
| Treasury > 10k RADIO | 15% | 66% | 7 hari |
| Upgrade Kontrak | 20% | 75% | 14 hari |

### 5.3 Proses Proposal

1. **Diskusi** - Diskusi forum (min 3 hari)
2. **Snapshot** - Voting sinyal off-chain
3. **Voting On-chain** - Voting governance formal
4. **Timelock** - Penundaan 48 jam sebelum eksekusi
5. **Eksekusi** - Eksekusi otomatis atau manual

---

## 6. Model Ekonomi

### 6.1 Akumulasi Nilai

$RADIO mengakumulasi nilai melalui:

1. **Pendapatan Biaya** - 2% dari semua tip masuk ke treasury
2. **Pendapatan Langganan** - 5% biaya platform
3. **Pembakaran Token** - Peluncuran station membakar RADIO
4. **Utilitas Governance** - Hak voting menciptakan permintaan

### 6.2 Mekanisme Pembakaran

| Aksi | Jumlah Bakar | Frekuensi |
|------|--------------|-----------|
| Peluncuran Token Station | 1.000 RADIO | Per peluncuran |
| Buka Fitur Premium | Variabel | Per pembukaan |
| Proposal Governance Gagal | 10% dari stake | Per proposal gagal |

### 6.3 Pendorong Permintaan

- **Tipping** - Pendengar aktif butuh RADIO untuk tip
- **Langganan** - Akses premium membutuhkan RADIO
- **Governance** - Voting membutuhkan kepemilikan RADIO
- **Peluncuran Station** - DJ butuh RADIO untuk meluncurkan token
- **Spekulasi** - Aktivitas trading di DEX

### 6.4 Dinamika Suplai

```
TGE:              70B (70%) - Pool Likuiditas (terkunci selamanya)
Bulan 1:          70B (70%) - Creator Vault masih terkunci
Bulan 3:          85B (85%) - Vault 50% vested
Bulan 6:          100B (100%) - Sepenuhnya unlock

Tekanan Deflasi: Pembakaran via burn() mengurangi total suplai seiring waktu
```

### 6.5 Pendapatan Creator

Token creator mendapat passive income dari trading:
- **100% LP fees** dari pool Uniswap V4 (via deployment clanker.world)
- **Clanker platform fee:** 20% dari LP fees (terpisah dari creator rewards)
- Dapat diklaim di: `clanker.world/clanker/TOKEN_ADDRESS/admin`

**Catatan:** Fee 20% Clanker dikenakan terpisah di level pool, tidak dipotong dari creator rewards.

---

## 7. Implementasi Teknis

### 7.1 Smart Contract

**RadioTokenWrapper.sol**
```solidity
contract RadioTokenWrapper {
    IERC20 public immutable radioToken; // Deploy Clanker
    
    // Fungsi inti
    function tip(address dj, uint256 amount, uint256 freq) external;
    function subscribe(uint256 freq, uint256 duration) external;
    function vote(uint256 proposalId, bool support) external;
    
    // Fungsi admin
    function setFeeRate(uint256 newRate) external onlyGovernance;
    function collectFees() external onlyTreasury;
}
```

### 7.2 Langkah Keamanan

- **Audit** - Audit smart contract sebelum mainnet
- **Timelock** - Penundaan 48 jam pada aksi governance
- **Multi-sig** - Treasury dikontrol oleh multi-sig 3/5
- **Rate Limiting** - Langkah anti-spam pada tipping

### 7.3 Upgradability

- Token inti: Tidak dapat di-upgrade (standar Clanker)
- Kontrak wrapper: Dapat di-upgrade via governance
- Governance: Hanya upgrade dengan time-lock

---

## 8. Peta Jalan (2026)

### Q1 2026: Peluncuran
- [ ] Deploy $RADIO via Clanker di Base
- [ ] Konfigurasi Creator Vault & Airdrop vesting
- [ ] Luncurkan kontrak RadioTokenWrapper
- [ ] Aktifkan fungsionalitas tipping
- [ ] Penyediaan likuiditas awal

### Q2 2026: Pertumbuhan
- [ ] Luncurkan sistem langganan
- [ ] Aktifkan voting governance
- [ ] Fitur peluncuran token station
- [ ] Integrasi Farcaster Frames

### Q3 2026: Ekspansi
- [ ] Integrasi aplikasi mobile
- [ ] Integrasi kemitraan
- [ ] Fitur governance lanjutan
- [ ] Program hibah komunitas

### Q4 2026: Kematangan
- [ ] Bridge cross-chain (Arbitrum, Ethereum)
- [ ] Transisi DAO penuh
- [ ] Pembagian pendapatan protokol
- [ ] Peluncuran dana ekosistem

---

## 9. Faktor Risiko

### 9.1 Risiko Pasar
- Volatilitas pasar cryptocurrency
- Ketidakpastian regulasi
- Kompetisi dari platform lain

### 9.2 Risiko Teknis
- Kerentanan smart contract
- Kemacetan jaringan di Base
- Kegagalan oracle

### 9.3 Risiko Operasional
- Risiko eksekusi tim
- Tantangan adopsi komunitas
- Kendala likuiditas

### 9.4 Mitigasi
- Audit keamanan dan bug bounty
- Manajemen treasury terdiversifikasi
- Peluncuran fitur bertahap
- Pendekatan mengutamakan komunitas

---

## 10. Kesimpulan

Token $RADIO adalah fondasi ekonomi untuk Web3 Radio, memberikan hak governance, utilitas, dan mekanisme akumulasi nilai yang selaras dengan kepentingan semua stakeholder. Dengan suplai tetap, utilitas yang jelas, dan governance berbasis komunitas, $RADIO dirancang untuk pertumbuhan jangka panjang yang berkelanjutan.

---

## Disclaimer Hukum

Whitepaper ini hanya untuk tujuan informasi dan tidak merupakan nasihat keuangan, rekomendasi investasi, atau ajakan untuk membeli token. Token $RADIO adalah token utilitas dan tidak boleh dianggap sebagai sekuritas. Investasi cryptocurrency membawa risiko signifikan. Silakan lakukan riset sendiri dan konsultasikan dengan penasihat keuangan sebelum membuat keputusan investasi.

---

**Kontak:**
- Website: [web3radio.fm]
- Farcaster: [@web3radio]
- GitHub: [github.com/web3radio]

**Terakhir Diperbarui:** Desember 2025
