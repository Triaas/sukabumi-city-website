-- ============================================================================
-- Migration: 003_create_profile_pages_table.sql
-- Deskripsi: Pembuatan tabel public.profile_pages untuk CMS 7 halaman detail
--            Profil Kota (sejarah, visi-misi, lambang, geografi,
--            sosial-ekonomi, dalam-angka, uks).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profile_pages (
    slug VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    hero_image TEXT NOT NULL DEFAULT '',
    hero_image_fit VARCHAR(20) NOT NULL DEFAULT 'cover',
    content_image TEXT,
    content_image_title VARCHAR(255),
    content_image_caption TEXT,
    content_html TEXT NOT NULL DEFAULT '',
    extra_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
