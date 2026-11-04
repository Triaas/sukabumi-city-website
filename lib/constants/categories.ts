/**
 * Single Source of Truth untuk 22 Kategori Resmi Portal Berita
 * Pemerintah Kota Sukabumi.
 */
export const OFFICIAL_CATEGORIES = [
  'Agama',
  'Artikel',
  'Bencana',
  'Diskominfo',
  'Ekonomi',
  'Hukum',
  'Infrastruktur',
  'Kesehatan',
  'Layanan Publik',
  'Legislatif',
  'Lingkungan',
  'Olahraga',
  'Pariwisata',
  'Pendidikan',
  'Pertanian',
  'Politik',
  'Seni Budaya',
  'Sosial',
  'Teknologi',
  'Transportasi',
  'Umum',
  'Walikota',
] as const;

export type OfficialCategory = (typeof OFFICIAL_CATEGORIES)[number];

/**
 * Daftar opsi filter kategori untuk dropdown publik & tabel admin
 * (menyertakan opsi "Semua kategori" di urutan pertama).
 */
export const CATEGORY_FILTER_OPTIONS = [
  'Semua kategori',
  ...OFFICIAL_CATEGORIES,
] as const;

/**
 * Helper untuk membuat slug URL-friendly dari nama kategori.
 */
export function toCategorySlug(categoryName: string): string {
  return categoryName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

