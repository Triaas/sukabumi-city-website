-- ============================================================================
-- Migration: 002_add_berita_visibility_flags.sql
-- Deskripsi: Menambahkan kolom penanda visibilitas draf (`was_published` &
--            `author_role`) pada tabel `public.berita` untuk memisahkan ruang
--            kerja draf privat Reporter dari meja redaksi Admin.
-- ============================================================================

ALTER TABLE public.berita
    ADD COLUMN IF NOT EXISTS was_published BOOLEAN DEFAULT FALSE;

ALTER TABLE public.berita
    ADD COLUMN IF NOT EXISTS author_role VARCHAR(50) DEFAULT 'REPORTER';

-- Sinkronisasi data lama yang sudah berstatus PUBLISHED
UPDATE public.berita
SET was_published = TRUE
WHERE status = 'PUBLISHED';

