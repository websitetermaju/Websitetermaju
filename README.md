# Websitetermaju

Website profesional untuk jasa pembuatan website. Dibangun dengan **Astro** + **Tailwind CSS v4**.

## Development

```sh
npm install
npm run dev        # Dev server di localhost:4321
npm run build      # Build ke ./dist/
npm run preview    # Preview build lokal
```

## Deploy via cPanel Git Version Control

### Penting: Build Dulu Sebelum Push

cPanel tidak bisa menjalankan `npm run build`. Folder `dist/` harus di-commit ke repo.

**Alur kerja setiap kali ada perubahan:**

1. Edit file di `src/`
2. Jalankan `npm run build`
3. Commit semua perubahan (termasuk `dist/`)
4. Push ke GitHub
5. Di cPanel → Git Version Control → Pull or Deploy → Update from Remote → Deploy HEAD Commit

### Setup Pertama Kali

1. Login ke cPanel
2. Buka **Git Version Control**
3. Klik **Create**
4. Masukkan URL repo: `git@github.com:websitetermaju/Websitetermaju.git`
5. Jika autentikasi gagal:
   - Di cPanel, ambil SSH public key
   - Masuk ke GitHub repo → **Settings** → **Deploy keys** → **Add Deploy Key**
   - Paste SSH key. **JANGAN** centang "Allow write access"
6. Edit file `.cpanel.yml` — ganti `USERNAME` dengan username cPanel kamu
7. Push dan deploy

### Konfigurasi Deploy

File `.cpanel.yml` mengatur file apa yang dicopy ke `public_html`:

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
