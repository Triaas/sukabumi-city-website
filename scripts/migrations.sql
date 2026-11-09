-- =============================================================================
-- Dokumentasi Migrasi & Optimasi Indeks Tabel public.berita
-- =============================================================================

-- 1. Penambahan Kolom Visibilitas & Peran Penulis
ALTER TABLE public.berita
  ADD COLUMN IF NOT EXISTS was_published BOOLEAN DEFAULT FALSE;

ALTER TABLE public.berita
  ADD COLUMN IF NOT EXISTS author_role VARCHAR(50) DEFAULT 'REPORTER';

-- Sinkronisasi nilai awal was_published untuk berita yang sudah tayang
UPDATE public.berita
SET was_published = TRUE
WHERE status = 'PUBLISHED'
  AND (was_published IS NULL OR was_published = FALSE);

-- 2. Indeks Komposit untuk Optimasi Kueri Rute Publik (getAllNews, getNewsBySlug, getRelatedNews)
CREATE INDEX IF NOT EXISTS idx_berita_public
  ON public.berita (status, published_at DESC);

