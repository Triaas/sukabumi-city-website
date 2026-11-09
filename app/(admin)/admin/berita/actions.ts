'use server';

import { revalidatePath } from 'next/cache';
import pool from '@/lib/db';
import { saveBeritaImage } from '@/lib/upload';
import { toCategorySlug } from '@/lib/constants/categories';
import type { NewsStatus, UserRole } from '@/lib/types/berita';

export type BeritaActionType = 'DRAFT' | 'SUBMIT' | 'PUBLISH';

export interface CreateBeritaResult {
  success: boolean;
  id?: number;
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
 * Mengonversi pasangan tanggal (YYYY-MM-DD) dan waktu (HH:mm) WIB (UTC+7)
 * menjadi ISO string timestamp yang valid, atau mengembalikan null jika tidak valid.
 */
function parseCustomPublishTimestamp(
  publishDate?: string | null,
  publishTime?: string | null
): string | null {
  const datePart = (publishDate || '').trim();
  const timePart = (publishTime || '').trim() || '00:00';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return null;
  }

  const normalizedTime = /^\d{2}:\d{2}$/.test(timePart)
    ? `${timePart}:00`
    : /^\d{2}:\d{2}:\d{2}$/.test(timePart)
      ? timePart
      : '00:00:00';

  const parsed = new Date(`${datePart}T${normalizedTime}+07:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  // Batasi agar tidak melebihi waktu saat ini (sesuai aturan form)
  const now = new Date();
  const finalDate = parsed.getTime() > now.getTime() ? now : parsed;
  return finalDate.toISOString();
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
    const caption = ((formData.get('caption') as string) || '').trim();
    const sourceCredit = ((formData.get('source_credit') as string) || '').trim();
    const actionType = ((formData.get('action_type') as BeritaActionType) ||
      'DRAFT') as BeritaActionType;
    const authorName =
      ((formData.get('author_name') as string) || '').trim() ||
      'Diskominfo Kota Sukabumi';
    const userRole = ((formData.get('user_role') as UserRole) ||
      'REPORTER') as UserRole;
    const publishDateRaw = (formData.get('publish_date') as string) || '';
    const publishTimeRaw = (formData.get('publish_time') as string) || '';
    const imageEntry = formData.get('image');

    // Validasi input wajib untuk semua naskah
    if (!title) {
      return {
        success: false,
        error: 'Judul berita utama wajib diisi.',
      };
    }

    // Penanganan gambar (File fisik atau URL string)
    let imageUrl: string | null = null;
    if (imageEntry instanceof File && imageEntry.size > 0) {
      imageUrl = await saveBeritaImage(imageEntry);
    } else if (typeof imageEntry === 'string' && imageEntry.trim().length > 0) {
      imageUrl = imageEntry.trim();
    }

    if (!imageUrl) {
      return {
        success: false,
        error: 'Gambar utama berita wajib diunggah.',
      };
    }

    if (!caption) {
      return {
        success: false,
        error: 'Keterangan / caption foto wajib diisi.',
      };
    }

    if (!sourceCredit) {
      return {
        success: false,
        error: 'Sumber foto / atribusi wajib diisi.',
      };
    }

    const plainTextContent = content.replace(/<[^>]*>/g, '').trim();
    if (!plainTextContent) {
      return {
        success: false,
        error: 'Naskah narasi berita wajib diisi.',
      };
    }

    // Resolusi category_id ke tabel public.categories
    const categoryId = await resolveCategoryId(rawCategory);
    if (!categoryId) {
      return {
        success: false,
        error: 'Pilih minimal 1 kategori berita.',
      };
    }

    // Buat slug unik
    const newSlug = await generateUniqueSlug(title);

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

    const customPublishedAt = parseCustomPublishTimestamp(
      publishDateRaw,
      publishTimeRaw
    );

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
        COALESCE($12::timestamptz, CASE WHEN $11::boolean THEN NOW() ELSE NULL END),
        COALESCE($12::timestamptz, NOW()),
        NOW()
      )
      RETURNING id, slug
    `;

    const insertedBerita = await pool.query(insertQuery, [
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
      customPublishedAt,
    ]);

    const insertedId = insertedBerita.rows[0]?.id
      ? Number(insertedBerita.rows[0].id)
      : undefined;

    // Revalidasi cache halaman publik dan dashboard
    revalidatePath('/berita');
    revalidatePath('/');
    revalidatePath('/admin/berita');
    revalidatePath('/reporter/berita');

    return {
      success: true,
      id: insertedId,
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
 * Server Action untuk menurunkan berita tayang ('PUBLISHED') dan mengosongkan `published_at`.
 * - Jika berita ditulis oleh Reporter (`author_role = 'REPORTER'`), status dikembalikan ke `'SUBMITTED'`
 *   (tampil sebagai "Perlu Peninjauan" di Admin dan "Diserahkan" di Reporter).
 * - Jika berita ditulis oleh Admin/Super Admin, status dikembalikan ke `'DRAFT'`.
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

    const checkRow = await pool.query(
      'SELECT author_role FROM public.berita WHERE id = $1 LIMIT 1',
      [numericId]
    );

    const authorRole = (checkRow.rows[0]?.author_role as string) || 'REPORTER';
    const nextStatus: NewsStatus =
      authorRole === 'REPORTER' ? 'SUBMITTED' : 'DRAFT';

    await pool.query(
      `UPDATE public.berita
       SET status = $2,
           published_at = NULL,
           was_published = TRUE,
           updated_at = NOW()
       WHERE id = $1
         AND status = 'PUBLISHED'`,
      [numericId, nextStatus]
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

/**
 * Server Action untuk menghapus berita secara permanen dari database (`public.berita`).
 */
export async function deleteNewsAction(id: number | string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      return { success: false, error: 'ID berita tidak valid.' };
    }

    await pool.query('DELETE FROM public.berita WHERE id = $1', [numericId]);

    revalidatePath('/admin/berita');
    revalidatePath('/reporter/berita');
    revalidatePath('/berita');
    revalidatePath('/');

    return { success: true };
  } catch (error: unknown) {
    console.error('Error in deleteNewsAction:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal menghapus berita dari database.',
    };
  }
}

/**
 * Server Action untuk memperbarui berita eksisting di tabel `public.berita`.
 * CATATAN PENTING: Kolom `author_name` dan `author_role` bersifat immutable (tidak boleh diubah saat UPDATE).
 */
export async function updateBeritaAction(
  id: number,
  formData: FormData
): Promise<CreateBeritaResult> {
  try {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      return {
        success: false,
        error: 'ID berita tidak valid.',
      };
    }

    const title = ((formData.get('title') as string) || '').trim();
    const content = ((formData.get('content') as string) || '').trim();
    const rawCategory = (formData.get('category_id') as string) || '';
    const caption = ((formData.get('caption') as string) || '').trim();
    const sourceCredit = ((formData.get('source_credit') as string) || '').trim();
    const actionType = ((formData.get('action_type') as BeritaActionType) ||
      'DRAFT') as BeritaActionType;
    const userRole = ((formData.get('user_role') as UserRole) ||
      'REPORTER') as UserRole;
    const publishDateRaw = (formData.get('publish_date') as string) || '';
    const publishTimeRaw = (formData.get('publish_time') as string) || '';
    const imageEntry = formData.get('image');
    const existingImageUrlRaw = (formData.get('existing_image_url') as string) || '';

    if (!title) {
      return {
        success: false,
        error: 'Judul berita utama wajib diisi.',
      };
    }

    // Ambil data naskah saat ini untuk pengecekan status, peran penulis asli, dan gambar eksisting
    const currentCheck = await pool.query(
      'SELECT slug, status, image_url, author_role FROM public.berita WHERE id = $1 LIMIT 1',
      [numericId]
    );

    if ((currentCheck.rowCount ?? 0) === 0) {
      return {
        success: false,
        error: 'Data berita tidak ditemukan di database.',
      };
    }

    const currentRow = currentCheck.rows[0];
    const currentSlug = currentRow.slug as string;
    const currentStatus = (currentRow.status as NewsStatus) || 'DRAFT';
    const originalAuthorRole = (currentRow.author_role as UserRole) || 'REPORTER';

    // Reporter hanya diizinkan mengedit jika naskah masih berstatus DRAFT
    if (userRole === 'REPORTER' && currentStatus !== 'DRAFT') {
      return {
        success: false,
        error: 'Hanya naskah berstatus Draf yang dapat diedit oleh Reporter.',
      };
    }

    // Penanganan gambar (File fisik baru atau mempertahankan URL gambar eksisting)
    let imageUrl: string | null = null;
    if (imageEntry instanceof File && imageEntry.size > 0) {
      imageUrl = await saveBeritaImage(imageEntry);
    } else if (typeof imageEntry === 'string' && imageEntry.trim().length > 0) {
      imageUrl = imageEntry.trim();
    } else if (existingImageUrlRaw.trim().length > 0) {
      imageUrl = existingImageUrlRaw.trim();
    }

    if (!imageUrl) {
      return {
        success: false,
        error: 'Gambar utama berita wajib diunggah.',
      };
    }

    if (!caption) {
      return {
        success: false,
        error: 'Keterangan / caption foto wajib diisi.',
      };
    }

    if (!sourceCredit) {
      return {
        success: false,
        error: 'Sumber foto / atribusi wajib diisi.',
      };
    }

    const plainTextContent = content.replace(/<[^>]*>/g, '').trim();
    if (!plainTextContent) {
      return {
        success: false,
        error: 'Naskah narasi berita wajib diisi.',
      };
    }

    const categoryId = await resolveCategoryId(rawCategory);
    if (!categoryId) {
      return {
        success: false,
        error: 'Pilih minimal 1 kategori berita.',
      };
    }

    // Aturan Status:
    // - Jika Admin/Super Admin menekan PUBLISH: status = 'PUBLISHED', was_published = TRUE, published_at = COALESCE(published_at, NOW())
    // - Jika Admin menyimpan perubahan tanpa menerbitkan (DRAFT) pada naskah milik Reporter:
    //   status tetap 'SUBMITTED' ("Perlu Peninjauan" di Admin, "Diserahkan" di Reporter).
    // - Jika Admin menyimpan draf (DRAFT) pada naskah milik Admin sendiri: status = 'DRAFT'
    // - Jika Reporter menekan SUBMIT: status = 'SUBMITTED'
    // - Jika Reporter menyimpan edit (DRAFT): status tetap 'DRAFT'
    let status: NewsStatus = 'DRAFT';
    let isPublishingNow = false;

    if (
      (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN_BERITA') &&
      actionType === 'PUBLISH'
    ) {
      status = 'PUBLISHED';
      isPublishingNow = true;
    } else if (userRole === 'REPORTER') {
      status = actionType === 'SUBMIT' ? 'SUBMITTED' : 'DRAFT';
      isPublishingNow = false;
    } else {
      status = originalAuthorRole === 'REPORTER' ? 'SUBMITTED' : 'DRAFT';
      isPublishingNow = false;
    }

    const customPublishedAt = parseCustomPublishTimestamp(
      publishDateRaw,
      publishTimeRaw
    );

    // Query UPDATE TIDAK mengubah author_name dan author_role
    const updateQuery = `
      UPDATE public.berita
      SET
        title = $2,
        content = $3,
        image_url = $4,
        caption = $5,
        source_credit = $6,
        category_id = $7,
        status = $8,
        was_published = CASE WHEN $9::boolean THEN TRUE ELSE COALESCE(was_published, FALSE) END,
        published_at = COALESCE($10::timestamptz, published_at, CASE WHEN $9::boolean THEN NOW() ELSE NULL END),
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, slug
    `;

    const updated = await pool.query(updateQuery, [
      numericId,
      title,
      content,
      imageUrl,
      caption,
      sourceCredit,
      categoryId,
      status,
      isPublishingNow,
      customPublishedAt,
    ]);

    const finalSlug = (updated.rows[0]?.slug as string) || currentSlug;

    revalidatePath('/berita');
    revalidatePath(`/berita/${finalSlug}`);
    revalidatePath('/');
    revalidatePath('/admin/berita');
    revalidatePath('/reporter/berita');

    return {
      success: true,
      id: numericId,
      slug: finalSlug,
    };
  } catch (error: any) {
    console.error('Error in updateBeritaAction:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat memperbarui berita di database.',
    };
  }
}



