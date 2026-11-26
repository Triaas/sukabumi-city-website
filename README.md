# Portal Resmi Pemerintah Kota Sukabumi

Aplikasi web portal informasi publik, berita daerah, pengumuman, transparansi dokumen, dan manajemen konten Pemerintah Kota Sukabumi berbasis Next.js (App Router) dan PostgreSQL.

## Menjalankan Proyek Secara Lokal

Pastikan variabel koneksi PostgreSQL telah dikonfigurasi pada berkas `.env.local` (lihat `.env.example` sebagai acuan), lalu jalankan server pengembangan:

```bash
pnpm install
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000) di peramban untuk mengakses halaman publik, atau `/login` untuk masuk ke portal pengelola.

## Panduan Operasional Akun & Keamanan

### 1. Inisialisasi Akun Awal (`seed-users`)

Untuk menyiapkan tabel autentikasi (`users`, `sessions`, `password_histories`), menjalankan *backfill* kepemilikan berita legacy secara idempoten, serta membuat akun awal (`SUPER_ADMIN`, `ADMIN_BERITA`, dan `REPORTER`), jalankan perintah berikut:

```bash
pnpm run seed:users
```

Apabila di lingkungan pengembangan lokal Anda perlu mengatur ulang kata sandi akun *seed* ke nilai bawaan skrip, tambahkan argumen `--reset`:

```bash
pnpm run seed:users -- --reset
```

> **Peringatan Keamanan Produksi:** Segera ganti seluruh kata sandi bawaan (*default*) pada semua akun awal begitu aplikasi dijalankan di server produksi melalui menu **Pengaturan Profil** atau **Manajemen User**, serta jangan pernah menjalankan opsi `--reset` di lingkungan produksi.

### 2. Pemulihan Darurat Super Admin (CLI)

Apabila seluruh akun `SUPER_ADMIN` terkunci, dinonaktifkan, atau lupa kata sandi, administrator server dapat memulihkan akses langsung melalui terminal server menggunakan perintah:

```bash
pnpm run reset:superadmin -- <email> <sandi_sementara_baru>
```

Contoh:

```bash
pnpm run reset:superadmin -- superadmin@sukabumikota.go.id SandiDarurat2026!
```

Catatan perilaku pemulihan darurat:
- Hanya berlaku untuk akun dengan peran `SUPER_ADMIN`.
- Kata sandi sementara baru wajib memenuhi kebijakan kekuatan sandi (minimal 8 karakter kombinasi huruf dan angka) dan belum pernah tercatat pada riwayat sandi akun tersebut.
- Akun otomatis diaktifkan kembali (`is_active = TRUE`), seluruh sesi aktifnya dicabut dari database, dan penanda `must_change_password = TRUE` diaktifkan sehingga saat login berikutnya pengguna otomatis diarahkan ke halaman `/ganti-sandi-wajib` sebelum dapat mengakses dashboard.

### 3. Ringkasan Kebijakan Keamanan Portal

- **Manajemen & Rotasi Sesi:** Sesi autentikasi disimpan sebagai *cookie* `httpOnly` (`sameSite: lax`, `secure` aktif di produksi) dengan masa berlaku 1 hari secara bawaan atau hingga 7 hari apabila opsi *Ingat Saya* dipilih, sementara database hanya menyimpan *hash* SHA-256 token sesi. Sesi kedaluwarsa dibersihkan otomatis saat sesi baru dibuat, dan setiap perubahan kata sandi mencabut seluruh sesi lama pengguna lalu menerbitkan token sesi baru untuk perangkat aktif.
- **Rotasi & Riwayat Kata Sandi:** Kata sandi wajib diperbarui secara berkala setiap **30 hari**, minimal terdiri dari 8 karakter kombinasi huruf dan angka, di-*hash* menggunakan `bcryptjs` (cost 12), dan dicegah agar tidak menggunakan kembali kata sandi yang pernah dipakai sebelumnya (`password_histories`).
- **Pembatasan Percobaan (*Rate Limiting*):** Endpoint autentikasi (`loginAction`, `forceChangePasswordAction`, dan `changeOwnPasswordAction`) dilindungi *sliding window rate limiter* berbasis kunci komposit `(IP + email/userId)` dengan batas maksimal **5 percobaan gagal per 15 menit** dan di-reset otomatis ketika autentikasi berhasil.
- **Kontrol Akses & Isolasi Kepemilikan:** Otorisasi diverifikasi di sisi server untuk peran `SUPER_ADMIN`, `ADMIN_BERITA`, dan `REPORTER`. Kepemilikan naskah `REPORTER` diverifikasi ketat menggunakan kunci numerik `author_id`, sedangkan arsip berita legacy tanpa `author_id` hanya dapat dikelola oleh `ADMIN_BERITA` atau `SUPER_ADMIN`.
- **Sanitasi Konten & Validasi Unggahan:** Konten HTML artikel disanitasi menggunakan daftar putih (*allowlist*) `sanitize-html` dan seluruh tautan eksternal/internal divalidasi skema URL-nya. Unggahan berkas gambar maupun dokumen diperiksa ukuran serta tanda tangan biner (*magic bytes*) di sisi server, dan akses langsung ke ekstensi non-media sensitif (`.log`, `.php`, `.json`, `.dat`, `.mmdb`, `.htaccess`, `.sql`, `.txt`) pada direktori arsip `/wp-content/uploads/` diblokir dengan status `404 Not Found`.
- **HTTP Security Headers & CSP:** Seluruh rute dilindungi oleh `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Strict-Transport-Security` (aktif di produksi), penonaktifan `X-Powered-By`, serta kebijakan `Content-Security-Policy` (CSP) yang membatasi sumber skrip, gaya, *font*, gambar, dokumen PDF (`object-src 'self'`), dan *iframe* hanya ke domain resmi yang diizinkan.
