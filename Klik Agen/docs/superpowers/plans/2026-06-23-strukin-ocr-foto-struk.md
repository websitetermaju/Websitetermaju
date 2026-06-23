# Sub-proyek A — Port OCR StrukIn + Foto Struk Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agen kirim foto bukti transfer mBanking → OCR on-device (ML Kit + BankParser StrukIn) → kalimat NL → pipeline chat existing mencatatnya jadi transaksi.

**Architecture:** Port engine OCR StrukIn (`MlKitParser`, `BankParser`, `TransferData`) ke Android Klik Agen. `StrukComposer` baru mengubah `TransferData` jadi kalimat (mis. `"transfer 500000 admin bank 6500 pakai BRI ke BCA"`) yang dikirim lewat alur `ChatViewModel.sendMessage` existing. Backend tidak berubah (parser AI sudah dukung `admin_bank`/`rekening_hint`/`ke`/`pakai`).

**Tech Stack:** Kotlin, Jetpack Compose, ML Kit (UNBUNDLED), Hilt, AndroidX Activity Result API; backend FastAPI + pytest (verifikasi kontrak).

## Global Constraints

- ML Kit WAJIB UNBUNDLED: `com.google.android.gms:play-services-mlkit-text-recognition:19.0.1` (lolos 16KB page-size Play).
- Semua file port pindah namespace ke `id.klikagen.app.*`; sesuaikan import.
- `TransferData` di Klik Agen TANPA `@Serializable` (Klik Agen tidak pakai kotlinx.serialization).
- Komposer: bank TUJUAN (`bankPenerima`) → `" ke <bank>"` (jadi note di parser); sumber (`detectBank` non-GENERIC) → `" pakai <bank>"` (jadi `rekening_hint`); bank tujuan TIDAK BOLEH jadi `rekening_hint`.
- Nominal dikirim sebagai angka mentah (mis. `500000`), bukan `500rb`.
- Test Android JVM: `./gradlew testDebugUnitTest`. Build: `./gradlew assembleDebug`. Jalankan dari `/home/wanda/Klik Agen/android`.
- Backend test: `./venv/bin/pytest` dari `/home/wanda/Klik Agen/backend`.
- Scope-locked: jangan sentuh fitur lain (rekonsiliasi, cetak thermal).

---

## File Structure

| File | Tanggung jawab |
|---|---|
| `android/.../data/model/TransferData.kt` | Model hasil parse 1 struk (port, tanpa @Serializable) |
| `android/.../util/BankParser.kt` | Parser struk posisi-independen (port verbatim) |
| `android/.../util/MlKitParser.kt` | Wrapper ML Kit: gambar→teks (port verbatim) |
| `android/.../util/StrukComposer.kt` | `TransferData`→kalimat NL (baru) |
| `android/.../ui/screen/chat/ChatViewModel.kt` | `sendStrukImage(uri)` (modifikasi) |
| `android/.../ui/screen/chat/ChatScreen.kt` | Wire kamera/galeri (modifikasi) |
| `android/app/build.gradle.kts` | Dependency ML Kit (modifikasi) |
| `android/app/src/main/AndroidManifest.xml` | FileProvider untuk kamera (modifikasi) |
| `android/app/src/main/res/xml/file_paths.xml` | Path FileProvider (baru) |
| `android/.../KlikAgenApp.kt` | Warm-up recognizer (modifikasi) |
| `android/app/src/test/.../BankParserTest.kt` | Port 32 unit test parser |
| `android/app/src/test/.../StrukComposerTest.kt` | Test komposer (baru) |
| `backend/tests/test_parser.py` | Test kontrak kalimat struk (tambah) |

Prefix Android: `app/src/main/java/id/klikagen/app/`

---

## Task 1: Port BankParser + TransferData + unit test

**Files:**
- Create: `android/app/src/main/java/id/klikagen/app/data/model/TransferData.kt`
- Create: `android/app/src/main/java/id/klikagen/app/util/BankParser.kt`
- Create: `android/app/src/test/java/id/klikagen/app/BankParserTest.kt`

**Interfaces:**
- Produces: `id.klikagen.app.util.BankParser` dengan `object BankParser { fun parse(rawText: String): TransferData; fun detectBank(text: String): BankType; enum class BankType(val display: String) { BCA, BRI, ..., GENERIC } }` dan `id.klikagen.app.data.model.TransferData(namaPenerima, bankPenerima, noRekPenerima, nominal, noReferensi, tanggal, waktu, biayaAdmin: String = "")`.

- [ ] **Step 1: Pastikan junit ada di test deps**

Run: `grep -n "testImplementation.*junit" android/app/build.gradle.kts`
Expected: ada baris `testImplementation("junit:junit:4.13.2")` (atau versi lain). Jika TIDAK ada, tambahkan ke blok `dependencies`:
```kotlin
testImplementation("junit:junit:4.13.2")
```

- [ ] **Step 2: Port TransferData.kt (drop @Serializable)**

Salin isi `/home/wanda/strukin/app/src/main/java/com/strukin/app/data/model/TransferData.kt` ke file baru, ubah package, dan HAPUS anotasi/`import` serialization. Hasil akhir file:
```kotlin
package id.klikagen.app.data.model

/**
 * Data hasil parse satu bukti transfer mBanking.
 * Semua field String + default kosong agar hasil parsial tetap valid.
 */
data class TransferData(
    val namaPenerima: String = "",
    val bankPenerima: String = "",
    val noRekPenerima: String = "",
    val nominal: String = "",
    val noReferensi: String = "",
    val tanggal: String = "",
    val waktu: String = "",
    /** Biaya admin; Total = nominal + biayaAdmin. Kosong = 0. */
    val biayaAdmin: String = "",
)
```

- [ ] **Step 3: Port BankParser.kt verbatim (ubah package + import)**

Salin SELURUH isi `/home/wanda/strukin/app/src/main/java/com/strukin/app/util/BankParser.kt` ke `android/app/src/main/java/id/klikagen/app/util/BankParser.kt`. Edit HANYA:
- Baris 1: `package com.strukin.app.util` → `package id.klikagen.app.util`
- Import `com.strukin.app.data.model.TransferData` → `id.klikagen.app.data.model.TransferData`

JANGAN ubah logika apapun. (`parse` & `detectBank` sudah `fun` publik, `BankType` punya `val display`.)

- [ ] **Step 4: Port BankParserTest.kt verbatim (ubah package + import)**

Salin SELURUH isi `/home/wanda/strukin/app/src/test/java/com/strukin/app/BankParserTest.kt` ke `android/app/src/test/java/id/klikagen/app/BankParserTest.kt`. Edit HANYA:
- `package com.strukin.app` → `package id.klikagen.app`
- import `com.strukin.app.util.BankParser` → `id.klikagen.app.util.BankParser`
- import `com.strukin.app.util.BankParser.BankType` → `id.klikagen.app.util.BankParser.BankType`

- [ ] **Step 5: Jalankan test, pastikan hijau**

Run: `cd android && ./gradlew testDebugUnitTest --tests "id.klikagen.app.BankParserTest"`
Expected: BUILD SUCCESSFUL, 32 test pass.

- [ ] **Step 6: Commit**
```bash
cd "/home/wanda/Klik Agen"
git -C android add app/src/main/java/id/klikagen/app/data/model/TransferData.kt app/src/main/java/id/klikagen/app/util/BankParser.kt app/src/test/java/id/klikagen/app/BankParserTest.kt app/build.gradle.kts
git -C android commit -m "feat(ocr): port BankParser + TransferData dari StrukIn (32 test hijau)"
```

---

## Task 2: ML Kit dependency + port MlKitParser + warm-up

**Files:**
- Modify: `android/app/build.gradle.kts`
- Create: `android/app/src/main/java/id/klikagen/app/util/MlKitParser.kt`
- Modify: `android/app/src/main/java/id/klikagen/app/KlikAgenApp.kt`

**Interfaces:**
- Produces: `id.klikagen.app.util.MlKitParser(context: Context)` dengan `suspend fun parseImage(imageUri: Uri): Result<String>`.

- [ ] **Step 1: Tambah dependency ML Kit (UNBUNDLED)**

Di `android/app/build.gradle.kts`, dalam blok `dependencies { ... }`, tambahkan:
```kotlin
    // OCR teks — ML Kit UNBUNDLED (lolos 16KB page-size Play)
    implementation("com.google.android.gms:play-services-mlkit-text-recognition:19.0.1")
```

- [ ] **Step 2: Port MlKitParser.kt verbatim (ubah package)**

Salin SELURUH isi `/home/wanda/strukin/app/src/main/java/com/strukin/app/util/MlKitParser.kt` ke `android/app/src/main/java/id/klikagen/app/util/MlKitParser.kt`. Edit HANYA baris package → `package id.klikagen.app.util`. Tidak ada perubahan lain.

- [ ] **Step 3: Warm-up recognizer di KlikAgenApp**

Ganti isi `android/app/src/main/java/id/klikagen/app/KlikAgenApp.kt` menjadi:
```kotlin
package id.klikagen.app

import android.app.Application
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

@HiltAndroidApp
class KlikAgenApp : Application(), Configuration.Provider {

    @Inject lateinit var workerFactory: HiltWorkerFactory

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()

    override fun onCreate() {
        super.onCreate()
        // Warm-up: picu unduh/inisialisasi model ML Kit agar OCR pertama tidak lambat.
        TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
    }
}
```

- [ ] **Step 4: Build, pastikan dependency resolve & compile**

Run: `cd android && ./gradlew assembleDebug`
Expected: BUILD SUCCESSFUL.

- [ ] **Step 5: Verifikasi APK tetap bebas .so ML Kit (16KB-safe)**

Run: `cd android && unzip -l app/build/outputs/apk/debug/app-debug.apk | grep "mlkit.*\.so" || echo "OK: tidak ada .so ML Kit (unbundled benar)"`
Expected: `OK: tidak ada .so ML Kit (unbundled benar)`

- [ ] **Step 6: Commit**
```bash
git -C android add app/build.gradle.kts app/src/main/java/id/klikagen/app/util/MlKitParser.kt app/src/main/java/id/klikagen/app/KlikAgenApp.kt
git -C android commit -m "feat(ocr): tambah ML Kit unbundled + MlKitParser + warm-up"
```

---

## Task 3: StrukComposer + unit test

**Files:**
- Create: `android/app/src/main/java/id/klikagen/app/util/StrukComposer.kt`
- Create: `android/app/src/test/java/id/klikagen/app/StrukComposerTest.kt`

**Interfaces:**
- Consumes: `TransferData`, `BankParser.BankType` (Task 1).
- Produces: `object StrukComposer { fun compose(data: TransferData, senderBank: BankParser.BankType): String }`.

- [ ] **Step 1: Tulis test yang gagal**

Create `android/app/src/test/java/id/klikagen/app/StrukComposerTest.kt`:
```kotlin
package id.klikagen.app

import id.klikagen.app.data.model.TransferData
import id.klikagen.app.util.BankParser.BankType
import id.klikagen.app.util.StrukComposer
import org.junit.Assert.assertEquals
import org.junit.Test

class StrukComposerTest {

    @Test
    fun lengkap_sumber_terdeteksi() {
        val d = TransferData(nominal = "500000", biayaAdmin = "6500", bankPenerima = "BCA")
        val hasil = StrukComposer.compose(d, BankType.BRI)
        assertEquals("transfer 500000 admin bank 6500 pakai BRI ke BCA", hasil)
    }

    @Test
    fun sumber_generic_tanpa_pakai() {
        val d = TransferData(nominal = "500000", biayaAdmin = "6500", bankPenerima = "BCA")
        val hasil = StrukComposer.compose(d, BankType.GENERIC)
        assertEquals("transfer 500000 admin bank 6500 ke BCA", hasil)
    }

    @Test
    fun tanpa_admin_tanpa_tujuan() {
        val d = TransferData(nominal = "300000")
        val hasil = StrukComposer.compose(d, BankType.GENERIC)
        assertEquals("transfer 300000", hasil)
    }

    @Test
    fun nominal_dibersihkan_dari_titik() {
        val d = TransferData(nominal = "1.250.000")
        val hasil = StrukComposer.compose(d, BankType.GENERIC)
        assertEquals("transfer 1250000", hasil)
    }
}
```

- [ ] **Step 2: Jalankan test, pastikan FAIL**

Run: `cd android && ./gradlew testDebugUnitTest --tests "id.klikagen.app.StrukComposerTest"`
Expected: FAIL (unresolved reference `StrukComposer`).

- [ ] **Step 3: Implementasi StrukComposer**

Create `android/app/src/main/java/id/klikagen/app/util/StrukComposer.kt`:
```kotlin
package id.klikagen.app.util

import id.klikagen.app.data.model.TransferData

/**
 * Ubah hasil OCR satu bukti transfer jadi kalimat NL yang dimengerti parser AI
 * backend. Bank TUJUAN -> "ke <bank>" (parser menaruhnya di note). Sumber
 * (senderBank non-GENERIC) -> "pakai <bank>" (jadi rekening_hint). Nominal
 * dikirim sebagai angka mentah.
 */
object StrukComposer {

    fun compose(data: TransferData, senderBank: BankParser.BankType): String {
        val sb = StringBuilder("transfer")

        val nominal = digitsOnly(data.nominal)
        if (nominal.isNotEmpty()) sb.append(" ").append(nominal)

        val admin = digitsOnly(data.biayaAdmin)
        if (admin.isNotEmpty()) sb.append(" admin bank ").append(admin)

        if (senderBank != BankParser.BankType.GENERIC && senderBank.display.isNotEmpty()) {
            sb.append(" pakai ").append(senderBank.display)
        }

        val tujuan = data.bankPenerima.trim()
        if (tujuan.isNotEmpty()) sb.append(" ke ").append(tujuan)

        return sb.toString()
    }

    /** Buang semua non-digit (titik/koma/spasi/"Rp") dari nominal OCR. */
    private fun digitsOnly(raw: String): String = raw.filter { it.isDigit() }
}
```

- [ ] **Step 4: Jalankan test, pastikan PASS**

Run: `cd android && ./gradlew testDebugUnitTest --tests "id.klikagen.app.StrukComposerTest"`
Expected: BUILD SUCCESSFUL, 4 test pass.

- [ ] **Step 5: Commit**
```bash
git -C android add app/src/main/java/id/klikagen/app/util/StrukComposer.kt app/src/test/java/id/klikagen/app/StrukComposerTest.kt
git -C android commit -m "feat(ocr): StrukComposer TransferData->kalimat NL (sumber vs tujuan dikunci test)"
```

---

## Task 4: Integrasi UI — image pick + sendStrukImage

**Files:**
- Create: `android/app/src/main/res/xml/file_paths.xml`
- Modify: `android/app/src/main/AndroidManifest.xml`
- Modify: `android/app/src/main/java/id/klikagen/app/ui/screen/chat/ChatViewModel.kt`
- Modify: `android/app/src/main/java/id/klikagen/app/ui/screen/chat/ChatScreen.kt`

**Interfaces:**
- Consumes: `MlKitParser` (Task 2), `BankParser` (Task 1), `StrukComposer` (Task 3).
- Produces: `ChatViewModel.sendStrukImage(uri: Uri)`.

- [ ] **Step 1: FileProvider path config**

Create `android/app/src/main/res/xml/file_paths.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<paths>
    <cache-path name="struk_cache" path="struk/" />
</paths>
```

- [ ] **Step 2: Daftarkan FileProvider di manifest**

Di `android/app/src/main/AndroidManifest.xml`, dalam elemen `<application>`, tambahkan:
```xml
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
```

- [ ] **Step 3: Tambah sendStrukImage di ChatViewModel**

Di `android/.../chat/ChatViewModel.kt`, tambahkan import di bagian atas:
```kotlin
import android.net.Uri
import id.klikagen.app.util.BankParser
import id.klikagen.app.util.MlKitParser
import id.klikagen.app.util.StrukComposer
```
Lalu tambahkan fungsi ini di dalam kelas `ChatViewModel` (mis. setelah `sendMessage()`):
```kotlin
    fun sendStrukImage(uri: Uri) {
        viewModelScope.launch {
            _isSending.value = true
            // Tampilkan placeholder "memproses foto" sebagai bubble user sementara.
            val tempId = "struk_${System.currentTimeMillis()}"
            _messages.value = _messages.value + ChatMessageDisplay(
                id = tempId, text = "🧾 Memproses foto struk…", isUser = true, timestamp = ""
            )

            val rawResult = MlKitParser(appContext).parseImage(uri)
            // Buang placeholder.
            _messages.value = _messages.value.filterNot { it.id == tempId }
            _isSending.value = false

            val rawText = rawResult.getOrNull()
            if (rawText.isNullOrBlank()) {
                _messages.value = _messages.value + ChatMessageDisplay(
                    id = "strukerr_${System.currentTimeMillis()}",
                    text = "Fotonya kurang jelas kak, coba foto ulang yang terang & lurus ya 📷",
                    isUser = false, timestamp = ""
                )
                return@launch
            }

            val data = BankParser.parse(rawText)
            val sender = BankParser.detectBank(rawText)
            val kalimat = StrukComposer.compose(data, sender)

            // Masuk ke alur chat existing (dapat: bubble user, offline-queue, tanya fee, dll).
            _inputText.value = kalimat
            sendMessage()
        }
    }
```

- [ ] **Step 4: Wire tombol kamera + galeri di ChatScreen**

Di `android/.../chat/ChatScreen.kt`, tambahkan import:
```kotlin
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.FileProvider
import java.io.File
```
Di dalam `ChatScreen(...)`, sebelum `Column(...)`, tambahkan launcher + helper:
```kotlin
    val context = LocalContext.current
    var pendingCameraUri by remember { mutableStateOf<Uri?>(null) }

    val galleryLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.PickVisualMedia()
    ) { uri -> if (uri != null) viewModel.sendStrukImage(uri) }

    val cameraLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.TakePicture()
    ) { success -> if (success) pendingCameraUri?.let { viewModel.sendStrukImage(it) } }
```
Ganti `InputBar(...)` agar meneruskan aksi kamera. Ubah signature `InputBar` + pemanggilan: tambahkan parameter `onPickGallery: () -> Unit` dan `onOpenCamera: () -> Unit`. Pada pemanggilan `InputBar`:
```kotlin
        InputBar(
            value = inputText,
            onValueChange = { viewModel.onInputChange(it) },
            onSend = { viewModel.sendMessage() },
            enabled = !isSending,
            isSending = isSending,
            onPickGallery = {
                galleryLauncher.launch(
                    androidx.activity.result.PickVisualMediaRequest(
                        ActivityResultContracts.PickVisualMedia.ImageOnly
                    )
                )
            },
            onOpenCamera = {
                val dir = File(context.cacheDir, "struk").apply { mkdirs() }
                val file = File(dir, "struk_${System.currentTimeMillis()}.jpg")
                val uri = FileProvider.getUriForFile(
                    context, "${context.packageName}.fileprovider", file
                )
                pendingCameraUri = uri
                cameraLauncher.launch(uri)
            }
        )
```
Di definisi `private fun InputBar(...)`, tambahkan dua parameter baru di signature:
```kotlin
private fun InputBar(
    value: String,
    onValueChange: (String) -> Unit,
    onSend: () -> Unit,
    enabled: Boolean,
    isSending: Boolean,
    onPickGallery: () -> Unit,
    onOpenCamera: () -> Unit
) {
```
Lalu pada `Box` tombol kamera (yang sekarang tanpa aksi), tambahkan `clickable` → buka galeri (tap) sebagai aksi utama; long-press tidak perlu. Ganti modifier Box kamera menjadi:
```kotlin
        Box(
            Modifier.size(42.dp).clip(RoundedCornerShape(13.dp)).background(Color(0xFFF4F6F8))
                .clickable(enabled = enabled) { onPickGallery() },
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Default.CameraAlt, contentDescription = "Foto struk", tint = TextSecondary, modifier = Modifier.size(20.dp))
        }
```
Pastikan import `androidx.compose.foundation.clickable` sudah ada (sudah ada di file). Kamera langsung (`onOpenCamera`) disediakan untuk iterasi berikut; untuk MVP, galeri sudah cukup mengaktifkan alur. (Catatan: `onOpenCamera` tetap di-wire agar tidak ada parameter tak terpakai — panggil dari galeri tidak; biarkan tersedia untuk langkah lanjut. Untuk menghindari warning unused, panggil `onOpenCamera` dari long-press opsional ATAU hapus parameter kamera jika ingin galeri-only. Pilih galeri-only bila ingin paling ramping: hapus `onOpenCamera`, `cameraLauncher`, `pendingCameraUri`, FileProvider Step 1-2.)

> **Keputusan implementer:** Untuk MVP paling ramping, **galeri-only** boleh dipilih (hapus bagian kamera + FileProvider). Bila kamera diinginkan, simpan semua. Default plan: galeri-only agar lebih sedikit permukaan error; kamera menyusul.

- [ ] **Step 5: Build**

Run: `cd android && ./gradlew assembleDebug`
Expected: BUILD SUCCESSFUL.

- [ ] **Step 6: Verifikasi manual di device**

Install: `adb install -r app/build/outputs/apk/debug/app-debug.apk`. Buka chat → tap ikon kamera → pilih foto struk transfer dari galeri → muncul bubble `"transfer ..."` → app tanya fee → jawab → dalam/luar → tersimpan. Cek saldo rekening sumber berkurang.

- [ ] **Step 7: Commit**
```bash
git -C android add app/src/main/AndroidManifest.xml app/src/main/res/xml/file_paths.xml app/src/main/java/id/klikagen/app/ui/screen/chat/ChatViewModel.kt app/src/main/java/id/klikagen/app/ui/screen/chat/ChatScreen.kt
git -C android commit -m "feat(ocr): wire foto struk -> OCR -> kalimat -> alur chat"
```

---

## Task 5: Test kontrak backend (kalimat struk terparse benar)

**Files:**
- Modify: `backend/tests/test_parser.py`

**Interfaces:**
- Consumes: `app.services.parser.parse_message` (existing, AI di-mock).

- [ ] **Step 1: Tambah test kontrak**

Tambahkan di `backend/tests/test_parser.py`:
```python
@pytest.mark.asyncio
async def test_parse_struk_composed_message():
    """Kalimat hasil StrukComposer: bank tujuan TIDAK jadi rekening_hint, admin_bank terbaca."""
    with patch("app.services.ai.call_ai") as mock_call_ai:
        # AI mengikuti aturan prompt: "pakai BRI" -> sumber; "ke BCA" -> note (tujuan).
        mock_call_ai.return_value = (
            '{"type":"transfer_setor","amount":500000,"fee":0,"admin_bank":6500,'
            '"harga_modal":0,"fee_model":"luar","rekening_hint":"BRI","note":"ke BCA"}'
        )
        result = await parser.parse_message("transfer 500000 admin bank 6500 pakai BRI ke BCA")
    assert result["type"] == "transfer_setor"
    assert result["amount"] == 500000
    assert result["admin_bank"] == 6500
    assert result["rekening_hint"] == "BRI"        # sumber, bukan tujuan
    assert "BCA" not in result["rekening_hint"]     # bank tujuan tidak bocor ke hint
```

Pastikan baris import di atas file sudah memuat `import pytest`, `from unittest.mock import patch`, dan `from app.services import parser` (sudah ada — lihat test existing).

- [ ] **Step 2: Jalankan test, pastikan PASS**

Run: `cd backend && ./venv/bin/pytest tests/test_parser.py::test_parse_struk_composed_message -v`
Expected: PASS.

- [ ] **Step 3: Jalankan full suite (tidak ada regresi)**

Run: `cd backend && ./venv/bin/pytest -q 2>&1 | tail -3`
Expected: semua hijau.

- [ ] **Step 4: Commit**
```bash
git -C backend add tests/test_parser.py
git -C backend commit -m "test(parser): kunci kontrak kalimat struk (tujuan tidak jadi rekening_hint)"
```

---

## Self-Review (hasil)

**Spec coverage:**
- §6.1 dep ML Kit unbundled → Task 2 ✓ ; §6.2 port file → Task 1+2 ✓ ; §6.3 StrukComposer → Task 3 ✓ ; §6.4 UI image pick → Task 4 ✓ ; §6.5 sendStrukImage → Task 4 ✓ ; §7 backend tanpa perubahan + verifikasi → Task 5 ✓ ; §8 offline (reuse PendingTrx via sendMessage) → Task 4 Step 3 ✓ ; §9.1 port BankParserTest → Task 1 ✓ ; §9.1 StrukComposerTest → Task 3 ✓ ; §9.2 backend test → Task 5 ✓ ; §4 nuansa sumber/tujuan → dikunci di Task 3 (composer) & Task 5 (parser) ✓.
- Gap: §6.1 warm-up → Task 2 Step 3 ✓. Tidak ada gap tersisa.

**Placeholder scan:** Tidak ada TBD/TODO. Port verbatim merujuk path sumber eksak. Galeri-only vs kamera adalah keputusan implementer eksplisit dengan default jelas, bukan placeholder.

**Type consistency:** `BankParser.parse`/`detectBank`/`BankType.display`/`TransferData` field konsisten antar Task 1→3→4. `StrukComposer.compose(TransferData, BankParser.BankType): String` sama di Task 3 & 4. `sendStrukImage(uri: Uri)` sama di Task 4.
