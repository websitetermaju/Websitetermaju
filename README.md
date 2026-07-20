# Websitetermaju

Website profesional untuk jasa pembuatan website. Dibangun dengan **Astro** + **Tailwind CSS v4**.

## Development

```sh
npm install
npm run dev        # Dev server di localhost:4321
npm run build      # Build ke ./dist/
npm run preview    # Preview build lokal
```

## Deploy produksi via Domainesia Git Deploy

### Penting: Build Dulu Sebelum Push

Hosting tidak menjalankan `npm run build`. Folder `dist/` wajib di-commit ke repo.

**Alur kerja setiap kali ada perubahan:**

1. Edit file di `src/`
2. Jalankan `npm run build`
3. Commit semua perubahan (termasuk `dist/`)
4. Push ke GitHub
5. Push branch `main` ke GitHub
6. Jalankan deployment `domainesia-hosting` untuk domain `webtermajuumkm.com`
7. Verifikasi `https://webtermajuumkm.com/` dan halaman portofolio

### Mapping Produksi Aktif

| Item | Nilai |
|---|---|
| Domain | `webtermajuumkm.com` |
| Repo | `https://github.com/websitetermaju/Websitetermaju.git` |
| Branch | `main` |
| Docroot | `/home/webterma/public_html` |
| Output publik | `dist/` melalui `.htaccess` |
| Build | Lokal sebelum push |
| Health check | `https://webtermajuumkm.com/` |

### Konfigurasi Deploy

File `.cpanel.yml` tetap tersedia untuk kompatibilitas cPanel manual. Deploy utama saat ini memakai Git Deploy Domainesia yang melakukan fetch dan reset ke branch `main`. `.htaccess` menyajikan build dari folder `dist/`.

```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/USERNAME/public_html
    - /bin/cp -Rf dist/* $DEPLOYPATH/
    - /bin/cp -Rf dist/_astro $DEPLOYPATH/
```

## Struktur Proyek

```
├── src/
│   ├── components/      # Komponen Astro (Navbar, Hero, dll)
│   ├── layouts/         # Layout utama
│   ├── pages/           # Halaman (index.astro)
│   └── styles/          # Global CSS + Tailwind config
├── public/              # Asset statis (favicon, gambar)
├── dist/                # Build output (di-commit untuk cPanel)
├── astro.config.mjs     # Konfigurasi Astro
├── .cpanel.yml          # Konfigurasi deploy cPanel
└── package.json
```

## Mengubah Konten

- **Harga**: Edit `src/components/Pricing.astro`
- **Portfolio**: Edit `src/components/Portfolio.astro`
- **Testimoni**: Edit `src/components/Testimonials.astro`
- **FAQ**: Edit `src/components/FAQ.astro`
- **Nomor WA**: Cari & ganti `628159203331` di semua komponen

Setelah edit, jangan lupa `npm run build` dan commit `dist/`.
