# Websitetermaju

Landing page statis untuk **jasa pembuatan website**. Semua tombol CTA mengarah ke WhatsApp.

## Mengubah Nomor WhatsApp & Pesan

Untuk mengganti nomor WhatsApp atau pesan default:
1. Buka file `js/main.js`
2. Cari konstanta `WA_NUMBER` dan `WA_DEFAULT_MSG`
3. Edit nilai sesuai keinginan
4. Semua tombol website otomatis menggunakan nomor & pesan baru (satu tempat, semua ikut berubah)
5. Setelah itu, buka `index.html` dan cari-ganti juga nomor `628159203331` di sana (link fallback tombol & footer), supaya tetap konsisten kalau JavaScript tidak aktif.

## Mengubah Paket, Portfolio & Testimoni

Buka file `index.html` dan cari komentar `<!-- EDIT: ... -->` untuk:
- Harga paket layanan
- Portfolio/contoh proyek
- Testimoni klien

Edit langsung di HTML, tidak perlu sentuh file lain.

## Deploy via cPanel Git Version Control

### Setup Pertama Kali

1. Login ke cPanel
2. Buka **Git Version Control** (atau cari di search)
3. Klik **Create**
4. Masukkan URL repo: `git@github.com:websitetermaju/Websitetermaju.git`
5. Jika autentikasi gagal:
   - Di cPanel, ambil SSH public key
   - Masuk ke GitHub repo → **Settings** → **Deploy keys** → **Add Deploy Key**
   - Paste SSH key. JANGAN centang "Allow write access" — untuk deploy cukup akses baca (read-only)
6. Setelah berhasil clone, edit file `.cpanel.yml` di root repo:
   - Ganti `USERNAME` dengan username cPanel kamu (lihat pojok kanan atas)
7. Push perubahan ke GitHub

### Update Rutin

1. Edit file lokal / GitHub
2. Push ke GitHub
3. Login ke cPanel → **Git Version Control**
4. Klik repo Websitetermaju
5. Klik **Pull or Deploy** → **"Update from Remote"** → **"Deploy HEAD Commit"**
6. Deploy selesai!

## Struktur File

```
/
├── index.html          (halaman utama)
├── css/                (stylesheet)
├── js/                 (JavaScript, termasuk main.js)
├── assets/             (gambar, icon, dll)
└── .cpanel.yml         (konfigurasi deploy cPanel)
```

Pertanyaan? Hubungi developer.
