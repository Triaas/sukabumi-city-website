# Spesifikasi Fitur Admin Dashboard
**Proyek:** Portal Pemerintah Kota Sukabumi[cite: 7]  
**Tech Stack:** Next.js (App Router), Tailwind CSS, PostgreSQL, TypeScript[cite: 7]

---

## 1. Arsitektur URL & Menu Navigasi
Dashboard Admin dirancang menggunakan layout khusus `(admin)` yang terpisah secara total dari layout halaman utama (publik) `(public)`. Menu navigasi berada di sidebar kiri dengan struktur rute sebagai berikut:

* `/admin` ➔ Halaman utama Dashboard (Menampilkan metrik makro terintegrasi Google Analytics 4: Total Kunjungan, Tayang Bulan Ini, dan Kategori/Berita Terpopuler).
* `/admin/berita` ➔ Halaman tabel manajemen publikasi berita.
* `/admin/pengumuman` ➔ Halaman tabel manajemen pengumuman resmi.
* `/admin/transparansi` ➔ Halaman tabel dokumen transparansi keuangan & form upload PDF.
* `/admin/banner` ➔ Halaman tabel manajemen Banner Beranda (pengganti Event Slider).
* `/admin/pengaturan` ➔ Halaman pengaturan sistem dan profil admin.

---

## 2. Matriks CRUD & API Endpoints
Seluruh interaksi data antara halaman klien (React) dan PostgreSQL ditangani melalui Next.js API Routes untuk menjaga keamanan dan mempermudah penanganan *file upload* (`FormData`).[cite: 7]

| Menu Admin | Fitur CRUD | API Endpoint | HTTP Method | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| **Dashboard (Analytics)** | Tampil Metrik | `/api/analytics` | `GET` | Menarik data dari Google Analytics Data API (GA4) |
| **Banner Beranda** | Tampil Semua | `/api/banner` | `GET` | Mengambil data dari tabel `banners` |
| | Tambah Baru | `/api/banner` | `POST` | Upload gambar banner, insert data baru |
| | Edit Data | `/api/banner` | `PUT` | Update data teks atau gambar by ID |
| | Hapus Data | `/api/banner?id={id}` | `DELETE` | Menghapus baris data berdasarkan ID |
| **Transparansi Dokumen** | Tampil Semua | `/api/transparansi` | `GET` | Mengambil data dari tabel `transparansi_dokumen`[cite: 7] |
| | Tambah Baru | `/api/transparansi` | `POST` | Upload file PDF, insert data baru[cite: 7] |
| | Edit Data | `/api/transparansi` | `PUT` | Update teks metadata dokumen by ID[cite: 7] |
| | Hapus Data | `/api/transparansi?id={id}`| `DELETE` | Menghapus data dan file PDF by ID[cite: 7] |
| **Kelola Berita** | Tampil Semua | `/api/berita` | `GET` | Mengambil data dari tabel berita |
| | Tambah Baru | `/api/berita` | `POST` | Insert artikel baru |
| | Edit Data | `/api/berita` | `PUT` | Update artikel berita |
| | Hapus Data | `/api/berita?id={id}` | `DELETE` | Menghapus artikel by ID (Kolom tabel di UI menggunakan Aksi: Edit/Hapus, tanpa kolom Sumber/Caption) |
| **Pengumuman Resmi** | Tampil Semua | `/api/pengumuman` | `GET` | Mengambil data dari tabel pengumuman |
| | Tambah Baru | `/api/pengumuman` | `POST` | Insert pengumuman baru |
| | Edit Data | `/api/pengumuman` | `PUT` | Update pengumuman |
| | Hapus Data | `/api/pengumuman?id={id}` | `DELETE` | Menghapus pengumuman by ID |

---

## 3. Spesifikasi Form Input (Struktur Data)
Berikut adalah daftar *field* (kolom input) yang akan disajikan kepada pengguna (Admin) pada masing-masing modal/halaman form:[cite: 7]

### A. Form Banner Beranda (Sebelumnnya Event Slider)
* **Judul / Deskripsi** `(title)`: Text Input — *Wajib diisi*[cite: 7]
* **Gambar Banner** `(image_url)`: File Upload (Image, Maksimal 2MB) — *Wajib saat tambah data*[cite: 7]
* **Tautan Tujuan** `(target_url)`: URL Input — *Opsional* (URL jika gambar diklik)[cite: 7]
* **Urutan Tampil** `(sort_order)`: Number Input — *Default: 0*[cite: 7]
* **Status Aktif** `(is_active)`: Boolean / Switch Toggle — *Default: Aktif (True)*[cite: 7]

### B. Form Transparansi Dokumen
* **Judul Dokumen** `(title)`: Text Input — *Wajib diisi*[cite: 7]
* **Kategori / Tipe** `(category)`: Dropdown Select — *Wajib diisi* (Misal: Laporan Keuangan, SK Wali Kota)[cite: 7]
* **Tanggal Pemberlakuan** `(effective_date)`: Date Picker — *Wajib diisi*[cite: 7]
* **Deskripsi Singkat** `(description)`: Text Area — *Opsional*[cite: 7]
* **File Dokumen** `(pdf_url)`: File Upload (PDF, Maksimal 10MB) — *Wajib saat tambah data*[cite: 7]

### C. Form Kelola Berita
*(Catatan: Field 'Sumber' dan 'Caption' dihilangkan untuk efisiensi fokus visual)*
* **Judul Berita** `(title)`: Text Input — *Wajib diisi*
* **Isi Konten** `(content)`: Rich Text Editor / Text Area — *Wajib diisi*
* **Kategori Berita** `(category_id)`: Dropdown Select — *Wajib diisi*
* **Gambar Thumbnail** `(thumbnail_url)`: File Upload (Image) — *Opsional*

### D. Form Pengumuman Resmi
* **Judul Pengumuman** `(title)`: Text Input — *Wajib diisi*
* **Isi Pengumuman** `(content)`: Rich Text Editor / Text Area — *Wajib diisi*
* **Dokumen Lampiran** `(attachment_url)`: File Upload (PDF/Image) — *Opsional*