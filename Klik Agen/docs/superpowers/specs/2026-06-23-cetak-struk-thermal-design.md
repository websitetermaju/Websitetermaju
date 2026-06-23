# Sub-proyek B — Cetak Struk Thermal 58mm (Design Spec)

> **Status:** Design disetujui (2026-06-23)
> **Bagian dari:** Integrasi StrukIn ke Klik Agen (A=OCR ✅ selesai, B=cetak thermal ←ini, C=rekonsiliasi).
> **Tergantung:** Sub-proyek A (`TransferData`, `BankParser.detectBank`) sudah ada.

---

## 1. Tujuan

Setelah agen foto bukti transfer (sub-proyek A), agen bisa menekan **"Cetak Struk"** untuk mencetak salinan struk thermal 58mm ke printer Bluetooth, untuk diberikan ke nasabah.

## 2. Keputusan (hasil brainstorming)

- **Trigger:** tombol "Cetak Struk" muncul setelah foto struk OCR; pakai `TransferData` yang **ditahan** dari momen OCR (tidak menunggu server).
- **Pendekatan (Opsi A):** reuse infra printer+bitmap StrukIn verbatim; tulis formatter tipis sendiri (StrukIn `StrukFormatter` terlalu kawin dengan model `TokoProfile`/`PengirimData`-nya, dan Klik Agen tak simpan no.rek sumber).
- **Profil struk:** reuse `store_name` + `phone` dari profil backend existing; tambah **alamat** & **footer** sebagai setelan **lokal** (per-device, presentasi saja — tanpa migrasi backend).
- **Template:** 1 gaya default (COMPACT).
- **Printer:** connect **on-demand** saat cetak pertama; alamat printer diingat untuk auto-connect berikutnya.

## 3. Grounding (memengaruhi desain)

1. `BluetoothPrinter` StrukIn (285 baris) self-contained: ESC/POS raster, 3 strategi koneksi (secure/insecure/reflection), izin-safe (`SecurityException` ditangkap), `PrinterManager` singleton, `connectSaved()` auto-connect. Reusable verbatim KECUALI: pakai `Result<Unit>` (kotlin.Result) yang **bentrok** dengan `id.klikagen.app.util.Result` (sealed class lokal) → wajib fully-qualify `kotlin.Result` (sama seperti fix di MlKitParser sub-proyek A).
2. `StrukBitmapRenderer.renderText(content): Bitmap` generik (teks monospace → bitmap 58mm/384px, auto-scale font, rata tengah). Reusable verbatim. `renderToBitmap(...)` dibuang (gandeng StrukFormatter).
3. Klik Agen **Account tidak punya kolom nomor rekening** (hanya `name`, `bank_name`, `type`). Maka "pengirim" di struk = nama rekening sumber saja; no.rek pengirim tidak ada.
4. `TransferData` (dari A) punya: `namaPenerima`, `bankPenerima`, `noRekPenerima`, `nominal`, `noReferensi`, `tanggal`, `waktu`, `biayaAdmin`.
5. Profil Klik Agen: backend `user.store_name`, `user.phone` (via `UserResponse`). Tidak ada alamat/footer.

## 4. Arsitektur & File

```
ChatScreen: bubble hasil OCR + tombol "🖨️ Cetak Struk"
   └─► ChatViewModel.printLastStruk()
         ├─ StrukTextBuilder.compact(transferData, strukProfile, sumberRekening) ─► String
         ├─ StrukBitmapRenderer.renderText(String) ─► Bitmap
         └─ PrinterManager.get(ctx)
               ├─ connectSaved() | (gagal) dialog scanDevices ─► connect()
               └─ print(bitmap)
```

| File | Aksi | Tanggung jawab |
|---|---|---|
| `android/.../util/BluetoothPrinter.kt` | Port verbatim (+fix kotlin.Result) | Koneksi & cetak ESC/POS, PrinterManager |
| `android/.../util/StrukBitmapRenderer.kt` | Port sebagian (hanya `renderText`) | Teks → bitmap 58mm |
| `android/.../util/StrukTextBuilder.kt` | Baru | TransferData+profil → teks COMPACT |
| `android/.../data/local/StrukProfileStore.kt` | Baru | Simpan alamat & footer lokal |
| `android/.../ui/screen/chat/ChatViewModel.kt` | Modifikasi | `_lastStruk` retensi + `printLastStruk()` + state printer |
| `android/.../ui/screen/chat/ChatScreen.kt` | Modifikasi | tombol Cetak Struk + dialog pilih printer + permission launcher |
| `android/app/src/main/AndroidManifest.xml` | Modifikasi | permission Bluetooth + feature |

Prefix: `app/src/main/java/id/klikagen/app/`

## 5. StrukTextBuilder (COMPACT, adaptasi Klik Agen)

`object StrukTextBuilder { fun compact(data: TransferData, profile: StrukProfile, sumberRekening: String): String }`

`StrukProfile` = data class lokal: `namaToko: String`, `telepon: String`, `alamat: String`, `footer: String = "Terima Kasih"`.

Util internal di-port dari `StrukFormatter` (self-contained): `num`, `fmt` (ribuan titik), `Line(text, center, fill)`, `render(items)` (lebar = baris terpanjang, min 32; garis `=`/`-` direntang), `center`. Layout COMPACT (adaptasi):
```
        <NAMA TOKO>            (center; fallback "NAMA TOKO")
        <alamat>              (center; skip bila kosong)
================================
Tgl  <tanggal> <waktu>
Ref  <noReferensi>
--------------------------------
Dari   <namaToko atau "-">
Bank   <sumberRekening>       (nama rekening sumber Klik Agen)
--------------------------------
Kepada <namaPenerima>
Bank   <bankPenerima>
No.Rek <noRekPenerima>
--------------------------------
Nominal Rp <nominal>          (hanya bila biayaAdmin>0)
B.Admin Rp <biayaAdmin>       (hanya bila biayaAdmin>0)
Total  Rp <nominal+biaya>
================================
        ✓ BERHASIL
        <footer>
```
Murni fungsi string → unit-testable JVM.

## 6. Retensi TransferData & tombol Cetak

Di `ChatViewModel`:
- Tambah `private val _lastStruk = MutableStateFlow<StrukPrintData?>(null)`; `val lastStruk` (StateFlow). `data class StrukPrintData(val transfer: TransferData, val sumberRekening: String)`.
- Di `sendStrukImage`, setelah OCR sukses (sebelum/sesudah compose): `_lastStruk.value = StrukPrintData(data, sender.display.ifEmpty { data.bankPenerima.ifEmpty { "-" } })`.

> Catatan: `sumberRekening` = bank pengirim hasil `detectBank` (bank app mBanking agen). Bila GENERIC, fallback "-". Ini perkiraan terbaik tanpa input manual; cukup untuk MVP.

Di `ChatScreen`: bila `lastStruk != null`, tampilkan baris aksi "🖨️ Cetak Struk" (mis. chip di atas InputBar atau pada bubble OCR). Tap → flow cetak.

## 7. Alur Cetak + Printer On-Demand + Izin

`ChatViewModel.printLastStruk(onNeedPrinterPicker: () -> Unit)` (atau via state):
```
data = _lastStruk ?: return (tampilkan "Belum ada struk untuk dicetak")
profil = StrukProfileStore.load() + store_name/phone dari profil
teks = StrukTextBuilder.compact(data.transfer, profil, data.sumberRekening)
bitmap = StrukBitmapRenderer.renderText(teks)
printer = PrinterManager.get(appContext)
hasil = printer.connectSaved()   // auto-connect printer tersimpan
if (hasil gagal & belum ada saved) -> trigger dialog pilih printer (scanDevices)
else if connected -> printer.print(bitmap)
feedback: sukses "Struk tercetak ✅" / gagal pesan ramah
```
Dialog pilih printer (Compose): collect `printer.scanDevices()` → daftar nama+alamat → tap → `printer.connect(device)` → sukses → `print`.

**Izin (Android 12+):** sebelum scan/connect, minta `BLUETOOTH_CONNECT` + `BLUETOOTH_SCAN` via `rememberLauncherForActivityResult(RequestMultiplePermissions)`. Ditolak → pesan "Izin Bluetooth diperlukan untuk mencetak." `BluetoothPrinter` sudah aman bila izin tak ada (tidak crash).

**Manifest** (tambah di `<manifest>`):
```xml
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
<uses-feature android:name="android.hardware.bluetooth" android:required="false" />
```

## 8. Penyimpanan Profil Struk Lokal

`StrukProfileStore` (SharedPreferences `klik_agen_struk`): `alamat`, `footer`. Default footer "Terima Kasih". `store_name`/`telepon` TIDAK disimpan di sini (ambil dari profil user backend yang sudah ada saat membangun `StrukProfile`). Edit alamat/footer: tambah field di layar Profil Toko (Setelan) — opsional MVP; default kosong tetap menghasilkan struk valid.

## 9. Testing

### 9.1 JVM unit (`StrukTextBuilderTest`)
- COMPACT lengkap (biaya>0): ada baris Nominal+B.Admin+Total, total = nominal+biaya, kop nama toko & footer muncul.
- biaya=0: baris Nominal & B.Admin TIDAK muncul, hanya Total.
- field OCR kosong (mis. `noReferensi=""`) → tetap render tanpa crash.
- alamat kosong → baris alamat di-skip.
- `fmt` ribuan: `1250000` → `1.250.000`.

### 9.2 Tidak di-unit-test (butuh device)
- `BluetoothPrinter`, scan/connect/print → verifikasi build + manual ke printer thermal fisik (mis. RPP02N).

### 9.3 Manual (device + printer)
- Foto struk → "Cetak Struk" → (izin) → pilih printer → struk tercetak rapi 58mm, total benar.

## 10. Out of Scope
- 5 template + pemilih (hanya COMPACT).
- Multi-pengirim / blur no.rek / `TokoProfile` penuh StrukIn.
- Cetak untuk transaksi non-transfer (pulsa/tarik tunai) — format struk beda, nanti.
- Menu Printer khusus di Setelan (pakai on-demand).
- Cetak ulang dari riwayat (hanya struk terakhir hasil OCR).

## 11. Risiko & Catatan
1. **`kotlin.Result` clash** — wajib fully-qualify di `BluetoothPrinter` (sama seperti MlKitParser). Titik bug yang sudah diketahui.
2. **Printer thermal murah** (RPP02N) sering tolak SPP standar → 3 strategi koneksi StrukIn sudah menangani; jangan disederhanakan.
3. **No.rek pengirim tak ada** di Klik Agen → struk hanya tampilkan nama rekening sumber. Bila perlu no.rek, butuh tambah kolom (di luar scope).
4. **`sumberRekening` dari `detectBank`** = bank app pengirim, bukan rekening yang dipilih server saat resolve. Untuk MVP cukup; bila beda dengan rekening sumber sebenarnya, agen tetap paham (struk untuk nasabah, fokus ke penerima+nominal).
5. **Izin BT runtime** Android 12+ wajib; tanpa izin tidak bisa cetak (pesan jelas).
