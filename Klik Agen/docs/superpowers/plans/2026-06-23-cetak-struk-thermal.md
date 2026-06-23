# Sub-proyek B — Cetak Struk Thermal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Setelah foto struk (sub-proyek A), agen menekan "Cetak Struk" untuk mencetak salinan struk thermal 58mm ke printer Bluetooth.

**Architecture:** Port `BluetoothPrinter` (ESC/POS) & `StrukBitmapRenderer.renderText` dari StrukIn verbatim. `StrukTextBuilder` baru (gaya COMPACT) membangun teks dari `TransferData` (OCR) + profil. Cetak: teks → bitmap → printer Bluetooth (connect on-demand).

**Tech Stack:** Kotlin, Jetpack Compose, Bluetooth SPP/ESC-POS, AndroidX Activity Result (permission), Hilt; unit test JVM (junit).

## Global Constraints

- Port `BluetoothPrinter` VERBATIM kecuali: fully-qualify `kotlin.Result` (bentrok `id.klikagen.app.util.Result` lokal).
- Semua file port pindah namespace `id.klikagen.app.*`.
- Template hanya COMPACT (1 gaya). Tidak port `TokoProfile`/`PengirimData`/`StrukFormatter`/template lain.
- Profil struk: `store_name`+`phone` dari profil backend existing; `alamat`+`footer` lokal (SharedPreferences). Tanpa migrasi backend.
- Printer connect ON-DEMAND saat cetak; alamat diingat (`connectSaved`).
- Test Android JVM: `./gradlew testDebugUnitTest` dari `/home/wanda/Klik Agen/android`. Build: `./gradlew assembleDebug`.
- Scope-locked: jangan sentuh rekonsiliasi / fitur lain.

---

## File Structure

| File | Aksi |
|---|---|
| `app/src/main/java/id/klikagen/app/util/BluetoothPrinter.kt` | port verbatim + kotlin.Result fix |
| `app/src/main/AndroidManifest.xml` | permission Bluetooth + feature |
| `app/src/main/java/id/klikagen/app/util/StrukBitmapRenderer.kt` | port `renderText` saja |
| `app/src/main/java/id/klikagen/app/util/StrukTextBuilder.kt` | baru (COMPACT) |
| `app/src/test/java/id/klikagen/app/StrukTextBuilderTest.kt` | baru |
| `app/src/main/java/id/klikagen/app/data/local/StrukProfileStore.kt` | baru (alamat/footer lokal) |
| `app/src/main/java/id/klikagen/app/ui/screen/chat/ChatViewModel.kt` | retensi + printLastStruk + state printer |
| `app/src/main/java/id/klikagen/app/ui/screen/chat/ChatScreen.kt` | tombol Cetak + dialog printer + izin |

---

## Task 1: Port BluetoothPrinter + permission manifest

**Files:**
- Create: `app/src/main/java/id/klikagen/app/util/BluetoothPrinter.kt`
- Modify: `app/src/main/AndroidManifest.xml`

**Interfaces:**
- Produces: `id.klikagen.app.util.BluetoothPrinter(context)` dengan `fun isBluetoothReady(): Boolean`, `fun scanDevices(): Flow<List<BluetoothDevice>>`, `suspend fun connect(device): kotlin.Result<Unit>`, `suspend fun connectSaved(): kotlin.Result<Unit>`, `fun isConnected(): Boolean`, `suspend fun print(bitmap: Bitmap): kotlin.Result<Unit>`, `fun disconnect()`, `fun savedAddress(): String?`; dan `object PrinterManager { fun get(context): BluetoothPrinter }`.

- [ ] **Step 1: Port file verbatim (ubah package)**

Salin SELURUH `/home/wanda/strukin/app/src/main/java/com/strukin/app/util/BluetoothPrinter.kt` ke `app/src/main/java/id/klikagen/app/util/BluetoothPrinter.kt`, ubah baris package → `package id.klikagen.app.util`.

- [ ] **Step 2: Fully-qualify kotlin.Result (bentrok util.Result lokal)**

Di file hasil port, ganti SEMUA kemunculan tipe & pemanggil `Result` milik kotlin menjadi `kotlin.Result`:
- Signature: `suspend fun connect(device: BluetoothDevice): Result<Unit>` → `kotlin.Result<Unit>`
- `suspend fun connectSaved(): Result<Unit>` → `kotlin.Result<Unit>`
- `suspend fun print(bitmap: Bitmap): Result<Unit>` → `kotlin.Result<Unit>`
- Semua `Result.success(` → `kotlin.Result.success(`
- Semua `Result.failure(` → `kotlin.Result.failure(`

Verifikasi tidak ada `Result` telanjang tersisa (selain `runCatching`/`getOrNull` yang tidak terdampak):
Run: `grep -n "Result" app/src/main/java/id/klikagen/app/util/BluetoothPrinter.kt | grep -v "kotlin.Result\|runCatching\|getOr"`
Expected: kosong.

- [ ] **Step 3: Tambah permission + feature di manifest**

Di `app/src/main/AndroidManifest.xml`, tambahkan SEBELUM elemen `<application>` (atau setelah `<manifest ...>`):
```xml
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
    <uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
    <uses-feature android:name="android.hardware.bluetooth" android:required="false" />
```

- [ ] **Step 4: Build**

Run: `cd android && ./gradlew assembleDebug`
Expected: BUILD SUCCESSFUL.

- [ ] **Step 5: Commit**
```bash
cd "/home/wanda/Klik Agen"
git -C android add app/src/main/java/id/klikagen/app/util/BluetoothPrinter.kt app/src/main/AndroidManifest.xml
git -C android commit -m "feat(cetak): port BluetoothPrinter ESC/POS + permission Bluetooth"
```

---

## Task 2: Port StrukBitmapRenderer (renderText saja)

**Files:**
- Create: `app/src/main/java/id/klikagen/app/util/StrukBitmapRenderer.kt`

**Interfaces:**
- Produces: `object StrukBitmapRenderer { const val WIDTH_58MM = 384; fun renderText(content: String, widthPx: Int = WIDTH_58MM): Bitmap }`.

- [ ] **Step 1: Buat file (hanya renderText, tanpa dependency StrukFormatter)**

Create `app/src/main/java/id/klikagen/app/util/StrukBitmapRenderer.kt` dengan isi PERSIS:
```kotlin
package id.klikagen.app.util

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface

/**
 * Merender teks struk monospace menjadi [Bitmap] 58mm (384px) untuk dicetak.
 * Rata tengah; font auto-kecil agar baris terpanjang muat. (Port dari StrukIn,
 * hanya renderText — tanpa dependency template/profil.)
 */
object StrukBitmapRenderer {

    /** Lebar cetak kertas thermal 58mm dalam piksel. */
    const val WIDTH_58MM = 384

    fun renderText(content: String, widthPx: Int = WIDTH_58MM): Bitmap {
        val lines = content.split("\n")
        val pad = 16f
        val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.BLACK
            typeface = Typeface.MONOSPACE
            textSize = 24f
        }

        val available = widthPx - 2 * pad
        val longestWidth = lines.maxOfOrNull { paint.measureText(it) } ?: 1f
        if (longestWidth > available && longestWidth > 0f) {
            paint.textSize = paint.textSize * (available / longestWidth)
        }

        val blockWidth = lines.maxOfOrNull { paint.measureText(it) } ?: 0f
        val xOffset = ((widthPx - blockWidth) / 2f).coerceAtLeast(pad)

        val fm = paint.fontMetrics
        val lineHeight = (fm.descent - fm.ascent) * 1.15f
        val height = (pad * 2 + lines.size * lineHeight).toInt().coerceAtLeast(1)

        val bitmap = Bitmap.createBitmap(widthPx, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        canvas.drawColor(Color.WHITE)

        var y = pad - fm.ascent
        for (line in lines) {
            canvas.drawText(line, xOffset, y, paint)
            y += lineHeight
        }
        return bitmap
    }
}
```

- [ ] **Step 2: Build**

Run: `cd android && ./gradlew assembleDebug`
Expected: BUILD SUCCESSFUL.

- [ ] **Step 3: Commit**
```bash
git -C android add app/src/main/java/id/klikagen/app/util/StrukBitmapRenderer.kt
git -C android commit -m "feat(cetak): port StrukBitmapRenderer.renderText (teks->bitmap 58mm)"
```

---

## Task 3: StrukProfile + StrukTextBuilder + test

**Files:**
- Create: `app/src/main/java/id/klikagen/app/util/StrukTextBuilder.kt`
- Create: `app/src/test/java/id/klikagen/app/StrukTextBuilderTest.kt`

**Interfaces:**
- Consumes: `id.klikagen.app.data.model.TransferData` (sub-proyek A).
- Produces: `data class StrukProfile(namaToko, telepon, alamat, footer)` dan `object StrukTextBuilder { fun compact(data: TransferData, profile: StrukProfile, sumberRekening: String): String }`.

- [ ] **Step 1: Tulis test yang gagal**

Create `app/src/test/java/id/klikagen/app/StrukTextBuilderTest.kt`:
```kotlin
package id.klikagen.app

import id.klikagen.app.data.model.TransferData
import id.klikagen.app.util.StrukProfile
import id.klikagen.app.util.StrukTextBuilder
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class StrukTextBuilderTest {

    private val profile = StrukProfile(
        namaToko = "Agen Budi", telepon = "0812", alamat = "Jl. Mawar 1", footer = "Terima Kasih"
    )

    @Test
    fun dengan_biaya_tampil_nominal_admin_total() {
        val d = TransferData(
            namaPenerima = "Suryono", bankPenerima = "BCA", noRekPenerima = "123",
            nominal = "500000", noReferensi = "REF1", tanggal = "07/06/2026", waktu = "09:41",
            biayaAdmin = "6500",
        )
        val s = StrukTextBuilder.compact(d, profile, "BRI")
        assertTrue("kop toko", s.contains("Agen Budi"))
        assertTrue("penerima", s.contains("Suryono"))
        assertTrue("sumber", s.contains("BRI"))
        assertTrue("nominal", s.contains("Nominal Rp 500.000"))
        assertTrue("admin", s.contains("B.Admin Rp 6.500"))
        assertTrue("total", s.contains("Total  Rp 506.500"))
        assertTrue("footer", s.contains("Terima Kasih"))
    }

    @Test
    fun tanpa_biaya_sembunyikan_nominal_admin() {
        val d = TransferData(namaPenerima = "Andi", nominal = "300000", biayaAdmin = "0")
        val s = StrukTextBuilder.compact(d, profile, "BRI")
        assertFalse("tidak ada baris Nominal", s.contains("Nominal Rp"))
        assertFalse("tidak ada baris B.Admin", s.contains("B.Admin"))
        assertTrue("total tetap ada", s.contains("Total  Rp 300.000"))
    }

    @Test
    fun alamat_kosong_di_skip_tanpa_crash() {
        val d = TransferData(nominal = "100000")
        val s = StrukTextBuilder.compact(d, profile.copy(alamat = ""), "-")
        assertFalse(s.contains("Jl. Mawar"))
        assertTrue(s.contains("Total  Rp 100.000"))
    }
}
```

- [ ] **Step 2: Jalankan test, pastikan FAIL**

Run: `cd android && ./gradlew testDebugUnitTest --tests "id.klikagen.app.StrukTextBuilderTest"`
Expected: FAIL (unresolved `StrukTextBuilder`/`StrukProfile`).

- [ ] **Step 3: Implementasi StrukTextBuilder**

Create `app/src/main/java/id/klikagen/app/util/StrukTextBuilder.kt`:
```kotlin
package id.klikagen.app.util

import id.klikagen.app.data.model.TransferData

/** Profil ringkas untuk kop & footer struk (gabungan profil backend + setelan lokal). */
data class StrukProfile(
    val namaToko: String = "",
    val telepon: String = "",
    val alamat: String = "",
    val footer: String = "Terima Kasih",
)

/**
 * Bangun teks struk gaya COMPACT (adaptasi StrukIn) dari data Klik Agen.
 * Klik Agen tak simpan no.rek sumber → pengirim hanya nama rekening [sumberRekening].
 * Penerima diambil dari hasil OCR ([TransferData]).
 */
object StrukTextBuilder {

    private const val HEAVY_CHAR = '='
    private const val DASH_CHAR = '-'
    private const val MIN_WIDTH = 32

    private data class Line(val text: String, val center: Boolean = false, val fill: Char? = null)

    fun compact(data: TransferData, profile: StrukProfile, sumberRekening: String): String {
        val items = build(
            mid(profile.namaToko.ifBlank { "NAMA TOKO" }),
            profile.alamat.ifBlank { null }?.let(::mid),
            profile.telepon.ifBlank { null }?.let(::mid),
            heavy(),
            row("Tgl  ${data.tanggal} ${data.waktu}".trimEnd()),
            row("Ref  ${data.noReferensi}"),
            dash(),
            row("Dari   ${profile.namaToko.ifBlank { "-" }}"),
            row("Bank   ${sumberRekening.ifBlank { "-" }}"),
            dash(),
            row("Kepada ${data.namaPenerima}"),
            row("Bank   ${data.bankPenerima}"),
            row("No.Rek ${data.noRekPenerima}"),
            dash(),
            if (hasBiaya(data)) row("Nominal ${rp(data.nominal)}") else null,
            if (hasBiaya(data)) row("B.Admin ${rp(data.biayaAdmin)}") else null,
            row("Total  ${rpTotal(data)}"),
            heavy(),
            mid("✓ BERHASIL"),
            mid(profile.footer.ifBlank { "Terima Kasih" }),
        )
        return render(items)
    }

    // --- util ---
    private fun num(s: String): Long = s.filter(Char::isDigit).toLongOrNull() ?: 0L
    private fun fmt(n: Long): String =
        if (n == 0L) "0" else n.toString().reversed().chunked(3).joinToString(".").reversed()
    private fun rp(s: String) = "Rp " + fmt(num(s))
    private fun biayaNum(d: TransferData) = num(d.biayaAdmin)
    private fun hasBiaya(d: TransferData) = biayaNum(d) > 0
    private fun rpTotal(d: TransferData) = "Rp " + fmt(num(d.nominal) + biayaNum(d))

    private fun center(s: String, width: Int): String {
        if (s.length >= width) return s
        return " ".repeat((width - s.length) / 2) + s
    }

    private fun render(items: List<Line>): String {
        val width = maxOf(
            MIN_WIDTH,
            items.filter { it.fill == null }.maxOfOrNull { it.text.length } ?: MIN_WIDTH,
        )
        return items.joinToString("\n") { line ->
            when {
                line.fill != null -> line.fill.toString().repeat(width)
                line.center -> center(line.text, width)
                else -> line.text
            }
        }
    }

    private fun build(vararg l: Line?): List<Line> = l.filterNotNull()
    private fun row(text: String) = Line(text)
    private fun mid(text: String) = Line(text, center = true)
    private fun heavy() = Line("", fill = HEAVY_CHAR)
    private fun dash() = Line("", fill = DASH_CHAR)
}
```

- [ ] **Step 4: Jalankan test, pastikan PASS**

Run: `cd android && ./gradlew testDebugUnitTest --tests "id.klikagen.app.StrukTextBuilderTest"`
Expected: BUILD SUCCESSFUL, 3 test pass.

- [ ] **Step 5: Commit**
```bash
git -C android add app/src/main/java/id/klikagen/app/util/StrukTextBuilder.kt app/src/test/java/id/klikagen/app/StrukTextBuilderTest.kt
git -C android commit -m "feat(cetak): StrukTextBuilder COMPACT + test (total/biaya/alamat)"
```

---

## Task 4: StrukProfileStore + integrasi UI (tombol cetak + dialog printer + izin)

**Files:**
- Create: `app/src/main/java/id/klikagen/app/data/local/StrukProfileStore.kt`
- Modify: `app/src/main/java/id/klikagen/app/ui/screen/chat/ChatViewModel.kt`
- Modify: `app/src/main/java/id/klikagen/app/ui/screen/chat/ChatScreen.kt`

**Interfaces:**
- Consumes: `BluetoothPrinter`/`PrinterManager` (T1), `StrukBitmapRenderer` (T2), `StrukTextBuilder`/`StrukProfile` (T3), `TransferData` (A).
- Produces: `ChatViewModel.lastStruk: StateFlow<StrukPrintData?>`, `fun printLastStruk()`, `fun connectAndPrint(device)`, `val printerDevices: StateFlow<List<BluetoothDevice>>`, `fun scanPrinters()`, `val printStatus: StateFlow<String?>`.

- [ ] **Step 1: StrukProfileStore (SharedPreferences alamat/footer)**

Create `app/src/main/java/id/klikagen/app/data/local/StrukProfileStore.kt`:
```kotlin
package id.klikagen.app.data.local

import android.content.Context

/** Simpan field struk lokal (alamat & footer). store_name/telepon dari profil backend. */
class StrukProfileStore(context: Context) {
    private val prefs = context.getSharedPreferences("klik_agen_struk", Context.MODE_PRIVATE)

    var alamat: String
        get() = prefs.getString("alamat", "") ?: ""
        set(v) { prefs.edit().putString("alamat", v).apply() }

    var footer: String
        get() = prefs.getString("footer", "Terima Kasih") ?: "Terima Kasih"
        set(v) { prefs.edit().putString("footer", v).apply() }
}
```

- [ ] **Step 2: ChatViewModel — retensi + cetak + state printer**

Di `ChatViewModel.kt`, tambah import:
```kotlin
import android.bluetooth.BluetoothDevice
import id.klikagen.app.data.local.StrukProfileStore
import id.klikagen.app.data.model.TransferData
import id.klikagen.app.util.PrinterManager
import id.klikagen.app.util.StrukBitmapRenderer
import id.klikagen.app.util.StrukProfile
import id.klikagen.app.util.StrukTextBuilder
import kotlinx.coroutines.flow.first
```
Tambah data class (file-level, di luar kelas, dekat `ChatMessageDisplay`):
```kotlin
data class StrukPrintData(val transfer: TransferData, val sumberRekening: String)
```
Di dalam kelas `ChatViewModel`, tambah state:
```kotlin
    private val _lastStruk = MutableStateFlow<StrukPrintData?>(null)
    val lastStruk: StateFlow<StrukPrintData?> = _lastStruk.asStateFlow()

    private val _printStatus = MutableStateFlow<String?>(null)
    val printStatus: StateFlow<String?> = _printStatus.asStateFlow()

    private val _printerDevices = MutableStateFlow<List<BluetoothDevice>>(emptyList())
    val printerDevices: StateFlow<List<BluetoothDevice>> = _printerDevices.asStateFlow()

    private val _showPrinterPicker = MutableStateFlow(false)
    val showPrinterPicker: StateFlow<Boolean> = _showPrinterPicker.asStateFlow()
```
Di dalam `sendStrukImage`, SETELAH `val data = BankParser.parse(rawText)` dan `val sender = BankParser.detectBank(rawText)` (sebelum `sendMessage()`), tambah:
```kotlin
            _lastStruk.value = StrukPrintData(
                transfer = data,
                sumberRekening = sender.display.ifEmpty { data.bankPenerima.ifEmpty { "-" } },
            )
```
Tambah fungsi cetak:
```kotlin
    private fun buildStrukText(d: StrukPrintData): android.graphics.Bitmap {
        val store = StrukProfileStore(appContext)
        // store_name & telepon dari profil backend (cache di state? ambil sederhana via getMe).
        val profile = StrukProfile(
            namaToko = strukNamaToko, telepon = strukTelepon,
            alamat = store.alamat, footer = store.footer,
        )
        val teks = StrukTextBuilder.compact(d.transfer, profile, d.sumberRekening)
        return StrukBitmapRenderer.renderText(teks)
    }

    // Nama toko/telepon untuk struk; diisi dari profil backend saat ada.
    private var strukNamaToko: String = ""
    private var strukTelepon: String = ""

    fun printLastStruk() {
        val d = _lastStruk.value ?: run { _printStatus.value = "Belum ada struk untuk dicetak"; return }
        viewModelScope.launch {
            // Lengkapi profil dari backend (sekali).
            if (strukNamaToko.isEmpty()) {
                try {
                    val me = api.getMe()
                    strukNamaToko = me.store_name
                    strukTelepon = me.phone
                } catch (_: Exception) {}
            }
            val printer = PrinterManager.get(appContext)
            val bitmap = buildStrukText(d)
            val connected = printer.isConnected() || printer.connectSaved().isSuccess
            if (!connected) {
                // Belum ada printer tersimpan → buka picker.
                _showPrinterPicker.value = true
                return@launch
            }
            _printStatus.value = "Mencetak…"
            val res = printer.print(bitmap)
            _printStatus.value = if (res.isSuccess) "Struk tercetak ✅" else "Gagal mencetak: ${res.exceptionOrNull()?.message ?: "printer error"}"
        }
    }

    fun scanPrinters() {
        viewModelScope.launch {
            val printer = PrinterManager.get(appContext)
            if (!printer.isBluetoothReady()) { _printStatus.value = "Nyalakan Bluetooth dulu ya"; return@launch }
            try {
                _printerDevices.value = printer.scanDevices().first()
            } catch (_: Exception) {
                _printStatus.value = "Tidak bisa memindai printer (cek izin Bluetooth)"
            }
        }
    }

    fun connectAndPrint(device: BluetoothDevice) {
        val d = _lastStruk.value ?: return
        viewModelScope.launch {
            _showPrinterPicker.value = false
            _printStatus.value = "Menghubungkan…"
            val printer = PrinterManager.get(appContext)
            val con = printer.connect(device)
            if (con.isFailure) { _printStatus.value = "Gagal konek printer"; return@launch }
            val res = printer.print(buildStrukText(d))
            _printStatus.value = if (res.isSuccess) "Struk tercetak ✅" else "Gagal mencetak"
        }
    }

    fun dismissPrinterPicker() { _showPrinterPicker.value = false }
    fun clearPrintStatus() { _printStatus.value = null }
```

- [ ] **Step 3: ChatScreen — tombol cetak + dialog printer + izin**

Di `ChatScreen.kt` tambah import:
```kotlin
import androidx.activity.result.contract.ActivityResultContracts.RequestMultiplePermissions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.TextButton
import androidx.compose.foundation.lazy.items
import android.Manifest
import android.os.Build
```
Di dalam `ChatScreen`, setelah `galleryLauncher`, tambah collect state + permission launcher:
```kotlin
    val lastStruk by viewModel.lastStruk.collectAsState()
    val printStatus by viewModel.printStatus.collectAsState()
    val showPrinterPicker by viewModel.showPrinterPicker.collectAsState()
    val printerDevices by viewModel.printerDevices.collectAsState()

    val btPermissionLauncher = rememberLauncherForActivityResult(RequestMultiplePermissions()) { result ->
        if (result.values.all { it }) viewModel.printLastStruk()
        else viewModel.clearPrintStatus()
    }
    fun requestPrint() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            btPermissionLauncher.launch(arrayOf(Manifest.permission.BLUETOOTH_CONNECT, Manifest.permission.BLUETOOTH_SCAN))
        } else viewModel.printLastStruk()
    }
```
Tampilkan `printStatus` sebagai banner (reuse `Banner`) bila tidak null, dan tombol cetak di atas `InputBar`. Di dalam `Column` (sebelum quick actions Row), tambah:
```kotlin
        printStatus?.let { Banner(it, Color(0xFF344054)) }
        if (lastStruk != null) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.Center
            ) {
                QuickActionPill("🖨️ Cetak Struk") { requestPrint() }
            }
        }
```
Dialog pilih printer (di akhir `ChatScreen`, setelah `InputBar`):
```kotlin
    if (showPrinterPicker) {
        LaunchedEffect(Unit) { viewModel.scanPrinters() }
        AlertDialog(
            onDismissRequest = { viewModel.dismissPrinterPicker() },
            title = { Text("Pilih Printer") },
            text = {
                if (printerDevices.isEmpty()) Text("Mencari printer… pastikan printer menyala & sudah dipasangkan.")
                else androidx.compose.foundation.lazy.LazyColumn {
                    items(printerDevices) { dev ->
                        val label = try { dev.name ?: dev.address } catch (_: SecurityException) { dev.address }
                        Text(
                            label,
                            modifier = Modifier.fillMaxWidth().clickable { viewModel.connectAndPrint(dev) }.padding(12.dp)
                        )
                    }
                }
            },
            confirmButton = {},
            dismissButton = { TextButton(onClick = { viewModel.dismissPrinterPicker() }) { Text("Tutup") } }
        )
    }
```

- [ ] **Step 4: Build**

Run: `cd android && ./gradlew assembleDebug`
Expected: BUILD SUCCESSFUL.

- [ ] **Step 5: Verifikasi manual (device + printer thermal)**

Install: `adb install -r app/build/outputs/apk/debug/app-debug.apk`. Foto struk → tombol "🖨️ Cetak Struk" → izinkan Bluetooth → pilih printer (mis. RPP02N) → struk tercetak 58mm, total benar, kop nama toko muncul.

- [ ] **Step 6: Commit**
```bash
git -C android add app/src/main/java/id/klikagen/app/data/local/StrukProfileStore.kt app/src/main/java/id/klikagen/app/ui/screen/chat/ChatViewModel.kt app/src/main/java/id/klikagen/app/ui/screen/chat/ChatScreen.kt
git -C android commit -m "feat(cetak): tombol Cetak Struk + dialog printer on-demand + izin BT"
```

---

## Self-Review (hasil)

**Spec coverage:** §4 BluetoothPrinter→T1 ✓; §4 renderText→T2 ✓; §5 StrukTextBuilder/StrukProfile→T3 ✓; §6 retensi `_lastStruk`→T4 Step2 ✓; §7 alur cetak+on-demand+izin+manifest→T1 Step3 (manifest) & T4 (alur/izin) ✓; §8 StrukProfileStore→T4 Step1 ✓; §9.1 test→T3 ✓; §10 out-of-scope dipatuhi (1 template, no TokoProfile). Gap: tidak ada.

**Placeholder scan:** Tidak ada TBD/TODO. Semua langkah berkode lengkap. Edit alamat/footer di Setelan disebut spec sebagai opsional MVP; default kosong tetap valid (struk pakai fallback) — bukan placeholder, fungsional.

**Type consistency:** `kotlin.Result` konsisten (T1). `StrukProfile(namaToko, telepon, alamat, footer)` sama di T3 & T4. `StrukTextBuilder.compact(TransferData, StrukProfile, String)` sama T3 & T4. `StrukPrintData(transfer, sumberRekening)` sama. `PrinterManager.get`, `connectSaved`, `connect`, `print`, `scanDevices`, `isConnected`, `isBluetoothReady` sesuai interface T1.
