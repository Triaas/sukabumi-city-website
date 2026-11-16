'use server';

import pool from '@/lib/db';
import { saveBeritaImage } from '@/lib/upload';
import { parseCustomPublishTimestamp } from '@/lib/utils/datetime';
import { generateUniqueSlug } from '@/lib/berita/slug';
import {
  resolveCategoryIds,
  syncBeritaCategories,
} from '@/lib/berita/category';
import {
  resolveNextStatus,
  resolveUnpublishStatus,
  type BeritaActionType,
} from '@/lib/berita/status';
import { revalidateBeritaPaths } from '@/lib/berita/revalidate';
import type { NewsStatus, UserRole } from '@/lib/types/berita';

export type { BeritaActionType };

export interface CreateBeritaResult {
  success: boolean;
  id?: number;
  uuid?: string;
  slug?: string;
  error?: string;
}

/**
 * Memvalidasi bahwa path gambar mengarah ke path lokal (`/`) atau protokol HTTP/HTTPS yang sah.
 */
function isValidImagePath(url: string | null | undefined): url is string {
  if (!url || typeof url !== 'string') {
    return false;
  }
  const trimmed = url.trim();
  return (
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  );
}

/**
 * Server Action untuk menyimpan atau menerbitkan berita baru ke tabel `public.berita`.
 */
export async function createBeritaAction(
  formData: FormData
): Promise<CreateBeritaResult> {
  try {
    const rawTitle = ((formData.get('title') as string) || '').trim();
    const content = ((formData.get('content') as string) || '').trim();
    const rawCategory = ((formData.get('category_id') as string) || '').trim();
    const rawCategories = formData
      .getAll('categories')
      .map((val) => String(val).trim())
      .filter(Boolean);
    const categoryInputs =
      rawCategories.length > 0
        ? rawCategories
        : rawCategory
          ? rawCategory.split(',').map((c) => c.trim()).filter(Boolean)
          : [];
    const caption = ((formData.get('caption') as string) || '').trim();
    const sourceCredit = ((formData.get('source_credit') as string) || '').trim();
    const actionType = ((formData.get('action_type') as BeritaActionType) ||
      'DRAFT') as BeritaActionType;
    const isDraftAction = actionType === 'DRAFT';
    const title = rawTitle || (isDraftAction ? '(Draf Tanpa Judul)' : '');
    const authorName =
      ((formData.get('author_name') as string) || '').trim() ||
      'Diskominfo Kota Sukabumi';
    const userRole = ((formData.get('user_role') as UserRole) ||
      'REPORTER') as UserRole;
    const publishDateRaw = ((formData.get('publish_date') as string) || '').trim();
    const publishTimeRaw = ((formData.get('publish_time') as string) || '').trim();
    const imageEntry = formData.get('image');

    // 1. Validasi seluruh field teks, kategori, dan jadwal TERLEBIH DAHULU
    //    sebelum menyentuh penyimpanan berkas fisik (mencegah orphan file upload).
    if (!title) {
      return {
        success: false,
        error: 'Judul berita utama wajib diisi.',
      };
    }

    const hasFileUpload = imageEntry instanceof File && imageEntry.size > 0;
    const hasStringImage =
      typeof imageEntry === 'string' && imageEntry.trim().length > 0;

    if (!isDraftAction && !hasFileUpload && !hasStringImage) {
      return {
        success: false,
        error: 'Gambar utama berita wajib diunggah.',
      };
    }

    if (hasStringImage && !isValidImagePath(imageEntry)) {
      return {
        success: false,
        error: 'Format path atau URL gambar tidak valid.',
      };
    }

    if (!isDraftAction && !caption) {
      return {
        success: false,
        error: 'Keterangan / caption foto wajib diisi.',
      };
    }

    if (!isDraftAction && !sourceCredit) {
      return {
        success: false,
        error: 'Sumber foto / atribusi wajib diisi.',
      };
    }

    const plainTextContent = content.replace(/<[^>]*>/g, '').trim();
    if (!isDraftAction && !plainTextContent) {
      return {
        success: false,
        error: 'Naskah narasi berita wajib diisi.',
      };
    }

    if (!isDraftAction && categoryInputs.length === 0) {
      return {
        success: false,
        error: 'Pilih minimal 1 kategori berita.',
      };
    }

    const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN_BERITA';
    if (!isDraftAction && isAdmin) {
      if (!publishDateRaw) {
        return {
          success: false,
          error: 'Tanggal publikasi wajib diisi.',
        };
      }
      if (!publishTimeRaw) {
        return {
          success: false,
          error: 'Waktu publikasi (WIB) wajib diisi.',
        };
      }
    }

    if (
      categoryInputs.some((cat) => cat.length > 30 && !/^\d+$/.test(cat))
    ) {
      return {
        success: false,
        error: 'Nama kategori baru tidak boleh melebihi 30 karakter.',
      };
    }

    // 2. Resolusi seluruh kategori ke tabel public.categories
    const categoryIds =
      categoryInputs.length > 0
        ? await resolveCategoryIds(categoryInputs, userRole)
        : [];
    if (!isDraftAction && (!categoryIds || categoryIds.length === 0)) {
      return {
        success: false,
        error: isAdmin
          ? 'Pilih minimal 1 kategori berita yang valid (maksimal 30 karakter).'
          : 'Kategori tidak ditemukan. Reporter tidak diizinkan membuat kategori baru.',
      };
    }
    const resolvedCategoryIds = categoryIds ?? [];
    const categoryId = resolvedCategoryIds[0] ?? null;

    // 3. Unggah gambar fisik HANYA setelah seluruh validasi lolos
    let imageUrl: string | null = null;
    if (hasFileUpload) {
      try {
        imageUrl = await saveBeritaImage(imageEntry as File);
      } catch (uploadErr: unknown) {
        return {
          success: false,
          error:
            uploadErr instanceof Error
              ? uploadErr.message
              : 'Gagal mengunggah berkas gambar berita.',
        };
      }
    } else if (hasStringImage) {
      imageUrl = (imageEntry as string).trim();
    }

    if (!isDraftAction && !isValidImagePath(imageUrl)) {
      return {
        success: false,
        error: 'Gambar utama berita wajib diunggah.',
      };
    }

    // 4. Buat slug unik & tentukan status naskah
    const newSlug = await generateUniqueSlug(title);
    const { status, isPublishedNow, wasPublished } = resolveNextStatus({
      actionType,
      userRole,
      isUpdate: false,
    });

    const customPublishedAt = parseCustomPublishTimestamp(
      publishDateRaw,
      publishTimeRaw
    );

    // 5. Eksekusi INSERT (created_at selalu NOW(), customPublishedAt hanya untuk published_at)
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
        COALESCE($12::timestamptz, CASE WHEN $13::boolean THEN NOW() ELSE NULL END),
        NOW(),
        NOW()
      )
      RETURNING id, uuid, slug
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
      wasPublished,
      customPublishedAt,
      isPublishedNow,
    ]);

    const insertedId = insertedBerita.rows[0]?.id
      ? Number(insertedBerita.rows[0].id)
      : undefined;
    const insertedUuid = insertedBerita.rows[0]?.uuid
      ? String(insertedBerita.rows[0].uuid)
      : undefined;

    if (insertedId) {
      await syncBeritaCategories(insertedId, resolvedCategoryIds);
    }

    revalidateBeritaPaths(newSlug);

    return {
      success: true,
      id: insertedId,
      uuid: insertedUuid,
      slug: newSlug,
    };
  } catch (error: unknown) {
    console.error('Error in createBeritaAction:', error);

    return {
      success: false,
      error:
        'Terjadi kesalahan pada server saat menyimpan berita. Silakan coba beberapa saat lagi.',
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

    revalidateBeritaPaths();

    return { success: true };
  } catch (error: unknown) {
    console.error('Error in unsubmitNewsAction:', error);
    return {
      success: false,
      error: 'Gagal menarik naskah berita. Silakan coba beberapa saat lagi.',
    };
  }
}

/**
 * Server Action untuk menurunkan berita tayang ('PUBLISHED') dan mengosongkan `published_at`.
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
    const nextStatus = resolveUnpublishStatus(authorRole);

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

    revalidateBeritaPaths();

    return { success: true };
  } catch (error: unknown) {
    console.error('Error in unpublishNewsAction:', error);
    return {
      success: false,
      error:
        'Gagal menurunkan penayangan berita. Silakan coba beberapa saat lagi.',
    };
  }
}

/**
 * Server Action untuk menghapus berita secara permanen dari database (`public.berita`).
 */
export async function deleteNewsAction(
  id: number | string,
  options?: { role?: UserRole; authorName?: string }
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      return { success: false, error: 'ID berita tidak valid.' };
    }

    if (options?.role === 'REPORTER') {
      const authorName = (options.authorName || '').trim();
      if (!authorName) {
        return {
          success: false,
          error: 'Identitas penulis tidak valid untuk menghapus berita.',
        };
      }

      const delRes = await pool.query(
        `DELETE FROM public.berita
         WHERE id = $1
           AND author_role = 'REPORTER'
           AND LOWER(author_name) = LOWER($2)
           AND status = 'DRAFT'`,
        [numericId, authorName]
      );

      if ((delRes.rowCount ?? 0) === 0) {
        return {
          success: false,
          error:
            'Anda tidak memiliki izin untuk menghapus naskah ini atau status bukan Draf.',
        };
      }
    } else {
      await pool.query('DELETE FROM public.berita WHERE id = $1', [numericId]);
    }

    revalidateBeritaPaths();

    return { success: true };
  } catch (error: unknown) {
    console.error('Error in deleteNewsAction:', error);
    return {
      success: false,
      error:
        'Gagal menghapus berita dari database. Silakan coba beberapa saat lagi.',
    };
  }
}

export const deleteBeritaAction = deleteNewsAction;

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

    const rawTitle = ((formData.get('title') as string) || '').trim();
    const content = ((formData.get('content') as string) || '').trim();
    const rawCategory = ((formData.get('category_id') as string) || '').trim();
    const rawCategories = formData
      .getAll('categories')
      .map((val) => String(val).trim())
      .filter(Boolean);
    const categoryInputs =
      rawCategories.length > 0
        ? rawCategories
        : rawCategory
          ? rawCategory.split(',').map((c) => c.trim()).filter(Boolean)
          : [];
    const caption = ((formData.get('caption') as string) || '').trim();
    const sourceCredit = ((formData.get('source_credit') as string) || '').trim();
    const actionType = ((formData.get('action_type') as BeritaActionType) ||
      'DRAFT') as BeritaActionType;
    const isDraftAction = actionType === 'DRAFT';
    const title = rawTitle || (isDraftAction ? '(Draf Tanpa Judul)' : '');
    const authorName = ((formData.get('author_name') as string) || '').trim();
    const userRole = ((formData.get('user_role') as UserRole) ||
      'REPORTER') as UserRole;
    const publishDateRaw = ((formData.get('publish_date') as string) || '').trim();
    const publishTimeRaw = ((formData.get('publish_time') as string) || '').trim();
    const imageEntry = formData.get('image');

    // 1. Validasi seluruh field teks, kategori, dan jadwal TERLEBIH DAHULU
    //    sebelum menyentuh penyimpanan berkas fisik (mencegah orphan file upload).
    if (!title) {
      return {
        success: false,
        error: 'Judul berita utama wajib diisi.',
      };
    }

    if (!isDraftAction && !caption) {
      return {
        success: false,
        error: 'Keterangan / caption foto wajib diisi.',
      };
    }

    if (!isDraftAction && !sourceCredit) {
      return {
        success: false,
        error: 'Sumber foto / atribusi wajib diisi.',
      };
    }

    const plainTextContent = content.replace(/<[^>]*>/g, '').trim();
    if (!isDraftAction && !plainTextContent) {
      return {
        success: false,
        error: 'Naskah narasi berita wajib diisi.',
      };
    }

    if (!isDraftAction && categoryInputs.length === 0) {
      return {
        success: false,
        error: 'Pilih minimal 1 kategori berita.',
      };
    }

    const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN_BERITA';
    if (!isDraftAction && isAdmin) {
      if (!publishDateRaw) {
        return {
          success: false,
          error: 'Tanggal publikasi wajib diisi.',
        };
      }
      if (!publishTimeRaw) {
        return {
          success: false,
          error: 'Waktu publikasi (WIB) wajib diisi.',
        };
      }
    }

    // 2. Ambil data naskah saat ini dari database untuk pengecekan status,
    //    peran penulis asli, dan fallback gambar eksisting yang tepercaya.
    const currentCheck = await pool.query(
      'SELECT uuid, slug, status, image_url, author_name, author_role, was_published FROM public.berita WHERE id = $1 LIMIT 1',
      [numericId]
    );

    if ((currentCheck.rowCount ?? 0) === 0) {
      return {
        success: false,
        error: 'Data berita tidak ditemukan di database.',
      };
    }

    const currentRow = currentCheck.rows[0];
    const currentUuid = String(currentRow.uuid || '');
    const currentSlug = currentRow.slug as string;
    const currentStatus = (currentRow.status as NewsStatus) || 'DRAFT';
    const originalAuthorName = String(currentRow.author_name || '').trim();
    const originalAuthorRole = (currentRow.author_role as UserRole) || 'REPORTER';
    const existingDbImageUrl =
      typeof currentRow.image_url === 'string'
        ? currentRow.image_url.trim()
        : null;

    // Reporter hanya diizinkan mengedit naskah miliknya sendiri yang masih berstatus DRAFT
    if (userRole === 'REPORTER') {
      if (
        originalAuthorRole !== 'REPORTER' ||
        !authorName ||
        originalAuthorName.toLowerCase() !== authorName.toLowerCase()
      ) {
        return {
          success: false,
          error: 'Anda tidak memiliki izin untuk mengedit naskah milik penulis lain.',
        };
      }
      if (currentStatus !== 'DRAFT') {
        return {
          success: false,
          error: 'Hanya naskah berstatus Draf yang dapat diedit oleh Reporter.',
        };
      }
    }

    const hasFileUpload = imageEntry instanceof File && imageEntry.size > 0;
    if (!isDraftAction && !hasFileUpload && !isValidImagePath(existingDbImageUrl)) {
      return {
        success: false,
        error: 'Gambar utama berita wajib diunggah.',
      };
    }

    if (
      categoryInputs.some((cat) => cat.length > 30 && !/^\d+$/.test(cat))
    ) {
      return {
        success: false,
        error: 'Nama kategori baru tidak boleh melebihi 30 karakter.',
      };
    }

    // 3. Resolusi seluruh kategori ke tabel public.categories
    const categoryIds =
      categoryInputs.length > 0
        ? await resolveCategoryIds(categoryInputs, userRole)
        : [];
    if (!isDraftAction && (!categoryIds || categoryIds.length === 0)) {
      return {
        success: false,
        error: isAdmin
          ? 'Pilih minimal 1 kategori berita yang valid (maksimal 30 karakter).'
          : 'Kategori tidak ditemukan. Reporter tidak diizinkan membuat kategori baru.',
      };
    }
    const resolvedCategoryIds = categoryIds ?? [];
    const categoryId = resolvedCategoryIds[0] ?? null;

    // 4. Unggah gambar baru HANYA setelah seluruh validasi lolos,
    //    atau gunakan fallback langsung dari database (currentRow.image_url).
    let imageUrl: string | null = existingDbImageUrl;
    if (hasFileUpload) {
      try {
        imageUrl = await saveBeritaImage(imageEntry as File);
      } catch (uploadErr: unknown) {
        return {
          success: false,
          error:
            uploadErr instanceof Error
              ? uploadErr.message
              : 'Gagal mengunggah berkas gambar berita.',
        };
      }
    }

    if (!isDraftAction && !isValidImagePath(imageUrl)) {
      return {
        success: false,
        error: 'Gambar utama berita wajib diunggah.',
      };
    }

    // 5. Tentukan status berikutnya via fungsi murni resolveNextStatus
    const { status, isPublishedNow, wasPublished } = resolveNextStatus({
      actionType,
      userRole,
      isUpdate: true,
      currentStatus,
      originalAuthorRole,
      wasPublished: Boolean(currentRow.was_published),
    });

    const customPublishedAt = parseCustomPublishTimestamp(
      publishDateRaw,
      publishTimeRaw
    );

    // 6. Query UPDATE TIDAK mengubah author_name dan author_role
    const isReporterRole = userRole === 'REPORTER';
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
        was_published = $9::boolean,
        published_at = COALESCE($10::timestamptz, published_at, CASE WHEN $11::boolean THEN NOW() ELSE NULL END),
        updated_at = NOW()
      WHERE id = $1
      ${isReporterRole ? "AND author_role = 'REPORTER' AND LOWER(author_name) = LOWER($12) AND status = 'DRAFT'" : ''}
      RETURNING id, uuid, slug
    `;

    const updateParams: any[] = [
      numericId,
      title,
      content,
      imageUrl,
      caption,
      sourceCredit,
      categoryId,
      status,
      wasPublished,
      customPublishedAt,
      isPublishedNow,
    ];
    if (isReporterRole) {
      updateParams.push(authorName);
    }

    const updated = await pool.query(updateQuery, updateParams);
    if ((updated.rowCount ?? 0) === 0) {
      return {
        success: false,
        error:
          'Gagal memperbarui berita: naskah tidak ditemukan atau Anda tidak memiliki akses.',
      };
    }

    const finalSlug = (updated.rows[0]?.slug as string) || currentSlug;
    const finalUuid = String(updated.rows[0]?.uuid || currentUuid);

    await syncBeritaCategories(numericId, resolvedCategoryIds);

    revalidateBeritaPaths(finalSlug);

    return {
      success: true,
      id: numericId,
      uuid: finalUuid,
      slug: finalSlug,
    };
  } catch (error: unknown) {
    console.error('Error in updateBeritaAction:', error);
    return {
      success: false,
      error:
        'Terjadi kesalahan pada server saat memperbarui berita. Silakan coba beberapa saat lagi.',
    };
  }
}
