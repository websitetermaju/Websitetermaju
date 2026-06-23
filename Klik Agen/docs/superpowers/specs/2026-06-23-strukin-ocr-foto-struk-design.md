# Sub-proyek A — Port OCR StrukIn + "Foto Struk → Catat" (Design Spec)

> **Status:** Design disetujui (2026-06-23)
> **Bagian dari:** Integrasi StrukIn ke Klik Agen (A=OCR, B=cetak thermal, C=rekonsiliasi). Ini **A**, dikerjakan duluan sebagai fondasi OCR.
> **Penulis:** Lina M (via Claude)

---

## 1. Tujuan

Mengaktifkan fitur PRD: agen kirim **foto bukti transfer mBanking** → app baca otomatis → jadi transaksi tercatat lewat alur chat yang sudah ada. Caranya: **port engine OCR StrukIn** (ML Kit on-device + `BankParser`) ke Klik Agen Android, lalu sambungkan ke pipeline chat existing.

**Bukan** bagian sub-proyek ini: cetak struk thermal (B) dan rekonsiliasi mutasi (C).

## 2. Konteks & Keputusan (hasil brainstorming)

- **Parsing on-device**, bukan server. Pakai ML Kit + `BankParser` StrukIn (teruji, 32 unit test, sudah rilis Play). Sesuai PRD "OCR jalan offline".
- **Alur konfirmasi:** hasil OCR diubah jadi **kalimat chat biasa** (mis. `"transfer 500rb admin 6500"`), tampil sebagai bubble user, lalu masuk **pipeline chat existing**. Koreksi cukup dengan membalas chat. (Opsi paling ramping, dipilih owner.)
- **Reuse penuh** alur transaksi yang sudah ada: intent → parser AI → resolve hint → `needs_fee` → tanya fee → tanya dalam/luar → simpan. Tidak ada endpoint/tabel baru.

## 3. Temuan Grounding (memengaruhi desain)

1. **Parser Klik Agen berbasis AI** (`app/services/parser.py::parse_message`, async, prompt JSON). Sudah paham `admin_bank`, `rekening_hint`, dan aturan **"ke <bank> = TUJUAN → note; rekening_hint = rekening SUMBER milik agen"**. ⇒ **Backend tidak perlu diubah.**
2. **Endpoint `/chat/image` sudah ada** tapi cuma terima `ocr_text` → diteruskan ke `process_message`. Untuk sub-proyek ini, Android mengirim **kalimat komposit yang rapi** (bukan teks OCR mentah) ke `/chat/message` biasa. `/chat/image` boleh dibiarkan/dipensiunkan.
3. **Tombol kamera di `ChatScreen` belum diwire** (hanya ikon dalam `Box`, tanpa `clickable`). Image pick + OCR belum ada sama sekali.
4. **Infra offline sudah ada:** `ChatViewModel.sendMessage` sudah antri ke `PendingTrx` (Room) saat offline + sync via `SyncWorker`. Kalimat hasil OCR otomatis ikut jalur ini.
5. **StrukIn pakai ML Kit UNBUNDLED** (`com.google.android.gms:play-services-mlkit-text-recognition:19.0.1`) — wajib demi lolos syarat 16KB page-size Play (Android 15+). Klik Agen sekarang `targetSdk 34` (16KB belum dipaksa), tapi unbundled tetap pilihan benar untuk masa depan.

## 4. Nuansa Sumber vs Tujuan (PENTING — sumber bug)

Bukti transfer menampilkan **bank TUJUAN** (penerima). Tapi `rekening_hint` di Klik Agen harus **rekening SUMBER** milik agen (uang keluar dari sana). Dua hal berbeda.

- `BankParser` StrukIn menghasilkan `TransferData.bankPenerima` = **tujuan**, dan punya `detectBank()` internal = **bank pengirim** (app mBanking yg dipakai, mis. BRImo→BRI).
- **Aturan komposer (wajib diikuti):**
  - `bankPenerima` (tujuan) → masuk **note**, JANGAN jadi `rekening_hint`.
  - Sumber (`rekening_hint`) → diisi dari **bank pengirim** HANYA bila `detectBank()` mengembalikan bank spesifik (bukan `GENERIC`). Bila `GENERIC`/tak yakin → **kosongkan** dan biarkan alur resolusi rekening existing yang bertanya ("pakai rekening mana?") — ini sudah ada & aman.
- Akibatnya, kalimat komposit memang sengaja TIDAK menaruh bank tujuan sebagai hint. Kalau agen punya >1 bank & sumber tak terdeteksi, app akan tanya — itu perilaku yang benar.

## 5. Arsitektur

```
ChatScreen (kamera/galeri)
   └─► StrukOcrUseCase (Android)
         ├─ MlKitParser.parseImage(uri) ──► teks mentah   (ML Kit on-device)
         ├─ BankParser.parse(teks)      ──► TransferData
         └─ StrukComposer.compose(TransferData, detectBank) ──► String kalimat NL
   └─► ChatViewModel.sendStrukMessage(kalimat)
         └─ (reuse) kirim ke POST /chat/message  ──►  process_message (EXISTING)
                                                       intent=transaksi → parser AI
                                                       → resolve hint → needs_fee
                                                       → dalam/luar → simpan ✅
```

## 6. Perubahan Android (kerjaan utama)

### 6.1 Dependency
- Tambah di `app/build.gradle.kts`:
  `implementation("com.google.android.gms:play-services-mlkit-text-recognition:19.0.1")`
- Warm-up recognizer di `KlikAgenApp.onCreate` (opsional tapi disarankan, agar OCR pertama tidak lambat) — pola sama seperti `StrukInApp`.

### 6.2 File yang di-port (ganti package → `id.klikagen.app`)
- `util/MlKitParser.kt` — apa adanya (hanya ganti package). Image URI → `Result<String>`.
- `util/BankParser.kt` (571 baris) — apa adanya. Tambah: ekspos hasil `detectBank()` agar komposer bisa pakai bank pengirim sebagai kandidat sumber (boleh lewat fungsi publik `detectBank(text): BankType` yang sudah ada).
- `data/model/TransferData.kt` — apa adanya.

### 6.3 File baru
- `util/StrukComposer.kt` — `fun compose(data: TransferData, senderBank: BankParser.BankType): String`. Aturan:
  - Basis: `"transfer ${nominal}"`.
  - Jika `biayaAdmin` ada: tambah `" admin bank ${biayaAdmin}"`.
  - Jika `senderBank` spesifik (bukan GENERIC): tambah `" pakai ${senderBank.display}"` (jadi `rekening_hint` sumber).
  - Jika `bankPenerima` ada: tambah `" ke ${bankPenerima}"` (parser AI menaruhnya di note, bukan hint).
  - Nominal dikirim sebagai angka mentah (mis. `500000`) agar parser AI pasti benar.
- `ui/screen/chat/StrukOcrUseCase.kt` (atau fungsi di ViewModel) — orkestrasi: uri → MlKitParser → BankParser → StrukComposer → string.

### 6.4 Integrasi UI di `ChatScreen.kt`
- Wire tombol kamera (saat ini `Box` tanpa `clickable`) → munculkan pilihan: **Kamera** (`ActivityResultContracts.TakePicture`) / **Galeri** (`PickVisualMedia`, `ImageOnly`).
- Setelah dapat `Uri` → panggil `viewModel.sendStrukImage(uri)`.

### 6.5 `ChatViewModel.kt`
- Tambah `fun sendStrukImage(uri: Uri)`:
  1. set state "memproses foto…" (indikator).
  2. jalankan OCR use-case → kalimat NL. Gagal OCR (buram/tak ada teks) → tampilkan pesan ramah ("Fotonya kurang jelas kak, coba foto ulang yang terang ya") — JANGAN kirim ke backend.
  3. sukses → set `_inputText = kalimat` lalu panggil `sendMessage()` existing (otomatis dapat: bubble user, offline-queue, alur fee, dll).

## 7. Perubahan Backend
- **Tidak ada perubahan kode wajib.** Parser AI sudah menangani format komposit (`admin bank`, `pakai <bank>`, `ke <bank>`).
- **Verifikasi (test):** kalimat komposit dari komposer → `parse_message` → field benar (`type=transfer_setor`, `amount`, `admin_bank`, `rekening_hint` sumber/`""`, tujuan di `note`).
- `/chat/image` dibiarkan (tidak dihapus di sub-proyek ini agar tidak menyentuh hal lain).

## 8. Perilaku Offline (sesuai PRD)
- ML Kit unbundled: model di-unduh **sekali** via Play Services (butuh internet sekali). Sesudah itu OCR jalan offline. (Caveat jujur: run pertama tetap butuh internet untuk unduh model.)
- OCR sukses saat device offline → kalimat masuk `PendingTrx` (Room) lewat `sendMessage()` existing → sync otomatis saat online. Tidak ada kerjaan offline baru.

## 9. Testing

### 9.1 Android unit (JVM, tanpa device)
- **Port `BankParserTest.kt`** (32 test) + data uji nyata dari memori `[[strukin-test-data]]`. Ganti package. Ini menjaga kualitas parser hasil port.
- **`StrukComposerTest.kt` (baru):**
  - `TransferData(nominal=500000, biayaAdmin=6500, bankPenerima="BCA")` + sender `BRI` → `"transfer 500000 admin bank 6500 pakai BRI ke BCA"`.
  - sender `GENERIC` → tanpa `"pakai ..."` (hint sumber kosong).
  - `biayaAdmin=""` → tanpa `"admin bank ..."`.

### 9.2 Backend (pytest)
- `test_parse_struk_composed_message`: kirim kalimat komposer ke `parse_message`, assert `type=transfer_setor`, `amount=500000`, `admin_bank=6500`, dan bank tujuan TIDAK jadi `rekening_hint` (ada di note atau hint kosong/sumber).

### 9.3 Manual (device)
- Foto struk nyata (BRImo→BCA) → muncul bubble `"transfer ... "` → app tanya fee → dalam/luar → tersimpan; cek saldo rekening sumber berkurang.

## 10. Out of Scope (ditangani sub-proyek lain / nanti)
- Parsing daftar **mutasi** multi-baris (itu sub-proyek C / Gemini Vision).
- **Gemini Vision** server-side sebagai penambah akurasi online (boleh ditambah kemudian; MVP A cukup ML Kit on-device).
- Cetak struk thermal (sub-proyek B).
- Kartu konfirmasi OCR yang bisa diedit (sengaja tidak dipilih; koreksi via chat).

## 11. Risiko & Catatan
1. **Akurasi OCR struk** bisa meleset (buram/format baru) → mitigasi: koreksi via chat (sudah ada), dan `BankParser` sudah posisi-independen + koreksi `0↔O`/`1↔l`.
2. **Nuansa sumber vs tujuan** (Bagian 4) adalah titik bug utama — wajib ada test yang mengunci bank tujuan TIDAK jadi `rekening_hint`.
3. **Run pertama ML Kit butuh internet** untuk unduh model (bukan 100% offline). Komunikasikan ke user saat onboarding bila perlu.
4. **Package/namespace:** semua file port harus pindah ke `id.klikagen.app.*`, dan import disesuaikan.
