# Websitetermaju Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One-page landing statis untuk jasa pembuatan website, semua CTA mengarah ke WhatsApp 628159203331, siap deploy via cPanel Git.

**Architecture:** HTML/CSS/JS statis murni tanpa build step. Satu `index.html` berisi 7 section, satu stylesheet, satu file JS kecil untuk injeksi link WA dan scroll-reveal. Deploy dengan `.cpanel.yml` yang menyalin file ke `public_html`.

**Tech Stack:** HTML5, CSS murni, vanilla JS (IntersectionObserver), Google Fonts (Plus Jakarta Sans), cPanel Git Version Control.

**Spec:** `docs/superpowers/specs/2026-06-10-websitetermaju-landing-design.md`

---

### Task 1: Scaffold + infrastruktur deploy

**Files:**
- Create: `.cpanel.yml`
- Create: `README.md`

- [ ] **Step 1: Tulis `.cpanel.yml`**

```yaml
---
deployment:
  tasks:
    # GANTI "USERNAME" dengan username cPanel kamu (lihat pojok kanan atas cPanel)
    - export DEPLOYPATH=/home/USERNAME/public_html
    - /bin/cp -f index.html $DEPLOYPATH/
    - /bin/cp -Rf css $DEPLOYPATH/
    - /bin/cp -Rf js $DEPLOYPATH/
    - /bin/cp -Rf assets $DEPLOYPATH/
```

- [ ] **Step 2: Tulis `README.md`**

Isi: cara ganti nomor WA & harga (semua di `js/main.js` dan `index.html`),
cara ganti portofolio/testimoni (cari komentar `<!-- EDIT: ... -->` di
`index.html`), dan 3 langkah deploy cPanel (Update from Remote → Deploy HEAD
Commit; setup awal: create repo di Git Version Control + deploy key).

- [ ] **Step 3: Commit**

```bash
git add .cpanel.yml README.md && git commit -m "chore: add cPanel deploy config and README"
```

### Task 2: Konten halaman (`index.html`)

**Files:**
- Create: `index.html`

Gunakan skill **frontend-design** saat menulis markup+styling (Task 2–3 satu
kesatuan kreatif). Bahasa Indonesia santai, sapaan "kamu". Section berurut:

- [ ] **Step 1: Head + meta**

Title: `Websitetermaju — Jasa Pembuatan Website Murah & Nggak Ribet`.
Meta description: `Jasa pembuatan website untuk UMKM. Proses gampang, harga jelas, jadi cepat. Konsultasi gratis via WhatsApp.`
Open Graph: og:title, og:description, og:image (`assets/og-image.png`).
Font: Plus Jakarta Sans weights 400;500;700;800, `display=swap`.
Favicon `assets/favicon.svg`.

- [ ] **Step 2: Section 1 — Hero**

Nav: logo teks "websitetermaju ✦" + anchor link (Proses · Karya · Paket).
H1: `Punya website bagus itu nggak harus ribet & mahal.` (kata "ribet & mahal"
diberi garis bawah coretan). Subjudul: `Websitetermaju bikinin kamu website
yang kelihatan profesional, cepat, dan gampang ditemukan di Google — kamu
tinggal terima jadi.` CTA: `Ngobrol dulu yuk 👋` (atribut `data-wa`).
Sub-CTA kecil: `Gratis konsultasi · Balas cepat jam 08.00–21.00 WIB`.

- [ ] **Step 3: Section 2 — Proses kerja (id="proses")**

Judul section: `Prosesnya segampang ini`. 4 kartu bernomor:
1. `Chat & cerita` — `Ceritain usahamu dan website seperti apa yang kamu mau. Belum kebayang? Kami bantu.`
2. `Kami desain` — `Dalam 2–3 hari kamu sudah lihat draf pertama websitemu.`
3. `Revisi santai` — `Ada yang kurang sreg? Revisi sampai kamu puas, tanpa drama.`
4. `Launch! 🚀` — `Website tayang di domainmu. Kami kasih panduan singkat cara pakainya.`

- [ ] **Step 4: Section 3 — Portofolio (id="karya")**

Judul: `Beberapa karya kami`. 3 kartu placeholder (`<!-- EDIT: ganti dengan
proyek nyata -->`): `Kopi Senja — toko kopi`, `Bengkel Mas Yono — jasa servis`,
`Batik Larasati — toko online`. Gambar pakai SVG placeholder dari `assets/`.

- [ ] **Step 5: Section 4 — Paket harga (id="paket")**

Judul: `Pilih paket yang pas`. 3 kartu (`<!-- EDIT: sesuaikan harga -->`):
- **Landing Page** Rp 750rb: 1 halaman, desain custom, tombol WhatsApp, gratis domain .my.id 1 thn, jadi ±5 hari.
- **Bisnis** Rp 1,5jt (badge `Paling laris ⭐`): sampai 5 halaman, desain custom, email bisnis, gratis domain .com 1 thn, SEO dasar, jadi ±7 hari.
- **Toko Online** Rp 3,5jt: katalog produk, keranjang + checkout WA, semua fitur Bisnis, jadi ±14 hari.
Tiap kartu: tombol `data-wa data-wa-msg="Halo, saya tertarik Paket <nama>. Boleh tanya-tanya dulu?"`.
Catatan kecil di bawah: `Harga bisa menyesuaikan kebutuhan. Chat aja dulu, gratis kok.`

- [ ] **Step 6: Section 5 — Testimoni**

Judul: `Kata mereka yang sudah duluan`. 3 kutipan placeholder
(`<!-- EDIT: ganti testimoni nyata -->`) dengan nama + jenis usaha.

- [ ] **Step 7: Section 6 — CTA penutup + footer**

CTA: latar cokelat tua, H2 `Masih mikir-mikir? Ngobrol dulu aja.`, teks
`Konsultasi gratis, nggak ada kewajiban order.`, tombol WA besar.
Footer: logo, `wa.me` + nomor, jam balas, © tahun. Tombol WA mengambang
(fixed kanan-bawah, `data-wa`).

- [ ] **Step 8: Commit** — `git commit -m "feat: add landing page markup and copy"`

### Task 3: Styling (`css/style.css`)

**Files:**
- Create: `css/style.css`

- [ ] **Step 1: Design tokens (CSS custom properties)**

```css
:root {
  --bg: #FFF6EC; --ink: #431407; --accent: #C2410C;
  --wa: #25D366; --card: #FFFFFF; --muted: #7C5C4A;
  --shadow: 3px 3px 0 var(--accent);
  --radius: 12px;
  --font: "Plus Jakarta Sans", system-ui, sans-serif;
}
```

- [ ] **Step 2: Implementasi gaya per section** mengikuti spec: bayangan offset
solid pada tombol/kartu, garis bawah coretan (SVG inline di
`background-image` atau pseudo-element), kartu portofolio miring selang-seling
(`transform: rotate(±1.5deg)`), kartu paket tengah di-scale-up + badge,
responsive (grid → 1 kolom di <720px), `prefers-reduced-motion` dihormati.

- [ ] **Step 3: Kelas animasi reveal**

```css
.reveal { opacity: 0; transform: translateY(24px); transition: all .6s ease; }
.reveal.shown { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .reveal { transition: none; opacity: 1; transform: none; } }
```

- [ ] **Step 4: Commit** — `git commit -m "feat: add styling"`

### Task 4: JS (`js/main.js`)

**Files:**
- Create: `js/main.js`

- [ ] **Step 1: Tulis main.js lengkap**

```js
// === KONFIGURASI — cukup edit bagian ini ===
const WA_NUMBER = "628159203331";
const WA_DEFAULT_MSG = "Halo, saya mau tanya soal jasa pembuatan website.";
// ===========================================

document.querySelectorAll("[data-wa]").forEach((el) => {
  const msg = el.dataset.waMsg || WA_DEFAULT_MSG;
  el.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  el.target = "_blank";
  el.rel = "noopener";
});

const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("shown")),
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
```

Di HTML, semua elemen `data-wa` sudah `<a href="https://wa.me/628159203331">`
sebagai fallback tanpa JS.

- [ ] **Step 2: Commit** — `git commit -m "feat: add WhatsApp link builder and scroll reveal"`

### Task 5: Assets

**Files:**
- Create: `assets/favicon.svg`, `assets/og-image.png`, `assets/karya-1.svg`, `assets/karya-2.svg`, `assets/karya-3.svg`

- [ ] **Step 1: Favicon SVG** — huruf "w✦" terakota di latar krem, 64×64.
- [ ] **Step 2: Placeholder portofolio** — 3 SVG 800×600 bergaya mini-mockup
  website (bar browser + blok konten) dengan palet sesuai tokens, label nama
  proyek. Bukan kotak abu-abu polos.
- [ ] **Step 3: OG image** — render 1200×630 PNG: logo + tagline di latar krem
  (boleh generate dari SVG via rsvg/ImageMagick, atau screenshot).
- [ ] **Step 4: Commit** — `git commit -m "feat: add favicon, OG image, portfolio placeholders"`

### Task 6: Verifikasi lokal

- [ ] **Step 1: Serve lokal** — `python3 -m http.server 8400 -d /home/wanda/websitetermaju`
- [ ] **Step 2: Cek dengan Playwright/browser**: buka `http://localhost:8400`,
  viewport desktop (1280px) dan HP (390px). Verifikasi: 7 section tampil,
  font Plus Jakarta Sans termuat, animasi reveal jalan, tidak ada error console.
- [ ] **Step 3: Verifikasi link WA** — semua `a[data-wa]` ber-href
  `https://wa.me/628159203331?text=...`; tombol paket berisi nama paketnya
  dalam `text=`. Expected: 6+ link valid (hero, 3 paket, CTA penutup, floating).
- [ ] **Step 4: Cek tanpa JS** — disable JS, link WA dasar tetap berfungsi.
- [ ] **Step 5: Perbaiki temuan, commit** — `git commit -m "fix: ..."` per perbaikan.

### Task 7: Push + panduan deploy cPanel

- [ ] **Step 1: Push** — `git push origin main`. Expected: sukses ke repo private.
- [ ] **Step 2: Pandu user setup cPanel** (interaktif, bukan otomatis):
  1. cPanel → Git Version Control → Create; isi clone URL SSH
     `git@github.com:websitetermaju/Websitetermaju.git`, repository path
     (default), lalu Create.
  2. Bila gagal auth: salin SSH public key dari cPanel (Git Version Control
     biasanya menampilkannya / lewat Terminal cPanel `cat ~/.ssh/id_rsa.pub`),
     daftarkan di GitHub → repo → Settings → Deploy keys (read-only cukup).
  3. Edit `.cpanel.yml`: ganti `USERNAME` dengan username cPanel (commit+push
     ulang dari lokal, atau beri tahu user nilai yang benar sebelum push).
  4. Pull or Deploy → Update from Remote → Deploy HEAD Commit.
  5. Buka domain user, verifikasi situs tayang + HTTPS (AutoSSL) aktif.

---

## Self-Review

- **Spec coverage:** 7 section ✔ (Task 2), visual tokens & elemen khas ✔
  (Task 3), perilaku WA + fallback ✔ (Task 4 + Task 2), SEO/OG/favicon ✔
  (Task 2 step 1 + Task 5), `.cpanel.yml` + alur deploy ✔ (Task 1 + 7),
  pengujian termasuk no-JS ✔ (Task 6). README ✔ (Task 1).
- **Placeholder scan:** placeholder konten (harga/testimoni/portofolio) memang
  disengaja per spec dan ditandai `<!-- EDIT -->`; `USERNAME` di `.cpanel.yml`
  menunggu input user (Task 7 step 3) — eksplisit, bukan lupa.
- **Konsistensi:** atribut `data-wa`/`data-wa-msg`, kelas `.reveal/.shown`,
  dan token warna konsisten antara Task 2, 3, 4.
