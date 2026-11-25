'use server';

import pool from '@/lib/db';
import { requireRole } from '@/lib/auth';
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

export async function createBeritaAction(
  formData: FormData
): Promise<CreateBeritaResult> {
  const sessionUser = await requireRole([
    'SUPER_ADMIN',
    'ADMIN_BERITA',
    'REPORTER',
  ]);

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
          ? rawCategory
              .split(',')
              .map((c) => c.trim())
              .filter(Boolean)
          : [];
    const caption = ((formData.get('caption') as string) || '').trim();
    const sourceCredit = (
      (formData.get('source_credit') as string) || ''
    ).trim();
    const rawActionType =
      ((formData.get('action_type') as BeritaActionType) ||
        'DRAFT') as BeritaActionType;

    // Identitas dan role diambil sepenuhnya dari sesi server, mengabaikan input FormData.
    const authorId = sessionUser.id;
    const authorName = sessionUser.name;
    const userRole = sessionUser.role;
    const actionType: BeritaActionType =
      userRole === 'REPORTER' && rawActionType === 'PUBLISH'
        ? 'SUBMIT'
        : rawActionType;
    const isDraftAction = actionType === 'DRAFT';
    const title = rawTitle || (isDraftAction ? '(Draf Tanpa Judul)' : '');

    const publishDateRaw = (
      (formData.get('publish_date') as string) || ''
    ).trim();
    const publishTimeRaw = (
      (formData.get('publish_time') as string) || ''
    ).trim();
    const imageEntry =
      formData.get('image') ?? formData.get('existing_image_url');

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

    if (categoryInputs.some((cat) => cat.length > 30 && !/^\d+$/.test(cat))) {
      return {
        success: false,
        error: 'Nama kategori baru tidak boleh melebihi 30 karakter.',
      };
    }

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

    const newSlug = await generateUniqueSlug(title);
    const { status, isPublishedNow, wasPublished } = resolveNextStatus({
      actionType,
      userRole,
      isUpdate: false,
    });

    if (userRole === 'REPORTER' && status === 'PUBLISHED') {
      return {
        success: false,
        error: 'Reporter tidak diizinkan menerbitkan berita secara langsung.',
      };
    }

    const customPublishedAt = isAdmin
      ? parseCustomPublishTimestamp(publishDateRaw, publishTimeRaw)
      : null;

    const insertQuery = `
      INSERT INTO public.berita (
        title,
        slug,
        content,
        image_url,
        caption,
        source_credit,
        category_id,
        author_id,
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
        $11,
        $12::boolean,
        COALESCE($13::timestamptz, CASE WHEN $14::boolean THEN NOW() ELSE NULL END),
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
      authorId,
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

export async function unsubmitNewsAction(id: number | string): Promise<{
  success: boolean;
  error?: string;
}> {
  const sessionUser = await requireRole([
    'SUPER_ADMIN',
    'ADMIN_BERITA',
    'REPORTER',
  ]);

  try {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      return { success: false, error: 'ID berita tidak valid.' };
    }

    if (sessionUser.role === 'REPORTER') {
      const updateRes = await pool.query(
        `UPDATE public.berita
         SET status = 'DRAFT',
             was_published = FALSE,
             updated_at = NOW()
         WHERE id = $1
           AND status = 'SUBMITTED'
           AND (
             author_id = $2
             OR (
               author_id IS NULL
               AND author_role = 'REPORTER'
               AND LOWER(author_name) = LOWER($3)
             )
           )`,
        [numericId, sessionUser.id, sessionUser.name]
      );

      if ((updateRes.rowCount ?? 0) === 0) {
        return {
          success: false,
          error:
            'Anda tidak memiliki izin untuk menarik naskah ini atau status bukan Diserahkan.',
        };
      }
    } else {
      const updateRes = await pool.query(
        `UPDATE public.berita
         SET status = 'DRAFT',
             was_published = FALSE,
             updated_at = NOW()
         WHERE id = $1
           AND status = 'SUBMITTED'`,
        [numericId]
      );

      if ((updateRes.rowCount ?? 0) === 0) {
        return {
          success: false,
          error: 'Naskah berita tidak ditemukan atau status bukan Diserahkan.',
        };
      }
    }

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

export async function unpublishNewsAction(id: number | string): Promise<{
  success: boolean;
  error?: string;
}> {
  await requireRole(['SUPER_ADMIN', 'ADMIN_BERITA']);

  try {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      return { success: false, error: 'ID berita tidak valid.' };
    }

    const checkRow = await pool.query(
      'SELECT author_role FROM public.berita WHERE id = $1 LIMIT 1',
      [numericId]
    );

    if ((checkRow.rowCount ?? 0) === 0) {
      return { success: false, error: 'Data berita tidak ditemukan.' };
    }

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

export async function deleteNewsAction(id: number | string): Promise<{
  success: boolean;
  error?: string;
}> {
  const sessionUser = await requireRole([
    'SUPER_ADMIN',
    'ADMIN_BERITA',
    'REPORTER',
  ]);

  try {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      return { success: false, error: 'ID berita tidak valid.' };
    }

    if (sessionUser.role === 'REPORTER') {
      const delRes = await pool.query(
        `DELETE FROM public.berita
         WHERE id = $1
           AND status = 'DRAFT'
           AND (
             author_id = $2
             OR (
               author_id IS NULL
               AND author_role = 'REPORTER'
               AND LOWER(author_name) = LOWER($3)
             )
           )`,
        [numericId, sessionUser.id, sessionUser.name]
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

export async function updateBeritaAction(
  id: number,
  formData: FormData
): Promise<CreateBeritaResult> {
  const sessionUser = await requireRole([
    'SUPER_ADMIN',
    'ADMIN_BERITA',
    'REPORTER',
  ]);

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
          ? rawCategory
              .split(',')
              .map((c) => c.trim())
              .filter(Boolean)
          : [];
    const caption = ((formData.get('caption') as string) || '').trim();
    const sourceCredit = (
      (formData.get('source_credit') as string) || ''
    ).trim();
    const rawActionType =
      ((formData.get('action_type') as BeritaActionType) ||
        'DRAFT') as BeritaActionType;

    // Role dan identitas diambil 100% dari sesi server.
    const userRole = sessionUser.role;
    const actionType: BeritaActionType =
      userRole === 'REPORTER' && rawActionType === 'PUBLISH'
        ? 'SUBMIT'
        : rawActionType;
    const isDraftAction = actionType === 'DRAFT';
    const title = rawTitle || (isDraftAction ? '(Draf Tanpa Judul)' : '');

    const publishDateRaw = (
      (formData.get('publish_date') as string) || ''
    ).trim();
    const publishTimeRaw = (
      (formData.get('publish_time') as string) || ''
    ).trim();
    const imageEntry = formData.get('image');

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

    const currentCheck = await pool.query(
      'SELECT uuid, slug, status, image_url, author_id, author_name, author_role, was_published FROM public.berita WHERE id = $1 LIMIT 1',
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
    const originalAuthorId =
      currentRow.author_id !== null && currentRow.author_id !== undefined
        ? Number(currentRow.author_id)
        : null;
    const originalAuthorName = String(currentRow.author_name || '').trim();
    const originalAuthorRole =
      (currentRow.author_role as UserRole) || 'REPORTER';
    const existingDbImageUrl =
      typeof currentRow.image_url === 'string'
        ? currentRow.image_url.trim()
        : null;

    if (userRole === 'REPORTER') {
      const isOwner =
        originalAuthorId !== null
          ? originalAuthorId === sessionUser.id
          : originalAuthorRole === 'REPORTER' &&
            originalAuthorName.toLowerCase() ===
              sessionUser.name.toLowerCase();

      if (!isOwner) {
        return {
          success: false,
          error:
            'Anda tidak memiliki izin untuk mengedit naskah milik penulis lain.',
        };
      }
      if (currentStatus !== 'DRAFT') {
        return {
          success: false,
          error:
            'Hanya naskah berstatus Draf yang dapat diedit oleh Reporter.',
        };
      }
    }

    const hasFileUpload = imageEntry instanceof File && imageEntry.size > 0;
    if (
      !isDraftAction &&
      !hasFileUpload &&
      !isValidImagePath(existingDbImageUrl)
    ) {
      return {
        success: false,
        error: 'Gambar utama berita wajib diunggah.',
      };
    }

    if (categoryInputs.some((cat) => cat.length > 30 && !/^\d+$/.test(cat))) {
      return {
        success: false,
        error: 'Nama kategori baru tidak boleh melebihi 30 karakter.',
      };
    }

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

    const { status, isPublishedNow, wasPublished } = resolveNextStatus({
      actionType,
      userRole,
      isUpdate: true,
      currentStatus,
      originalAuthorRole,
      wasPublished: Boolean(currentRow.was_published),
    });

    if (userRole === 'REPORTER' && status === 'PUBLISHED') {
      return {
        success: false,
        error: 'Reporter tidak diizinkan menerbitkan berita secara langsung.',
      };
    }

    const customPublishedAt = isAdmin
      ? parseCustomPublishTimestamp(publishDateRaw, publishTimeRaw)
      : null;

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
      ${
        isReporterRole
          ? `AND status = 'DRAFT' AND (author_id = $12 OR (author_id IS NULL AND author_role = 'REPORTER' AND LOWER(author_name) = LOWER($13)))`
          : ''
      }
      RETURNING id, uuid, slug
    `;

    const updateParams: unknown[] = [
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
      updateParams.push(sessionUser.id, sessionUser.name);
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
