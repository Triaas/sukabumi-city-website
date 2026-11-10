import pool from '@/lib/db';

const MAX_SLUG_ITERATIONS = 50;

/**
 * Mengubah judul berita menjadi format slug URL-friendly dengan normalisasi Unicode (NFKD).
 */
export function slugifyTitle(title: string): string {
  const base = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return base || `berita-${Date.now()}`;
}

/**
 * Memastikan slug unik dan tidak bertabrakan dengan data di `public.berita` maupun `wp_posts`.
 * Dibatasi maksimal 50 iterasi untuk mencegah infinite loop.
 */
export async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugifyTitle(title);
  let candidate = baseSlug;

  for (let iteration = 1; iteration <= MAX_SLUG_ITERATIONS; iteration += 1) {
    let existsInBerita = false;
    let existsInWp = false;

    try {
      const beritaCheck = await pool.query(
        'SELECT 1 FROM public.berita WHERE slug = $1 LIMIT 1',
        [candidate]
      );
      existsInBerita = (beritaCheck.rowCount ?? 0) > 0;
    } catch (err: any) {
      if (err?.code !== '42P01') {
        throw err;
      }
    }

    try {
      const wpCheck = await pool.query(
        'SELECT 1 FROM wp_posts WHERE post_name = $1 LIMIT 1',
        [candidate]
      );
      existsInWp = (wpCheck.rowCount ?? 0) > 0;
    } catch (err: any) {
      if (err?.code !== '42P01') {
        console.warn('Warning checking slug in wp_posts:', err?.message);
      }
    }

    if (!existsInBerita && !existsInWp) {
      return candidate;
    }

    candidate = `${baseSlug}-${iteration + 1}`;
  }

  return `${baseSlug}-${Date.now()}`;
}

