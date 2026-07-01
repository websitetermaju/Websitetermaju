# Klik Agen — PRD Visioner & Desain Arsitektur AI

**Status:** Design (disetujui per bagian) | **Tanggal:** 2026-07-01 | **Menggantikan:** `klik-agen-mini-prd.md`

> Dokumen ini adalah hasil brainstorming ulang. Ia mendefinisikan **visi**, **arsitektur AI**, dan **model bisnis** Klik Agen — dari MVP agen solo hingga platform kasir visual. Setiap keputusan di sini sudah divalidasi bersama pemilik produk.

---

## 1. Ringkasan Eksekutif

**Klik Agen** adalah asisten AI untuk **agen BRILink & pemilik toko** di Indonesia. Filosofi tunggal: **segampang gesek ATM** — agen gaptek cukup ngobrol natural atau kirim foto, semua urusan bisnis beres. Tidak ada form panjang, tidak ada menu ribet, tidak perlu belajar.

Produk berdiri di atas **tiga pilar**:

| Pilar | Peran | Kalimat |
|---|---|---|
| 🥇 **Chat AI segampang ATM** | HERO — alasan pindah | "Catat transaksi cukup ngobrol." |
| 🛡️ **Perisai anti-tipu** | Pendukung — hook viral | "Bikin kamu gak ketipu bukti transfer palsu." |
| 🧠 **Otak keuangan proaktif** | Pendukung — mesin retensi | "Jagain cuan kamu, ngomong duluan pas bahaya." |

Diikat satu benang: **agen gaptek berhenti rugi diam-diam, cukup lewat chat.**

**Pelengkap "gantiin EDC":** app sudah bisa **cetak ulang struk m-banking ke printer thermal 58mm** — foto struk → catat → cetak bukti fisik untuk customer. Fitur inti semua tier (butuh printer thermal terpisah).

**Visi jangka panjang:** AI yang sama yang paham chat transaksi akan tumbuh memahami **barang di kamera** — melahirkan **kasir visual tanpa barcode** (Fase 3), moat yang belum dimiliki kompetitor manapun.

---

## 2. Masalah & Peluang Pasar

### 2.1 Pain point agen (dari riset lapangan)
1. **Selisih kas harian** — uang fisik ≠ catatan. Selisih kecil menumpuk. Buang 1–2 jam/hari.
2. **Fee lupa dicatat / salah hitung** → rugi diam-diam.
3. **Saldo tekor / debet gagal** — sering Senin & Jumat, jaringan jelek.
4. **Salah ketik rekening** → rugi fatal, susah balik.
5. **Likuiditas** — uang fisik habis tapi saldo digital banyak (atau sebalik).

### 2.2 Peta kompetitor
| Pemain | Tipe | Chat AI | Anti-tipu | Kasir visual |
|---|---|---|---|---|
| BukuWarung / BukuKas | Generalis UMKM | ❌ | ❌ | ❌ (butuh barcode) |
| Kasiragen | Spesialis agen | ❌ | ❌ | ❌ |
| Fioriz (sejak 2018) | Spesialis agen | ❌ | ❌ | ❌ |
| eLink Mini ATM | Spesialis agen | ❌ | ❌ | ❌ |
| Digimars, Nota Link | Spesialis agen | ❌ | ❌ | ❌ |
| **Klik Agen** | **Spesialis AI-first** | ✅ | ✅ | ✅ (Fase 3) |

### 2.3 Celah yang belum diisi siapapun
- **Chat AI natural** — semua kompetitor form/menu based. Agen gaptek tetap harus belajar.
- **Deteksi bukti transfer palsu** — *tidak ada satu pun* aplikasi punya. Kasus nyata: agen rugi **Rp 12 juta** (Brebes, 2 Juni 2025); modus edit struk 30 detik viral 2 juta views (Okt 2024); tren baru struk palsu buatan AI.
- **Kasir tanpa barcode** — semua POS butuh scan barcode / input manual.

**Kebenaran kunci anti-tipu:** foto struk *bukan* bukti sah (bisa dipalsu, bahkan AI-generated). Satu-satunya bukti = **dana benar-benar masuk rekening**. Solusi kita membuktikan dana masuk, bukan menebak keaslian foto.

### 2.4 Transparansi harga sebagai senjata
Semua kompetitor **menyembunyikan harga** ("hubungi kami"). Pasar belum terdidik. Klik Agen tampil dengan **harga transparan** → diferensiasi kepercayaan.

---

## 3. Target User

**MVP: agen BRILink solo & gaptek.**
- Usia 25–45, satu konter, 20–100 transaksi/hari.
- Terbiasa WhatsApp, tidak nyaman aplikasi banyak langkah.
- **Mayoritas juga punya warung/toko kelontong** yang menyatu dengan konter → jembatan alami ke kasir visual.

Segmen owner multi-cabang = perluasan Fase 2 (arsitektur `branches` sudah disiapkan).

---

## 4. North Star & Prinsip Desain

**North Star Metric:**
> % agen yang mencatat **≥10 transaksi/hari lewat chat, tanpa buka menu, ≥5 hari/minggu.**

Kalau agen balik tiap hari & lancar catat hanya dari chat → "segampang ATM" terbukti → retensi (nyawa SaaS) terjaga.

**Lima prinsip (non-negosiable):**
1. **Zero-belajar** — bisa dipakai tanpa tutorial. Butuh diajarin = gagal.
2. **AI mikir dulu, selalu** — tiap pesan dipahami AI, bukan disaring gerbang kata.
3. **Konfirmasi, bukan tebak diam** — tiap transaksi tampil kartu "bener nih?" sebelum simpan. Itu "PIN"-nya ATM.
4. **Jujur soal batas** — anti-tipu tidak mengaku deteksi semua palsu; ia membuktikan dana masuk.
5. **Proaktif jaga cuan** — app ngomong duluan pas bahaya, bukan nunggu ditanya.

---

## 5. Arsitektur AI (Jantung Produk)

### 5.1 Masalah arsitektur lama
Alur lama menyaring pesan dengan **keyword-gate** sebelum AI — menyekik kepintaran:

```
pesan → classify_intent() [KEYWORD GATE] → lolos? AI : "obrolan" (GAGAL catat)
```

Akibatnya "budi ngambil sejuta" atau "masukin 500 ke rekening emak" **gagal tercatat** karena katanya tak ada di daftar. Ini kebalikan dari ATM.

### 5.2 Alur baru — AI-first, tiered by difficulty

```mermaid
flowchart TD
    A[Pesan / Foto dari Agen] --> B{Fast-path regex?<br/>kasus 100% jelas<br/>'tt 200rb', 'undo'}
    B -->|kena| H[Aksi langsung<br/>instan, gratis]
    B -->|tidak kena| C[AI UNDERSTANDER<br/>1 panggilan]

    C --> T1[TIER 1 — model murah<br/>DeepSeek / Gemini Flash]
    T1 --> D{Confidence tinggi<br/>& bukan kasus berat?}
    D -->|ya| E[Hasil terstruktur JSON]
    D -->|tidak / foto struk /<br/>koreksi rumit| T2[TIER 2 — model pinter<br/>Claude / OpenAI]
    T2 --> E

    E --> R[ROUTER<br/>baca intent, arahkan]
    R --> CG{CONFIRM-GATE}
    CG -->|data lengkap+yakin| K[Kartu Konfirmasi<br/>'Simpan?' → tap Ya]
    CG -->|data kurang| Q[1 pertanyaan balik<br/>bukan error]
    CG -->|ragu| KL[Klarifikasi<br/>'maksudnya catat / tanya?']
    K --> S[(Simpan ke DB<br/>bookkeeping NET)]

    T1 -.semua provider down.-> GM[GUIDED MODE<br/>state-machine tanya-jawab<br/>app tak pernah mati]
    T2 -.gagal.-> GM
```

### 5.3 Infografis rantai AI (tiered + failover)

```
┌─────────────────────────────────────────────────────────────────┐
│                      AI UNDERSTANDER                              │
│         (1 panggilan = intent + ekstraksi + cek-kurang)          │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼   ~90% pesan (gampang)              ~10% pesan (sulit)
┌───────────────────────┐            ┌───────────────────────────┐
│  TIER 1 — MURAH        │  eskalasi  │  TIER 2 — PINTAR          │
│  ┌─────────┐┌────────┐ │  ───────▶  │  ┌────────┐┌───────────┐  │
│  │DeepSeek ││ Gemini │ │  jika:     │  │ Claude ││  OpenAI   │  │
│  │  Chat   ││Flash-  │ │  • ragu    │  │ Sonnet ││  GPT-4o   │  │
│  │$.14/.28 ││Lite    │ │  • foto    │  │        ││ (vision)  │  │
│  └─────────┘└────────┘ │  • rumit   │  └────────┘└───────────┘  │
│   failover antar-      │            │   failover antar-provider │
│   provider se-tier     │            │   (kasus sulit + vision)  │
└───────────────────────┘            └───────────────────────────┘
        │                                        │
        └──────────────┬─────────────────────────┘
                       ▼  (4 provider down bersamaan — sangat jarang)
              ┌──────────────────┐
              │   GUIDED MODE    │  app tetap jalan (tanya-jawab manual)
              └──────────────────┘

Pemicu eskalasi Tier 1 → Tier 2:
  1. Confidence rendah (AI murah ragu)
  2. Kelas kasus berat (foto struk/vision, koreksi rumit, multi-transaksi)
```

### 5.4 Output AI Understander (kontrak JSON)
```json
{
  "intent": "transaksi | tanya_data | koreksi | perintah_setting | obrolan | tidak_jelas",
  "confidence": 0.0,
  "transaksi": {
    "type": "tarik_tunai | transfer_setor | pulsa_data | tagihan | topup_ewallet | transfer_atm | pindah_saldo | pengeluaran_operasional | lainnya",
    "amount": 0, "fee": 0, "admin_bank": 0, "harga_modal": 0,
    "fee_model": "luar | dalam",
    "rekening_hint": "", "rekening_tujuan_hint": "",
    "pengeluaran_kategori": "", "note": ""
  },
  "yang_kurang": ["nominal"],
  "pertanyaan_balik": "Tarik tunai berapa kak?",
  "reply_obrolan": ""
}
```

### 5.5 Perubahan kode (membalik urutan, bukan buang)
| File | Sebelum | Sesudah |
|---|---|---|
| `services/intent.py` | Gerbang utama | Fast-path regex (optimasi opsional) |
| `services/parser.py` | Panggilan AI terpisah | Dilebur ke **Understander** (1 prompt) |
| `services/ai.py` | 2-lapis (Gemini→Claude) | **Tiered 4-provider** + health-tracking per provider |
| `services/chat.py` | keyword→AI | **AI-first**, keyword jadi cabang optimasi |

**Dipertahankan (aset berharga):** bookkeeping NET, guard saldo minus, WIB boundary, state-machine konfirmasi, guided-mode fallback.

**Kenapa aman:** confirm-gate → salah-parse tak pernah langsung tersimpan; guided-mode → uptime terjaga saat AI down.

⚠️ **Area butuh tuning pasca-launch:** kalibrasi ambang confidence, definisi "kasus berat", monitoring COGS variabel (routing 2-dimensi lebih rumit dari failover biasa).

---

## 6. Pilar 2 — Perisai Anti-Tipu

### 6.1 Prinsip
Tidak menebak keaslian foto (kalah lawan generator AI). Membuktikan **dana benar masuk** lewat notifikasi bank asli di HP agen.

### 6.2 Dua lapis

```mermaid
flowchart LR
    subgraph L1[Lapis 1 — Pembaca Notif Bank]
      N[Notif BRImo/SMS banking masuk] --> NL[NotificationListenerService] --> AX[AI ekstrak:<br/>nominal, waktu, pengirim] --> ST[(Simpan: bukti dana masuk)]
    end
    subgraph L2[Lapis 2 — Pencocok Klaim]
      C[Customer klaim<br/>'udah transfer 3jt'] --> M{Cocokkan dengan<br/>notif masuk}
      M -->|cocok nominal+waktu| OK[✅ Terverifikasi — aman cairkan]
      M -->|belum ada| NO[⚠️ Belum ada dana —<br/>JANGAN kasih uang dulu]
      M -->|selisih| DIF[❓ Notif 2,9jt vs klaim 3jt —<br/>konfirmasi]
    end
    ST -.-> M
```

### 6.3 Kalau foto struk dikirim (pelengkap, jujur)
AI beri **skor kewaspadaan** + checklist (nama, jam, ref number, bank), SELALU ditutup:
> "⚠️ Foto bisa dipalsu. Bukti asli = notif dana masuk. Sudah ada notif belum?"

Tak pernah bilang "struk ini asli" — hanya "dana sudah masuk / belum".

### 6.4 Edge cases
| Skenario | Behavior |
|---|---|
| Agen tak izinkan notif | Perisai mati, app tetap jalan. Ingatkan manfaat sesekali. |
| Notif telat masuk | "Tunggu 1–2 menit / cek mutasi manual." Tak pernah auto-hijau. |
| Format bank tak dikenal | Simpan mentah, minta konfirmasi nominal sekali (belajar format). |
| Dana masuk beda nama | Tampilkan nama pengirim dari notif, agen cocokkan sendiri. |

**Batas scope:** BUKAN integrasi API bank (BRI tak buka; rapuh/legal). Kita di sisi HP agen (notif) — sah & realistis. Deteksi foto AI-generated canggih = Fase 2.

---

## 7. Pilar 3 — Otak Keuangan Proaktif

App ngomong duluan pas bahaya cuan. Aturan emas: **sedikit tapi penting. Ragu = diam.**

### 7.1 Empat momen proaktif
1. **🌙 Tutup Buku Harian** (jagoan — serang pain #1 selisih kas)
   Tiap malam: ringkasan trx + fee + saldo sistem → "Uang fisik di laci berapa kak?" → cocokkan → **deteksi selisih**.
2. **💧 Alert Saldo Tipis** — saldo aset < ambang (agen set) → tawari catat isi saldo.
3. **📉 Alert Fee di Bawah Rata-rata** — trx banyak tapi fee jauh di bawah biasanya → "ada fee kelupaan?"
4. **🔔 Reminder ringan** — kas belum ditutup 2 hari, atau trx nol sampai siang.

### 7.2 Kendali anti-spam (WAJIB)
- Maks **1 notif proaktif/hari** selain tutup buku. Prioritas: bahaya > info.
- Semua bisa dimatikan per jenis.
- Nada ramah bahasa agen ("kak", "cuan"), bukan bahasa bank.
- Hanya muncul kalau **actionable**.

### 7.3 Teknis
- Tutup buku & reminder = **terjadwal** (backend cron / Android WorkManager).
- Saldo tipis & fee = **event-driven** saat transaksi tersimpan (tanpa polling).
- Ambang & jam tutup = **per agen**, diatur lewat chat ("tutup buku jam 9 malam").

---

## 8. Visi — Kasir Visual Tanpa Barcode (Fase 3)

### 8.1 Konsep
```
Owner setup: foto tiap produk + input nama & harga → "katalog visual"
Kasir:       arahkan kamera ke barang → AI cocokkan → harga keluar
```
Teknologi: **visual product matching** (image embedding + similarity search), bukan OCR/barcode. On-device (ML Kit / TFLite image embedding) → cepat & bisa offline.

### 8.2 Jebakan (jujur) & solusi
| Tantangan | Solusi |
|---|---|
| Barang mirip (Indomie Goreng vs Ayam Bawang) | **Top-3 tebakan**, kasir tap yang benar (1 ketukan) |
| Varian rasa/ukuran (Aqua 600 vs 1500) | Top-3 + label ukuran |
| Foto jelek / mengkilap | Fallback ketik nama; AI belajar dari koreksi |
| Setup 500 SKU | Foto bertahap; prioritas produk laris dulu |

Prinsip sama: **AI mempersempit, manusia konfirmasi** — konsisten dengan "konfirmasi bukan tebak". Barang sulit → eskalasi ke Tier 2 vision (Claude/OpenAI). **Arsitektur AI-first sudah siap menampung ini** — inilah alasan "harus pinter".

### 8.3 Nilai bisnis
- **Belum ada kompetitor** punya kasir-tanpa-barcode → moat kedua.
- Menyerang segmen agen-yang-juga-punya-warung (mayoritas).
- Addon **Rp 79rb/bln** → ARPU naik drastis.

---

## 9. Model Bisnis & Ekonomi Unit

### 9.1 Filosofi harga — batasi yang mahal, gratiskan yang murah
Biaya AI **tidak seragam**. Chat teks nyaris gratis; OCR vision-AI ~10–25× lebih mahal per panggilan. Maka:
- **Chat teks = UNLIMITED semua tier** (murah, memperkuat "segampang ATM").
- **OCR on-device (ML Kit) = UNLIMITED semua tier** (jalan di HP agen, Rp0 ke server; sudah akurat untuk BRI, BCA lama/baru, bank digital minim watermark — terbukti puluhan tes lapangan).
- **AI-vision (struk sulit banyak-watermark) = SATU-SATUNYA yang dibatasi/dijatah** — inilah biaya nyata.

Kunci: mayoritas customer pakai bank digital (tanpa watermark) → ditangani ML Kit → gratis. AI-vision hanya nyala untuk minoritas struk sulit yang ML Kit meleset. Volume nyata AI-vision rendah → COGS aman.

**Alur OCR dua-pintu (user pegang kendali, tak ada AI jalan diam-diam):**
```
Foto struk → [Pintu 1] ML Kit on-device (GRATIS) → hasil tampil
   ├─ benar               → catat ✅ (Rp0)
   ├─ meleset sedikit     → user EDIT MANUAL di tempat ✅ (Rp0)
   └─ kacau (watermark)   → user tap [🔄 Scan ulang AI] → [Pintu 2] AI-vision (kena kuota)
```
AI-vision hanya jalan bila **user sendiri memintanya** (manual). Tidak ada auto-trigger — hemat kuota + user yang menentukan, konsisten "konfirmasi bukan tebak". Edit manual menyerap kasus meleset-ringan tanpa menyentuh AI sama sekali.

### 9.2 Paket (busur pertumbuhan)
| Tahap | Paket | Harga/bln | Isi |
|---|---|---|---|
| Trial | Coba Gratis | 14 hari | Semua fitur, tanpa kartu |
| MVP | **Agen** | **Rp 29.000** | Chat AI unlimited, OCR on-device unlimited, **AI-vision 30/bln**, anti-tipu, otak keuangan, cetak struk, 1 konter |
| MVP | **Agen Pro** | **Rp 69.000** | Semua Agen + AI-vision lega + prioritas Tier-2 + analitik |
| Fase 2 | **Owner** | **Rp 149.000** | Multi-cabang (2–3), role kasir/owner, web dashboard |
| Fase 2 | + Cabang tambahan | **+Rp 39.000/cabang** | Cabang ke-4 dst |
| Fase 3 | + **Kasir Visual** (addon) | **+Rp 79.000** | Katalog visual, scan tanpa barcode |

### 9.3 Add-on AI-Vision (tanpa upgrade Pro)
Untuk agen tier bawah yang butuh AI-vision lebih dari 30/bln — **beli add-on unlimited**, tak perlu lompat ke Pro. Harga 30-hari sengaja disamakan dengan fee transfer beda-bank (Rp14.900) — angka yang **familiar** di kepala agen.

| Durasi | Harga | Per bulan efektif |
|---|---|---|
| 30 hari | **Rp 14.900** | Rp 14.900 |
| 3 bulan | Rp 39.000 | Rp 13.000 |
| 6 bulan | Rp 69.000 | Rp 11.500 |
| 1 tahun | **Rp 89.000** | Rp 7.417 |

> **Catatan strategi (sadar & disengaja):** harga tahunan Rp89rb ≈ −50% dari 30-harian. Ini **land-grab disengaja** — kunci pelanggan lama + cash upfront di fase awal. Margin add-on tahunan tipis, diterima demi akuisisi.
>
> **"Unlimited" ditanggung** karena ML Kit menyerap mayoritas beban. Worst-case realistis (power-user 50 foto/hari, ML Kit sukses ~85% → ~210 AI-vision/bln) COGS ~Rp5rb < harga add-on. Rem anti-abuse pada angka ekstrem gak-manusiawi (>1.500 AI-vision/bln = bot) — di bawah itu unlimited beneran.

### 9.4 Ekonomi unit (per agen/bln, tier Agen — data pricing nyata)
Basis: DeepSeek Chat $0.14 in / $0.28 out per 1M token; Gemini 2.5 Flash-Lite $0.10/$0.40; kurs ~Rp16.500. ~2 pesan/transaksi, ~550 token/pesan.

| Komponen | Biaya | Catatan |
|---|---|---|
| Chat AI (DeepSeek primary, ~Rp1,6/pesan) | ~Rp 5–9rb | 100 trx/hari; fast-path + cache memotong |
| AI-vision (30 scan × ~Rp25) | ~Rp 0,5–1rb | dijatah, jadi terkendali |
| Server (VPS shared, ter-amortisasi) | ~Rp 2–5rb | membaik saat skala |
| **Total COGS** | **~Rp 8–15rb** | |
| Harga | Rp 29rb | |
| **Margin kotor** | **~Rp 14–21rb (48–72%)** | |

### 9.5 Busur ARPU
| Profil | Langganan | ARPU/bln |
|---|---|---|
| Agen solo ringan | Agen | Rp 29rb |
| Agen aktif + add-on vision | Agen + add-on | ~Rp 44rb |
| Agen super-aktif | Agen Pro | Rp 69rb |
| Owner 3 cabang | Owner | Rp 149rb |
| Owner 5 cabang | Owner + 2 cabang | Rp 227rb |
| Agen + toko (kasir visual) | Agen + Kasir Visual | **Rp 108rb** |

### 9.6 Benchmark harga (data nyata — kita kompetitif)
| Produk | Harga | Catatan |
|---|---|---|
| Kompetitor agen (Kasiragen/Fioriz/eLink) | ❌ disembunyikan | Kita transparan = diferensiasi kepercayaan |
| Kasir Pintar Pro | Rp 55.500/bln | Butuh barcode; kita tanpa barcode |
| Moka POS | Rp 299.000/bln/outlet | Kasir visual kita Rp79rb jauh lebih murah |
| Olsera | ~Rp 107.000/bln (tahunan) | — |

### 9.7 Break-even & TAM
- Break-even ops ≈ **100–200 agen bayar**.
- 1.000 agen × ~Rp 17rb margin = ~Rp 17jt/bln kotor.
- TAM: ratusan ribu agen BRILink → irisan kecil sudah bisnis nyata.

### 9.8 Akuisisi
1. **Hook anti-tipu** — konten "cara agen gak ketipu 12jt" → free trial.
2. **Word-of-mouth** komunitas agen — "segampang ATM" mudah direkomendasi.
3. **Trial 14 hari tanpa friksi** — nilai tutup-buku & anti-tipu kerasa <1 minggu.
4. **Add-on murah familiar** (Rp14.900 = fee trf BT) — konversi rendah-friksi.

**Ditolak:** komisi PPOB/switching biller (kontradiksi "app pencatatan"), iklan (rusak kepercayaan).

---

## 10. Tech Stack (Detail)

### 10.1 Diagram sistem

```mermaid
flowchart TB
    subgraph Android[📱 ANDROID — Kotlin + Jetpack Compose]
      UI[Compose UI<br/>Chat / Saldo / Rekap]
      NLS[NotificationListenerService<br/>baca notif bank]
      MLK[ML Kit — OCR struk /<br/>image embedding kasir]
      ROOM[(Room DB<br/>offline-first)]
      WM[WorkManager<br/>sync + jadwal proaktif]
      RETRO[Retrofit/OkHttp/Moshi]
      HILT[Hilt DI]
    end

    subgraph Backend[🖥️ BACKEND — FastAPI async]
      API[REST API<br/>auth/chat/rekening/rekap/admin]
      UND[AI Understander service]
      AIC[ai.py — tiered router<br/>+ health tracking]
      BK[bookkeeping NET<br/>guard saldo minus]
      REKAP[rekap WIB boundary]
      CRON[Scheduler<br/>tutup buku / reminder]
    end

    subgraph AI[🤖 AI PROVIDERS]
      DS[DeepSeek Chat]:::t1
      GM[Gemini Flash-Lite]:::t1
      CL[Claude Sonnet]:::t2
      OA[OpenAI GPT-4o]:::t2
    end

    DB[(PostgreSQL)]
    SMS[SMS Gateway<br/>OTP — Fase 2]

    UI --> RETRO --> API
    NLS --> RETRO
    MLK --> RETRO
    UI --> ROOM --> WM --> RETRO
    API --> UND --> AIC
    AIC --> DS & GM & CL & OA
    API --> BK --> DB
    API --> REKAP --> DB
    CRON --> API
    API --> SMS

    classDef t1 fill:#d4f4dd,stroke:#2d8a4e;
    classDef t2 fill:#dbe4ff,stroke:#3b5bdb;
```

### 10.2 Tabel teknologi
| Layer | Teknologi | Alasan |
|---|---|---|
| **Android UI** | Kotlin + Jetpack Compose | Modern, deklaratif, sudah dipakai |
| **DI** | Hilt | Standar, sudah ada |
| **Networking** | Retrofit + OkHttp + Moshi | Matang, sudah ada |
| **Offline** | Room DB + WorkManager | Offline-first + jadwal proaktif; sudah ada |
| **Baca notif bank** | NotificationListenerService | Akses notif tanpa API bank (perisai anti-tipu) |
| **OCR / kasir visual** | ML Kit (OCR + image embedding), TFLite | On-device, offline, gratis; matching produk |
| **Backend** | FastAPI + SQLAlchemy async + Alembic | Async, sudah ada, 189 test |
| **Database** | PostgreSQL | Transaksi kuat, sudah dipakai |
| **AI Tier 1 (murah)** | DeepSeek Chat ($0.14/$0.28 per 1M), Gemini 2.5 Flash-Lite ($0.10/$0.40) | Parsing JSON teks, biaya rendah |
| **AI Tier 2 (pinter)** | Claude Sonnet, OpenAI GPT-4o (~$3/$10–15 per 1M) | Kasus sulit + vision-AI (struk watermark, kasir) |
| **OCR utama** | ML Kit on-device (gratis) | Nyerap mayoritas struk; AI-vision hanya untuk yang gagal |
| **Auth** | JWT (claim is_admin) | Sudah ada |
| **OTP/SMS** | SMS Gateway (Fase 2), OTP `secrets` | Onboarding user asli |
| **Deploy** | Docker Compose + nginx + VPS + CI | Belum ada — prasyarat jual |

### 10.3 Keputusan arsitektur terkunci (dari CLAUDE.md — tetap berlaku)
- **Bookkeeping = NET cash-ledger** (bukan gross double-entry). Invariant: residual == profit per tipe.
- **`direction` = English "credit"/"debit"** (kanonik). Aset: debit=masuk(+), credit=keluar(−).
- **Timezone WIB (UTC+7 tetap)** untuk semua boundary; simpan UTC-naive.
- **Guard saldo minus** — lock baris + cek sebelum kurangi aset.
- **8 tipe transaksi** NET; omzet exclude pindah_saldo & pengeluaran.

---

## 11. Roadmap

```
┌──────────────────────────────────────────────────────────────────────┐
│ FASE 0 — Fondasi AI-first                                             │
│   AI-first Understander · tiered 4-provider · confirm-gate           │
│   Perbaiki celah keyword-gate. Prasyarat semua fitur pinter.         │
├──────────────────────────────────────────────────────────────────────┤
│ FASE 1 — MVP Jual (agen solo)                                        │
│   Chat AI natural · Anti-tipu L1+L2 · Otak proaktif (4 momen)        │
│   OCR on-device + AI-vision fallback · Cetak struk thermal 58mm      │
│   Tier Agen/Pro + add-on vision · trial 14 hari · Deploy · SMS · CI  │
├──────────────────────────────────────────────────────────────────────┤
│ FASE 2 — Menang & Tumbuh                                             │
│   Escalation by-difficulty full-tuning · OCR struk canggih          │
│   Paket Owner multi-cabang/role · Web dashboard · Analitik dalam    │
├──────────────────────────────────────────────────────────────────────┤
│ FASE 3 — KASIR VISUAL (addon Rp 79rb)                               │
│   Visual product matching · top-3 confirm · katalog dari foto       │
├──────────────────────────────────────────────────────────────────────┤
│ FASE 4 — Ekspansi                                                    │
│   Agen non-BRILink (BNI/Mandiri Link, PPOB umum) · integrasi biller │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 12. Success Metrics

| Fase | Metrik |
|---|---|
| MVP | North Star: % agen catat ≥10 trx/hari via chat, ≥5 hari/minggu |
| MVP | ≥1 kejadian penipuan tercegah per 100 agen/bln (bukti nilai anti-tipu) |
| MVP | Retensi bulan-2 ≥ 60% (nyawa SaaS) |
| Fase 3 | Waktu scan-to-harga < 3 detik; akurasi top-3 ≥ 90% |

---

## 13. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| COGS AI-vision membengkak | Margin tergerus | ML Kit on-device nyerap mayoritas; AI-vision dijatah/add-on; rem anti-abuse >1.500/bln |
| ML Kit gagal lebih sering dari dugaan | Kuota vision cepat habis | Ukur % kegagalan nyata pasca-launch; sesuaikan jatah 30/bln bila perlu |
| Akurasi kasir visual rendah (barang mirip) | Fitur premium gagal | Top-3 confirm, eskalasi Tier 2, belajar dari koreksi |
| Notif bank tak terbaca (format/OS) | Perisai lemah | Belajar format bertahap; jujur soal batas; tak pernah auto-hijau |
| Kompetitor besar tiru chat AI | Moat menipis | Perdalam vertikal BRILink + anti-tipu + kasir visual (susah ditiru cepat) |
| Provider AI naik harga / down | Biaya/uptime | 4-provider tiered failover |
| Routing 2-dimensi sulit dikalibrasi | Salah tier | Tuning pasca-launch dengan data nyata |
| Add-on tahunan Rp89rb margin tipis | Revenue/user rendah | Disengaja (land-grab); dievaluasi ulang setelah basis pelanggan terbentuk |

---

## 14. Out of Scope (tegas)
- Integrasi API bank langsung (BRI tak buka; rapuh/legal).
- Switching biller / jual saldo (kontradiksi "app pencatatan").
- Iklan.
- Deteksi foto AI-generated canggih (Fase 2+).
- Multi-cabang/role di MVP (Fase 2).

---

*Akhir dokumen. Menggantikan `klik-agen-mini-prd.md` sebagai sumber kebenaran visi & arsitektur.*
