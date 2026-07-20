# Website Builder V1 — WebsiteTermaju

Status: **V1 live**  
Tanggal rilis: **20 Juli 2026**  
URL: **https://webtermajuumkm.com/buat-web-ai/**  
Repo: **https://github.com/websitetermaju/Websitetermaju**  
Branch produksi: **`main`**  
Commit V1: **`dc66585`**

## 1. Fungsi

Website Builder V1 membantu pemilik UMKM membuat landing page sederhana tanpa coding.

Alur pengguna:

1. Pilih bidang bisnis.
2. Masukkan nama bisnis dan nomor WhatsApp.
3. Tulis deskripsi usaha.
4. Isi **Template Cepat** atau aktifkan Gemini secara opsional.
5. Edit tagline, deskripsi, keunggulan, produk, dan harga.
6. Pilih tema warna.
7. Periksa preview desktop atau mobile.
8. Unduh file HTML.
9. Hubungi WebsiteTermaju bila membutuhkan domain, hosting, atau penyesuaian.

## 2. Posisi Produk

Mode utama disebut **Template Cepat**, bukan AI.

- Template Cepat memakai data dan template lokal berdasarkan bidang bisnis.
- Mode Gemini bersifat opsional.
- Pengguna harus memasukkan API key Gemini sendiri.
- API key dikirim langsung dari browser pengguna ke Google Gemini.
- WebsiteTermaju tidak menyimpan API key tersebut.
- Pengguna disarankan memakai restricted key khusus aplikasi.

## 3. Fitur V1

- Enam kategori usaha:
  - Kuliner
  - Jasa
  - Toko Online
  - Kecantikan
  - Kesehatan
  - Pendidikan
- Template konten berdasarkan kategori.
- Mode Gemini opsional.
- Form edit konten.
- Lima pilihan tema warna.
- Preview desktop dan mobile.
- Preview langsung saat data berubah.
- Tombol WhatsApp dengan nomor milik pengguna.
- Unduh landing page dalam file HTML.
- Penawaran bantuan domain dan hosting melalui WhatsApp.
- Headline responsif dengan perlindungan kata panjang.

## 4. Aturan Keamanan dan Kejujuran

- Tidak membuat testimoni fiktif.
- Tidak mengklaim mode template sebagai AI.
- Tidak menyimpan API key Gemini.
- Tidak menampilkan API key sebagai teks biasa.
- Maksimal dua CTA WhatsApp dalam landing page hasil generator.
- Tidak memakai diskon, rating, jaminan, atau klaim hasil yang tidak didukung.
- Footer hasil generator memakai label netral: **Dibuat menggunakan WebsiteTermaju**.

## 5. Identitas Visual

Builder mengikuti website utama WebsiteTermaju:

- Latar krem `#FBF9F5`.
- Panel putih.
- Warna utama hijau `#0E7C66`.
- Font Plus Jakarta Sans.
- Border tipis berwarna netral.
- Radius sedang dan konsisten.
- Tombol utama berwarna hijau solid.
- Ikon memakai SVG konsisten.
- Tidak memakai emoji dekoratif, sparkle, gradient berlebihan, atau efek chromatic pada headline.

Layout builder tetap memakai workspace dua panel:

- Panel kiri: form dan pengaturan.
- Panel kanan: preview landing page.

## 6. Arsitektur Teknis

- Framework: Astro `7.x`.
- Styling: Tailwind CSS `4.x` untuk website utama.
- Output: static site.
- Source builder: `src/pages/buat-web-ai/index.astro`.
- Test kualitas: `tests/builder-quality.test.js`.
- Output build: `dist/buat-web-ai/index.html`.
- Hosting: Domainesia Git Deploy.
- Domain produksi: `webtermajuumkm.com`.
- Deployment ID Domainesia: `6c9f83cf`.

Generated HTML saat ini memuat Tailwind CDN dan Google Fonts. Karena itu, file hasil unduhan membutuhkan koneksi internet agar tampilan lengkap termuat.

## 7. Perintah Pengembangan

Persyaratan:

- Node.js `>=22.12.0`

Instal dependensi:

```bash
npm install
```

Jalankan pengembangan:

```bash
npm run dev
```

Jalankan test builder:

```bash
node --test tests/builder-quality.test.js
```

Build produksi:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

Pemeriksaan Git:

```bash
git diff --check
```

## 8. Pemeriksaan Wajib Sebelum Deploy

Semua ini harus lulus:

1. `node --test tests/builder-quality.test.js`
2. `npm run build`
3. `git diff --check`
4. Preview desktop tampil normal.
5. Preview mobile tampil normal.
6. Template Cepat mengisi konten.
7. Gemini tetap opsional dan disclaimer terlihat.
8. Nomor WhatsApp pada hasil sesuai input pengguna.
9. File HTML dapat diunduh.
10. Tidak ada testimoni palsu atau klaim AI pada mode default.
11. Homepage utama tidak berubah tanpa sengaja.

Baseline V1:

- **36/36 test lulus**.
- **8 halaman Astro berhasil dibangun**.
- Error log hosting kosong setelah deploy.

## 9. Proses Deploy

GitHub menjadi sumber utama.

1. Edit source.
2. Jalankan test.
3. Jalankan build.
4. Verifikasi `dist/`.
5. Commit source, test, dan output build.
6. Push ke branch `main`.
7. Trigger Domainesia Git Deploy ID `6c9f83cf`.
8. Pastikan log deploy menunjuk commit yang benar.
9. Buka URL publik.
10. Periksa console browser dan error log hosting.

Catatan: Domainesia Git Deploy hanya menjalankan `git fetch` dan `git reset --hard`. Build harus sudah dibuat dan dikomit sebelum deploy.

## 10. Batasan V1

- Bukan platform hosting otomatis.
- Belum menerbitkan website pengguna langsung ke domain mereka.
- Belum memiliki akun pengguna atau penyimpanan proyek.
- Belum memiliki backend AI milik WebsiteTermaju.
- Gemini memakai API key milik pengguna melalui browser.
- HTML hasil unduhan masih bergantung pada Tailwind CDN dan Google Fonts.
- Data form tidak disimpan setelah halaman ditutup.
- Template masih terbatas pada enam kategori.
- Harga contoh perlu diperiksa dan diedit pengguna sebelum diterbitkan.

## 11. Kandidat V2

Prioritas berdasarkan nilai pengguna:

1. Simpan dan buka kembali proyek.
2. Tambah variasi template per kategori.
3. Upload logo dan gambar usaha.
4. Inline CSS agar hasil HTML dapat bekerja tanpa CDN.
5. Validasi nomor WhatsApp dan harga.
6. Backend AI server-side tanpa meminta API key pengguna.
7. Publish otomatis ke subdomain preview.
8. Paket domain dan hosting terintegrasi.
9. Riwayat revisi dan duplikasi proyek.
10. Analitik penggunaan builder tanpa menyimpan data sensitif.

## 12. Riwayat Rilis V1

- `59beb15` — membersihkan klaim, konten demo, dan elemen berisiko pada website utama.
- `ee290e1` — membuat builder jujur, profesional, aman, serta menambah test kualitas.
- `dc66585` — menyelaraskan warna, layout, dan desain builder dengan website utama.

## 13. Rollback

Jika versi setelah V1 bermasalah:

```bash
git revert <commit-bermasalah>
git push origin main
```

Lalu trigger ulang Domainesia Git Deploy dan verifikasi URL publik.

Jangan memakai `git reset --hard` pada branch produksi bersama tanpa audit dan persetujuan karena dapat menghapus riwayat perubahan.
