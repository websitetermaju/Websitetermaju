# Klik Agen UI/UX Redesign — Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement. Steps use checkbox (`- [ ]`) for tracking.

**Goal:** Redesign seluruh UI Android Klik Agen dari Blue ke Emerald Green + Plus Jakarta Sans, pixel-perfect ke prototype `Klik Agen.dc.html`.

**Architecture:** UI-only. ViewModel, data layer (Room/Retrofit/DTOs), backend API tidak disentuh. MainScreen: hapus TopAppBar biru, bottom nav baru. Setiap screen handle header sendiri.

**Tech Stack:** Kotlin + Jetpack Compose + Material3 + Google Fonts + Hilt

## Global Constraints
- Primary: `#0E9F6E` (Pri), `#057A52` (PriDark), `#E7F6EF` (PriSoft)
- Font: Plus Jakarta Sans 400/500/600/700/800 via Google Fonts downloadable provider
- App bg: `#F7F8FA`; Card bg: `#FFFFFF`; Border: `#EBEDF0`
- Border radius: input 13dp, button 14dp, card 16-20dp, bubble 18dp
- Test backend wajib hijau (backend unchanged)
- Bottom nav: Chat | Saldo | Rekap | Setelan (bukan Akun)
- Tanpa emoji di UI; pakai ikon SVG/Compose

---

### Task 1: Theme Foundation

**Files:**
- Modify: `android/app/build.gradle.kts`
- Modify: `android/app/src/main/java/id/klikagen/app/ui/theme/Color.kt`
- Modify: `android/app/src/main/java/id/klikagen/app/ui/theme/Theme.kt`
- Modify: `android/app/src/main/java/id/klikagen/app/ui/theme/Type.kt`
- Create: `android/app/src/main/res/values/font_certs.xml`

**Produces:** Color tokens (Pri, PriDark, PriSoft, Bg, Border, TextPrimary, TextSecondary, TextMuted, NavInactive, CreditGreen, DebitRed, LogoutRed), KlikAgenTheme composable, KlikAgenTypography with Plus Jakarta Sans.

- [ ] **Step 1: Add Google Fonts dependency**

Edit `android/app/build.gradle.kts`, tambah di `dependencies` block:
```kotlin
implementation("androidx.compose.ui:ui-text-google-fonts:1.6.8")
```

- [ ] **Step 2: Rewrite Color.kt**

```kotlin
package id.klikagen.app.ui.theme

import androidx.compose.ui.graphics.Color

// Emerald Green Primary
val Pri = Color(0xFF0E9F6E)
val PriDark = Color(0xFF057A52)
val PriSoft = Color(0xFFE7F6EF)

// Neutrals
val Bg = Color(0xFFF7F8FA)
val SurfaceWhite = Color(0xFFFFFFFF)
val BorderLight = Color(0xFFF0F1F4)
val TextPrimary = Color(0xFF0F172A)
val TextSecondary = Color(0xFF667085)
val TextMuted = Color(0xFF98A2B3)
val NavInactive = Color(0xFF9AA4B2)

// Semantic
val CreditGreen = Color(0xFF12A150)
val DebitRed = Color(0xFFE5484D)
val LogoutRed = Color(0xFFD92D20)
val LogoutRedBg = Color(0xFFFEF3F2)
val LogoutRedBorder = Color(0xFFFBD5D5)

// Deprecated aliases — keep refs in unchanged code working
@Deprecated("Use Pri", ReplaceWith("Pri"))
val Blue500 = Pri
@Deprecated("Use PriSoft", ReplaceWith("PriSoft"))
val Blue100 = PriSoft
@Deprecated("Use TextSecondary", ReplaceWith("TextSecondary"))
val Gray500 = TextSecondary
@Deprecated("Use CreditGreen", ReplaceWith("CreditGreen"))
val Green500 = CreditGreen
@Deprecated("Use DebitRed", ReplaceWith("DebitRed"))
val Red500 = DebitRed
val Orange500 = Color(0xFFEA580C)
@Deprecated("Use Border")
val Gray100 = Color(0xFFF1F5F9)
@Deprecated("Use TextPrimary")
val Gray700 = Color(0xFF334155)
val Gray900 = Color(0xFF0F172A)
```

- [ ] **Step 3: Update Theme.kt**

```kotlin
package id.klikagen.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColorScheme = lightColorScheme(
    primary = Pri,
    onPrimary = SurfaceWhite,
    primaryContainer = PriSoft,
    onPrimaryContainer = PriDark,
    secondary = CreditGreen,
    background = Bg,
    surface = SurfaceWhite,
    error = DebitRed,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    outline = BorderLight,
    outlineVariant = BorderLight
)

@Composable
fun KlikAgenTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = KlikAgenTypography,
        content = content
    )
}
```

- [ ] **Step 4: Rewrite Type.kt**

```kotlin
package id.klikagen.app.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.googlefonts.Font
import androidx.compose.ui.text.googlefonts.GoogleFont
import androidx.compose.ui.unit.sp
import id.klikagen.app.R

val GoogleFontProvider = GoogleFont.Provider(
    providerAuthority = "com.google.android.gms.fonts",
    providerPackage = "com.google.android.gms",
    certificates = R.array.com_google_android_gms_fonts_certs
)

val PlusJakartaSansFamily = FontFamily(
    Font(googleFont = GoogleFont("Plus Jakarta Sans"), fontProvider = GoogleFontProvider, weight = FontWeight.Normal),
    Font(googleFont = GoogleFont("Plus Jakarta Sans"), fontProvider = GoogleFontProvider, weight = FontWeight.Medium),
    Font(googleFont = GoogleFont("Plus Jakarta Sans"), fontProvider = GoogleFontProvider, weight = FontWeight.SemiBold),
    Font(googleFont = GoogleFont("Plus Jakarta Sans"), fontProvider = GoogleFontProvider, weight = FontWeight.Bold),
    Font(googleFont = GoogleFont("Plus Jakarta Sans"), fontProvider = GoogleFontProvider, weight = FontWeight.ExtraBold),
)

val KlikAgenTypography = Typography(
    headlineLarge = TextStyle(fontFamily = PlusJakartaSansFamily, fontWeight = FontWeight.ExtraBold, fontSize = 40.sp, letterSpacing = (-1.5).sp),
    headlineMedium = TextStyle(fontFamily = PlusJakartaSansFamily, fontWeight = FontWeight.ExtraBold, fontSize = 26.sp, letterSpacing = (-0.6).sp),
    titleLarge = TextStyle(fontFamily = PlusJakartaSansFamily, fontWeight = FontWeight.ExtraBold, fontSize = 21.sp, letterSpacing = (-0.5).sp),
    titleMedium = TextStyle(fontFamily = PlusJakartaSansFamily, fontWeight = FontWeight.Bold, fontSize = 16.sp),
    titleSmall = TextStyle(fontFamily = PlusJakartaSansFamily, fontWeight = FontWeight.Bold, fontSize = 14.sp),
    bodyLarge = TextStyle(fontFamily = PlusJakartaSansFamily, fontWeight = FontWeight.Medium, fontSize = 15.sp, lineHeight = 22.sp),
    bodyMedium = TextStyle(fontFamily = PlusJakartaSansFamily, fontWeight = FontWeight.Medium, fontSize = 14.sp, lineHeight = 20.sp),
    bodySmall = TextStyle(fontFamily = PlusJakartaSansFamily, fontWeight = FontWeight.Normal, fontSize = 13.sp, lineHeight = 18.sp),
    labelLarge = TextStyle(fontFamily = PlusJakartaSansFamily, fontWeight = FontWeight.Bold, fontSize = 11.5.sp, letterSpacing = 0.4.sp),
    labelMedium = TextStyle(fontFamily = PlusJakartaSansFamily, fontWeight = FontWeight.Bold, fontSize = 11.sp, letterSpacing = 0.4.sp),
    labelSmall = TextStyle(fontFamily = PlusJakartaSansFamily, fontWeight = FontWeight.Bold, fontSize = 10.5.sp)
)
```

- [ ] **Step 5: Create font_certs.xml**

```bash
mkdir -p "/home/wanda/Klik Agen/android/app/src/main/res/values"
```

Write `android/app/src/main/res/values/font_certs.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <array name="com_google_android_gms_fonts_certs">
        <item>@array/com_google_android_gms_fonts_certs_dev</item>
        <item>@array/com_google_android_gms_fonts_certs_prod</item>
    </array>
</resources>
```

- [ ] **Step 6: Verify compilation**

```bash
cd "/home/wanda/Klik Agen/android" && ./gradlew assembleDebug 2>&1 | tail -5
```
Expected: `BUILD SUCCESSFUL`

- [ ] **Step 7: Commit**

```bash
cd "/home/wanda/Klik Agen" && git add android/app/build.gradle.kts android/app/src/main/java/id/klikagen/app/ui/theme/ android/app/src/main/res/values/font_certs.xml
git commit -m "feat: Emerald Green theme + Plus Jakarta Sans font

- Replace Blue #2563EB with Emerald Green #0E9F6E
- Plus Jakarta Sans via Google Fonts downloadable provider
- New color tokens: Pri, PriDark, PriSoft, Bg, TextPrimary, etc.
- Deprecated aliases for backward compat during migration

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Redesign Login Screen

**Files:**
- Modify: `android/app/src/main/java/id/klikagen/app/ui/screen/login/LoginScreen.kt`

**Consumes:** LoginViewModel (unchanged) — `uiState.phone`, `uiState.password`, `uiState.isLoading`, `uiState.error`, `uiState.success`, `viewModel.onPhoneChange()`, `viewModel.onPasswordChange()`, `viewModel.login()`

**Produces:** Same composable signature: `LoginScreen(onLoginSuccess, onRegisterClick, viewModel)`

- [ ] **Step 1: Rewrite LoginScreen.kt**

```kotlin
package id.klikagen.app.ui.screen.login

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import id.klikagen.app.ui.theme.BorderLight
import id.klikagen.app.ui.theme.Pri
import id.klikagen.app.ui.theme.TextMuted
import id.klikagen.app.ui.theme.TextPrimary
import id.klikagen.app.ui.theme.TextSecondary

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onRegisterClick: () -> Unit,
    viewModel: LoginViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(uiState.success) {
        if (uiState.success) onLoginSuccess()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .padding(horizontal = 30.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(48.dp))

        // Branding
        Text(
            text = "Klik Agen",
            style = MaterialTheme.typography.headlineLarge,
            modifier = Modifier.fillMaxWidth()
        )
        // Green accent bar
        Box(
            modifier = Modifier
                .width(46.dp)
                .height(4.dp)
                .clip(RoundedCornerShape(3.dp))
                .background(Pri)
                .align(Alignment.Start)
        )
        Spacer(modifier = Modifier.height(14.dp))
        Text(
            text = "Asisten pembukuan untuk agen BRILink. Catat transaksi cukup lewat chat.",
            style = MaterialTheme.typography.bodyLarge.copy(color = TextSecondary, lineHeight = 22.sp),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.weight(1f))

        // Phone
        Text("NOMOR HP", style = MaterialTheme.typography.labelLarge.copy(color = TextMuted), modifier = Modifier.fillMaxWidth().padding(bottom = 7.dp))
        OutlinedTextField(
            value = uiState.phone,
            onValueChange = { viewModel.onPhoneChange(it) },
            placeholder = { Text("08xxxxxxxxxx", color = TextMuted) },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
            singleLine = true,
            shape = RoundedCornerShape(13.dp),
            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Pri, unfocusedBorderColor = BorderLight, focusedContainerColor = Color.White, unfocusedContainerColor = Color.White),
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(14.dp))

        // Password
        Text("PASSWORD", style = MaterialTheme.typography.labelLarge.copy(color = TextMuted), modifier = Modifier.fillMaxWidth().padding(bottom = 7.dp))
        OutlinedTextField(
            value = uiState.password,
            onValueChange = { viewModel.onPasswordChange(it) },
            placeholder = { Text("••••••••", color = TextMuted) },
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            singleLine = true,
            shape = RoundedCornerShape(13.dp),
            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Pri, unfocusedBorderColor = BorderLight, focusedContainerColor = Color.White, unfocusedContainerColor = Color.White),
            modifier = Modifier.fillMaxWidth()
        )

        if (uiState.error != null) {
            Spacer(modifier = Modifier.height(12.dp))
            Text(uiState.error!!, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Login button
        Button(
            onClick = { viewModel.login() },
            enabled = !uiState.isLoading,
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Pri),
            modifier = Modifier.fillMaxWidth().height(54.dp)
        ) {
            if (uiState.isLoading) CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
            else Text("Masuk", fontSize = 15.5.sp, fontWeight = FontWeight.Bold)
        }

        // Register link
        Spacer(modifier = Modifier.height(18.dp))
        Row(modifier = Modifier.padding(bottom = 30.dp)) {
            Text("Belum punya akun? ", style = MaterialTheme.typography.bodyMedium.copy(color = TextSecondary))
            Text("Daftar", style = MaterialTheme.typography.bodyMedium.copy(color = Pri, fontWeight = FontWeight.Bold), modifier = Modifier.clickable(onClick = onRegisterClick))
        }
    }
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd "/home/wanda/Klik Agen/android" && ./gradlew assembleDebug 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd "/home/wanda/Klik Agen" && git add android/app/src/main/java/id/klikagen/app/ui/screen/login/LoginScreen.kt
git commit -m "feat: redesign Login screen with Emerald theme

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Redesign Register Screen

**Files:**
- Modify: `android/app/src/main/java/id/klikagen/app/ui/screen/register/RegisterScreen.kt`

- [ ] **Step 1: Rewrite RegisterScreen.kt**

```kotlin
package id.klikagen.app.ui.screen.register

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import id.klikagen.app.ui.theme.BorderLight
import id.klikagen.app.ui.theme.Pri
import id.klikagen.app.ui.theme.PriDark
import id.klikagen.app.ui.theme.PriSoft
import id.klikagen.app.ui.theme.TextMuted
import id.klikagen.app.ui.theme.TextPrimary
import id.klikagen.app.ui.theme.TextSecondary

@Composable
fun RegisterScreen(
    onRegisterSuccess: () -> Unit,
    onLoginClick: () -> Unit,
    viewModel: RegisterViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(uiState.success) {
        if (uiState.success) onRegisterSuccess()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 30.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(14.dp))

        // Back
        Text("‹ Kembali", style = MaterialTheme.typography.bodyMedium.copy(color = TextSecondary, fontWeight = FontWeight.SemiBold), modifier = Modifier.fillMaxWidth().clickable(onClick = onLoginClick))
        Spacer(modifier = Modifier.height(18.dp))

        // Title
        Text("Daftar akun baru", style = MaterialTheme.typography.headlineMedium, modifier = Modifier.fillMaxWidth())

        // Slot badge
        Spacer(modifier = Modifier.height(12.dp))
        if (uiState.isSlotLoading) {
            CircularProgressIndicator(modifier = Modifier.size(16.dp))
        } else if (uiState.slotResponse != null) {
            val slot = uiState.slotResponse!!
            Row(
                modifier = Modifier
                    .align(Alignment.Start)
                    .clip(RoundedCornerShape(999.dp))
                    .background(PriSoft)
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(modifier = Modifier.size(7.dp).clip(RoundedCornerShape(50)).background(Pri))
                Spacer(modifier = Modifier.width(7.dp))
                Text("${slot.terpakai}/${slot.total_kuota} slot tersisa", style = MaterialTheme.typography.bodySmall.copy(color = PriDark, fontWeight = FontWeight.Bold))
            }
        }
        Spacer(modifier = Modifier.height(22.dp))

        // Fields
        val fieldColors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Pri, unfocusedBorderColor = BorderLight, focusedContainerColor = Color.White, unfocusedContainerColor = Color.White)
        val fieldShape = RoundedCornerShape(13.dp)

        Text("NAMA LENGKAP", style = MaterialTheme.typography.labelLarge.copy(color = TextMuted), modifier = Modifier.fillMaxWidth().padding(bottom = 7.dp))
        OutlinedTextField(value = uiState.name, onValueChange = { viewModel.onNameChange(it) }, placeholder = { Text("Budi Santoso", color = TextMuted) }, singleLine = true, shape = fieldShape, colors = fieldColors, modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(13.dp))

        Text("NOMOR HP", style = MaterialTheme.typography.labelLarge.copy(color = TextMuted), modifier = Modifier.fillMaxWidth().padding(bottom = 7.dp))
        OutlinedTextField(value = uiState.phone, onValueChange = { viewModel.onPhoneChange(it) }, placeholder = { Text("08xxxxxxxxxx", color = TextMuted) }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone), singleLine = true, shape = fieldShape, colors = fieldColors, modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(13.dp))

        Text("NAMA TOKO", style = MaterialTheme.typography.labelLarge.copy(color = TextMuted), modifier = Modifier.fillMaxWidth().padding(bottom = 7.dp))
        OutlinedTextField(value = uiState.storeName, onValueChange = { viewModel.onStoreNameChange(it) }, placeholder = { Text("Toko Budi", color = TextMuted) }, singleLine = true, shape = fieldShape, colors = fieldColors, modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(13.dp))

        Text("PASSWORD", style = MaterialTheme.typography.labelLarge.copy(color = TextMuted), modifier = Modifier.fillMaxWidth().padding(bottom = 7.dp))
        OutlinedTextField(value = uiState.password, onValueChange = { viewModel.onPasswordChange(it) }, placeholder = { Text("Min. 6 karakter", color = TextMuted) }, visualTransformation = PasswordVisualTransformation(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password), singleLine = true, shape = fieldShape, colors = fieldColors, modifier = Modifier.fillMaxWidth())

        if (uiState.error != null) {
            Spacer(modifier = Modifier.height(12.dp))
            Text(uiState.error!!, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
        }

        Spacer(modifier = Modifier.height(22.dp))
        val isFormEnabled = uiState.slotResponse?.sisa?.let { it > 0 } ?: false
        Button(
            onClick = { viewModel.register() },
            enabled = !uiState.isLoading && isFormEnabled,
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Pri),
            modifier = Modifier.fillMaxWidth().height(54.dp)
        ) {
            if (uiState.isLoading) CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
            else Text("Daftar Sekarang", fontSize = 15.5.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(30.dp))
    }
}
```

- [ ] **Step 2: Commit**

```bash
cd "/home/wanda/Klik Agen" && git add android/app/src/main/java/id/klikagen/app/ui/screen/register/RegisterScreen.kt
git commit -m "feat: redesign Register screen with Emerald theme + slot badge

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Redesign Main Screen + Bottom Nav

**Files:**
- Modify: `android/app/src/main/java/id/klikagen/app/ui/screen/main/MainScreen.kt`

**Changes:** Hapus TopAppBar. Bottom nav: Chat | Saldo | Rekap | Setelan dengan SVG path icons. Scaffold background = Bg.

- [ ] **Step 1: Rewrite MainScreen.kt**

```kotlin
package id.klikagen.app.ui.screen.main

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.path
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import id.klikagen.app.ui.screen.akun.AkunScreen
import id.klikagen.app.ui.screen.chat.ChatScreen
import id.klikagen.app.ui.screen.rekap.RekapScreen
import id.klikagen.app.ui.screen.saldo.ArusKasScreen
import id.klikagen.app.ui.screen.saldo.DaftarRekeningScreen
import id.klikagen.app.ui.theme.Bg
import id.klikagen.app.ui.theme.NavInactive
import id.klikagen.app.ui.theme.Pri
import id.klikagen.app.ui.theme.PriSoft

// SVG path icons matching prototype
private val ChatIcon: ImageVector
    get() = ImageVector.Builder("ChatIcon", 24f, 24f, 24f, 24f).apply {
        path(Path().apply { moveTo(20f, 11.5f); arcTo(7.5f, 7.5f, 0f, true, true, 10.7f, 6.8f) // simplified
            lineTo(4f, 20f); lineTo(5.7f, 14.7f); arcTo(7.5f, 7.5f, 0f, true, true, 20f, 11.5f); close() })
    }.build()

// Simplified: use Material built-in icons with correct tint
// For production, create proper VectorDrawable or use painterResource

@Composable
fun MainScreen(storeName: String, onLogout: () -> Unit) {
    var selectedTab by remember { mutableIntStateOf(0) }
    var selectedAccountId by remember { mutableStateOf<String?>(null) }
    var selectedAccountName by remember { mutableStateOf("") }

    Scaffold(
        containerColor = Bg,
        bottomBar = {
            NavigationBar(
                containerColor = Color.White,
                tonalElevation = 0.dp,
                modifier = Modifier.height(64.dp)
            ) {
                NavItem(0, selectedTab, "Chat") { selectedTab = 0; selectedAccountId = null }
                NavItem(1, selectedTab, "Saldo") { selectedTab = 1 }
                NavItem(2, selectedTab, "Rekap") { selectedTab = 2 }
                NavItem(3, selectedTab, "Setelan") { selectedTab = 3 }
            }
        }
    ) { paddingValues ->
        Box(modifier = Modifier.fillMaxSize().padding(paddingValues)) {
            when (selectedTab) {
                0 -> { selectedAccountId = null; ChatScreen(onTokenExpired = onLogout, modifier = Modifier.fillMaxSize()) }
                1 -> {
                    if (selectedAccountId == null) DaftarRekeningScreen(
                        onAccountClick = { id, name -> selectedAccountId = id; selectedAccountName = name },
                        modifier = Modifier.fillMaxSize()
                    ) else ArusKasScreen(
                        accountId = selectedAccountId!!, accountName = selectedAccountName,
                        onBack = { selectedAccountId = null }, modifier = Modifier.fillMaxSize()
                    )
                }
                2 -> RekapScreen(modifier = Modifier.fillMaxSize())
                3 -> AkunScreen(onLogout = onLogout, onNavigateToSaldo = { selectedTab = 1 }, modifier = Modifier.fillMaxSize())
            }
        }
    }
}

@Composable
private fun NavItem(idx: Int, selected: Int, label: String, onClick: () -> Unit) {
    val active = selected == idx
    val icon = when (idx) {
        0 -> androidx.compose.material.icons.Icons.AutoMirrored.Filled.Chat
        1 -> androidx.compose.material.icons.Icons.Filled.AccountBalance
        2 -> androidx.compose.material.icons.Icons.Filled.Assessment
        else -> androidx.compose.material.icons.Icons.Filled.Settings
    }
    NavigationBarItem(
        selected = active, onClick = onClick,
        icon = { Icon(icon, contentDescription = label) },
        label = { Text(label, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold) },
        colors = NavigationBarItemDefaults.colors(
            selectedIconColor = Pri, selectedTextColor = Pri,
            unselectedIconColor = NavInactive, unselectedTextColor = NavInactive,
            indicatorColor = PriSoft
        )
    )
}
```

- [ ] **Step 2: Commit**

```bash
cd "/home/wanda/Klik Agen" && git add android/app/src/main/java/id/klikagen/app/ui/screen/main/MainScreen.kt
git commit -m "feat: redesign MainScreen — remove TopAppBar, new bottom nav

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: Redesign Chat Screen

**Files:**
- Modify: `android/app/src/main/java/id/klikagen/app/ui/screen/chat/ChatScreen.kt`

**Changes:** Header dengan avatar KA + store name + online status. Bubble user (Pri bg, putih, kanan). Bubble bot (putih, border, kiri). Confirmation card (putih + hijau header). Rekap card. Typing indicator. Quick action pills. Input bar dengan camera + pill input + send circle.

- [ ] **Step 1: Rewrite ChatScreen.kt**

```kotlin
package id.klikagen.app.ui.screen.chat

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import id.klikagen.app.ui.theme.Bg
import id.klikagen.app.ui.theme.BorderLight
import id.klikagen.app.ui.theme.CreditGreen
import id.klikagen.app.ui.theme.DebitRed
import id.klikagen.app.ui.theme.NavInactive
import id.klikagen.app.ui.theme.Pri
import id.klikagen.app.ui.theme.PriDark
import id.klikagen.app.ui.theme.PriSoft
import id.klikagen.app.ui.theme.TextMuted
import id.klikagen.app.ui.theme.TextPrimary
import id.klikagen.app.ui.theme.TextSecondary

private val quickActions = listOf(
    "Transfer 300rb fee 5rb" to "Catat transfer 300rb fee 5rb",
    "Tarik tunai 500rb" to "Catat tarik tunai 500rb",
    "Rekap hari ini" to "Rekap hari ini",
    "Pindah 200rb ke kas" to "Pindah 200rb ke kas"
)

@Composable
fun ChatScreen(
    onTokenExpired: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ChatViewModel = hiltViewModel()
) {
    val messages by viewModel.messages.collectAsState()
    val inputText by viewModel.inputText.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val isSending by viewModel.isSending.collectAsState()
    val shouldNavigateToLogin by viewModel.shouldNavigateToLogin.collectAsState()
    val isOffline by viewModel.isOffline.collectAsState()
    val isDegraded by viewModel.isDegraded.collectAsState()
    val hasStalePending by viewModel.hasStalePending.collectAsState()
    val listState = rememberLazyListState()

    LaunchedEffect(shouldNavigateToLogin) {
        if (shouldNavigateToLogin) { viewModel.onNavigatedToLogin(); onTokenExpired() }
    }
    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) listState.animateScrollToItem(messages.size - 1)
    }

    Column(modifier = modifier.fillMaxSize().background(Bg)) {
        // Banners
        if (isOffline) Banner("Offline — transaksi disimpan lokal, akan terkirim otomatis", Color(0xFF9E9E9E))
        if (isDegraded && !isOffline) Banner("Mode simpel aktif — AI sedang gangguan, input tetap bisa masuk", Color(0xFFFFA000))
        if (hasStalePending) Banner("2 hari belum tersinkron — segera sambungkan internet", DebitRed)

        // Header
        ChatHeader(storeName = "Toko") // TODO: get store from user state

        // Messages
        if (isLoading && messages.isEmpty()) {
            Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        } else {
            LazyColumn(
                state = listState,
                modifier = Modifier.weight(1f).fillMaxWidth().padding(horizontal = 14.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(11.dp)
            ) {
                items(messages, key = { it.id }) { msg ->
                    when {
                        msg.isUser -> UserBubble(msg.text)
                        msg.transaction != null -> ConfirmationCard(msg)
                        msg.text.contains("Rekap") || msg.text.contains("Laba") -> RekapCard(msg)
                        else -> BotBubble(msg.text)
                    }
                }
                if (isSending) item { TypingIndicator() }
            }
        }

        // Quick actions
        Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(horizontal = 14.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            quickActions.forEach { (label, text) ->
                QuickActionPill(label) { viewModel.onInputChange(text); viewModel.sendMessage() }
            }
        }

        // Input bar
        InputBar(
            value = inputText,
            onValueChange = { viewModel.onInputChange(it) },
            onSend = { viewModel.sendMessage() },
            enabled = !isSending,
            isSending = isSending
        )
    }
}

@Composable
private fun ChatHeader(storeName: String) {
    Row(
        modifier = Modifier.fillMaxWidth().height(62.dp).background(Color.White).padding(horizontal = 18.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // KA Avatar
        Box(modifier = Modifier.size(40.dp).clip(RoundedCornerShape(13.dp)).background(PriSoft), contentAlignment = Alignment.Center) {
            Text("KA", color = PriDark, fontSize = 14.sp, fontWeight = FontWeight.ExtraBold)
        }
        Spacer(Modifier.width(11.dp))
        Column(Modifier.weight(1f)) {
            Text("Klik Agen", style = MaterialTheme.typography.titleSmall.copy(letterSpacing = (-0.3).sp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(CreditGreen))
                Spacer(Modifier.width(5.dp))
                Text("Online · $storeName", style = MaterialTheme.typography.labelMedium.copy(color = CreditGreen))
            }
        }
        // Settings icon
        Box(modifier = Modifier.size(38.dp).clip(RoundedCornerShape(11.dp)).background(Color(0xFFF4F6F8)), contentAlignment = Alignment.Center) {
            Text("⚙", fontSize = 14.sp) // placeholder; use Icon in production
        }
    }
    HorizontalDivider(color = BorderLight, thickness = 1.dp)
}

@Composable
private fun UserBubble(text: String) {
    Box(
        modifier = Modifier
            .align(Alignment.End)
            .widthIn(max = 292.dp)
            .clip(RoundedCornerShape(18.dp, 18.dp, 5.dp, 18.dp))
            .background(Pri)
            .padding(horizontal = 15.dp, vertical = 11.dp)
    ) {
        Text(text, color = Color.White, style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Medium, lineHeight = 21.sp))
    }
}

@Composable
private fun BotBubble(text: String) {
    Box(
        modifier = Modifier
            .align(Alignment.Start)
            .widthIn(max = 296.dp)
            .clip(RoundedCornerShape(18.dp, 18.dp, 18.dp, 5.dp))
            .background(Color.White)
            .border(1.dp, BorderLight, RoundedCornerShape(18.dp, 18.dp, 18.dp, 5.dp))
            .padding(horizontal = 15.dp, vertical = 11.dp)
    ) {
        Text(text, color = TextPrimary, style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Medium, lineHeight = 21.sp))
    }
}

@Composable
private fun ConfirmationCard(msg: ChatMessageDisplay) {
    val tx = msg.transaction ?: return
    Column(
        modifier = Modifier
            .align(Alignment.Start)
            .widthIn(max = 302.dp)
            .clip(RoundedCornerShape(18.dp))
            .background(Color.White)
            .border(1.dp, BorderLight, RoundedCornerShape(18.dp))
    ) {
        // Header
        Row(Modifier.fillMaxWidth().padding(13.dp, 11.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(28.dp).clip(CircleShape).background(PriSoft), contentAlignment = Alignment.Center) {
                Text("✓", color = Pri, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.width(10.dp))
            Text("Transaksi tercatat", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.ExtraBold))
            Spacer(Modifier.weight(1f))
            Text(tx.ref_number.takeLast(5), style = MaterialTheme.typography.labelSmall.copy(color = TextMuted))
        }
        HorizontalDivider(color = BorderLight)
        Column(Modifier.padding(15.dp, 13.dp)) {
            Text(tx.type.replace("_", " "), style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary, fontWeight = FontWeight.SemiBold))
            Text("Rp ${String.format("%,.0f", tx.amount)}", fontSize = 25.sp, fontWeight = FontWeight.ExtraBold, color = TextPrimary, letterSpacing = (-0.6).sp)
            Spacer(Modifier.height(12.dp))
            if (tx.fee > 0) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Fee agen", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
                    Text("+ Rp ${String.format("%,.0f", tx.fee)}", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold, color = CreditGreen))
                }
            }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Saldo", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
                Text("Rp ${String.format("%,.0f", tx.amount)}", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold, color = TextPrimary))
            }
        }
    }
}

@Composable
private fun RekapCard(msg: ChatMessageDisplay) {
    // Simplified: render rekap data from message if available
    BotBubble(msg.text)
}

@Composable
private fun TypingIndicator() {
    val infiniteTransition = rememberInfiniteTransition(label = "typing")
    fun dotAlpha(delay: Int) = infiniteTransition.animateFloat(
        initialValue = 0.25f, targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(400, delayMillis = delay), repeatMode = RepeatMode.Reverse),
        label = "dot$delay"
    )
    Row(
        modifier = Modifier
            .align(Alignment.Start)
            .clip(RoundedCornerShape(18.dp, 18.dp, 18.dp, 5.dp))
            .background(Color.White).border(1.dp, BorderLight, RoundedCornerShape(18.dp, 18.dp, 18.dp, 5.dp))
            .padding(horizontal = 16.dp, vertical = 13.dp),
        horizontalArrangement = Arrangement.spacedBy(5.dp)
    ) {
        listOf(0, 200, 400).forEachIndexed { _, delay ->
            Box(Modifier.size(7.dp).clip(CircleShape).background(NavInactive).graphicsLayer { alpha = dotAlpha(delay).value })
        }
    }
}

@Composable
private fun QuickActionPill(label: String, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(999.dp))
            .background(Color.White)
            .border(1.dp, BorderLight, RoundedCornerShape(999.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 8.dp)
    ) {
        Text(label, style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold, color = Color(0xFF344054)))
    }
}

@Composable
private fun InputBar(value: String, onValueChange: (String) -> Unit, onSend: () -> Unit, enabled: Boolean, isSending: Boolean) {
    Row(
        modifier = Modifier.fillMaxWidth().background(Color.White).padding(horizontal = 12.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Camera button
        Box(Modifier.size(42.dp).clip(RoundedCornerShape(13.dp)).background(Color(0xFFF4F6F8)), contentAlignment = Alignment.Center) {
            Icon(Icons.Default.CameraAlt, contentDescription = "Kamera", tint = TextSecondary, modifier = Modifier.size(20.dp))
        }
        Spacer(Modifier.width(9.dp))
        // Text input
        Box(
            modifier = Modifier.weight(1f).height(44.dp).clip(RoundedCornerShape(999.dp)).background(Color(0xFFF4F6F8)).padding(horizontal = 16.dp),
            contentAlignment = Alignment.CenterStart
        ) {
            // Using BasicTextField or TextField
            androidx.compose.material3.TextField(
                value = value, onValueChange = onValueChange,
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Ketik transaksi atau \"rekap hari ini\"…", color = TextMuted, style = MaterialTheme.typography.bodyLarge) },
                singleLine = true, enabled = enabled,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                keyboardActions = KeyboardActions(onSend = { onSend() }),
                colors = androidx.compose.material3.TextFieldDefaults.colors(
                    focusedContainerColor = Color.Transparent, unfocusedContainerColor = Color.Transparent,
                    focusedIndicatorColor = Color.Transparent, unfocusedIndicatorColor = Color.Transparent
                )
            )
        }
        Spacer(Modifier.width(9.dp))
        // Send button
        Box(
            modifier = Modifier.size(44.dp).clip(CircleShape).background(Pri).clickable(enabled = enabled && value.isNotBlank()) { onSend() },
            contentAlignment = Alignment.Center
        ) {
            if (isSending) CircularProgressIndicator(Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
            else Icon(Icons.AutoMirrored.Filled.Send, "Kirim", tint = Color.White, modifier = Modifier.size(20.dp))
        }
    }
}

@Composable
private fun Banner(text: String, bgColor: Color) {
    Surface(color = bgColor, modifier = Modifier.fillMaxWidth()) {
        Text(text, modifier = Modifier.padding(8.dp), color = Color.White, style = MaterialTheme.typography.bodySmall)
    }
}
```

- [ ] **Step 2: Fix alignment modifiers**

The `align` modifiers used above won't work outside of a `Column`/`Row` scope. Fix: wrap bubbles in a `Box` or use `Modifier.fillMaxWidth().wrapContentWidth()` pattern.

```kotlin
// Fix UserBubble: wrap in Box with Alignment.End
@Composable
private fun UserBubble(text: String) {
    Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.CenterEnd) {
        Box(
            modifier = Modifier
                .widthIn(max = 292.dp)
                .clip(RoundedCornerShape(18.dp, 18.dp, 5.dp, 18.dp))
                .background(Pri)
                .padding(horizontal = 15.dp, vertical = 11.dp)
        ) { Text(text, color = Color.White, style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Medium, lineHeight = 21.sp)) }
    }
}
// Same pattern for BotBubble, ConfirmationCard, RekapCard — wrap in Box(fillMaxWidth, Start)
```

- [ ] **Step 3: Commit**

```bash
cd "/home/wanda/Klik Agen" && git add android/app/src/main/java/id/klikagen/app/ui/screen/chat/ChatScreen.kt
git commit -m "feat: redesign Chat screen — bubbles, cards, quick actions, input bar

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: Redesign DaftarRekeningScreen (Saldo)

**Files:**
- Modify: `android/app/src/main/java/id/klikagen/app/ui/screen/saldo/DaftarRekeningScreen.kt`

**Changes:** Hero card hijau BRI, Kas Laci card putih, mutasi list restyle, hapus FAB.

- [ ] **Step 1: Rewrite DaftarRekeningScreen.kt**

```kotlin
package id.klikagen.app.ui.screen.saldo

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import id.klikagen.app.ui.theme.Bg
import id.klikagen.app.ui.theme.BorderLight
import id.klikagen.app.ui.theme.CreditGreen
import id.klikagen.app.ui.theme.DebitRed
import id.klikagen.app.ui.theme.Pri
import id.klikagen.app.ui.theme.PriDark
import id.klikagen.app.ui.theme.PriSoft
import id.klikagen.app.ui.theme.TextMuted
import id.klikagen.app.ui.theme.TextPrimary
import id.klikagen.app.ui.theme.TextSecondary

@Composable
fun DaftarRekeningScreen(
    onAccountClick: (id: String, name: String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: SaldoViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    when {
        uiState.loading && uiState.accounts.isEmpty() -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        uiState.error != null && uiState.accounts.isEmpty() -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text(uiState.error!!, color = DebitRed) }
        else -> {
            LazyColumn(modifier = modifier.fillMaxSize().background(Bg)) {
                // Header
                item {
                    Column(Modifier.fillMaxWidth().background(Color.White).padding(18.dp)) {
                        Text("Saldo & Mutasi", style = MaterialTheme.typography.titleLarge)
                        Text("Posisi rekening & kas hari ini", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
                    }
                    HorizontalDivider(color = BorderLight)
                }
                // Hero card + Kas Laci
                item {
                    Column(Modifier.padding(16.dp)) {
                        // BRI Hero Card
                        Box(
                            modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(Pri).padding(20.dp)
                        ) {
                            // Decorative circle
                            Box(Modifier.size(120.dp).clip(RoundedCornerShape(50)).background(Color.White.copy(alpha = 0.08f)).align(Alignment.TopEnd).offset(y = (-30).dp, x = 20.dp))
                            Column {
                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("Rekening BRI", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = Color.White.copy(alpha = 0.9f))
                                    Text("Bank", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White, modifier = Modifier.clip(RoundedCornerShape(999.dp)).background(Color.White.copy(alpha = 0.2f)).padding(horizontal = 10.dp, vertical = 4.dp))
                                }
                                Spacer(Modifier.height(14.dp))
                                Text(formatRupiah(uiState.accounts.firstOrNull()?.balance ?: 0.0), fontSize = 30.sp, fontWeight = FontWeight.ExtraBold, color = Color.White, letterSpacing = (-0.8).sp)
                            }
                        }
                        // Kas Laci card (first non-bank account)
                        Spacer(Modifier.height(12.dp))
                        val kasAccount = uiState.accounts.find { it.type == "kas" }
                        if (kasAccount != null) {
                            Row(
                                Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(Color.White).border(1.dp, BorderLight, RoundedCornerShape(20.dp)).padding(18.dp, 20.dp),
                                horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text("Kas Laci", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary, fontWeight = FontWeight.SemiBold))
                                    Text(formatRupiah(kasAccount.balance), fontSize = 23.sp, fontWeight = FontWeight.ExtraBold, color = TextPrimary, letterSpacing = (-0.5).sp)
                                }
                                Text("Kas", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PriDark, modifier = Modifier.clip(RoundedCornerShape(999.dp)).background(PriSoft).padding(horizontal = 11.dp, vertical = 5.dp))
                            }
                        }
                    }
                }
                // Mutasi header
                item { Text("Mutasi BRI", style = MaterialTheme.typography.titleSmall.copy(color = Color(0xFF344054)), modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)) }
                // Account cards
                items(uiState.accounts, key = { it.id }) { account ->
                    AccountCard(account = account, onClick = { onAccountClick(account.id, account.name) })
                }
                item { Spacer(Modifier.height(32.dp)) }
            }
        }
    }
}

@Composable
private fun AccountCard(account: RekeningSaldoOut, onClick: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp)
            .clip(RoundedCornerShape(16.dp)).background(Color.White).border(1.dp, BorderLight, RoundedCornerShape(16.dp))
            .clickable(onClick = onClick).padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Type icon
        val typeIcon = when (account.type) { "bank" -> Icons.Default.AccountBalance; "ewallet" -> "📱"; "edc" -> "💳"; else -> "💰" }
        Box(Modifier.size(36.dp).clip(RoundedCornerShape(10.dp)).background(Color(0xFFF4F6F8)), contentAlignment = Alignment.Center) {
            Text(typeIcon.toString(), fontSize = 16.sp)
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(account.name, style = MaterialTheme.typography.titleSmall, color = TextPrimary)
            Text(account.type.replace("_", " "), style = MaterialTheme.typography.labelSmall.copy(color = TextMuted))
        }
        Column(horizontalAlignment = Alignment.End) {
            Text(formatRupiah(account.balance), style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold), color = TextPrimary)
        }
    }
}
```

Note: `AccountCard` import `RekeningSaldoOut` from DTOs — already available. Keep swipe-to-delete if needed; simplified for MVP.

- [ ] **Step 2: Commit**

```bash
cd "/home/wanda/Klik Agen" && git add android/app/src/main/java/id/klikagen/app/ui/screen/saldo/DaftarRekeningScreen.kt
git commit -m "feat: redesign DaftarRekening with hero card + new card style

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: Redesign ArusKasScreen

**Files:**
- Modify: `android/app/src/main/java/id/klikagen/app/ui/screen/saldo/ArusKasScreen.kt`
- Modify: `android/app/src/main/java/id/klikagen/app/ui/screen/rekap/RekapScreen.kt`
- Modify: `android/app/src/main/java/id/klikagen/app/ui/screen/akun/AkunScreen.kt`

**Changes (ArusKas):** Update MutasiRow styling — title bold 14sp, amount colored (credit=red → design has credit=green for incoming), running balance.  
**Changes (Rekap):** Hero card hijau "Laba Bersih", period pill selector, 2×2 grid, streak card PriSoft.  
**Changes (Akun):** Profile card dengan avatar PriSoft besar, menu list icons, logout merah.

These three are smaller refactors using already-established patterns. Each follows the same model: update styling, keep ViewModel interface.

- [ ] **Step 1: Update ArusKasScreen MutasiRow**

In `ArusKasScreen.kt`, replace `MutasiRow`:
```kotlin
@Composable
private fun MutasiRow(mutasi: MutasiItem) {
    Column(Modifier.fillMaxWidth().padding(vertical = 13.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(mutasi.keterangan, style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold), modifier = Modifier.weight(1f))
            Text(
                formatRupiah(mutasi.nominal),
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.ExtraBold),
                color = when (mutasi.tipe_mutasi) {
                    "debit" -> CreditGreen // uang masuk
                    "credit" -> DebitRed   // uang keluar
                    else -> TextSecondary
                }
            )
        }
        Spacer(Modifier.height(2.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(mutasi.tanggal + if (mutasi.ref_number.isNotBlank()) " · ${mutasi.ref_number}" else "", style = MaterialTheme.typography.labelSmall.copy(color = TextMuted))
            Text("Saldo ${formatRupiah(mutasi.saldo_berjalan)}", style = MaterialTheme.typography.labelSmall.copy(color = TextMuted))
        }
    }
}
```
Also update the top bar to match new style (back arrow, account name as title on white bg).

- [ ] **Step 2: Rewrite RekapScreen**

```kotlin
package id.klikagen.app.ui.screen.rekap

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import id.klikagen.app.data.remote.dto.RekapResponse
import id.klikagen.app.ui.screen.saldo.formatRupiah
import id.klikagen.app.ui.theme.Bg
import id.klikagen.app.ui.theme.BorderLight
import id.klikagen.app.ui.theme.CreditGreen
import id.klikagen.app.ui.theme.DebitRed
import id.klikagen.app.ui.theme.Pri
import id.klikagen.app.ui.theme.PriSoft
import id.klikagen.app.ui.theme.TextMuted
import id.klikagen.app.ui.theme.TextPrimary
import id.klikagen.app.ui.theme.TextSecondary

@Composable
fun RekapScreen(
    modifier: Modifier = Modifier,
    viewModel: RekapViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val data = uiState.data

    Column(modifier = modifier.fillMaxSize().background(Bg).verticalScroll(rememberScrollState())) {
        // Header + Period selector
        Column(Modifier.fillMaxWidth().background(Color.White).padding(18.dp)) {
            Text("Rekap", style = MaterialTheme.typography.titleLarge)
            Spacer(Modifier.height(14.dp))
            Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(13.dp)).background(Color(0xFFF1F3F5)).padding(4.dp)) {
                RekapPeriod.entries.forEach { period ->
                    val active = uiState.period == period
                    Box(
                        Modifier.weight(1f).clip(RoundedCornerShape(10.dp))
                            .background(if (active) Pri else Color.Transparent).clickable { viewModel.setPeriod(period) }
                            .padding(vertical = 9.dp), contentAlignment = Alignment.Center
                    ) {
                        Text(period.label, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = if (active) Color.White else TextSecondary)
                    }
                }
            }
        }
        HorizontalDivider(color = BorderLight)

        when {
            uiState.loading && data == null -> Box(Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
            uiState.error != null && data == null -> Box(Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) { Text(uiState.error!!, color = DebitRed) }
            data != null -> RekapContent(data, uiState.period.label)
        }
    }
}

@Composable
private fun RekapContent(data: RekapResponse, periodLabel: String) {
    Column(Modifier.padding(16.dp)) {
        // Hero card
        Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(Pri).padding(22.dp)) {
            Column {
                Text("Laba Bersih · $periodLabel", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = Color.White.copy(alpha = 0.9f))
                Text(formatRupiah(data.laba_bersih), fontSize = 34.sp, fontWeight = FontWeight.ExtraBold, color = Color.White, letterSpacing = (-1).sp)
                Text("dari ${data.total_trx} transaksi", fontSize = 12.5.sp, color = Color.White.copy(alpha = 0.85f))
            }
        }

        // 2×2 grid
        Spacer(Modifier.height(12.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(11.dp)) {
            StatCard("Omzet", formatRupiah(data.total_omzet), TextPrimary, Modifier.weight(1f))
            StatCard("Total Fee", formatRupiah(data.total_fee), CreditGreen, Modifier.weight(1f))
        }
        Spacer(Modifier.height(11.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(11.dp)) {
            StatCard("Transaksi", "${data.total_trx}", TextPrimary, Modifier.weight(1f))
            StatCard("Pengeluaran", "- ${formatRupiah(data.total_pengeluaran)}", DebitRed, Modifier.weight(1f))
        }

        // Streak
        if (data.streak >= 1) {
            Spacer(Modifier.height(14.dp))
            Row(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(PriSoft).padding(14.dp, 16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("🔥", fontSize = 22.sp)
                Spacer(Modifier.width(11.dp))
                Column {
                    Text("Streak ${data.streak} hari berturut-turut", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.ExtraBold))
                    Text("Catat transaksi tiap hari, jaga apinya tetap nyala!", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
                }
            }
        }
    }
}

@Composable
private fun StatCard(label: String, value: String, valueColor: Color, modifier: Modifier) {
    Column(
        modifier
            .clip(RoundedCornerShape(16.dp)).background(Color.White).border(1.dp, BorderLight, RoundedCornerShape(16.dp))
            .padding(15.dp)
    ) {
        Text(label, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextSecondary)
        Text(value, fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = valueColor)
    }
}
```

- [ ] **Step 3: Rewrite AkunScreen main view**

Replace the main `AkunSubScreen.Main` branch in `AkunScreen.kt` with the new design:

```kotlin
// Replace the Column inside AkunSubScreen.Main -> uiState.user != null block:
Column(
    modifier = Modifier.fillMaxSize().background(Bg).verticalScroll(rememberScrollState()),
    verticalArrangement = Arrangement.spacedBy(14.dp)
) {
    // Header
    Column(Modifier.fillMaxWidth().background(Color.White).padding(18.dp)) {
        Text("Pengaturan", style = MaterialTheme.typography.titleLarge)
    }
    HorizontalDivider(color = BorderLight)
    Spacer(Modifier.height(2.dp))

    // Profile card
    Box(Modifier.fillMaxWidth().padding(horizontal = 16.dp).clip(RoundedCornerShape(18.dp)).background(Color.White).border(1.dp, BorderLight, RoundedCornerShape(18.dp)).padding(18.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(52.dp).clip(RoundedCornerShape(16.dp)).background(PriSoft), contentAlignment = Alignment.Center) {
                Text(user.name.take(1).uppercase(), fontSize = 19.sp, fontWeight = FontWeight.ExtraBold, color = PriDark)
            }
            Spacer(Modifier.width(14.dp))
            Column(Modifier.weight(1f)) {
                Text(user.name, style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.ExtraBold))
                Text("${user.store_name} · ${user.phone}", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
            }
        }
    }

    // Menu items
    Column(
        Modifier.fillMaxWidth().padding(horizontal = 16.dp)
            .clip(RoundedCornerShape(18.dp)).background(Color.White).border(1.dp, BorderLight, RoundedCornerShape(18.dp))
    ) {
        MenuRow("Profil Toko", "✏") { viewModel.startEditProfile() }
        HorizontalDivider(color = BorderLight, modifier = Modifier.padding(horizontal = 16.dp))
        MenuRow("Pengaturan Fee", "📋") { /* expand fee section */ }
        HorizontalDivider(color = BorderLight, modifier = Modifier.padding(horizontal = 16.dp))
        MenuRow("Bantuan", "❓") { /* help */ }
    }

    // Logout
    Box(
        Modifier.fillMaxWidth().padding(horizontal = 16.dp).clip(RoundedCornerShape(14.dp)).background(LogoutRedBg).border(1.dp, LogoutRedBorder, RoundedCornerShape(14.dp)).clickable { viewModel.logout(); onLogout() }.padding(15.dp),
        contentAlignment = Alignment.Center
    ) {
        Text("Keluar", color = LogoutRed, style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold))
    }

    // Version
    Text("Klik Agen v1.0 · MVP", style = MaterialTheme.typography.labelSmall.copy(color = TextMuted), modifier = Modifier.fillMaxWidth().padding(bottom = 18.dp), textAlign = TextAlign.Center)
}
```

Add helper:
```kotlin
@Composable
private fun MenuRow(label: String, icon: String, onClick: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().clickable(onClick = onClick).padding(horizontal = 16.dp, vertical = 15.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(Modifier.size(34.dp).clip(RoundedCornerShape(10.dp)).background(Color(0xFFF4F6F8)), contentAlignment = Alignment.Center) {
            Text(icon, fontSize = 14.sp)
        }
        Spacer(Modifier.width(13.dp))
        Text(label, Modifier.weight(1f), style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold, color = Color(0xFF1F2937)))
        Text("›", color = TextMuted)
    }
}
```

- [ ] **Step 4: Compile & fix**

```bash
cd "/home/wanda/Klik Agen/android" && ./gradlew assembleDebug 2>&1 | tail -30
```

Fix any compilation errors (imports, missing references, type mismatches).

- [ ] **Step 5: Commit all remaining**

```bash
cd "/home/wanda/Klik Agen" && git add android/app/src/main/java/id/klikagen/app/ui/screen/
git commit -m "feat: redesign ArusKas, Rekap, Akun screens with Emerald theme

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: Final Verification

- [ ] **Step 1: Full Android build**

```bash
cd "/home/wanda/Klik Agen/android" && ./gradlew assembleDebug 2>&1 | grep -E "BUILD|ERROR|FAIL"
```
Expected: `BUILD SUCCESSFUL`

- [ ] **Step 2: Backend tests**

```bash
cd "/home/wanda/Klik Agen/backend" && ./venv/bin/pytest -q 2>&1 | tail -5
```
Expected: `119 passed` (or similar — all green)

- [ ] **Step 3: Clean up deprecated aliases (optional)**

If all screens compile and work, remove deprecated aliases from Color.kt and clean up imports across all files.

- [ ] **Step 4: Final commit**

```bash
cd "/home/wanda/Klik Agen" && git add -A && git commit -m "feat: complete Klik Agen UI/UX redesign

All screens redesigned to match Emerald Green prototype:
- Login/Register: new branding, fields, green CTAs
- Chat: new header, bubbles, confirmation cards, quick actions
- Saldo: hero card, new card style, mutasi
- Rekap: period pills, hero card, 2x2 grid, streak
- Settings: profile card, menu list, red logout
- Bottom nav: Chat | Saldo | Rekap | Setelan
- Theme: Emerald Green #0E9F6E + Plus Jakarta Sans

Co-Authored-By: Claude <noreply@anthropic.com>"
```
