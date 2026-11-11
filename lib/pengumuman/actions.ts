'use server';

import { revalidatePath } from 'next/cache';
import pool from '@/lib/db/pool';
import { slugifyTitle } from '@/lib/berita/slug';
import { parseCustomPublishTimestamp } from '@/lib/utils/datetime';
import {
  savePengumumanThumbnail,
  savePengumumanAttachment,
} from '@/lib/upload';

export interface PengumumanRow {
  id: number;
  title: string;
  slug: string;
  nomor_pengumuman: string | null;
  content: string;
  thumbnail_url: string | null;
  attachment_url: string | null;
  status: string;
  published_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface PengumumanItem {
  id: number;
  no: string;
  title: string;
  slug: string;
  nomor_pengumuman: string | null;
  content: string;
  thumbnail_url: string | null;
  attachment_url: string | null;
  attachment: string | null;
  status: 'Diterbitkan' | 'Draf';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  date: string;
  time: string;
  author: {
    name: string;
    role: string;
    avatar: string;
    avatarBg: string;
  };
}

export interface PengumumanMutationResult {
  success: boolean;
  id?: number;
  slug?: string;
  error?: string;
}

const INDONESIAN_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

function formatIndoDateShort(value: Date | string | null | undefined): string {
  if (!value) return '-';
  const dateObj = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dateObj.getTime())) return '-';

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'numeric',
    year: 'numeric',
  }).formatToParts(dateObj);

  const day = parseInt(parts.find((p) => p.type === 'day')?.value || '1', 10);
  const monthIdx =
    parseInt(parts.find((p) => p.type === 'month')?.value || '1', 10) - 1;
  const year = parts.find((p) => p.type === 'year')?.value || '';

  return `${day} ${INDONESIAN_MONTHS[monthIdx] || ''} ${year}`.trim();
}

function formatWibTimeShort(value: Date | string | null | undefined): string {
  if (!value) return '-';
  const dateObj = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dateObj.getTime())) return '-';

  const formatted = dateObj
    .toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta',
    })
    .replace('.', ':');

  return `${formatted} WIB`;
}

function normalizeDbStatus(rawStatus: string | null | undefined): 'PUBLISHED' | 'DRAFT' {
  const upper = (rawStatus || '').trim().toUpperCase();
  if (upper === 'PUBLISHED' || upper === 'PUBLISH' || upper === 'DITERBITKAN') {
    return 'PUBLISHED';
  }
  return 'DRAFT';
}

function toUiStatus(rawStatus: string | null | undefined): 'Diterbitkan' | 'Draf' {
  return normalizeDbStatus(rawStatus) === 'PUBLISHED' ? 'Diterbitkan' : 'Draf';
}

async function generateUniquePengumumanSlug(
  title: string,
  excludeId?: number
): Promise<string> {
  const baseSlug = slugifyTitle(title);
  let candidate = baseSlug;

  for (let i = 1; i <= 50; i += 1) {
    const query = excludeId
      ? 'SELECT 1 FROM public.pengumuman WHERE slug = $1 AND id <> $2 LIMIT 1'
      : 'SELECT 1 FROM public.pengumuman WHERE slug = $1 LIMIT 1';
    const params = excludeId ? [candidate, excludeId] : [candidate];
    const check = await pool.query(query, params);
    if ((check.rowCount ?? 0) === 0) {
      return candidate;
    }
    candidate = `${baseSlug}-${i + 1}`;
  }

  return `${baseSlug}-${Date.now()}`;
}

function revalidatePengumumanPaths() {
  revalidatePath('/admin/pengumuman');
  revalidatePath('/pengumuman');
  revalidatePath('/');
}

/**
 * Mengambil seluruh daftar pengumuman dari `public.pengumuman` diurutkan berdasarkan `created_at DESC`.
 */
export async function getPengumumanList(): Promise<PengumumanItem[]> {
  try {
    const result = await pool.query<PengumumanRow>(
      'SELECT * FROM public.pengumuman ORDER BY created_at DESC'
    );

    return result.rows.map((row, idx) => {
      const sourceDate = row.published_at || row.created_at;
      const publishedIso = row.published_at
        ? new Date(row.published_at).toISOString()
        : null;
      const createdIso = row.created_at
        ? new Date(row.created_at).toISOString()
        : new Date().toISOString();
      const updatedIso = row.updated_at
        ? new Date(row.updated_at).toISOString()
        : createdIso;

      return {
        id: Number(row.id),
        no: row.nomor_pengumuman || String(idx + 1).padStart(2, '0'),
        title: row.title,
        slug: row.slug,
        nomor_pengumuman: row.nomor_pengumuman || null,
        content: row.content,
        thumbnail_url: row.thumbnail_url || null,
        attachment_url: row.attachment_url || null,
        attachment: row.attachment_url || null,
        status: toUiStatus(row.status),
        published_at: publishedIso,
        created_at: createdIso,
        updated_at: updatedIso,
        date: formatIndoDateShort(sourceDate),
        time: formatWibTimeShort(sourceDate),
        author: {
          name: 'Trias Firmansyah',
          role: 'Admin',
          avatar: 'TF',
          avatarBg: 'bg-[#dcfce7] text-[#16a34a]',
        },
      };
    });
  } catch (error: unknown) {
    console.error('Error in getPengumumanList:', error);
    return [];
  }
}

/**
 * Server Action untuk membuat pengumuman baru di `public.pengumuman`.
 */
export async function createPengumumanAction(
  formData: FormData
): Promise<PengumumanMutationResult> {
  try {
    const title = ((formData.get('title') as string) || '').trim();
    const content = ((formData.get('content') as string) || '').trim();
    const nomorPengumuman =
      ((formData.get('nomor_pengumuman') as string) || '').trim() || null;
    const rawStatus = ((formData.get('status') as string) || 'Diterbitkan').trim();
    const publishDate = ((formData.get('publish_date') as string) || '').trim();
    const publishTime = ((formData.get('publish_time') as string) || '').trim();

    const thumbnailEntry = formData.get('thumbnail');
    const existingThumbnailUrl = (
      (formData.get('existing_thumbnail_url') as string) || ''
    ).trim();

    const attachmentEntry = formData.get('attachment');
    const existingAttachmentUrl = (
      (formData.get('existing_attachment_url') as string) || ''
    ).trim();

    if (!title) {
      return {
        success: false,
        error: 'Judul pengumuman wajib diisi.',
      };
    }

    const plainTextContent = content.replace(/<[^>]*>/g, '').trim();
    if (!plainTextContent) {
      return {
        success: false,
        error: 'Isi pengumuman wajib diisi.',
      };
    }

    const hasAttachmentFile =
      attachmentEntry instanceof File && attachmentEntry.size > 0;
    if (!hasAttachmentFile && !existingAttachmentUrl) {
      return {
        success: false,
        error: 'Berkas dokumen lampiran (PDF) wajib diunggah.',
      };
    }

    let finalThumbnailUrl: string | null = existingThumbnailUrl || null;
    if (thumbnailEntry instanceof File && thumbnailEntry.size > 0) {
      finalThumbnailUrl = await savePengumumanThumbnail(thumbnailEntry);
    }

    let finalAttachmentUrl: string | null = existingAttachmentUrl || null;
    if (hasAttachmentFile) {
      finalAttachmentUrl = await savePengumumanAttachment(attachmentEntry);
    }

    const slug = await generateUniquePengumumanSlug(title);
    const dbStatus = normalizeDbStatus(rawStatus);
    const parsedPublishAt = parseCustomPublishTimestamp(publishDate, publishTime);
    const publishedAt =
      parsedPublishAt || (dbStatus === 'PUBLISHED' ? new Date().toISOString() : null);

    const insertResult = await pool.query<{ id: number; slug: string }>(
      `INSERT INTO public.pengumuman (
         title,
         slug,
         nomor_pengumuman,
         content,
         thumbnail_url,
         attachment_url,
         status,
         published_at,
         created_at,
         updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING id, slug`,
      [
        title,
        slug,
        nomorPengumuman,
        content,
        finalThumbnailUrl,
        finalAttachmentUrl,
        dbStatus,
        publishedAt,
      ]
    );

    revalidatePengumumanPaths();

    return {
      success: true,
      id: Number(insertResult.rows[0]?.id),
      slug: insertResult.rows[0]?.slug,
    };
  } catch (error: unknown) {
    console.error('Error in createPengumumanAction:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan pengumuman baru.',
    };
  }
}

/**
 * Server Action untuk memperbarui data pengumuman di `public.pengumuman`.
 */
export async function updatePengumumanAction(
  idOrFormData: number | string | FormData,
  maybeFormData?: FormData
): Promise<PengumumanMutationResult> {
  try {
    const formData =
      idOrFormData instanceof FormData ? idOrFormData : maybeFormData;
    const rawId =
      idOrFormData instanceof FormData
        ? (idOrFormData.get('id') as string)
        : idOrFormData;
    const numericId = Number(rawId);

    if (!formData || !Number.isFinite(numericId) || numericId <= 0) {
      return {
        success: false,
        error: 'ID pengumuman tidak valid.',
      };
    }

    const existingCheck = await pool.query<PengumumanRow>(
      'SELECT * FROM public.pengumuman WHERE id = $1 LIMIT 1',
      [numericId]
    );

    if ((existingCheck.rowCount ?? 0) === 0) {
      return {
        success: false,
        error: 'Data pengumuman tidak ditemukan.',
      };
    }

    const currentRow = existingCheck.rows[0];
    const title = ((formData.get('title') as string) || '').trim();
    const content = ((formData.get('content') as string) || '').trim();
    const nomorPengumumanRaw = formData.get('nomor_pengumuman');
    const nomorPengumuman =
      nomorPengumumanRaw !== null
        ? String(nomorPengumumanRaw).trim() || null
        : currentRow.nomor_pengumuman;
    const rawStatus = ((formData.get('status') as string) || 'Diterbitkan').trim();
    const publishDate = ((formData.get('publish_date') as string) || '').trim();
    const publishTime = ((formData.get('publish_time') as string) || '').trim();

    const thumbnailEntry = formData.get('thumbnail');
    const existingThumbnailUrl = (
      (formData.get('existing_thumbnail_url') as string) || ''
    ).trim();

    const attachmentEntry = formData.get('attachment');
    const existingAttachmentUrl = (
      (formData.get('existing_attachment_url') as string) || ''
    ).trim();

    if (!title) {
      return {
        success: false,
        error: 'Judul pengumuman wajib diisi.',
      };
    }

    const plainTextContent = content.replace(/<[^>]*>/g, '').trim();
    if (!plainTextContent) {
      return {
        success: false,
        error: 'Isi pengumuman wajib diisi.',
      };
    }

    const hasAttachmentFile =
      attachmentEntry instanceof File && attachmentEntry.size > 0;
    if (!hasAttachmentFile && !existingAttachmentUrl) {
      return {
        success: false,
        error: 'Berkas dokumen lampiran (PDF) wajib diunggah.',
      };
    }

    let finalThumbnailUrl: string | null = existingThumbnailUrl || null;
    if (thumbnailEntry instanceof File && thumbnailEntry.size > 0) {
      finalThumbnailUrl = await savePengumumanThumbnail(thumbnailEntry);
    }

    let finalAttachmentUrl: string | null = existingAttachmentUrl || null;
    if (hasAttachmentFile) {
      finalAttachmentUrl = await savePengumumanAttachment(attachmentEntry);
    }

    const slug =
      title.toLowerCase() !== currentRow.title.toLowerCase()
        ? await generateUniquePengumumanSlug(title, numericId)
        : currentRow.slug;

    const dbStatus = normalizeDbStatus(rawStatus);
    const parsedPublishAt = parseCustomPublishTimestamp(publishDate, publishTime);
    const publishedAt =
      parsedPublishAt ||
      (currentRow.published_at
        ? new Date(currentRow.published_at).toISOString()
        : dbStatus === 'PUBLISHED'
          ? new Date().toISOString()
          : null);

    await pool.query(
      `UPDATE public.pengumuman
       SET title = $2,
           slug = $3,
           nomor_pengumuman = $4,
           content = $5,
           thumbnail_url = $6,
           attachment_url = $7,
           status = $8,
           published_at = $9,
           updated_at = NOW()
       WHERE id = $1`,
      [
        numericId,
        title,
        slug,
        nomorPengumuman,
        content,
        finalThumbnailUrl,
        finalAttachmentUrl,
        dbStatus,
        publishedAt,
      ]
    );

    revalidatePengumumanPaths();

    return {
      success: true,
      id: numericId,
      slug,
    };
  } catch (error: unknown) {
    console.error('Error in updatePengumumanAction:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal memperbarui pengumuman.',
    };
  }
}

/**
 * Server Action untuk menghapus pengumuman dari `public.pengumuman` berdasarkan ID.
 */
export async function deletePengumumanAction(
  id: number | string
): Promise<PengumumanMutationResult> {
  try {
    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return {
        success: false,
        error: 'ID pengumuman tidak valid.',
      };
    }

    const deleted = await pool.query(
      'DELETE FROM public.pengumuman WHERE id = $1 RETURNING id',
      [numericId]
    );

    if ((deleted.rowCount ?? 0) === 0) {
      return {
        success: false,
        error: 'Data pengumuman tidak ditemukan atau sudah dihapus.',
      };
    }

    revalidatePengumumanPaths();

    return {
      success: true,
      id: numericId,
    };
  } catch (error: unknown) {
    console.error('Error in deletePengumumanAction:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal menghapus pengumuman.',
    };
  }
}

/**
 * Server Action untuk menurunkan status pengumuman tayang ('PUBLISHED') menjadi 'DRAFT'
 * dan mengosongkan `published_at`.
 */
export async function unpublishPengumumanAction(
  id: number | string
): Promise<PengumumanMutationResult> {
  try {
    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return {
        success: false,
        error: 'ID pengumuman tidak valid.',
      };
    }

    const checkRow = await pool.query<PengumumanRow>(
      'SELECT id, title, status FROM public.pengumuman WHERE id = $1 LIMIT 1',
      [numericId]
    );

    if ((checkRow.rowCount ?? 0) === 0) {
      return {
        success: false,
        error: 'Data pengumuman tidak ditemukan.',
      };
    }

    await pool.query(
      `UPDATE public.pengumuman
       SET status = 'DRAFT',
           published_at = NULL,
           updated_at = NOW()
       WHERE id = $1`,
      [numericId]
    );

    revalidatePengumumanPaths();

    return {
      success: true,
      id: numericId,
    };
  } catch (error: unknown) {
    console.error('Error in unpublishPengumumanAction:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal menurunkan penayangan pengumuman.',
    };
  }
}


