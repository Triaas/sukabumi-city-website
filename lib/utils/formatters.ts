/**
 * Helper normalisasi URL gambar (menghapus domain lama portal.sukabumikota.go.id
 * agar menggunakan path relatif yang seragam).
 */
export function normalizeImageUrl(rawUrl: string | null | undefined): string | undefined {
  if (!rawUrl) return undefined;
  return rawUrl
    .replace('https://portal.sukabumikota.go.id', '')
    .replace('http://portal.sukabumikota.go.id', '');
}

/**
 * Helper format tanggal ke Bahasa Indonesia (contoh: "24 Oktober 2026").
 */
export function formatIndoDate(dateInput: Date | string): string {
  return new Date(dateInput).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Helper pembersihan daftar kategori (membuang kategori generik 'berita kota').
 */
export function extractCategoryList(rawCategory: string | null | undefined): string[] {
  if (!rawCategory) return [];
  return rawCategory
    .split(',')
    .map((c: string) => c.trim())
    .filter((c: string) => c.toLowerCase() !== 'berita kota' && c.length > 0);
}

