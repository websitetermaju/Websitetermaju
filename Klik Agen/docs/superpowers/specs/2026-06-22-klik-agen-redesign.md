# Klik Agen — UI/UX Redesign Spec

**Status:** Approved | **Date:** 2026-06-22 | **Source:** Claude Design handoff (`Klik Agen.dc.html`)

---

## Scope

Redesign seluruh UI Android app Klik Agen — 6 screen + bottom navigation — mengikuti prototype design. Backend tidak berubah. Web admin out of scope.

---

## Design System

### Colors (Emerald Green Theme)

| Token | Value | Usage |
|-------|-------|-------|
| `pri` (Primary) | `#0E9F6E` | CTA, active nav, user bubbles, hero cards |
| `priD` (Primary Dark) | `#057a52` | Text on pri-soft, badge text |
| `priSoft` (Primary Soft) | `#E7F6EF` | Badge bg, streaks, soft accents |
| Background | `#F7F8FA` | App screen bg |
| Surface | `#FFFFFF` | Cards, input bg |
| Border | `#EBEDF0` / `#F0F1F4` | Card borders, dividers |
| Text Primary | `#0F172A` | Headings, values |
| Text Secondary | `#667085` | Labels, captions |
| Text Muted | `#98A2B3` | Placeholders, timestamps |
| Nav Inactive | `#9AA4B2` | Inactive bottom nav |
| Green (credit) | `#12A150` | Fee text, positive amounts |
| Red (debit) | `#E5484D` | Negative amounts, pengeluaran |
| Logout Red | `#D92D20` / `#FEF3F2` / `#FBD5D5` | Logout button |

### Typography

- **Font:** Plus Jakarta Sans (weights: 400, 500, 600, 700, 800)
- **Scale:** 10.5–40sp
- **Letter spacing:** -1.5px untuk brand text, -0.3px hingga -0.8px untuk headings

### Shape

- Border radius: 13–20px (soft, modern)
- Buttons: 14px border radius
- Input: 13px border radius, 1.5px border
- Cards: 16–20px border radius
- Chat bubbles: 18px, asymetrical tail (user: bottom-right 5px, bot: bottom-left 5px)

### Device Frame

- Width: 352dp, Height: 744dp (in 374dp phone frame with 11dp padding)
- Status bar: 38dp height

---

## Screen Specs

### 1. Login Screen
**File:** `LoginScreen.kt`

- Branding: "Klik **Agen**" (40sp, weight 800, letter-spacing -1.5px) with green "Agen"
- Green accent bar: 46×4px, rounded
- Subtitle: "Asisten pembukuan untuk agen BRILink..." (15sp, #667085)
- Fields: Nomor HP + Password — label uppercase 11.5sp bold, input 15sp, border #E4E7EC 1.5px
- Focus state: border turns pri, box-shadow 3px priSoft
- CTA: "Masuk" — full width, 16px padding, 14px radius, pri bg, white text, 15.5sp bold
- Link: "Belum punya akun? **Daftar**"

### 2. Register Screen
**File:** `RegisterScreen.kt`

- Back nav: "‹ Kembali" (14sp, #667085)
- Title: "Daftar akun baru" (26sp, weight 800)
- Slot badge: green dot + "49/50 slot tersisa" — pill shape, priSoft bg
- Fields: Nama Lengkap, Nomor HP, Nama Toko, Password
- CTA: "Daftar Sekarang"
- Validasi: cek kuota dari GET /api/slot

### 3. Chat Screen (Home)
**File:** `ChatScreen.kt`

**Header (62dp):**
- KA avatar: 40×40, priSoft bg, priD text, 13px radius
- "Klik Agen" title + "● Online · {store}" subtitle
- Settings gear icon button

**Messages:**
- User bubble: right-aligned, max 80% width, pri bg, white text, 14.5sp, rounded 18px (bottom-right 5px tail), shadow
- Bot text bubble: left-aligned, max 84%, white bg, #1F2937 text, border #EEF0F2, 18px radius (bottom-left 5px tail)
- Confirmation card: white card 86% width, border #EBEDF0, checkmark icon in green circle, header "Transaksi tercatat" + ref, divider, detail (jenis, nominal 25sp bold, fee, saldo)
- Rekap card: pri header "Rekap · {periode}", "Laba bersih {amount}", detail rows (transaksi, omzet, fee, pengeluaran)
- Typing indicator: 3 dots with staggered blink animation

**Quick Actions (horizontal scroll):**
- Pills: white bg, border #E4E7EC, 999px radius, 12.5sp semi-bold
- Default: Transfer 300rb, Tarik tunai 500rb, Rekap hari ini, Pindah ke kas

**Input Bar:**
- Camera button (42×42, #F4F6F8 bg)
- Text input: pill shape (999px radius), #F4F6F8 bg, placeholder "Ketik transaksi atau "rekap hari ini"..."
- Send button: 44×44 circle, pri bg, white icon, box-shadow

### 4. Saldo & Mutasi Screen
**File:** `DaftarRekeningScreen.kt` + `ArusKasScreen.kt`

- Header: "Saldo & Mutasi" (21sp bold) + subtitle "Posisi rekening & kas hari ini"
- BRI Hero Card: pri bg, white text, 20px radius, decorative circle, "Rekening BRI" + "Bank" badge, saldo 30sp bold
- Kas Laci Card: white bg, border, "Kas Laci" label, saldo 23sp, "Kas" badge priSoft
- Mutasi Section: "Mutasi BRI" header 13sp bold
- Mutasi items: title 14sp bold, subtitle 11.5sp muted, amount colored (credit green +/debit red -), running balance

### 5. Rekap Screen
**File:** `RekapScreen.kt`

- Header: "Rekap" (21sp bold)
- Period selector: segmented pill (Hari | Minggu | Bulan), active = pri bg white text, inactive = transparent #667085
- Hero Card: pri bg, "Laba Bersih · {period}", amount 34sp bold, "dari {n} transaksi"
- Stat Grid (2×2): Omzet, Total Fee (green), Transaksi, Pengeluaran (red)
- Streak card: priSoft bg, flame SVG icon, "Streak {n} hari berturut-turut", encouragement text

### 6. Settings Screen
**File:** `AkunScreen.kt`

- Header: "Pengaturan" (21sp bold)
- Profile card: inisial avatar (52×52, priSoft bg, priD text), nama 16sp, toko+hp 13sp
- Menu items (with icons in 34×34 #F4F6F8 circle):
  - Profil Toko (user icon)
  - Pengaturan Fee per Transaksi (list icon)
  - Bantuan (question circle icon)
- Logout: red (#D92D20) text on #FEF3F2 bg, border #FBD5D5
- Version: "Klik Agen v1.0 · MVP" muted

### Bottom Navigation
**File:** `MainScreen.kt`

- Height: 64dp (+ 4dp bottom padding)
- 4 tabs: Chat, Saldo, Rekap, Setelan
- SVG icons, 23×23, stroke-width 1.9
- Active: pri color; Inactive: #9AA4B2
- Labels: 10.5sp, weight 700

---

## Implementation Notes

### File Changes (Android)

| File | Action |
|------|--------|
| `ui/theme/Color.kt` | Rewrite — new color palette |
| `ui/theme/Theme.kt` | Update — new color scheme + font |
| `ui/theme/Type.kt` | Update — Plus Jakarta Sans scale |
| `ui/screen/login/LoginScreen.kt` | Rewrite — new design |
| `ui/screen/register/RegisterScreen.kt` | Rewrite — new design + slot badge |
| `ui/screen/chat/ChatScreen.kt` | Rewrite — new bubbles, cards, quick actions, camera |
| `ui/screen/saldo/DaftarRekeningScreen.kt` | Rewrite — hero card + cards |
| `ui/screen/saldo/ArusKasScreen.kt` | Update — new mutasi style |
| `ui/screen/rekap/RekapScreen.kt` | Rewrite — period pills, hero, grid, streak |
| `ui/screen/akun/AkunScreen.kt` | Rewrite — profile card, menu items |
| `ui/screen/main/MainScreen.kt` | Update — new bottom nav with SVG icons |
| `ui/navigation/NavGraph.kt` | Minor update if needed |

### Not Changing
- Backend API (FastAPI) — no changes
- Data layer (Room, Retrofit, DTOs) — no changes
- ViewModels — update only UI state mapping where needed
- Web admin — out of scope

### Design Fidelity Rules
1. Warna: HARUS sesuai color tokens di atas — tidak boleh ada warna blue lama
2. Font: HARUS Plus Jakarta Sans
3. Spacing & radius: ikuti prototype
4. Ikon SVG: recreate di Compose — tidak pakai emoji
5. Sesuaikan data binding ke ViewModel yang sudah ada
