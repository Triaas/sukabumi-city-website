import pool from '@/lib/db/pool';
import { OFFICIAL_CATEGORIES, toCategorySlug } from '@/lib/constants/categories';
import type { UserRole } from '@/lib/types/berita';

export interface CategoryWithCount {
  id: number;
  name: string;
  total_count: number;
  published_count: number;
  draft_count: number;
  raw_total_count: number;
}

export interface CategoryMutationResult {
  success: boolean;
  error?: string;
  movedCount?: number;
  category?: {
    id: number;
    name: string;
  };
}

export interface CategoryLinkedNewsItem {
  id: number;
  uuid: string | null;
  title: string;
  status: string;
  author_name: string;
  author_role: string | null;
  is_reporter_private_draft: boolean;
  other_categories: string[];
}

let beritaCategoriesEnsuredPromise: Promise<void> | null = null;

/**
 * Memastikan tabel relasi banyak-ke-banyak `public.berita_categories` tersedia
 * dan melakukan backfill sekali per proses server dari `public.berita.category_id`.
 */
export async function ensureBeritaCategoriesTable(): Promise<void> {
  if (!beritaCategoriesEnsuredPromise) {
    beritaCategoriesEnsuredPromise = (async () => {
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS public.berita_categories (
            berita_id INT NOT NULL REFERENCES public.berita(id) ON DELETE CASCADE,
            category_id INT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
            position INT NOT NULL DEFAULT 0,
            PRIMARY KEY (berita_id, category_id)
          );
        `);

        await pool.query(`
          INSERT INTO public.berita_categories (berita_id, category_id, position)
          SELECT id, category_id, 0
          FROM public.berita
          WHERE category_id IS NOT NULL
          ON CONFLICT (berita_id, category_id) DO NOTHING;
        `);
      } catch (err: unknown) {
        beritaCategoriesEnsuredPromise = null;
        console.warn('Warning ensuring public.berita_categories:', err);
      }
    })();
  }

  await beritaCategoriesEnsuredPromise;
}

/**
 * Menyinkronkan daftar `category_id` milik suatu berita ke tabel `public.berita_categories`.
 */
export async function syncBeritaCategories(
  beritaId: number,
  categoryIds: number[]
): Promise<void> {
  if (!Number.isFinite(beritaId) || beritaId <= 0) return;

  await ensureBeritaCategoriesTable();

  const uniqueIds = [
    ...new Set(categoryIds.filter((id) => Number.isFinite(id) && id > 0)),
  ];

  await pool.query(
    'DELETE FROM public.berita_categories WHERE berita_id = $1',
    [beritaId]
  );

  for (let i = 0; i < uniqueIds.length; i += 1) {
    await pool.query(
      `INSERT INTO public.berita_categories (berita_id, category_id, position)
       VALUES ($1, $2, $3)
       ON CONFLICT (berita_id, category_id) DO UPDATE SET position = EXCLUDED.position`,
      [beritaId, uniqueIds[i], i]
    );
  }
}

/**
 * Mengambil seluruh nama kategori dari `public.categories`, digabung dengan
 * `OFFICIAL_CATEGORIES` (deduplikasi case-insensitive, urut alfabet).
 * Mengembalikan `OFFICIAL_CATEGORIES` jika tabel tidak dapat diakses.
 */
export async function getAvailableCategories(): Promise<string[]> {
  const fallback = [...OFFICIAL_CATEGORIES] as string[];

  try {
    const result = await pool.query<{ name: string | null }>(
      'SELECT name FROM public.categories ORDER BY name ASC'
    );

    const seen = new Map<string, string>();
    for (const name of [...fallback, ...result.rows.map((row) => row.name ?? '')]) {
      const trimmed = name.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, trimmed);
      }
    }

    return [...seen.values()].sort((a, b) => a.localeCompare(b, 'id'));
  } catch (error: unknown) {
    console.error('Error in getAvailableCategories:', error);
    return fallback;
  }
}

/**
 * Mengambil seluruh kategori beserta jumlah berita per status.
 * - `total_count`: berita aktif di mata Admin (draf pribadi Reporter tidak dihitung).
 * - `published_count`: berita berstatus PUBLISHED.
 * - `draft_count`: berita non-PUBLISHED yang terlihat Admin (Draf Admin / Perlu Peninjauan).
 * - `raw_total_count`: seluruh berita yang terikat kategori, termasuk draf pribadi Reporter
 *   (dipakai untuk mengunci penghapusan).
 * Relasi dihitung dari `berita.category_id` dan `berita_categories` (multi-kategori).
 */
export async function getCategoriesWithCount(): Promise<CategoryWithCount[]> {
  try {
    await ensureBeritaCategoriesTable();

    const result = await pool.query<{
      id: number;
      name: string;
      total_count: number;
      published_count: number;
      draft_count: number;
      raw_total_count: number;
    }>(
      `WITH category_links AS (
         SELECT berita_id, category_id FROM public.berita_categories
         UNION
         SELECT id AS berita_id, category_id FROM public.berita WHERE category_id IS NOT NULL
       )
       SELECT
         c.id,
         c.name,
         COUNT(b.id) FILTER (
           WHERE NOT (b.status = 'DRAFT' AND b.author_role = 'REPORTER')
         )::int AS total_count,
         COUNT(b.id) FILTER (WHERE b.status = 'PUBLISHED')::int AS published_count,
         COUNT(b.id) FILTER (
           WHERE b.status != 'PUBLISHED'
             AND NOT (b.status = 'DRAFT' AND b.author_role = 'REPORTER')
         )::int AS draft_count,
         COUNT(b.id)::int AS raw_total_count
       FROM public.categories c
       LEFT JOIN category_links cl ON cl.category_id = c.id
       LEFT JOIN public.berita b ON b.id = cl.berita_id
       GROUP BY c.id, c.name
       ORDER BY c.name ASC`
    );

    return result.rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      total_count: Number(row.total_count) || 0,
      published_count: Number(row.published_count) || 0,
      draft_count: Number(row.draft_count) || 0,
      raw_total_count: Number(row.raw_total_count) || 0,
    }));
  } catch (error: unknown) {
    console.error('Error in getCategoriesWithCount:', error);
    return [];
  }
}

/**
 * Menambahkan kategori baru ke `public.categories` (maksimal 30 karakter, bebas duplikat case-insensitive).
 */
export async function createCategory(
  name: string
): Promise<CategoryMutationResult> {
  try {
    const trimmed = (name || '').trim().replace(/\s+/g, ' ');
    if (!trimmed) {
      return {
        success: false,
        error: 'Nama kategori wajib diisi.',
      };
    }

    if (trimmed.length > 30) {
      return {
        success: false,
        error: 'Nama kategori tidak boleh melebihi 30 karakter.',
      };
    }

    const slug = toCategorySlug(trimmed);
    if (!slug) {
      return {
        success: false,
        error: 'Nama kategori harus mengandung huruf atau angka yang valid.',
      };
    }

    const existing = await pool.query<{ id: number; name: string }>(
      `SELECT id, name FROM public.categories
       WHERE LOWER(name) = LOWER($1) OR slug = $2
       LIMIT 1`,
      [trimmed, slug]
    );

    if ((existing.rowCount ?? 0) > 0) {
      return {
        success: false,
        error: `Kategori "${existing.rows[0].name}" sudah terdaftar.`,
      };
    }

    const inserted = await pool.query<{ id: number; name: string }>(
      `INSERT INTO public.categories (name, slug)
       VALUES ($1, $2)
       RETURNING id, name`,
      [trimmed, slug]
    );

    return {
      success: true,
      category: {
        id: Number(inserted.rows[0].id),
        name: inserted.rows[0].name,
      },
    };
  } catch (error: unknown) {
    console.error('Error in createCategory:', error);
    return {
      success: false,
      error: 'Gagal menambahkan kategori baru ke database.',
    };
  }
}

/**
 * Memperbarui nama kategori di `public.categories` (maksimal 30 karakter, bebas konflik dengan kategori lain).
 */
export async function updateCategory(
  id: number,
  newName: string
): Promise<CategoryMutationResult> {
  try {
    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return {
        success: false,
        error: 'ID kategori tidak valid.',
      };
    }

    const trimmed = (newName || '').trim().replace(/\s+/g, ' ');
    if (!trimmed) {
      return {
        success: false,
        error: 'Nama kategori wajib diisi.',
      };
    }

    if (trimmed.length > 30) {
      return {
        success: false,
        error: 'Nama kategori tidak boleh melebihi 30 karakter.',
      };
    }

    const slug = toCategorySlug(trimmed);
    if (!slug) {
      return {
        success: false,
        error: 'Nama kategori harus mengandung huruf atau angka yang valid.',
      };
    }

    const currentCheck = await pool.query(
      'SELECT id FROM public.categories WHERE id = $1 LIMIT 1',
      [numericId]
    );

    if ((currentCheck.rowCount ?? 0) === 0) {
      return {
        success: false,
        error: 'Data kategori tidak ditemukan.',
      };
    }

    const duplicate = await pool.query<{ id: number; name: string }>(
      `SELECT id, name FROM public.categories
       WHERE id <> $1 AND (LOWER(name) = LOWER($2) OR slug = $3)
       LIMIT 1`,
      [numericId, trimmed, slug]
    );

    if ((duplicate.rowCount ?? 0) > 0) {
      return {
        success: false,
        error: `Nama kategori "${duplicate.rows[0].name}" sudah digunakan oleh kategori lain.`,
      };
    }

    const updated = await pool.query<{ id: number; name: string }>(
      `UPDATE public.categories
       SET name = $2, slug = $3
       WHERE id = $1
       RETURNING id, name`,
      [numericId, trimmed, slug]
    );

    return {
      success: true,
      category: {
        id: Number(updated.rows[0].id),
        name: updated.rows[0].name,
      },
    };
  } catch (error: unknown) {
    console.error('Error in updateCategory:', error);
    return {
      success: false,
      error: 'Gagal memperbarui nama kategori di database.',
    };
  }
}

/**
 * Menghapus kategori dari `public.categories` jika `news_count === 0`.
 * Menolak penghapusan apabila masih ada berita yang terhubung ke kategori tersebut.
 */
export async function deleteCategory(
  id: number
): Promise<CategoryMutationResult> {
  try {
    await ensureBeritaCategoriesTable();

    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return {
        success: false,
        error: 'ID kategori tidak valid.',
      };
    }

    const check = await pool.query<{
      id: number;
      name: string;
      raw_total_count: number;
    }>(
      `SELECT
         c.id,
         c.name,
         (
           SELECT COUNT(*)::int FROM (
             SELECT berita_id FROM public.berita_categories WHERE category_id = c.id
             UNION
             SELECT id FROM public.berita WHERE category_id = c.id
           ) linked
         ) AS raw_total_count
       FROM public.categories c
       WHERE c.id = $1
       LIMIT 1`,
      [numericId]
    );

    if ((check.rowCount ?? 0) === 0) {
      return {
        success: false,
        error: 'Data kategori tidak ditemukan.',
      };
    }

    const { name, raw_total_count } = check.rows[0];
    const count = Number(raw_total_count) || 0;

    if (count > 0) {
      return {
        success: false,
        error: `Kategori "${name}" tidak dapat dihapus karena masih terikat pada ${count} berita atau draf.`,
      };
    }

    await pool.query('DELETE FROM public.categories WHERE id = $1', [numericId]);

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error('Error in deleteCategory:', error);
    return {
      success: false,
      error: 'Gagal menghapus kategori dari database.',
    };
  }
}

/**
 * Mengambil daftar ringkas berita yang terikat pada suatu kategori,
 * termasuk informasi kategori lain yang menempel pada berita tersebut.
 */
export async function getNewsByCategoryId(
  categoryId: number
): Promise<CategoryLinkedNewsItem[]> {
  try {
    const numericId = Number(categoryId);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return [];
    }

    await ensureBeritaCategoriesTable();

    const result = await pool.query<{
      id: number;
      uuid: string | null;
      title: string;
      status: string;
      author_name: string | null;
      author_role: string | null;
      other_categories: string[] | null;
    }>(
      `WITH linked_berita AS (
         SELECT berita_id FROM public.berita_categories WHERE category_id = $1
         UNION
         SELECT id AS berita_id FROM public.berita WHERE category_id = $1
       )
       SELECT
         b.id,
         b.uuid,
         b.title,
         b.status,
         b.author_name,
         b.author_role,
         COALESCE(
           ARRAY(
             SELECT c2.name
             FROM public.berita_categories bc2
             INNER JOIN public.categories c2 ON c2.id = bc2.category_id
             WHERE bc2.berita_id = b.id AND c2.id <> $1
             ORDER BY bc2.position ASC, c2.name ASC
           ),
           ARRAY[]::text[]
         ) AS other_categories
       FROM linked_berita lb
       INNER JOIN public.berita b ON b.id = lb.berita_id
       ORDER BY COALESCE(b.published_at, b.created_at) DESC, b.id DESC`,
      [numericId]
    );

    return result.rows.map((row) => ({
      id: Number(row.id),
      uuid: row.uuid ?? null,
      title: row.title || '(Tanpa Judul)',
      status: row.status || 'DRAFT',
      author_name: row.author_name || 'Admin',
      author_role: row.author_role ?? null,
      is_reporter_private_draft:
        row.status === 'DRAFT' && row.author_role === 'REPORTER',
      other_categories: Array.isArray(row.other_categories)
        ? row.other_categories.filter(Boolean)
        : [],
    }));
  } catch (error: unknown) {
    console.error('Error in getNewsByCategoryId:', error);
    return [];
  }
}

/**
 * Memindahkan seluruh berita yang terikat pada `sourceCategoryId` ke `targetCategoryId`
 * lalu menghapus `sourceCategoryId` dalam satu transaksi database.
 */
export async function reassignAndDeleteCategory(
  sourceCategoryId: number,
  targetCategoryId: number
): Promise<CategoryMutationResult> {
  const sourceId = Number(sourceCategoryId);
  const targetId = Number(targetCategoryId);

  if (
    !Number.isFinite(sourceId) ||
    sourceId <= 0 ||
    !Number.isFinite(targetId) ||
    targetId <= 0
  ) {
    return {
      success: false,
      error: 'Kategori asal atau tujuan tidak valid.',
    };
  }

  if (sourceId === targetId) {
    return {
      success: false,
      error: 'Kategori tujuan harus berbeda dari kategori yang akan dihapus.',
    };
  }

  await ensureBeritaCategoriesTable();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cats = await client.query<{ id: number; name: string }>(
      'SELECT id, name FROM public.categories WHERE id = ANY($1::int[])',
      [[sourceId, targetId]]
    );

    const sourceCat = cats.rows.find((c) => Number(c.id) === sourceId);
    const targetCat = cats.rows.find((c) => Number(c.id) === targetId);

    if (!sourceCat) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: 'Kategori yang akan dihapus tidak ditemukan.',
      };
    }

    if (!targetCat) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: 'Kategori tujuan tidak ditemukan.',
      };
    }

    const linkedRes = await client.query<{ berita_id: number }>(
      `SELECT berita_id FROM public.berita_categories WHERE category_id = $1
       UNION
       SELECT id AS berita_id FROM public.berita WHERE category_id = $1`,
      [sourceId]
    );

    const affectedIds = linkedRes.rows.map((r) => Number(r.berita_id));

    if (affectedIds.length > 0) {
      await client.query(
        `INSERT INTO public.berita_categories (berita_id, category_id, position)
         SELECT unnest($1::int[]), $2, 0
         ON CONFLICT (berita_id, category_id) DO NOTHING`,
        [affectedIds, targetId]
      );

      await client.query(
        'DELETE FROM public.berita_categories WHERE category_id = $1',
        [sourceId]
      );

      await client.query(
        'UPDATE public.berita SET category_id = $2 WHERE category_id = $1',
        [sourceId, targetId]
      );
    }

    await client.query('DELETE FROM public.categories WHERE id = $1', [
      sourceId,
    ]);

    await client.query('COMMIT');

    return {
      success: true,
      movedCount: affectedIds.length,
      category: {
        id: targetId,
        name: targetCat.name,
      },
    };
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    console.error('Error in reassignAndDeleteCategory:', error);
    return {
      success: false,
      error: 'Gagal memindahkan berita dan menghapus kategori.',
    };
  } finally {
    client.release();
  }
}

/**
 * Menyelesaikan `category_id` (integer FK ke `public.categories`).
 * Mendukung input berupa ID numerik maupun nama kategori.
 * Kategori baru hanya boleh dibuat oleh `SUPER_ADMIN` / `ADMIN_BERITA`;
 * untuk Reporter (atau role tidak diketahui) mengembalikan `null`.
 */
export async function resolveCategoryId(
  rawCategory: string | null | undefined,
  userRole?: UserRole
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

  // Validasi batas maksimal 30 karakter untuk pembuatan kategori baru
  if (trimmed.length > 30) {
    return null;
  }

  // Kategori resmi selalu boleh disinkronkan ke tabel master, apa pun role-nya
  const isOfficial = OFFICIAL_CATEGORIES.some(
    (cat) => cat.toLowerCase() === trimmed.toLowerCase()
  );
  const canCreate = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN_BERITA';

  if (!isOfficial && !canCreate) {
    return null;
  }

  const inserted = await pool.query(
    `INSERT INTO public.categories (name, slug)
     VALUES ($1, $2)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [trimmed, slug]
  );

  return (inserted.rows[0]?.id as number) ?? null;
}

/**
 * Menyelesaikan daftar multi-kategori menjadi array `category_id` unik dengan urutan terjaga.
 * Mengembalikan `null` jika ada kategori yang tidak valid atau ditolak otorisasinya.
 */
export async function resolveCategoryIds(
  rawCategories: string[],
  userRole?: UserRole
): Promise<number[] | null> {
  const cleaned = rawCategories
    .flatMap((item) => item.split(','))
    .map((item) => item.trim())
    .filter(Boolean);

  if (cleaned.length === 0) {
    return null;
  }

  const resolvedIds: number[] = [];
  for (const raw of cleaned) {
    const id = await resolveCategoryId(raw, userRole);
    if (!id) {
      return null;
    }
    if (!resolvedIds.includes(id)) {
      resolvedIds.push(id);
    }
  }

  return resolvedIds.length > 0 ? resolvedIds : null;
}
