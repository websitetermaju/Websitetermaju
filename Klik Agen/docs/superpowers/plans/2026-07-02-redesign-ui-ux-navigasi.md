# Redesign UI/UX + Navigasi (Sub-proyek A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign UI/UX app Android Klik Agen agar chat jadi HERO full-screen, visual konsisten (satu palet emerald, ikon vektor, launcher icon rebrand), dan siapkan slot/komponen placeholder untuk fitur PRD — tanpa mengubah backend.

**Architecture:** App Compose+Hilt single-Activity. Ganti navigasi `when(selectedTab)` jadi sealed-state stack + `BackHandler`. Hapus bottom-nav; chat jadi home dengan top bar (chip saldo + Rekap + Setelan). Poles semua layar existing: satukan palet, konsolidasi `formatRupiah`, ganti emoji→ikon vektor, migrasi Material 2→3. Tambah empty-state chat + sambutan AI statis. Semua perubahan UI-only.

**Tech Stack:** Kotlin, Jetpack Compose (BOM 2024.04.01), Material3 + material-icons-extended, Hilt, Navigation-Compose 2.7.7, JUnit 4.13.2 (JVM unit test).

## Global Constraints

- Package root: `id.klikagen.app`. Semua path di `android/app/src/main/java/id/klikagen/app/`.
- Palet kanonik: emerald `Pri=#0E9F6E`, `PriDark=#057A52`, `PriSoft=#E7F6EF`; semantik `CreditGreen`, `DebitRed`, `TextPrimary/Secondary/Muted`, `BorderLight`, `Bg`, `SurfaceWhite`. DILARANG menambah warna hardcode baru di komponen.
- Font: Plus Jakarta Sans via `MaterialTheme.typography` (jangan `fontSize` mentah di komponen baru).
- Ikon: HANYA vektor (`Icons.*` dari `material-icons-extended`) atau vector drawable. NOL emoji sebagai ikon.
- Touch target interaktif ≥48dp.
- Copy bahasa agen ("kak", "cuan"), bukan bahasa bank.
- JANGAN ubah backend, DTO, atau pemetaan warna arah kas (`debit→CreditGreen`, `credit→DebitRed` — load-bearing).
- Test: hanya JVM unit test tersedia (`app/src/test/`). TDD untuk logika murni (format, reducer nav, prioritas banner). Perubahan visual diverifikasi via `./gradlew assembleDebug` hijau.
- Build verify command: `cd android && ./gradlew :app:compileDebugKotlin` (cepat) atau `./gradlew assembleDebug` (penuh).
- Commit tiap task selesai.

---

## File Structure

**Dibuat baru:**
- `ui/theme/Spacing.kt` — token spacing/radius terpusat.
- `ui/screen/main/MainNavState.kt` — sealed state navigasi + reducer murni (testable).
- `ui/screen/chat/ChatWelcome.kt` — komponen empty-state + sambutan AI + contoh pill.
- `ui/screen/chat/ChatBanners.kt` — logika prioritas & stacking banner (testable) + composable stack.
- `ui/screen/chat/ConfirmCard.kt` — komponen placeholder confirm-gate (pre-save).
- `app/src/test/java/id/klikagen/app/RupiahFormatTest.kt`
- `app/src/test/java/id/klikagen/app/MainNavStateTest.kt`
- `app/src/test/java/id/klikagen/app/ChatBannersTest.kt`

**Dimodifikasi:**
- `ui/theme/Color.kt` — hapus alias lama.
- `util/RupiahFormat.kt` — tambah overload `Double` kanonik.
- `res/drawable/ic_launcher_background.xml`, `ic_launcher_foreground.xml` — rebrand emerald + KA.
- `ui/screen/main/MainScreen.kt` — sealed-state nav + BackHandler, hapus bottom-nav.
- `ui/screen/chat/ChatScreen.kt` — top bar, empty-state, banner stack, rename card, retry, storeName.
- `ui/screen/chat/ChatViewModel.kt` — helper `isHistoryEmpty`, teks welcome (statis).
- `ui/screen/rekap/RekapScreen.kt` — emoji 🔥→ikon, token warna.
- `ui/screen/akun/AkunScreen.kt` — hapus dead code, emoji→ikon, warna, Bantuan diperkaya.
- `ui/screen/akun/FeeTierScreen.kt` — emoji 📊→ikon, palet, back icon, buang `formatRp` lokal.
- `ui/screen/akun/KelolaRekeningSheet.kt` — surface error, buang `formatRupiah` lokal, back icon.
- `ui/screen/saldo/ArusKasScreen.kt` — Material2→3 pull-refresh, TopAppBar.
- `ui/screen/saldo/DaftarRekeningScreen.kt` — buang duplikasi visual akun, pindah `formatRupiah`.
- `ui/screen/saldo/TambahRekeningSheet.kt` — dedup vs RekeningFormDialog (hapus salah satu).
- `ui/screen/login/LoginScreen.kt`, `register/RegisterScreen.kt` — show/hide password, back icon.

---

## Task 1: Konsolidasi `formatRupiah` (fondasi, TDD)

**Files:**
- Modify: `util/RupiahFormat.kt`
- Test: `app/src/test/java/id/klikagen/app/RupiahFormatTest.kt` (create)

**Interfaces:**
- Produces: `fun formatRupiah(amount: Double): String` di paket `id.klikagen.app.util` → "Rp 1.000.000". `formatRupiah(String)` & `stripToDigits(String)` tetap ada.

- [ ] **Step 1: Tulis test gagal**

Create `app/src/test/java/id/klikagen/app/RupiahFormatTest.kt`:
```kotlin
package id.klikagen.app

import id.klikagen.app.util.formatRupiah
import org.junit.Assert.assertEquals
import org.junit.Test

class RupiahFormatTest {
    @Test fun formatsDoubleWithThousandsAndPrefix() {
        assertEquals("Rp 1.000.000", formatRupiah(1_000_000.0))
    }
    @Test fun formatsZero() {
        assertEquals("Rp 0", formatRupiah(0.0))
    }
    @Test fun dropsFraction() {
        assertEquals("Rp 1.500", formatRupiah(1_500.4))
    }
    @Test fun stringOverloadStillWorks() {
        assertEquals("1.000.000", formatRupiah("1000000"))
    }
}
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `cd android && ./gradlew :app:testDebugUnitTest --tests "id.klikagen.app.RupiahFormatTest"`
Expected: FAIL — `formatRupiah(Double)` belum ada (unresolved reference / ambiguity).

- [ ] **Step 3: Tambah overload Double kanonik**

Di `util/RupiahFormat.kt`, tambah setelah fungsi yang ada:
```kotlin
/** Format nominal Double jadi "Rp 1.000.000" (locale id-ID, tanpa desimal). */
fun formatRupiah(amount: Double): String {
    val formatted = java.text.NumberFormat.getNumberInstance(Locale("id", "ID")).apply {
        maximumFractionDigits = 0
    }.format(amount)
    return "Rp $formatted"
}
```

- [ ] **Step 4: Jalankan, pastikan lulus**

Run: `cd android && ./gradlew :app:testDebugUnitTest --tests "id.klikagen.app.RupiahFormatTest"`
Expected: PASS (4 test).

- [ ] **Step 5: Ganti pemakai lokal ke util kanonik**

- `ui/screen/saldo/DaftarRekeningScreen.kt:238-241` — HAPUS fungsi `formatRupiah(Double)` lokal, tambah import `import id.klikagen.app.util.formatRupiah`.
- `ui/screen/akun/KelolaRekeningSheet.kt:320` — HAPUS `private fun formatRupiah(amount: Double)`, tambah import util.
- `ui/screen/akun/FeeTierScreen.kt:29` — HAPUS `private fun formatRp(amount: Double)`; ganti semua panggilan `formatRp(` → `formatRupiah(`, tambah import util.
- `ui/screen/rekap/RekapScreen.kt:36` — ganti import `import id.klikagen.app.ui.screen.saldo.formatRupiah` → `import id.klikagen.app.util.formatRupiah`.

- [ ] **Step 6: Build verify**

Run: `cd android && ./gradlew :app:compileDebugKotlin`
Expected: BUILD SUCCESSFUL (tak ada referensi format lama).

- [ ] **Step 7: Commit**

```bash
git add android/app/src/main/java/id/klikagen/app/util/RupiahFormat.kt android/app/src/test/java/id/klikagen/app/RupiahFormatTest.kt android/app/src/main/java/id/klikagen/app/ui/screen/saldo/DaftarRekeningScreen.kt android/app/src/main/java/id/klikagen/app/ui/screen/akun/KelolaRekeningSheet.kt android/app/src/main/java/id/klikagen/app/ui/screen/akun/FeeTierScreen.kt android/app/src/main/java/id/klikagen/app/ui/screen/rekap/RekapScreen.kt
git commit -m "refactor: konsolidasi formatRupiah jadi satu util kanonik"
```

---

## Task 2: Spacing tokens

**Files:**
- Create: `ui/theme/Spacing.kt`

**Interfaces:**
- Produces: `object Spacing { val xs=4.dp; val sm=8.dp; val md=12.dp; val lg=16.dp; val xl=24.dp }` dan `object Radius { val sm=8.dp; val md=13.dp; val lg=16.dp; val xl=20.dp; val pill=999.dp }`.

- [ ] **Step 1: Buat file token**

Create `ui/theme/Spacing.kt`:
```kotlin
package id.klikagen.app.ui.theme

import androidx.compose.ui.unit.dp

/** Skala spacing 4/8dp terpusat — ganti angka mentah bertahap saat menyentuh layar. */
object Spacing {
    val xs = 4.dp
    val sm = 8.dp
    val md = 12.dp
    val lg = 16.dp
    val xl = 24.dp
}

/** Skala radius sudut terpusat. */
object Radius {
    val sm = 8.dp
    val md = 13.dp
    val lg = 16.dp
    val xl = 20.dp
    val pill = 999.dp
}
```

- [ ] **Step 2: Build verify**

Run: `cd android && ./gradlew :app:compileDebugKotlin`
Expected: BUILD SUCCESSFUL.

- [ ] **Step 3: Commit**

```bash
git add android/app/src/main/java/id/klikagen/app/ui/theme/Spacing.kt
git commit -m "feat: tambah token Spacing & Radius terpusat"
```

---

## Task 3: Satukan palet — buang alias lama

**Files:**
- Modify: `ui/theme/Color.kt`, `ui/screen/akun/AkunScreen.kt`, `ui/screen/akun/FeeTierScreen.kt`

**Interfaces:**
- Consumes: token `Pri`, `PriDark`, `PriSoft`, `CreditGreen`, `DebitRed`, `TextPrimary/Secondary/Muted`, `BorderLight`.

- [ ] **Step 1: Ganti pemakaian alias lama di AkunScreen & FeeTierScreen**

Peta ganti (berlaku di kedua file):
- `Blue500` → `Pri`
- `Blue100` → `PriSoft`
- `Gray500` → `TextSecondary`
- `Gray700` → `TextPrimary`
- `Gray100` → `BorderLight`
- `Green500` → `CreditGreen`
- `Red500` → `DebitRed`
- `Orange500` → `Pri` (atau `DebitRed` bila konteks warning; pilih sesuai makna di lokasi — cek tiap pemakaian)

Sesuaikan blok `import ... .ui.theme.*` agar mengimpor token baru dan menghapus import alias lama.

- [ ] **Step 2: Build verify (sebelum hapus alias)**

Run: `cd android && ./gradlew :app:compileDebugKotlin`
Expected: SUCCESS — pastikan tak ada lagi pemakai alias sebelum dihapus.

- [ ] **Step 3: Hapus alias lama dari Color.kt**

Di `ui/theme/Color.kt`, HAPUS baris L26-42 (blok `// Deprecated aliases` sampai akhir): `Blue500`, `Blue100`, `Gray500`, `Green500`, `Red500`, `Orange500`, `Gray100`, `Gray700`, `Gray900`. Sisakan hanya token aktif (Pri*, Bg, Surface, Border, Text*, Nav*, semantik, Logout*).

- [ ] **Step 4: Build verify (konfirmasi nol referensi)**

Run: `cd android && ./gradlew :app:compileDebugKotlin`
Expected: BUILD SUCCESSFUL. Bila gagal "unresolved reference: Blue500" dll → masih ada pemakai; balik ke Step 1.

- [ ] **Step 5: Grep sanity**

Run: `cd android && grep -rn "Blue500\|Blue100\|Gray500\|Gray700\|Gray100\|Green500\|Red500\|Orange500" app/src/main`
Expected: nihil (kosong).

- [ ] **Step 6: Commit**

```bash
git add android/app/src/main/java/id/klikagen/app/ui/theme/Color.kt android/app/src/main/java/id/klikagen/app/ui/screen/akun/AkunScreen.kt android/app/src/main/java/id/klikagen/app/ui/screen/akun/FeeTierScreen.kt
git commit -m "refactor: satukan palet warna, buang alias Blue/Gray lama"
```

---

## Task 4: Rebrand launcher icon (biru → emerald KA)

**Files:**
- Modify: `res/drawable/ic_launcher_background.xml`, `res/drawable/ic_launcher_foreground.xml`

- [ ] **Step 1: Ganti background jadi emerald**

Ganti isi `app/src/main/res/drawable/ic_launcher_background.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#0E9F6E"
        android:pathData="M0,0h108v108H0z"/>
</vector>
```

- [ ] **Step 2: Ganti foreground jadi monogram "KA"**

Ganti isi `app/src/main/res/drawable/ic_launcher_foreground.xml` (teks "KA" putih di dalam safe zone tengah; pakai path vektor sederhana — bulatan latar transparan + dua huruf). Karena path glyph kompleks, gunakan pendekatan huruf via `pathData` tebal. Isi:
```xml
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <!-- Safe zone adaptive icon: konten inti ~66dp di tengah (offset 21..87) -->
    <!-- Huruf K -->
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M34,38h6v13l11,-13h7.5l-12,14l12.5,18h-7.5l-9,-13l-2.5,3v10h-6z"/>
    <!-- Huruf A -->
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M62,70l9,-32h6l9,32h-6l-1.7,-6.5h-8.6l-1.7,6.5zM71.2,58h6.1l-3,-11.5z"/>
</vector>
```

- [ ] **Step 3: Build verify**

Run: `cd android && ./gradlew assembleDebug`
Expected: BUILD SUCCESSFUL (resource valid, tak ada error inflate).

- [ ] **Step 4: Verifikasi visual (manual/emulator)**

Jalankan di emulator/device, cek icon homescreen: latar emerald, "KA" putih terbaca, tidak terpotong pada bentuk mask (bulat/squircle). Bila glyph terlihat kurang rapi, sesuaikan `pathData` (ini item visual — iterasi wajar).

Fallback bila path glyph sulit dirapikan: render "KA" via font di generator (Android Studio → New > Image Asset > Text) lalu ganti drawable — tetap emerald `#0E9F6E`, teks putih. Dokumentasikan pilihan di commit.

- [ ] **Step 5: Commit**

```bash
git add android/app/src/main/res/drawable/ic_launcher_background.xml android/app/src/main/res/drawable/ic_launcher_foreground.xml
git commit -m "feat: rebrand launcher icon jadi monogram KA emerald (dari biru)"
```

---

## Task 5: Reducer navigasi (sealed state, TDD)

**Files:**
- Create: `ui/screen/main/MainNavState.kt`
- Test: `app/src/test/java/id/klikagen/app/MainNavStateTest.kt` (create)

**Interfaces:**
- Produces:
  - `sealed interface NavDest { Home; Saldo; Rekap; Setelan }` (objects).
  - `data class MainNavState(val dest: NavDest = NavDest.Home)`.
  - `fun MainNavState.onBack(): MainNavState?` — kembali `Home` bila sedang di layar sekunder; `null` bila sudah `Home` (artinya biarkan sistem handle → exit).
  - `fun MainNavState.goTo(dest: NavDest): MainNavState`.

- [ ] **Step 1: Tulis test gagal**

Create `app/src/test/java/id/klikagen/app/MainNavStateTest.kt`:
```kotlin
package id.klikagen.app

import id.klikagen.app.ui.screen.main.MainNavState
import id.klikagen.app.ui.screen.main.NavDest
import id.klikagen.app.ui.screen.main.goTo
import id.klikagen.app.ui.screen.main.onBack
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class MainNavStateTest {
    @Test fun defaultIsHome() {
        assertEquals(NavDest.Home, MainNavState().dest)
    }
    @Test fun goToChangesDest() {
        assertEquals(NavDest.Rekap, MainNavState().goTo(NavDest.Rekap).dest)
    }
    @Test fun backFromSecondaryReturnsHome() {
        val s = MainNavState(NavDest.Setelan)
        assertEquals(NavDest.Home, s.onBack()!!.dest)
    }
    @Test fun backFromHomeIsNull() {
        assertNull(MainNavState(NavDest.Home).onBack())
    }
}
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `cd android && ./gradlew :app:testDebugUnitTest --tests "id.klikagen.app.MainNavStateTest"`
Expected: FAIL — kelas belum ada.

- [ ] **Step 3: Implementasi**

Create `ui/screen/main/MainNavState.kt`:
```kotlin
package id.klikagen.app.ui.screen.main

sealed interface NavDest {
    data object Home : NavDest
    data object Saldo : NavDest
    data object Rekap : NavDest
    data object Setelan : NavDest
}

data class MainNavState(val dest: NavDest = NavDest.Home)

fun MainNavState.goTo(dest: NavDest): MainNavState = copy(dest = dest)

/** Home → null (sistem yang handle back/exit). Layar sekunder → kembali ke Home. */
fun MainNavState.onBack(): MainNavState? =
    if (dest == NavDest.Home) null else copy(dest = NavDest.Home)
```

- [ ] **Step 4: Jalankan, pastikan lulus**

Run: `cd android && ./gradlew :app:testDebugUnitTest --tests "id.klikagen.app.MainNavStateTest"`
Expected: PASS (4 test).

- [ ] **Step 5: Commit**

```bash
git add android/app/src/main/java/id/klikagen/app/ui/screen/main/MainNavState.kt android/app/src/test/java/id/klikagen/app/MainNavStateTest.kt
git commit -m "feat: reducer navigasi sealed-state untuk chat-as-home"
```

---

## Task 6: MainScreen — pakai sealed nav, hapus bottom-nav, BackHandler, remap share-foto

**Files:**
- Modify: `ui/screen/main/MainScreen.kt`

**Interfaces:**
- Consumes: `MainNavState`, `NavDest`, `goTo`, `onBack` (Task 5); `ChatScreen(onTokenExpired, onOpenSaldo, onOpenRekap, onOpenSetelan, modifier)` (Task 8 menambah param — sementara Task 6 pakai signature lama + callback baru, lihat Step 2).
- Produces: layar sekunder di-push; back → Home; share-foto → paksa Home.

- [ ] **Step 1: Ganti state tab jadi sealed nav + BackHandler**

Di `MainScreen.kt`, ganti `var selectedTab by remember { mutableIntStateOf(TAB_CHAT) }` menjadi:
```kotlin
var navState by remember { mutableStateOf(MainNavState()) }
```
Tambah import:
```kotlin
import androidx.activity.compose.BackHandler
import id.klikagen.app.ui.screen.main.MainNavState
import id.klikagen.app.ui.screen.main.NavDest
import id.klikagen.app.ui.screen.main.goTo
import id.klikagen.app.ui.screen.main.onBack
```
Setelah deklarasi `navState`, tambah:
```kotlin
BackHandler(enabled = navState.dest != NavDest.Home) {
    navState.onBack()?.let { navState = it }
}
```

- [ ] **Step 2: Ganti share-foto remap**

Ganti blok `LaunchedEffect(pendingSharedUri)` (yang set `selectedTab = TAB_CHAT`) jadi:
```kotlin
LaunchedEffect(pendingSharedUri) {
    if (pendingSharedUri != null) navState = navState.goTo(NavDest.Home)
}
```

- [ ] **Step 3: Hapus `Scaffold` bottomBar, render per NavDest**

Ganti seluruh `Scaffold { ... NavigationBar ... }` menjadi `Box` fullscreen yang me-render sesuai `navState.dest`. Chat jadi Home; layar lain di-push. Ganti isi body:
```kotlin
Box(
    modifier = Modifier
        .fillMaxSize()
        .background(Bg)
        .statusBarsPadding()
        .navigationBarsPadding()
) {
    when (navState.dest) {
        NavDest.Home -> ChatScreen(
            onTokenExpired = onLogout,
            onOpenSaldo = { navState = navState.goTo(NavDest.Saldo) },
            onOpenRekap = { navState = navState.goTo(NavDest.Rekap) },
            onOpenSetelan = { navState = navState.goTo(NavDest.Setelan) },
            storeName = storeName,
            modifier = Modifier.fillMaxSize()
        )
        NavDest.Saldo -> {
            if (selectedAccountId == null) DaftarRekeningScreen(
                refreshKey = saldoRefreshKey,
                onAccountClick = { id, name -> selectedAccountId = id; selectedAccountName = name },
                modifier = Modifier.fillMaxSize()
            ) else ArusKasScreen(
                accountId = selectedAccountId!!, accountName = selectedAccountName,
                onBack = { selectedAccountId = null }, modifier = Modifier.fillMaxSize()
            )
        }
        NavDest.Rekap -> RekapScreen(modifier = Modifier.fillMaxSize())
        NavDest.Setelan -> AkunScreen(
            onLogout = onLogout,
            onNavigateToSaldo = { navState = navState.goTo(NavDest.Saldo) },
            modifier = Modifier.fillMaxSize()
        )
    }
}
```
Catatan: nested back Saldo (ArusKas→DaftarRekening) sudah ditangani `selectedAccountId` + `onBack` internal. `BackHandler` global menangani sekunder→Home. Bila di ArusKas, tombol back layar (Task 12) yang pop ke DaftarRekening; tombol back sistem akan ke Home (dapat diterima untuk A).
Hapus `import`/konstanta yang tak lagi dipakai: `TAB_CHAT`, ikon `Chat/AccountBalance/Assessment/Settings`, `NavigationBar*`, `Scaffold`, `ime` handling lama (keyboard kini ditangani ChatScreen sendiri).

- [ ] **Step 4: Build verify**

Run: `cd android && ./gradlew :app:compileDebugKotlin`
Expected: gagal SEMENTARA karena `ChatScreen` belum punya param baru (`onOpenSaldo/…/storeName`). Ini diselesaikan Task 8. Bila mengeksekusi berurutan, lanjutkan ke Task 7-8 lalu build. Untuk menjaga tiap task hijau, **gabungkan Step 3 ini agar dikompilasi bersama Task 8** — lihat catatan urutan di bawah.

> **Urutan eksekusi:** Task 6 Step 3 mengubah pemanggilan `ChatScreen`. Karena signature `ChatScreen` baru dibuat di Task 8, kerjakan Task 6 (Step 1-2) → commit, lalu Task 7 → Task 8 (yang mengubah `ChatScreen` + build hijau bersama Step 3). Step 3 di-commit sebagai bagian Task 8. Tandai Step 3-4 di sini sebagai "diselesaikan di Task 8".

- [ ] **Step 5: Commit (Step 1-2 saja)**

```bash
git add android/app/src/main/java/id/klikagen/app/ui/screen/main/MainScreen.kt
git commit -m "feat: MainScreen pakai sealed nav + BackHandler + remap share-foto (WIP body di Task 8)"
```

---

## Task 7: ChatViewModel — helper history kosong + teks sambutan statis

**Files:**
- Modify: `ui/screen/chat/ChatViewModel.kt`

**Interfaces:**
- Produces:
  - `val isHistoryEmpty: StateFlow<Boolean>` — true bila `messages` kosong DAN tidak loading.
  - `object ChatWelcomeContent { const val greeting; val examples: List<Pair<String,String>> }` (label→teks kirim). Statis, tanpa panggilan AI.

- [ ] **Step 1: Tambah StateFlow turunan `isHistoryEmpty`**

Di `ChatViewModel.kt`, tambah import:
```kotlin
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
```
Tambah properti (setelah `_isLoading`/`_messages` terdefinisi):
```kotlin
val isHistoryEmpty: StateFlow<Boolean> =
    combine(_messages, _isLoading) { msgs, loading -> msgs.isEmpty() && !loading }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)
```

- [ ] **Step 2: Tambah konten sambutan statis**

Buat file kecil di paket chat — `ui/screen/chat/ChatWelcomeContent.kt`:
```kotlin
package id.klikagen.app.ui.screen.chat

/** Teks sambutan first-run — STATIS di app (bukan panggilan AI). Selaras zero-belajar PRD. */
object ChatWelcomeContent {
    const val greeting =
        "Halo kak! Aku Klik Agen. Catat transaksi cukup ngobrol kayak WhatsApp — gak perlu isi form. " +
        "Coba ketuk salah satu ini, atau kirim foto struk:"
    /** label pill → teks yang dikirim ke chat saat diketuk. */
    val examples: List<Pair<String, String>> = listOf(
        "Transfer 300rb fee 5rb" to "Catat transfer 300rb fee 5rb",
        "Tarik tunai 500rb" to "Catat tarik tunai 500rb",
        "Rekap hari ini" to "Rekap hari ini",
    )
}
```

- [ ] **Step 3: Build verify**

Run: `cd android && ./gradlew :app:compileDebugKotlin`
Expected: BUILD SUCCESSFUL.

- [ ] **Step 4: Commit**

```bash
git add android/app/src/main/java/id/klikagen/app/ui/screen/chat/ChatViewModel.kt android/app/src/main/java/id/klikagen/app/ui/screen/chat/ChatWelcomeContent.kt
git commit -m "feat: state history-kosong + konten sambutan chat statis"
```

---

## Task 8: Prioritas & stacking banner (TDD)

**Files:**
- Create: `ui/screen/chat/ChatBanners.kt`
- Test: `app/src/test/java/id/klikagen/app/ChatBannersTest.kt` (create)

**Interfaces:**
- Produces:
  - `enum class SystemBanner { OFFLINE, STALE, DEGRADED }`
  - `fun pickSystemBanner(offline: Boolean, stale: Boolean, degraded: Boolean): SystemBanner?` — prioritas OFFLINE > STALE > DEGRADED; `null` bila tak ada.

- [ ] **Step 1: Tulis test gagal**

Create `app/src/test/java/id/klikagen/app/ChatBannersTest.kt`:
```kotlin
package id.klikagen.app

import id.klikagen.app.ui.screen.chat.SystemBanner
import id.klikagen.app.ui.screen.chat.pickSystemBanner
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class ChatBannersTest {
    @Test fun offlineWins() {
        assertEquals(SystemBanner.OFFLINE, pickSystemBanner(offline = true, stale = true, degraded = true))
    }
    @Test fun staleBeatsDegraded() {
        assertEquals(SystemBanner.STALE, pickSystemBanner(offline = false, stale = true, degraded = true))
    }
    @Test fun degradedOnly() {
        assertEquals(SystemBanner.DEGRADED, pickSystemBanner(offline = false, stale = false, degraded = true))
    }
    @Test fun noneWhenAllClear() {
        assertNull(pickSystemBanner(offline = false, stale = false, degraded = false))
    }
}
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `cd android && ./gradlew :app:testDebugUnitTest --tests "id.klikagen.app.ChatBannersTest"`
Expected: FAIL — belum ada.

- [ ] **Step 3: Implementasi picker**

Create `ui/screen/chat/ChatBanners.kt`:
```kotlin
package id.klikagen.app.ui.screen.chat

/** Banner status sistem, urut prioritas. Hanya SATU yang tampil sekaligus. */
enum class SystemBanner { OFFLINE, STALE, DEGRADED }

/** Pilih satu banner status sistem: OFFLINE > STALE > DEGRADED. null = tak ada. */
fun pickSystemBanner(offline: Boolean, stale: Boolean, degraded: Boolean): SystemBanner? = when {
    offline -> SystemBanner.OFFLINE
    stale -> SystemBanner.STALE
    degraded -> SystemBanner.DEGRADED
    else -> null
}
```

- [ ] **Step 4: Jalankan, pastikan lulus**

Run: `cd android && ./gradlew :app:testDebugUnitTest --tests "id.klikagen.app.ChatBannersTest"`
Expected: PASS (4 test).

- [ ] **Step 5: Commit**

```bash
git add android/app/src/main/java/id/klikagen/app/ui/screen/chat/ChatBanners.kt android/app/src/test/java/id/klikagen/app/ChatBannersTest.kt
git commit -m "feat: prioritas banner status sistem (offline>stale>degraded)"
```

---

## Task 9: ChatScreen — top bar, empty-state, banner stack, rename card, retry, storeName

**Files:**
- Modify: `ui/screen/chat/ChatScreen.kt`
- Create: `ui/screen/chat/ConfirmCard.kt`

**Interfaces:**
- Consumes: `ChatWelcomeContent`, `isHistoryEmpty` (Task 7); `pickSystemBanner`, `SystemBanner` (Task 8); `formatRupiah` (Task 1); `Spacing`/`Radius` (Task 2).
- Produces: `fun ChatScreen(onTokenExpired: () -> Unit, onOpenSaldo: () -> Unit, onOpenRekap: () -> Unit, onOpenSetelan: () -> Unit, storeName: String, modifier: Modifier, viewModel: ChatViewModel)`.

- [ ] **Step 1: Ubah signature ChatScreen + kumpulkan state baru**

Ganti header fungsi `ChatScreen` jadi:
```kotlin
@Composable
fun ChatScreen(
    onTokenExpired: () -> Unit,
    onOpenSaldo: () -> Unit,
    onOpenRekap: () -> Unit,
    onOpenSetelan: () -> Unit,
    storeName: String,
    modifier: Modifier = Modifier,
    viewModel: ChatViewModel = hiltViewModel()
) {
```
Tambah pengumpulan state:
```kotlin
val isHistoryEmpty by viewModel.isHistoryEmpty.collectAsState()
```
Tambah import: `id.klikagen.app.util.formatRupiah`, `id.klikagen.app.ui.theme.Spacing`, `id.klikagen.app.ui.theme.Radius`, ikon `Icons.Filled.Settings`, `Icons.Filled.Print`, `Icons.Filled.Assessment`, `Icons.Filled.AccountBalanceWallet`.

- [ ] **Step 2: Ganti `ChatHeader` jadi top bar (chip saldo + Rekap + Setelan)**

Ganti pemanggilan `ChatHeader(storeName = "Toko")` → `ChatTopBar(storeName = storeName, onOpenSaldo = onOpenSaldo, onOpenRekap = onOpenRekap, onOpenSetelan = onOpenSetelan)`.
Ganti definisi `private fun ChatHeader(storeName: String)` menjadi:
```kotlin
@Composable
private fun ChatTopBar(
    storeName: String,
    onOpenSaldo: () -> Unit,
    onOpenRekap: () -> Unit,
    onOpenSetelan: () -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth().height(58.dp).background(Color.White).padding(horizontal = Spacing.md),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Chip saldo (kiri) — tap buka Saldo. Angka saldo diisi fitur nanti; untuk A tampilkan label toko.
        Row(
            modifier = Modifier.clip(RoundedCornerShape(Radius.pill)).background(PriSoft)
                .clickable { onOpenSaldo() }.padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Filled.AccountBalanceWallet, contentDescription = "Saldo", tint = PriDark, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(6.dp))
            Text(if (storeName.isBlank()) "Saldo" else storeName, style = MaterialTheme.typography.labelLarge.copy(color = PriDark), maxLines = 1)
        }
        Spacer(Modifier.weight(1f))
        // Rekap
        Box(Modifier.size(44.dp).clip(RoundedCornerShape(Radius.md)).clickable { onOpenRekap() }, contentAlignment = Alignment.Center) {
            Icon(Icons.Filled.Assessment, contentDescription = "Rekap", tint = TextSecondary, modifier = Modifier.size(22.dp))
        }
        // Setelan
        Box(Modifier.size(44.dp).clip(RoundedCornerShape(Radius.md)).clickable { onOpenSetelan() }, contentAlignment = Alignment.Center) {
            Icon(Icons.Filled.Settings, contentDescription = "Setelan", tint = TextSecondary, modifier = Modifier.size(22.dp))
        }
    }
    HorizontalDivider(color = BorderLight, thickness = 1.dp)
}
```
> Catatan: chip menampilkan nama toko untuk A (angka saldo real = fitur backend nanti). Ini bukan data palsu — label toko memang tersedia.

- [ ] **Step 3: Ganti banner ad-hoc jadi banner stack berprioritas**

Ganti blok:
```kotlin
if (isOffline) Banner(...)
if (isDegraded && !isOffline) Banner(...)
if (hasStalePending) Banner(...)
```
menjadi:
```kotlin
when (pickSystemBanner(offline = isOffline, stale = hasStalePending, degraded = isDegraded)) {
    SystemBanner.OFFLINE -> Banner("Offline — transaksi disimpan lokal, akan terkirim otomatis", Color(0xFF9E9E9E))
    SystemBanner.STALE -> Banner("2 hari belum tersinkron — segera sambungkan internet", DebitRed)
    SystemBanner.DEGRADED -> Banner("Mode simpel aktif — AI sedang gangguan, input tetap bisa masuk", Color(0xFFFFA000))
    null -> {}
}
```
Tambah import `id.klikagen.app.ui.screen.chat.pickSystemBanner` & `SystemBanner` (satu paket, tak wajib import tapi eksplisit boleh).

- [ ] **Step 4: Empty-state — tampilkan sambutan saat history kosong**

Di dalam `else` (bukan loading) sebelum/menggantikan LazyColumn kosong, bila `isHistoryEmpty` true render welcome. Sisipkan sebelum `LazyColumn`:
```kotlin
if (isHistoryEmpty) {
    ChatWelcome(
        onExampleTap = { sendText -> viewModel.onInputChange(sendText); viewModel.sendMessage() },
        modifier = Modifier.weight(1f).fillMaxWidth()
    )
} else {
    LazyColumn( /* existing */ ) { /* existing items */ }
}
```

- [ ] **Step 5: Buat komponen `ChatWelcome`**

Tambah di file `ChatScreen.kt` (atau file baru `ui/screen/chat/ChatWelcome.kt`; jika file baru, jadikan `@Composable internal fun`):
```kotlin
@Composable
private fun ChatWelcome(onExampleTap: (String) -> Unit, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.padding(horizontal = Spacing.lg),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(Modifier.size(56.dp).clip(RoundedCornerShape(Radius.lg)).background(PriSoft), contentAlignment = Alignment.Center) {
            Text("KA", color = PriDark, style = MaterialTheme.typography.titleLarge)
        }
        Spacer(Modifier.height(Spacing.lg))
        Text(
            ChatWelcomeContent.greeting,
            style = MaterialTheme.typography.bodyLarge.copy(color = TextSecondary),
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(Spacing.lg))
        ChatWelcomeContent.examples.forEach { (label, sendText) ->
            Box(
                Modifier.fillMaxWidth().padding(vertical = 5.dp)
                    .clip(RoundedCornerShape(Radius.md)).background(Color.White)
                    .border(1.dp, BorderLight, RoundedCornerShape(Radius.md))
                    .clickable { onExampleTap(sendText) }
                    .padding(horizontal = Spacing.lg, vertical = 14.dp)
            ) {
                Text(label, style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold, color = TextPrimary))
            }
        }
    }
}
```

- [ ] **Step 6: Rename `ConfirmationCard` → `ReceiptCard`**

Ganti nama fungsi `private fun ConfirmationCard(msg: ChatMessageDisplay)` → `ReceiptCard`, dan pemanggilnya di `when` (`msg.transaction != null -> ReceiptCard(msg)`). Semantik tak berubah (kartu post-save "Transaksi tercatat ✓").

- [ ] **Step 7: Buat `ConfirmCard` placeholder (belum dipakai di alur)**

Create `ui/screen/chat/ConfirmCard.kt`:
```kotlin
package id.klikagen.app.ui.screen.chat

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import id.klikagen.app.ui.theme.*

/**
 * Confirm-gate PRESAVE (PRD Prinsip #3 "konfirmasi bukan tebak").
 * PLACEHOLDER sub-proyek A: komponen visual siap, BELUM disambung —
 * butuh backend draft + endpoint confirm (Fase 0). Tak dipanggil di alur nyata.
 */
@Composable
fun ConfirmCard(
    title: String,
    amountLabel: String,
    detail: String,
    onConfirm: () -> Unit,
    onEdit: () -> Unit,
    onCancel: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.clip(RoundedCornerShape(Radius.xl)).background(Color.White)
            .border(1.dp, BorderLight, RoundedCornerShape(Radius.xl)).padding(Spacing.lg)
    ) {
        Text(title, style = MaterialTheme.typography.bodyMedium.copy(color = TextSecondary, fontWeight = FontWeight.SemiBold))
        Text(amountLabel, style = MaterialTheme.typography.headlineMedium.copy(color = TextPrimary))
        if (detail.isNotBlank()) {
            Spacer(Modifier.height(Spacing.xs))
            Text(detail, style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
        }
        Spacer(Modifier.height(Spacing.lg))
        Row(horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            Box(
                Modifier.weight(1f).clip(RoundedCornerShape(Radius.md)).background(Pri)
                    .clickable { onConfirm() }.padding(vertical = 14.dp),
                contentAlignment = androidx.compose.ui.Alignment.Center
            ) { Text("Ya, simpan", color = Color.White, style = MaterialTheme.typography.titleSmall) }
            Box(
                Modifier.clip(RoundedCornerShape(Radius.md)).border(1.dp, BorderLight, RoundedCornerShape(Radius.md))
                    .clickable { onEdit() }.padding(horizontal = 18.dp, vertical = 14.dp),
                contentAlignment = androidx.compose.ui.Alignment.Center
            ) { Text("Edit", color = TextPrimary, style = MaterialTheme.typography.titleSmall) }
        }
        Spacer(Modifier.height(Spacing.xs))
        Box(Modifier.fillMaxWidth().clickable { onCancel() }.padding(vertical = 8.dp), contentAlignment = androidx.compose.ui.Alignment.Center) {
            Text("Batal", color = TextSecondary, style = MaterialTheme.typography.bodySmall)
        }
    }
}
```

- [ ] **Step 8: Ganti emoji cetak struk & bubble lokal**

- Ganti `QuickActionPill("🖨️ Cetak Struk")` → gunakan pill dengan ikon: sisipkan `Icon(Icons.Filled.Print, ...)` + teks "Cetak Struk". Minimal: ubah label jadi "Cetak Struk" dan tambahkan ikon di kiri pill (buat varian `QuickActionPill` menerima leading icon opsional, atau bungkus Row(Icon+Text)).
- Bubble sistem lokal di ViewModel (`"📥 Disimpan lokal…"`, `"🧾 Memproses…"`) — biarkan (teks chat, bukan ikon UI). Opsional: hapus emoji dari string bila ingin bersih total.

- [ ] **Step 9: Retry pada bubble error kirim**

Di `ChatViewModel.sendMessage()` catch block, ubah pesan error agar bisa retry: simpan teks terakhir. Tambah fungsi:
```kotlin
private var lastFailedText: String? = null
fun retryLastMessage() {
    val t = lastFailedText ?: return
    lastFailedText = null
    _inputText.value = t
    sendMessage()
}
```
Di catch, sebelum menambah bubble error: `lastFailedText = text`. Di `ChatScreen`, deteksi bubble id berawalan `"err_"` → render dengan aksi tap `viewModel.retryLastMessage()` (bungkus `BotBubble` error dalam `Modifier.clickable`). Tambahkan teks "· ketuk untuk coba lagi".

- [ ] **Step 10: Selesaikan Task 6 Step 3 (body MainScreen) + build hijau bersama**

Terapkan Task 6 Step 3 sekarang (signature `ChatScreen` sudah cocok). Lalu:

Run: `cd android && ./gradlew :app:compileDebugKotlin`
Expected: BUILD SUCCESSFUL.

- [ ] **Step 11: Build penuh + test suite**

Run: `cd android && ./gradlew assembleDebug && ./gradlew :app:testDebugUnitTest`
Expected: BUILD SUCCESSFUL; semua unit test PASS.

- [ ] **Step 12: Commit**

```bash
git add android/app/src/main/java/id/klikagen/app/ui/screen/chat/ChatScreen.kt android/app/src/main/java/id/klikagen/app/ui/screen/chat/ConfirmCard.kt android/app/src/main/java/id/klikagen/app/ui/screen/chat/ChatViewModel.kt android/app/src/main/java/id/klikagen/app/ui/screen/main/MainScreen.kt
git commit -m "feat: chat top bar + empty-state sambutan + banner stack + ReceiptCard/ConfirmCard + retry"
```

---

## Task 10: RekapScreen — emoji 🔥 → ikon, token warna

**Files:**
- Modify: `ui/screen/rekap/RekapScreen.kt`

- [ ] **Step 1: Ganti emoji streak jadi ikon**

Ganti `Text("🔥", fontSize = 22.sp)` (L114) menjadi:
```kotlin
Icon(Icons.Filled.LocalFireDepartment, contentDescription = null, tint = Pri, modifier = Modifier.size(22.dp))
```
Tambah import `androidx.compose.material.icons.Icons`, `androidx.compose.material.icons.filled.LocalFireDepartment`, `androidx.compose.material3.Icon`.

- [ ] **Step 2: Token warna track segmented**

Ganti `Color(0xFFF1F3F5)` (L60) → `Bg` (atau `BorderLight`); tambah import bila perlu (`Bg` sudah ada di theme). Pastikan kontras label tetap oke.

- [ ] **Step 3: Build verify**

Run: `cd android && ./gradlew :app:compileDebugKotlin`
Expected: BUILD SUCCESSFUL.

- [ ] **Step 4: Commit**

```bash
git add android/app/src/main/java/id/klikagen/app/ui/screen/rekap/RekapScreen.kt
git commit -m "refactor: RekapScreen ganti emoji streak jadi ikon + token warna"
```

---

## Task 11: AkunScreen — hapus dead code, emoji→ikon, Bantuan diperkaya, surface error Kelola

**Files:**
- Modify: `ui/screen/akun/AkunScreen.kt`, `ui/screen/akun/KelolaRekeningSheet.kt`

- [ ] **Step 1: Hapus dead code**

Di `AkunScreen.kt`, HAPUS composable yang tak dipanggil dari layar aktif: `SectionHeader` (L428), `ProfileCard` (L439), `MenuItemCard` (L574), `ProfileRow` (L631). Verifikasi tak ada pemanggil:
Run: `cd android && grep -n "SectionHeader(\|ProfileCard(\|MenuItemCard(\|ProfileRow(" app/src/main/java/id/klikagen/app/ui/screen/akun/AkunScreen.kt`
Bila muncul hanya definisi (bukan pemanggilan), aman dihapus. Hapus juga import ikon yang jadi tak terpakai setelahnya.

- [ ] **Step 2: Ganti `MenuRow` emoji jadi ikon vektor**

Ubah signature `private fun MenuRow(label: String, icon: String, onClick: ...)` → `MenuRow(label: String, icon: ImageVector, onClick: ...)`. Ganti render `Text(icon)` → `Icon(icon, contentDescription = null, tint = TextSecondary, modifier = Modifier.size(22.dp))`, dan chevron `Text("›")` → `Icon(Icons.Filled.ChevronRight, contentDescription = null, tint = TextMuted)`.
Ganti pemanggilan (L199-227):
- `MenuRow("Profil Toko", "✏")` → `MenuRow("Profil Toko", Icons.Filled.Edit)`
- `"🏦"` → `Icons.Filled.AccountBalance`
- `"📋"` → `Icons.AutoMirrored.Filled.List`
- `"🔒"` → `Icons.Filled.Lock`
- `"❓"` → `Icons.AutoMirrored.Filled.HelpOutline`
Tambah import `androidx.compose.ui.graphics.vector.ImageVector` + ikon terkait.

- [ ] **Step 3: Perkaya dialog Bantuan (on-demand)**

Di blok `if (showHelp)` (L265-279), isi `text` AlertDialog dengan konten cara-pakai (Column scrollable):
```kotlin
text = {
    Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Catat transaksi", style = MaterialTheme.typography.titleSmall)
        Text("Ketik biasa di chat, contoh: \"transfer bca 500rb fee 5rb\" atau \"tarik tunai 300rb\".", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
        Text("Foto struk", style = MaterialTheme.typography.titleSmall)
        Text("Ketuk ikon kamera di kolom chat, pilih foto struk. Hasil bisa dikoreksi sebelum disimpan.", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
        Text("Cetak struk", style = MaterialTheme.typography.titleSmall)
        Text("Setelah transaksi dari foto tercatat, ketuk \"Cetak Struk\" lalu pilih printer Bluetooth.", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
        Text("Rekap", style = MaterialTheme.typography.titleSmall)
        Text("Ketik \"rekap hari ini\" / \"rekap bulan ini\", atau buka menu Rekap di atas layar chat.", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
    }
}
```
Pastikan import `verticalScroll`, `rememberScrollState`, `Arrangement`, `Column` ada.

- [ ] **Step 4: Surface error di KelolaRekeningViewModel**

Di `KelolaRekeningSheet.kt`, `KelolaRekeningViewModel`: tambah state error & isi di catch (ganti `catch (_: Exception) {}`):
```kotlin
private val _error = MutableStateFlow<String?>(null)
val error: StateFlow<String?> = _error.asStateFlow()
fun clearError() { _error.value = null }
```
Di `load()/tambah()/hapus()` catch: `_error.value = "Gagal memuat/menyimpan, coba lagi"` (sesuaikan pesan). Di `edit()`: JANGAN tutup dialog saat gagal — hanya tutup di cabang sukses. Tampilkan error via snackbar/`Text` merah di UI Kelola (ikuti pola snackbar existing bila ada).

- [ ] **Step 5: Build verify**

Run: `cd android && ./gradlew :app:compileDebugKotlin`
Expected: BUILD SUCCESSFUL.

- [ ] **Step 6: Commit**

```bash
git add android/app/src/main/java/id/klikagen/app/ui/screen/akun/AkunScreen.kt android/app/src/main/java/id/klikagen/app/ui/screen/akun/KelolaRekeningSheet.kt
git commit -m "refactor: Akun hapus dead code + emoji->ikon + Bantuan diperkaya + surface error Kelola"
```

---

## Task 12: ArusKas & konsistensi Material 3 (pull-refresh, TopAppBar, back icon)

**Files:**
- Modify: `ui/screen/saldo/ArusKasScreen.kt`, `ui/screen/akun/FeeTierScreen.kt`, `ui/screen/akun/KelolaRekeningSheet.kt`

- [ ] **Step 1: Migrasi pull-refresh M2 → M3 di ArusKas**

Ganti `androidx.compose.material.pullrefresh.*` → M3 `PullToRefreshBox`:
```kotlin
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
```
Ganti struktur `pullRefresh(state)` + `PullRefreshIndicator` menjadi:
```kotlin
PullToRefreshBox(
    isRefreshing = uiState.refreshing,
    onRefresh = { viewModel.refresh() },
    modifier = Modifier.fillMaxSize()
) {
    LazyColumn( /* existing content */ ) { /* existing */ }
}
```
Hapus import & state M2 (`rememberPullRefreshState`, `pullRefresh`, `PullRefreshIndicator`).

- [ ] **Step 2: Top bar ArusKas → TopAppBar M3 + back icon AutoMirrored**

Ganti top bar manual jadi `TopAppBar` M3 dengan `navigationIcon` = `IconButton { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Kembali") }` memanggil `onBack`, title = `accountName`. Import `androidx.compose.material3.TopAppBar`, `androidx.compose.material.icons.automirrored.filled.ArrowBack`. Tandai `@OptIn(ExperimentalMaterial3Api::class)`.

- [ ] **Step 3: Back icon di FeeTier & Kelola**

- `FeeTierScreen.kt:70` `Icons.Default.ArrowBack` → `Icons.AutoMirrored.Filled.ArrowBack`.
- `KelolaRekeningSheet.kt:153` `Icons.Default.ArrowBack` → `Icons.AutoMirrored.Filled.ArrowBack`. Perbaiki padding header manual `4.dp` → `Spacing.sm`/`Spacing.md` agar back tak mepet (atau ganti ke TopAppBar M3 bila ringkas).

- [ ] **Step 4: FeeTier empty-state emoji 📊 → ikon**

`FeeTierScreen.kt:95` `Text("📊", headlineLarge)` → `Icon(Icons.Filled.BarChart, contentDescription = null, tint = TextMuted, modifier = Modifier.size(40.dp))`.

- [ ] **Step 5: Build verify**

Run: `cd android && ./gradlew :app:compileDebugKotlin`
Expected: BUILD SUCCESSFUL. (Jika `PullToRefreshBox` butuh `@OptIn(ExperimentalMaterial3Api::class)`, tambahkan.)

- [ ] **Step 6: Commit**

```bash
git add android/app/src/main/java/id/klikagen/app/ui/screen/saldo/ArusKasScreen.kt android/app/src/main/java/id/klikagen/app/ui/screen/akun/FeeTierScreen.kt android/app/src/main/java/id/klikagen/app/ui/screen/akun/KelolaRekeningSheet.kt
git commit -m "refactor: migrasi Material2->3 (pull-refresh, TopAppBar, back icon), FeeTier emoji->ikon"
```

---

## Task 13: DaftarRekening — buang duplikasi visual akun

**Files:**
- Modify: `ui/screen/saldo/DaftarRekeningScreen.kt`

- [ ] **Step 1: Satukan daftar akun**

Sekarang akun index 0/1 diperlakukan khusus (hero + card) LALU semua akun diulang di list "Semua Rekening" → akun teratas tampil dua kali. Ubah jadi: **satu hero** untuk akun kas utama saja (mis. akun pertama bertipe kas), lalu list SISA akun (kecuali yang sudah jadi hero). Hilangkan perlakuan hardcode index-1.
Pola:
```kotlin
val accounts = uiState.accounts
val hero = accounts.firstOrNull()
val rest = accounts.drop(1)
// render hero (bg Pri) ; lalu label "Semua Rekening" ; lalu rest.forEach { AccountRow(it) }
```
Pastikan tombol "Pindah Saldo" tetap muncul bila `accounts.size >= 2`.

- [ ] **Step 2: Build verify**

Run: `cd android && ./gradlew :app:compileDebugKotlin`
Expected: BUILD SUCCESSFUL.

- [ ] **Step 3: Commit**

```bash
git add android/app/src/main/java/id/klikagen/app/ui/screen/saldo/DaftarRekeningScreen.kt
git commit -m "refactor: DaftarRekening hilangkan duplikasi visual akun teratas"
```

---

## Task 14: Dedup form rekening (TambahRekeningSheet vs RekeningFormDialog)

**Files:**
- Modify/Delete: `ui/screen/saldo/TambahRekeningSheet.kt`

- [ ] **Step 1: Cek pemakaian TambahRekeningSheet**

Run: `cd android && grep -rn "TambahRekeningSheet" app/src/main`
- Bila TIDAK dipakai di layar aktif → hapus file `TambahRekeningSheet.kt`.
- Bila dipakai → pilih SATU sumber form. Rekomendasi: pertahankan `RekeningFormDialog` (di KelolaRekeningSheet, sudah tangani tambah+edit), arahkan pemanggil `TambahRekeningSheet` ke sana, lalu hapus `TambahRekeningSheet.kt`. Satukan konstanta tipe (`TIPE_LIST`/`TIPE_LABELS`) ke satu tempat.

- [ ] **Step 2: Build verify**

Run: `cd android && ./gradlew :app:compileDebugKotlin`
Expected: BUILD SUCCESSFUL.

- [ ] **Step 3: Commit**

```bash
git add -A android/app/src/main/java/id/klikagen/app/ui/screen/saldo/
git commit -m "refactor: dedup form rekening (satu sumber RekeningFormDialog)"
```

---

## Task 15: Login/Register — show/hide password + back icon

**Files:**
- Modify: `ui/screen/login/LoginScreen.kt`, `ui/screen/register/RegisterScreen.kt`

- [ ] **Step 1: Toggle show/hide password (Login)**

Pada field password, tambah `visualTransformation` yang di-toggle:
```kotlin
var passwordVisible by remember { mutableStateOf(false) }
// pada OutlinedTextField password:
visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
trailingIcon = {
    val icon = if (passwordVisible) Icons.Filled.VisibilityOff else Icons.Filled.Visibility
    IconButton(onClick = { passwordVisible = !passwordVisible }) {
        Icon(icon, contentDescription = if (passwordVisible) "Sembunyikan" else "Tampilkan")
    }
}
```
Import: `androidx.compose.ui.text.input.PasswordVisualTransformation`, `VisualTransformation`, ikon `Visibility`/`VisibilityOff`, `IconButton`.

- [ ] **Step 2: Toggle show/hide password (Register)**

Terapkan pola identik Step 1 pada field password di `RegisterScreen.kt`.

- [ ] **Step 3: Back link teks → IconButton (Register)**

Ganti back "‹ Kembali" (L72) jadi `IconButton(onClick = onLoginClick) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Kembali") }`. Import ikon AutoMirrored.

- [ ] **Step 4: Build verify + test suite penuh**

Run: `cd android && ./gradlew :app:compileDebugKotlin && ./gradlew :app:testDebugUnitTest`
Expected: BUILD SUCCESSFUL; semua unit test PASS.

- [ ] **Step 5: Commit**

```bash
git add android/app/src/main/java/id/klikagen/app/ui/screen/login/LoginScreen.kt android/app/src/main/java/id/klikagen/app/ui/screen/register/RegisterScreen.kt
git commit -m "feat: show/hide password (Login/Register) + back icon Register"
```

---

## Task 16: Verifikasi menyeluruh (Definition of Done)

**Files:** —

- [ ] **Step 1: Build rilis-debug penuh**

Run: `cd android && ./gradlew clean assembleDebug`
Expected: BUILD SUCCESSFUL.

- [ ] **Step 2: Semua unit test**

Run: `cd android && ./gradlew :app:testDebugUnitTest`
Expected: PASS (RupiahFormatTest, MainNavStateTest, ChatBannersTest, + test existing BankParser/StrukTextBuilder/StrukComposer).

- [ ] **Step 3: Grep sanity — nol emoji-icon & palet lama**

Run:
```bash
cd android && grep -rn 'Text("⚙\|Text("🖨\|Text("🔥\|Text("✏\|Text("🏦\|Text("📋\|Text("🔒\|Text("❓\|Text("📊\|Text("›\|Text("‹' app/src/main
grep -rn "Blue500\|Gray500\|Green500\|Red500\|Orange500" app/src/main
grep -rn "fun formatRp(\|private fun formatRupiah" app/src/main
```
Expected: ketiganya kosong.

- [ ] **Step 4: Smoke test manual (emulator/device)**

Jalankan app, verifikasi checklist DoD spec §9:
1. Bottom-nav hilang; chat full-screen home; chip saldo/Rekap/Setelan berfungsi 1-tap.
2. Back dari Saldo/Rekap/Setelan → balik ke chat (bukan exit).
3. Share foto dari galeri/mbanking saat di layar sekunder → auto ke chat + alur OCR.
4. Empty-state sambutan tampil saat chat kosong; ketuk contoh → terkirim.
5. Launcher icon emerald "KA" di homescreen.
6. Rekap/Setelan/Login tampil rapi, ikon vektor, warna konsisten.

- [ ] **Step 5: Commit catatan verifikasi (bila ada penyesuaian)**

```bash
git add -A
git commit -m "chore: verifikasi menyeluruh redesign UI/UX sub-proyek A"
```

---

## Self-Review (diisi penulis plan)

**Spec coverage:**
- Nav chat-home + top bar → Task 5,6,9 ✓
- Back behavior + share-foto remap → Task 6 ✓
- Confirm-gate placeholder + rename → Task 9 ✓
- Empty-state + sambutan AI + Bantuan → Task 7,9,11 ✓
- Palet satu sumber → Task 3 ✓
- Launcher icon → Task 4 ✓
- formatRupiah konsolidasi → Task 1 ✓
- Spacing tokens → Task 2 ✓
- Emoji→ikon (Chat/Rekap/Akun/FeeTier) → Task 9,10,11,12 ✓
- Banner stacking → Task 8,9 ✓
- Retry error → Task 9 ✓
- Material2→3 → Task 12 ✓
- Dead code + silent catch Akun/Kelola → Task 11 ✓
- DaftarRekening dedup → Task 13 ✓
- Dedup form rekening → Task 14 ✓
- Login/Register password + back → Task 15 ✓
- storeName wiring → Task 6,9 ✓
- Nav OPSIONAL (FeeTier/Kelola/ArusKas jadi route) → sengaja DITUNDA (spec §6 opsional) ✓

**Catatan urutan:** Task 6 Step 3-4 diselesaikan bersama Task 9 Step 10 (dependensi signature ChatScreen). Sudah ditandai eksplisit.
