'use server';

import { revalidatePath } from 'next/cache';
import pool from '@/lib/db/pool';
import { saveBannerImage } from '@/lib/upload';

export interface BannerRow {
  id: number;
  title: string;
  image_url: string;
  target_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  created_at: Date | string | null;
}

export interface BannerItem {
  id: number;
  title: string;
  imageUrl: string;
  targetUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface BannerMutationResult {
  success: boolean;
  id?: number;
  imageUrl?: string;
  error?: string;
}

async function ensureEventBannersTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.event_banners (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL,
      target_url VARCHAR(255) DEFAULT '#',
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function revalidateBannerPaths(): void {
  revalidatePath('/admin/banner');
  revalidatePath('/');
  revalidatePath('/api/event-banners');
}

function parseBooleanStatus(raw: FormDataEntryValue | null, fallback = true): boolean {
  if (raw === null || raw === undefined) return fallback;
  const str = String(raw).trim().toLowerCase();
  if (str === 'true' || str === '1' || str === 'active' || str === 'aktif') {
    return true;
  }
  if (str === 'false' || str === '0' || str === 'inactive' || str === 'tidak aktif') {
    return false;
  }
  return fallback;
}

async function normalizeBannerOrder(
  movedId?: number,
  targetPosition?: number
): Promise<void> {
  const { rows } = await pool.query<{ id: number }>(
    `SELECT id FROM public.event_banners ORDER BY sort_order ASC, id DESC`
  );
  const orderedIds = rows.map((r) => Number(r.id));

  if (movedId !== undefined && targetPosition !== undefined) {
    const filtered = orderedIds.filter((id) => id !== movedId);
    const clampedIndex = Math.max(
      0,
      Math.min(filtered.length, targetPosition - 1)
    );
    filtered.splice(clampedIndex, 0, movedId);
    orderedIds.splice(0, orderedIds.length, ...filtered);
  }

  for (let i = 0; i < orderedIds.length; i++) {
    await pool.query(
      `UPDATE public.event_banners SET sort_order = $1 WHERE id = $2`,
      [i + 1, orderedIds[i]]
    );
  }
}

export async function getBannerList(): Promise<BannerItem[]> {
  try {
    await ensureEventBannersTable();

    const { rows } = await pool.query<BannerRow>(`
      SELECT
        id,
        title,
        image_url,
        target_url,
        sort_order,
        is_active,
        created_at
      FROM public.event_banners
      ORDER BY sort_order ASC, id DESC
    `);

    const hasInvalidOrder = rows.some(
      (row, idx) => Number(row.sort_order) !== idx + 1
    );
    if (hasInvalidOrder && rows.length > 0) {
      await normalizeBannerOrder();
      rows.forEach((row, idx) => {
        row.sort_order = idx + 1;
      });
    }

    return rows.map((row) => {
      const rawTarget = (row.target_url || '').trim();
      return {
        id: Number(row.id),
        title: row.title || '',
        imageUrl: row.image_url || '',
        targetUrl: rawTarget === '#' ? '' : rawTarget,
        sortOrder:
          typeof row.sort_order === 'number' && !Number.isNaN(row.sort_order)
            ? row.sort_order
            : 1,
        isActive: row.is_active !== false,
        createdAt:
          row.created_at instanceof Date
            ? row.created_at.toISOString()
            : String(row.created_at || ''),
      };
    });
  } catch (error) {
    console.error('Error in getBannerList:', error);
    return [];
  }
}

export async function createBannerAction(
  formData: FormData
): Promise<BannerMutationResult> {
  try {
    await ensureEventBannersTable();

    const rawTitle = ((formData.get('title') as string) || '').trim();
    const rawTargetUrl = ((formData.get('target_url') as string) || '').trim();
    const rawSortOrder = ((formData.get('sort_order') as string) || '').trim();
    const isActive = parseBooleanStatus(formData.get('is_active'), true);
    const title = rawTitle || (!isActive ? '(Draf Banner Tanpa Judul)' : '');

    const imageFileEntry = formData.get('image_file');
    const existingImageUrl = (
      (formData.get('existing_image_url') as string) || ''
    ).trim();

    if (!title) {
      return {
        success: false,
        error: 'Judul / deskripsi banner wajib diisi.',
      };
    }

    const hasImageFile =
      imageFileEntry instanceof File && imageFileEntry.size > 0;
    if (isActive && !hasImageFile && !existingImageUrl) {
      return {
        success: false,
        error: 'Gambar banner wajib diunggah.',
      };
    }

    let finalImageUrl = existingImageUrl;
    if (hasImageFile) {
      finalImageUrl = await saveBannerImage(imageFileEntry);
    }

    const parsedSort = parseInt(rawSortOrder, 10);
    const sortOrder =
      Number.isFinite(parsedSort) && parsedSort >= 0 ? parsedSort : 1;
    const targetUrl = rawTargetUrl || '#';

    const insertResult = await pool.query<{ id: number }>(
      `INSERT INTO public.event_banners (
         title,
         image_url,
         target_url,
         sort_order,
         is_active,
         created_at
       )
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id`,
      [title, finalImageUrl, targetUrl, sortOrder, isActive]
    );

    const insertedId = Number(insertResult.rows[0]?.id);
    await normalizeBannerOrder(insertedId, sortOrder);

    revalidateBannerPaths();

    return {
      success: true,
      id: insertedId,
      imageUrl: finalImageUrl,
    };
  } catch (error: unknown) {
    console.error('Error in createBannerAction:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menyimpan banner baru.',
    };
  }
}

export async function updateBannerAction(
  formDataOrId: FormData | number,
  maybeFormData?: FormData
): Promise<BannerMutationResult> {
  try {
    await ensureEventBannersTable();

    const formData =
      formDataOrId instanceof FormData ? formDataOrId : maybeFormData!;
    const rawId =
      typeof formDataOrId === 'number'
        ? formDataOrId
        : Number(formData?.get('id'));

    const numericId = Number(rawId);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return {
        success: false,
        error: 'ID banner tidak valid.',
      };
    }

    const existingRes = await pool.query<BannerRow>(
      `SELECT id, title, image_url, target_url, sort_order, is_active
       FROM public.event_banners
       WHERE id = $1
       LIMIT 1`,
      [numericId]
    );

    if (existingRes.rows.length === 0) {
      return {
        success: false,
        error: 'Data banner tidak ditemukan di database.',
      };
    }

    const currentRow = existingRes.rows[0];

    const rawTitle = ((formData.get('title') as string) || '').trim();
    const rawTargetUrl = ((formData.get('target_url') as string) || '').trim();
    const rawSortOrder = ((formData.get('sort_order') as string) || '').trim();
    const isActive = parseBooleanStatus(
      formData.get('is_active'),
      currentRow.is_active !== false
    );
    const title = rawTitle || (!isActive ? '(Draf Banner Tanpa Judul)' : '');

    const imageFileEntry = formData.get('image_file');
    const existingImageUrl =
      ((formData.get('existing_image_url') as string) || '').trim() ||
      currentRow.image_url;

    if (!title) {
      return {
        success: false,
        error: 'Judul / deskripsi banner wajib diisi.',
      };
    }

    const hasImageFile =
      imageFileEntry instanceof File && imageFileEntry.size > 0;
    if (isActive && !hasImageFile && !existingImageUrl) {
      return {
        success: false,
        error: 'Gambar banner wajib tersedia.',
      };
    }

    let finalImageUrl = existingImageUrl;
    if (hasImageFile) {
      finalImageUrl = await saveBannerImage(imageFileEntry);
    }

    const parsedSort = parseInt(rawSortOrder, 10);
    const sortOrder =
      Number.isFinite(parsedSort) && parsedSort >= 0
        ? parsedSort
        : currentRow.sort_order ?? 1;
    const targetUrl = rawTargetUrl || '#';

    await pool.query(
      `UPDATE public.event_banners
       SET title = $2,
           image_url = $3,
           target_url = $4,
           sort_order = $5,
           is_active = $6
       WHERE id = $1`,
      [numericId, title, finalImageUrl, targetUrl, sortOrder, isActive]
    );

    await normalizeBannerOrder(numericId, sortOrder);

    revalidateBannerPaths();

    return {
      success: true,
      id: numericId,
      imageUrl: finalImageUrl,
    };
  } catch (error: unknown) {
    console.error('Error in updateBannerAction:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat memperbarui banner.',
    };
  }
}

export async function deleteBannerAction(
  id: number
): Promise<BannerMutationResult> {
  try {
    await ensureEventBannersTable();

    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return {
        success: false,
        error: 'ID banner tidak valid.',
      };
    }

    const deleteRes = await pool.query(
      `DELETE FROM public.event_banners WHERE id = $1 RETURNING id`,
      [numericId]
    );

    if (deleteRes.rowCount === 0) {
      return {
        success: false,
        error: 'Banner tidak ditemukan atau sudah dihapus.',
      };
    }

    await normalizeBannerOrder();

    revalidateBannerPaths();

    return {
      success: true,
      id: numericId,
    };
  } catch (error: unknown) {
    console.error('Error in deleteBannerAction:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal menghapus banner.',
    };
  }
}

export async function toggleBannerStatusAction(
  id: number,
  isActive: boolean
): Promise<BannerMutationResult> {
  try {
    await ensureEventBannersTable();

    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return {
        success: false,
        error: 'ID banner tidak valid.',
      };
    }

    const updateRes = await pool.query(
      `UPDATE public.event_banners
       SET is_active = $2
       WHERE id = $1
       RETURNING id`,
      [numericId, Boolean(isActive)]
    );

    if (updateRes.rowCount === 0) {
      return {
        success: false,
        error: 'Data banner tidak ditemukan.',
      };
    }

    revalidateBannerPaths();

    return {
      success: true,
      id: numericId,
    };
  } catch (error: unknown) {
    console.error('Error in toggleBannerStatusAction:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal memperbarui status banner.',
    };
  }
}
