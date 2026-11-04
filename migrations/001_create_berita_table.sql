-- ============================================================================
-- Migration: 001_create_berita_table.sql
-- Deskripsi: Pembuatan skema mandiri untuk Modul Berita & Master Kategori
--            Pemerintah Kota Sukabumi.
-- Catatan  : Skrip ini murni DDL untuk tabel baru dan TIDAK mengubah atau
--            menghapus tabel warisan WordPress (wp_*).
-- ============================================================================

-- 1. Tabel Master Kategori (public.categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Tipe ENUM Status Berita ("NewsStatus")
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NewsStatus') THEN
        CREATE TYPE "NewsStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'PUBLISHED');
    END IF;
END
$$;

-- 3. Tabel Mandiri Berita (public.berita)
CREATE TABLE IF NOT EXISTS public.berita (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    image_url TEXT,
    caption VARCHAR(255),
    source_credit VARCHAR(255),
    category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
    author_name VARCHAR(150) NOT NULL DEFAULT 'Diskominfo Kota Sukabumi',
    status "NewsStatus" NOT NULL DEFAULT 'DRAFT',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. Indeks untuk Efisiensi Kueri Daftar Berita Publik
CREATE INDEX IF NOT EXISTS idx_berita_status_published_at
    ON public.berita (status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_berita_category_id
    ON public.berita (category_id);

