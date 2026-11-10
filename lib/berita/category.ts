import pool from '@/lib/db';
import { toCategorySlug } from '@/lib/constants/categories';

/**
 * Menyelesaikan `category_id` (integer FK ke `public.categories`).
 * Mendukung input berupa ID numerik maupun nama kategori (otomatis sinkron ke `public.categories`).
 */
export async function resolveCategoryId(
  rawCategory: string | null | undefined
): Promise<number | null> {
  if (!rawCategory || !rawCategory.trim()) {
    return null;
  }

  const trimmed = rawCategory.trim();

  // Jika input berupa angka ID kategori
  if (/^\d+$/.test(trimmed)) {
    const numericId = parseInt(trimmed, 10);
    const existingById = await pool.query(
      'SELECT id FROM public.categories WHERE id = $1 LIMIT 1',
      [numericId]
    );
    if ((existingById.rowCount ?? 0) > 0) {
      return numericId;
    }
  }

  // Jika input berupa nama kategori (contoh: 'Layanan Publik', 'Kesehatan')
  const slug = toCategorySlug(trimmed);
  const existingByName = await pool.query(
    'SELECT id FROM public.categories WHERE LOWER(name) = LOWER($1) OR slug = $2 LIMIT 1',
    [trimmed, slug]
  );

  if ((existingByName.rowCount ?? 0) > 0) {
    return existingByName.rows[0].id as number;
  }

  // Jika belum ada di tabel master `public.categories`, tambahkan secara otomatis
  const inserted = await pool.query(
    `INSERT INTO public.categories (name, slug)
     VALUES ($1, $2)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [trimmed, slug]
  );

  return (inserted.rows[0]?.id as number) ?? null;
}

