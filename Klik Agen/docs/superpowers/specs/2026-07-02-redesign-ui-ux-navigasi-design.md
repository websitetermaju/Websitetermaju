# Klik Agen — Redesign UI/UX + Navigasi (Sub-proyek A)

**Status:** Design (menunggu review user) | **Tanggal:** 2026-07-02
**Basis:** `2026-07-01-klik-agen-vision-prd-design.md` (PRD Visioner)
**Scope:** HANYA UI/UX + navigasi layar existing Android. Bukan backend, bukan fitur baru.

> Sub-proyek pertama dari dekomposisi redesign menyeluruh. Tujuannya membuat "rumah" visual tempat semua fitur PRD (anti-tipu, otak proaktif, kuota vision, cetak struk) akan dipasang di sub-proyek berikutnya. Dokumen ini dikunci ke kode nyata (hasil eksplorasi) dan divalidasi terhadap 5 prinsip desain PRD.

---

## 1. Tujuan & Non-Tujuan

### Tujuan
1. Jadikan **chat sebagai HERO** — satu pintu, "segampang ATM" (PRD Prinsip #1).
2. Naikkan kualitas visual & konsistensi: satu palet, satu sistem tipografi, ikon vektor, spacing bergrid, touch ≥48dp.
3. Rapikan utang teknis UI yang menghalangi redesign: dead code, palet ganda, `formatRupiah` 4 versi, campur Material 2/3, emoji-as-icon.
4. Siapkan **slot & komponen placeholder** untuk fitur PRD (confirm-gate, banner proaktif, badge kuota, cetak struk) — siap disambung sub-proyek lain, TANPA logika.
5. Tambah **empty-state/first-run chat** — murni UI, wajib demi zero-belajar.

### Non-Tujuan (tegas — keluar dari sub-proyek A)
- **Confirm-gate fungsional** — butuh backend (draft + endpoint confirm). Itu Fase 0 / sub-proyek B. A hanya menyediakan komponen kartu + state placeholder.
- **Logika fitur PRD**: anti-tipu (notif bank), otak proaktif (scheduler), OCR AI-vision + kuota nyata, tier/billing. A hanya menyediakan shell visual.
- **Dark theme** — out of scope.
- **Perubahan backend / DTO** apa pun.
- **Refactor arsitektur navigasi ke NavHost penuh** untuk FeeTier/Kelola/ArusKas — opsional, tidak wajib di A (lihat §6, ditandai OPSIONAL).

---

## 2. Keputusan Desain (terkunci)

| # | Keputusan | Alasan |
|---|---|---|
| D1 | Chat = home full-screen. Bottom-nav 4-tab **dihapus**. | Chat HERO (PRD §1). Tab sederajat melawan hierarki. |
| D2 | Top bar chat: **chip saldo** (kiri, tap→arus kas) + **Rekap** + **Setelan** (kanan). | Saldo & Rekap tetap 1-tap (jaga North Star). Tanpa gestur baru (zero-belajar). |
| D3 | Layar sekunder (Saldo/Rekap/Setelan) di-**push di atas chat**; back → **pop ke chat**, bukan exit app. | Konsekuensi hapus tab. Back yang menutup app = langgar zero-belajar. |
| D4 | Pertahankan brand: **emerald `#0E9F6E`** + **Plus Jakarta Sans**. Redesign = poles, bukan rebrand. | Brand sudah matang & konsisten dengan identitas. |
| D5 | Pisah dua kartu: **`ConfirmCard`** (pre-save, BARU, placeholder) vs **`ReceiptCard`** (post-save, rename dari `ConfirmationCard`). | Nama sekarang menyesatkan. Confirm-gate PRD Prinsip #3 butuh komponen sendiri. |
| D6 | Slot fitur PRD **sembunyi sampai backend siap** — jangan tampilkan angka/data palsu. | PRD Prinsip #4 (jujur soal batas). Badge kuota dummy = bohong ke user. |

---

## 3. Arsitektur Navigasi

### 3.1 Sebelum → Sesudah
```
SEBELUM (MainScreen.kt: when(selectedTab))          SESUDAH
┌───────────────────────────┐              ┌───────────────────────────┐
│  ChatHeader (avatar KA)    │              │ [💰 Rp2,4jt]  [Rekap] [⚙]  │ ← top bar
│  ...chat...                │              │  ...chat (full height)...  │
│  input bar                 │              │  input bar                 │
├───────────────────────────┤              └───────────────────────────┘
│ ●Chat  Saldo Rekap Setelan │  ← dihapus     (tanpa bottom-nav)
└───────────────────────────┘              Saldo/Rekap/Setelan = layar
                                            sekunder, di-push di atas chat
```

### 3.2 Model navigasi (pragmatis, minim risiko)
`MainScreen` tetap host tunggal, ganti `when(selectedTab)` → **state stack sederhana**:
- `Home` (chat, default)
- `Saldo` (DaftarRekening → ArusKas nested, sudah ada)
- `Rekap`
- `Setelan` (Akun → FeeTier/Kelola nested, sudah ada)

Aturan:
- Dari chat: tap chip saldo → `Saldo`; tap Rekap → `Rekap`; tap ⚙ → `Setelan`.
- **`BackHandler`** aktif saat bukan `Home`: back → kembali ke `Home` (atau pop nested dulu jika ada, mis. ArusKas → DaftarRekening → Home).
- Ini bukan migrasi ke NavHost penuh (itu OPSIONAL §6) — cukup ganti Int tab jadi sealed state + BackHandler. Risiko rendah, sesuai pola existing.

### 3.3 Remap share-foto (WAJIB — kelewat di proposal awal)
`SharedImageBus.pendingUri` sekarang memicu `selectedTab = TAB_CHAT`. Setelah tab hilang:
- Saat foto di-share dari mbanking → **paksa state ke `Home`** (pop semua layar sekunder) lalu jalankan alur OCR. Kalau user sedang di Saldo/Setelan, harus auto-pop ke chat agar hasil OCR kelihatan.

---

## 4. Sistem Visual (poles)

### 4.1 Palet — satukan jadi satu sumber
- **Buang** alias lama yang masih dipakai: `Blue500/Blue100/Gray500/Gray700/Gray100/Green500/Red500`. Ganti semua referensi (AkunScreen, FeeTierScreen) ke token `Pri*` / semantik (`CreditGreen`, `DebitRed`, `TextPrimary/Secondary/Muted`, `BorderLight`).
- SplashScreen: samakan (`Pri` lewat theme, sudah pakai `colorScheme.primary` — biarkan konsisten).
- Hasil: satu bahasa warna di seluruh app.

### 4.2 Tipografi & spacing tokens
- Pindahkan `fontSize`/`letterSpacing` mentah yang berserakan → gunakan `MaterialTheme.typography` (sudah lengkap di `Type.kt`).
- Tambah **spacing tokens** (mis. object `Spacing { xs=4, sm=8, md=12, lg=16, xl=24 }`) untuk padding/radius yang sekarang hardcode (18/16/14/20/999...). Ganti bertahap di layar yang disentuh.

### 4.3 Ikon — hapus semua emoji-as-icon
Ganti ke vektor (`Icons.*` Material atau asset), touch ≥48dp:
| Lokasi | Emoji | Ganti |
|---|---|---|
| ChatScreen header | `⚙` (placeholder) | `Icons.Filled.Settings` |
| ChatScreen cetak | `🖨️` | `Icons.Filled.Print` |
| RekapScreen streak | `🔥` | `Icons.Filled.LocalFireDepartment` |
| AkunScreen menu | `✏🏦📋🔒❓` + `›` chevron | `Icons` (Edit/AccountBalance/List/Lock/Help + `ChevronRight`) — import sudah ada, tinggal dipakai |
| FeeTierScreen empty | `📊` | `Icons.Filled.BarChart` |

### 4.4 Konsistensi Material 3
- ArusKasScreen: `androidx.compose.material.pullrefresh` (M2) → **M3 `PullToRefreshBox`**.
- Semua back icon → `Icons.AutoMirrored.Filled.ArrowBack` (FeeTier/Kelola/Register masih pakai versi lama/teks).
- Top bar layar sekunder → pola `TopAppBar` M3 seragam (ArusKas & Kelola sekarang manual, padding `4.dp` bikin back mepet).

---

## 5. Layar per Layar

### 5.1 Chat (home) — layar bintang
**Struktur baru (atas→bawah):**
1. **Top bar** — chip saldo (kiri) + Rekap + ⚙ (kanan). Ganti `ChatHeader` avatar-only sekarang.
2. **Banner stack** (aturan prioritas, §5.2).
3. **Area pesan** (LazyColumn) — dengan **empty-state** bila kosong.
4. **Baris cetak struk** (muncul saat `lastStruk != null`) — sudah ada, rapikan ikon.
5. **Quick-action pills** — pertahankan.
6. **Input bar** — pertahankan; tambah state error retry.

**Empty-state / first-run (WAJIB — zero-belajar):**
Saat riwayat chat kosong, tampilkan sapaan + **contoh hidup sekali-ketuk**:
> "Halo kak! 👋 Catat transaksi cukup ngobrol. Coba ketuk salah satu:"
> `[Transfer 300rb fee 5rb]` `[Tarik tunai 500rb]` `[Rekap hari ini]`

Bukan tutorial — contoh yang langsung jalan. Ketuk → isi input → kirim.

**Kartu:**
- `ReceiptCard` (rename `ConfirmationCard`, L375) — post-save "Transaksi tercatat ✓". Tak berubah fungsi.
- `ConfirmCard` (BARU, placeholder) — komponen visual "Bener nih? Tarik tunai Rp500rb, fee Rp5rb" + tombol primer emerald **[Ya, simpan]** + sekunder **[Edit]** / **[Batal]**. Digerakkan state `PendingConfirm` (placeholder, belum ada data dari backend). Tidak dipanggil di alur nyata sampai Fase 0 — disediakan agar Fase 0 tinggal sambung.

### 5.2 Aturan stacking banner (WAJIB — cegah tabrakan)
Urutan & batas dari atas:
1. Status sistem (paling atas, boleh menumpuk maks 1 terpilih berdasar prioritas): `offline` > `stale-pending` > `degraded`.
2. **Proaktif** (1 slot, dismissible) — di bawah status sistem. Sesuai PRD §7.2 "maks 1 notif/hari".
3. Print status (transient, dismissible).

Aturan: tampilkan **maksimal 1 banner status sistem + 1 proaktif** serentak. Sisanya antre.

### 5.3 Saldo (DaftarRekening + ArusKas)
- DaftarRekening: perbaiki **duplikasi visual** (akun-0/1 di-hardcode khusus lalu semua akun diulang di list bawah) → satu daftar konsisten, hero untuk akun kas utama saja.
- Konsolidasi `formatRupiah` → satu util publik.
- ArusKas: migrasi M2→M3 pull-refresh; `TopAppBar` M3; **jangan ubah** pemetaan warna `debit→CreditGreen / credit→DebitRed` (load-bearing, cocok dg bookkeeping NET PRD §10.3) — hanya rapikan visual.

### 5.4 Rekap
- Sudah solid (hero laba + grid 2×2 + streak). Poles: emoji 🔥 → ikon, warna track hardcode → token, font mentah → typography.

### 5.5 Setelan (Akun + FeeTier + Kelola)
- **Hapus dead code** (~200 baris): `ProfileCard`, `MenuItemCard`, `SectionHeader`, `ProfileRow` + import ikon tak terpakai.
- Emoji menu → ikon vektor (import sudah ada).
- Migrasi kartu Fee/Password dari palet lama (Blue/Gray + Card elevation) → flat+border + token `Pri*`, samakan bahasa visual.
- **Dedup form rekening**: pilih satu antara `TambahRekeningSheet` vs `RekeningFormDialog` — buang yang lain, satukan konstanta tipe.
- **Silent catch** di `KelolaRekeningViewModel` (`catch(_){}`) → surface error ke UI (minimal snackbar). `edit()` jangan tutup dialog saat gagal.

### 5.6 Login / Register / Splash
- Tambah **show/hide password** (Login + Register).
- Register: back link teks `‹ Kembali` → `IconButton` (touch target + pola standar).
- Label uppercase manual → style token. Spacing/font mentah → token.
- Splash: sudah bersih, pastikan pakai token yang sama.

---

## 6. Utang Teknis (dibereskan sebagai bagian redesign)
Konsolidasi yang menyentuh banyak layar, dilakukan saat menyentuh layar terkait:
1. **Satu `formatRupiah`** (sekarang 4 versi: DaftarRekening public, Kelola private, util string, FeeTier lokal) → satu util publik.
2. **Satu palet** (buang Blue/Gray/Green500/Red500).
3. **Spacing/type tokens** — hilangkan angka mentah bertahap.
4. **OPSIONAL (tidak wajib di A):** angkat FeeTier/Kelola/ArusKas jadi rute Nav resmi. Sekarang campur NavHost + state-boolean. Ditandai opsional karena berisiko lebih besar; boleh ditunda ke sub-proyek terpisah bila plan implementasi menilai terlalu berat.

---

## 7. Edge Cases (kontrak UI)

| Skenario | Behavior UI |
|---|---|
| Chat kosong / first-run | Empty-state: sapaan + 3 contoh sekali-ketuk. |
| Offline | Banner abu (sudah ada), pertahankan; ikut aturan stacking §5.2. |
| Stale pending (2 hari) | Banner merah (sudah ada); prioritas > degraded. |
| AI degraded / guided mode | Banner kuning; pastikan `ConfirmCard`/kartu tetap bisa render (bukan cuma teks). |
| Kirim gagal | Bubble error + **tap-to-retry** (baru). |
| Kuota AI-vision habis | Slot pesan jujur (placeholder, sembunyi sampai backend siap): "Kuota AI-vision habis — edit manual aja / beli add-on." Tidak tampil di A tanpa data. |
| Foto di-share saat di layar sekunder | Auto-pop ke chat home, jalankan OCR. |
| Back di layar sekunder | Pop ke chat, bukan exit app. |
| Back di chat home | Perilaku default (exit) — tak berubah. |

---

## 8. Yang Dipertahankan (jangan disentuh fungsinya)
- Alur OCR dua-pintu: `StrukEditDialog` (koreksi manual ML Kit) — inti PRD §9.1.
- Infra banner offline/stale/degraded, printer picker, `BluetoothPrinter`/`StrukComposer`, typing indicator, quick-action pills.
- Pemetaan warna arah kas (`debit/credit`) — load-bearing.
- `storeName` dari `tokenStorage.getStoreName()` — cukup teruskan ke ChatScreen (sekarang hardcode "Toko"), bukan fitur baru.

---

## 9. Kriteria Selesai (Definition of Done — UI)
1. Bottom-nav hilang; chat full-screen jadi home; top bar chip-saldo + Rekap + ⚙ berfungsi 1-tap.
2. Back dari layar sekunder pop ke chat; share-foto auto-pop ke chat.
3. Nol emoji-as-icon; nol referensi palet lama; satu `formatRupiah`.
4. Empty-state chat tampil saat riwayat kosong.
5. `ConfirmationCard`→`ReceiptCard`; `ConfirmCard` placeholder tersedia (tak aktif).
6. Dead code AkunScreen terhapus; silent catch di-surface.
7. Aturan stacking banner diterapkan.
8. Build hijau; tak ada regresi fungsi existing (OCR, cetak, sync, rekap, saldo).

---

## 10. Sub-proyek berikutnya (peta, bukan scope A)
B: Fondasi AI-first (Understander + tiered + **confirm-gate fungsional**) · C: Perisai anti-tipu · D: Otak proaktif · E: OCR AI-vision + kuota · F: Cetak struk (poles) · G: Tier/billing. Masing-masing spec sendiri.

---

*Akhir dokumen. Sub-proyek A dari redesign menyeluruh Klik Agen.*
