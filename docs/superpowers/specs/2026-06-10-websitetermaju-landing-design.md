# Desain: Landing Page Websitetermaju

Tanggal: 2026-06-10
Status: Disetujui user (brainstorming selesai)

## Tujuan

Website untuk jasa pembuatan website "Websitetermaju". Satu tujuan utama:
pengunjung chat ke WhatsApp (628159203331). Semua keputusan desain
mengarah ke konversi itu.

Deploy ke shared hosting milik user via fitur Git Version Control cPanel.
Repo: github.com/websitetermaju/Websitetermaju (private).

## Keputusan yang sudah disepakati

| Topik | Keputusan |
|---|---|
| Jenis situs | One-page landing |
| Konten | Hero, proses kerja, portofolio, paket harga, testimoni, CTA penutup, footer |
| Data konten | Placeholder dulu (harga, portofolio, testimoni) — user ganti nanti |
| Gaya visual | "Hangat & Akrab" (opsi C dari mockup) |
| Font | Plus Jakarta Sans untuk semua teks (judul pakai weight 800) |
| Teknologi | HTML + CSS + JS statis murni, tanpa build step, tanpa framework |
| Deploy | cPanel Git Version Control + `.cpanel.yml` |
| Nomor WhatsApp | 628159203331 (dari 08159203331) |

## Struktur halaman (urut dari atas)

Alur psikologi pengunjung: tertarik → percaya → lihat bukti → cek harga → chat.

1. **Hero** — headline "Punya website bagus itu nggak harus ribet & mahal.",
   subjudul singkat, tombol WA besar "Ngobrol dulu yuk 👋".
2. **Proses kerja** — 4 langkah: Chat & konsultasi → Desain → Revisi → Launch.
3. **Portofolio** — grid 3–6 karya placeholder, kartu sedikit miring selang-seling.
4. **Paket harga** (section terpenting) — 3 kartu: Landing Page (~Rp 750rb),
   Bisnis (~Rp 1,5jt, ditonjolkan sebagai paling laris), Toko Online (~Rp 3,5jt).
   Tiap kartu berisi daftar fitur dan tombol WA dengan pesan otomatis
   per paket, mis. "Halo, saya tertarik Paket Bisnis...".
5. **Testimoni** — 3 kutipan placeholder dengan nama & jenis usaha.
6. **CTA penutup** — latar cokelat tua, "Masih ragu? Konsultasi gratis,
   nggak ada kewajiban order." + tombol WA besar.
7. **Footer** — logo, kontak, jam balas chat, sosmed.

Tombol WA hijau mengambang di pojok kanan bawah, selalu terlihat saat scroll.

## Visual

- Warna: latar krem `#FFF6EC`, teks cokelat tua `#431407`, aksen terakota
  `#C2410C`, tombol WhatsApp hijau `#25D366`.
- Font: Plus Jakarta Sans (Google Fonts, `font-display: swap`), judul
  weight 800, body 400–500.
- Elemen khas: bayangan offset solid (`3px 3px 0`) pada tombol dan kartu,
  garis bawah gaya coretan tangan pada kata kunci headline, ornamen ✦,
  animasi reveal halus saat scroll via IntersectionObserver (tanpa library).
- Bahasa: Indonesia santai-akrab, sapaan "kamu".

## Struktur file

```
index.html       # seluruh konten halaman
css/style.css    # semua styling
js/main.js       # scroll-reveal + konfigurasi & injeksi link WA
assets/          # gambar placeholder, favicon, OG image
.cpanel.yml      # deploy: salin file ke public_html
README.md        # cara ganti harga/nomor WA/konten + cara deploy
```

## Perilaku link WhatsApp

- Nomor WA dan template pesan didefinisikan satu kali di `js/main.js`.
- Semua elemen ber-atribut `data-wa` (dengan pesan opsional per elemen,
  mis. nama paket) dibangun jadi link `https://wa.me/628159203331?text=...`
  saat halaman dimuat.
- Fallback: elemen `data-wa` tetap berupa `<a>` dengan href wa.me dasar
  (tanpa text) di HTML, sehingga link tetap berfungsi bila JS gagal dimuat.

## SEO & performa

- Title, meta description, Open Graph (judul, deskripsi, gambar) agar
  preview bagus saat link dibagikan di WhatsApp; favicon.
- Tanpa framework; gambar `loading="lazy"`; target halaman < 100KB
  di luar gambar.

## Deploy (cPanel Git Version Control)

1. `.cpanel.yml` berisi task salin `index.html`, `css/`, `js/`, `assets/`
   ke `public_html`. Path tujuan memakai placeholder username cPanel yang
   diisi user saat setup.
2. Setup sekali: cPanel → Git Version Control → Create → clone URL repo;
   daftarkan SSH key dari cPanel sebagai deploy key di GitHub (repo private).
3. Update rutin: push ke GitHub → cPanel "Update from Remote" →
   "Deploy HEAD Commit".

## Pengujian

- Buka lokal di browser (desktop + viewport HP), cek semua section tampil
  dan animasi berjalan.
- Verifikasi semua link WA menghasilkan URL wa.me benar dengan pesan
  yang sesuai paketnya.
- Cek halaman tetap berfungsi penuh (link WA dasar) saat JS dimatikan.

## Di luar lingkup (untuk nanti)

- Konten nyata portofolio/testimoni/harga final (user akan mengganti).
- Form kontak, blog, multi-halaman, analytics.
- Otomatisasi pull cPanel via webhook/API (deploy manual 2-klik dulu).
