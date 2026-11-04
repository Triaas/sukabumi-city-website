'use server';

import { revalidatePath } from 'next/cache';
import pool, { ensureBeritaVisibilityColumns } from '@/lib/db';
import { saveBeritaImage } from '@/lib/upload';
import { toCategorySlug } from '@/lib/constants/categories';
import type { NewsStatus, UserRole } from '@/lib/types/berita';

export type BeritaActionType = 'DRAFT' | 'SUBMIT' | 'PUBLISH';

export interface CreateBeritaResult {
  success: boolean;
  slug?: string;
  error?: string;
}

/**
 * Mengubah judul berita menjadi format slug URL-friendly.
 */
function slugifyTitle(title: string): string {
  const base = title
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
 */
async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugifyTitle(title);
  let candidate = baseSlug;
  let counter = 2;

  while (true) {
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

    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

/**
 * Menyelesaikan `category_id` (integer FK ke `public.categories`).
 * Mendukung input berupa ID numerik maupun nama kategori (otomatis sinkron ke `public.categories`).
 */
async function resolveCategoryId(
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

/**
 * Server Action untuk menyimpan atau menerbitkan berita baru ke tabel `public.berita`.
 */
export async function createBeritaAction(
  formData: FormData
): Promise<CreateBeritaResult> {
  try {
    const title = ((formData.get('title') as string) || '').trim();
    const content = ((formData.get('content') as string) || '').trim();
    const rawCategory = (formData.get('category_id') as string) || '';
    const caption = ((formData.get('caption') as string) || '').trim() || null;
    const sourceCredit =
      ((formData.get('source_credit') as string) || '').trim() || null;
    const actionType = ((formData.get('action_type') as BeritaActionType) ||
      'DRAFT') as BeritaActionType;
    const authorName =
      ((formData.get('author_name') as string) || '').trim() ||
      'Diskominfo Kota Sukabumi';
    const userRole = ((formData.get('user_role') as UserRole) ||
      'REPORTER') as UserRole;
    const imageEntry = formData.get('image');

    // Validasi input dasar
    if (!title) {
      return {
        success: false,
        error: 'Judul berita wajib diisi.',
      };
    }

    const plainTextContent = content.replace(/<[^>]*>/g, '').trim();
    if (actionType !== 'DRAFT' && !plainTextContent) {
      return {
        success: false,
        error: 'Naskah narasi berita wajib diisi sebelum dikirim atau diterbitkan.',
      };
    }

    // Penanganan gambar (File fisik atau URL string)
    let imageUrl: string | null = null;
    if (imageEntry instanceof File && imageEntry.size > 0) {
      imageUrl = await saveBeritaImage(imageEntry);
    } else if (typeof imageEntry === 'string' && imageEntry.trim().length > 0) {
      imageUrl = imageEntry.trim();
    }

    if (actionType !== 'DRAFT' && !imageUrl) {
      return {
        success: false,
        error: 'Gambar utama berita wajib diunggah sebelum dikirim atau diterbitkan.',
      };
    }

    // Buat slug unik
    const newSlug = await generateUniqueSlug(title);

    // Resolusi category_id ke tabel public.categories
    const categoryId = await resolveCategoryId(rawCategory);

    // Tentukan status berdasarkan action_type & user_role
    let status: NewsStatus = 'DRAFT';
    let isPublishedNow = false;

    if (actionType === 'DRAFT') {
      status = 'DRAFT';
      isPublishedNow = false;
    } else if (userRole === 'REPORTER' && actionType === 'SUBMIT') {
      status = 'SUBMITTED';
      isPublishedNow = false;
    } else if (
      (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN_BERITA') &&
      actionType === 'PUBLISH'
    ) {
      status = 'PUBLISHED';
      isPublishedNow = true;
    } else if (userRole === 'REPORTER') {
      // Proteksi keamanan: Reporter tidak dapat langsung menerbitkan berita
      status = 'SUBMITTED';
      isPublishedNow = false;
    }

    // Pastikan kolom penanda visibilitas tersedia di tabel public.berita
    await ensureBeritaVisibilityColumns();

    // Eksekusi INSERT ke tabel public.berita
    const insertQuery = `
      INSERT INTO public.berita (
        title,
        slug,
        content,
        image_url,
        caption,
        source_credit,
        category_id,
        author_name,
        author_role,
        status,
        was_published,
        published_at,
        created_at,
        updated_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11::boolean,
        CASE WHEN $11::boolean THEN NOW() ELSE NULL END,
        NOW(),
        NOW()
      )
      RETURNING slug
    `;

    await pool.query(insertQuery, [
      title,
      newSlug,
      content,
      imageUrl,
      caption,
      sourceCredit,
      categoryId,
      authorName,
      userRole,
      status,
      isPublishedNow,
    ]);

    // Revalidasi cache halaman publik dan dashboard
    revalidatePath('/berita');
    revalidatePath('/');
    revalidatePath('/admin/berita');
    revalidatePath('/reporter/berita');

    return {
      success: true,
      slug: newSlug,
    };
  } catch (error: any) {
    console.error('Error in createBeritaAction:', error);

    if (error?.code === '42P01') {
      return {
        success: false,
        error:
          'Tabel database public.berita belum ditemukan. Pastikan migrasi SQL 001_create_berita_table.sql sudah dijalankan.',
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menyimpan berita ke database.',
    };
  }
}

/**
 * Server Action untuk menarik kembali naskah berstatus 'SUBMITTED' menjadi 'DRAFT' (Khusus Reporter).
 */
export async function unsubmitNewsAction(id: number | string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      return { success: false, error: 'ID berita tidak valid.' };
    }

    await ensureBeritaVisibilityColumns();

    await pool.query(
      `UPDATE public.berita
       SET status = 'DRAFT',
           was_published = FALSE,
           updated_at = NOW()
       WHERE id = $1
         AND status = 'SUBMITTED'`,
      [numericId]
    );

    revalidatePath('/reporter/berita');
    revalidatePath('/admin/berita');
    revalidatePath('/berita');
    revalidatePath('/');

    return { success: true };
  } catch (error: unknown) {
    console.error('Error in unsubmitNewsAction:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal menarik naskah berita.',
    };
  }
}

/**
 * Server Action untuk menurunkan berita tayang ('PUBLISHED') kembali menjadi 'DRAFT'
 * dan mengosongkan `published_at`, namun mempertahankan `was_published = TRUE`
 * agar tetap terlihat di meja redaksi Admin (Fitur Takedown Admin).
 */
export async function unpublishNewsAction(id: number | string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      return { success: false, error: 'ID berita tidak valid.' };
    }

    await ensureBeritaVisibilityColumns();

    await pool.query(
      `UPDATE public.berita
       SET status = 'DRAFT',
           published_at = NULL,
           was_published = TRUE,
           updated_at = NOW()
       WHERE id = $1
         AND status = 'PUBLISHED'`,
      [numericId]
    );

    revalidatePath('/admin/berita');
    revalidatePath('/reporter/berita');
    revalidatePath('/berita');
    revalidatePath('/');

    return { success: true };
  } catch (error: unknown) {
    console.error('Error in unpublishNewsAction:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal menurunkan penayangan berita.',
    };
  }
}


