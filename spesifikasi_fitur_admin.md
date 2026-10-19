# Spesifikasi Fitur Admin Dashboard
**Proyek:** Portal Pemerintah Kota Sukabumi  
**Tech Stack:** Next.js (App Router), Tailwind CSS, PostgreSQL, TypeScript

---

## 1. Arsitektur URL & Menu Navigasi
Dashboard Admin dirancang menggunakan layout khusus yang terpisah dari halaman utama (publik). Menu navigasi berada di sidebar kiri dengan struktur rute sebagai berikut:

* `/admin` ➔ Halaman utama (Dashboard statistik ringkas / *Welcome page*).
* `/admin/event-slider` ➔ Halaman tabel manajemen Event Slider & form tambah/edit.
* `/admin/transparansi-dokumen` ➔ Halaman tabel dokumen transparansi & form upload PDF.
* `/admin/berita-pengumuman` ➔ Halaman tabel manajemen berita & pengumuman.

---

## 2. Matriks CRUD & API Endpoints
Seluruh interaksi data antara halaman klien (React) dan PostgreSQL ditangani melalui Next.js API Routes untuk menjaga keamanan dan mempermudah penanganan *file upload* (`FormData`).

| Menu Admin | Fitur CRUD | API Endpoint | HTTP Method | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| **Event Slider** | Tampil Semua | `/api/event-banners` | `GET` | Mengambil data dari tabel `event_banners` |
| | Tambah Baru | `/api/event-banners` | `POST` | Upload gambar slider, insert data baru |
| | Edit Data | `/api/event-banners` | `PUT` | Update data teks atau gambar by ID |
| | Hapus Data | `/api/event-banners?id={id}` | `DELETE` | Menghapus baris data berdasarkan ID |
| **Transparansi Dokumen** | Tampil Semua | `/api/transparansi-dokumen` | `GET` | Mengambil data dari tabel `transparansi_dokumen` |
| | Tambah Baru | `/api/transparansi-dokumen` | `POST` | Upload file PDF, insert data baru |
| | Edit Data | `/api/transparansi-dokumen` | `PUT` | Update teks metadata dokumen by ID |
| | Hapus Data | `/api/transparansi-dokumen?id={id}`| `DELETE` | Menghapus data dan file PDF by ID |
| **Berita & Pengumuman** | Tampil Semua | `/api/berita` | `GET` | Mengambil data dari relasi `wp_posts` |
| | Tambah Baru | `/api/berita` | `POST` | Insert artikel baru ke `wp_posts` dan relasinya |
| | Hapus Data | `/api/berita?id={id}` | `DELETE` | Menghapus artikel by ID |

---

## 3. Spesifikasi Form Input (Struktur Data)
Berikut adalah daftar *field* (kolom input) yang akan disajikan kepada pengguna (Admin) pada masing-masing modal/halaman form:

### A. Form Event Slider
* **Judul / Deskripsi** `(title)`: Text Input — *Wajib diisi*
* **Gambar Banner** `(image_url)`: File Upload (Image, Maksimal 2MB) — *Wajib saat tambah data*
* **Tautan Tujuan** `(target_url)`: URL Input — *Opsional* (URL jika gambar diklik)
* **Urutan Tampil** `(sort_order)`: Number Input — *Default: 0*
* **Status Aktif** `(is_active)`: Boolean / Switch Toggle — *Default: Aktif (True)*

### B. Form Transparansi Dokumen
* **Judul Dokumen** `(title)`: Text Input — *Wajib diisi*
* **Kategori / Tipe** `(category)`: Dropdown Select — *Wajib diisi* (Misal: Laporan Keuangan, SK Wali Kota)
* **Tanggal Pemberlakuan** `(effective_date)`: Date Picker — *Wajib diisi*
* **Deskripsi Singkat** `(description)`: Text Area — *Opsional*
* **File Dokumen** `(pdf_url)`: File Upload (PDF, Maksimal 10MB) — *Wajib saat tambah data*

### C. Form Berita & Pengumuman
* **Tipe Postingan** `(post_type)`: Radio Button (Berita / Pengumuman) — *Wajib diisi*
* **Judul Postingan** `(post_title)`: Text Input — *Wajib diisi*
* **Isi Konten** `(post_content)`: Rich Text Editor / Text Area — *Wajib diisi*
* **Kategori Berita** `(term_id)`: Dropdown Select (diambil dari `wp_terms`) — *Wajib jika Berita*
* **Gambar Thumbnail** `(thumbnail)`: File Upload (Image) — *Opsional*