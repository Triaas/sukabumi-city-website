'use server';

import { revalidatePath } from 'next/cache';
import pool from '@/lib/db/pool';
import { slugifyTitle } from '@/lib/berita/slug';
import { saveTransparansiPdf } from '@/lib/upload';

export interface TransparansiRow {
  id: number;
  title: string;
  slug: string;
  description: string;
  effective_date: Date | string;
  effective_date_str?: string;
  pdf_url: string;
  status: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface TransparansiItem {
  id: number;
  no: string;
  title: string;
  slug: string;
  description: string;
  effective_date: string;
  effectiveDate: string;
  pdf_url: string;
  pdfFile: string;
  status: 'Diterbitkan' | 'Draf';
  created_at: string;
  updated_at: string;
}

export interface TransparansiMutationResult {
  success: boolean;
  id?: number;
  slug?: string;
  pdf_url?: string;
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

function getTodayDateWIB(): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === 'year')?.value || '';
  const month = parts.find((p) => p.type === 'month')?.value || '';
  const day = parts.find((p) => p.type === 'day')?.value || '';

  return `${year}-${month}-${day}`;
}

function normalizeDateString(value: Date | string | null | undefined): string {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }
  const dateObj = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dateObj.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(dateObj);

  const year = parts.find((p) => p.type === 'year')?.value || '';
  const month = parts.find((p) => p.type === 'month')?.value || '';
  const day = parts.find((p) => p.type === 'day')?.value || '';

  return `${year}-${month}-${day}`;
}

function formatYmdToIndoShort(ymd: string): string {
  if (!ymd) return '-';
  const parts = ymd.trim().split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return `${String(day).padStart(2, '0')} ${INDONESIAN_MONTHS[monthIdx] || parts[1]} ${year}`;
  }
  return ymd;
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

async function ensureTransparansiTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.transparansi (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT NOT NULL,
      effective_date DATE NOT NULL,
      pdf_url VARCHAR(500) NOT NULL,
      status VARCHAR(20) DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED')),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function generateUniqueTransparansiSlug(
  title: string,
  excludeId?: number
): Promise<string> {
  const baseSlug = slugifyTitle(title);
  let candidate = baseSlug;

  for (let i = 1; i <= 50; i += 1) {
    const query = excludeId
      ? 'SELECT 1 FROM public.transparansi WHERE slug = $1 AND id <> $2 LIMIT 1'
      : 'SELECT 1 FROM public.transparansi WHERE slug = $1 LIMIT 1';
    const params = excludeId ? [candidate, excludeId] : [candidate];
    const check = await pool.query(query, params);
    if ((check.rowCount ?? 0) === 0) {
      return candidate;
    }
    candidate = `${baseSlug}-${i + 1}`;
  }

  return `${baseSlug}-${Date.now()}`;
}

function revalidateTransparansiPaths() {
  revalidatePath('/admin/transparansi');
  revalidatePath('/transparansi');
  revalidatePath('/api/transparansi-dokumen');
  revalidatePath('/');
}

export async function getTransparansiList(): Promise<TransparansiItem[]> {
  try {
    await ensureTransparansiTable();
    const result = await pool.query<TransparansiRow>(
      `SELECT
         id,
         title,
         slug,
         description,
         TO_CHAR(effective_date, 'YYYY-MM-DD') AS effective_date_str,
         effective_date,
         pdf_url,
         status,
         created_at,
         updated_at
       FROM public.transparansi
       ORDER BY effective_date DESC, created_at DESC`
    );

    return result.rows.map((row, idx) => {
      const ymd =
        row.effective_date_str || normalizeDateString(row.effective_date);
      const createdIso = row.created_at
        ? new Date(row.created_at).toISOString()
        : new Date().toISOString();
      const updatedIso = row.updated_at
        ? new Date(row.updated_at).toISOString()
        : createdIso;

      return {
        id: Number(row.id),
        no: String(idx + 1).padStart(2, '0'),
        title: row.title,
        slug: row.slug,
        description: row.description || '',
        effective_date: ymd,
        effectiveDate: formatYmdToIndoShort(ymd),
        pdf_url: row.pdf_url,
        pdfFile: row.pdf_url,
        status: toUiStatus(row.status),
        created_at: createdIso,
        updated_at: updatedIso,
      };
    });
  } catch (error: unknown) {
    console.error('Error in getTransparansiList:', error);
    return [];
  }
}

export async function createTransparansiAction(
  formData: FormData
): Promise<TransparansiMutationResult> {
  try {
    await ensureTransparansiTable();

    const rawTitle = ((formData.get('title') as string) || '').trim();
    const description = ((formData.get('description') as string) || '').trim();
    const rawEffectiveDate = (
      (formData.get('effective_date') as string) || ''
    ).trim();
    const rawStatus = (
      (formData.get('status') as string) || 'Diterbitkan'
    ).trim();
    const dbStatus = normalizeDbStatus(rawStatus);
    const isDraft = dbStatus === 'DRAFT';
    const title = rawTitle || (isDraft ? '(Draf Dokumen Tanpa Judul)' : '');
    const todayWib = getTodayDateWIB();
    const effectiveDate =
      rawEffectiveDate && /^\d{4}-\d{2}-\d{2}$/.test(rawEffectiveDate)
        ? rawEffectiveDate
        : isDraft
          ? todayWib
          : rawEffectiveDate;

    const pdfFileEntry = formData.get('pdf_file') || formData.get('attachment');
    const existingPdfUrl = (
      ((formData.get('existing_pdf_url') ||
        formData.get('existing_attachment_url')) as string) || ''
    ).trim();

    if (!title) {
      return {
        success: false,
        error: 'Judul dokumen wajib diisi.',
      };
    }

    if (!isDraft && !description) {
      return {
        success: false,
        error: 'Deskripsi program wajib diisi.',
      };
    }

    if (!effectiveDate || !/^\d{4}-\d{2}-\d{2}$/.test(effectiveDate)) {
      return {
        success: false,
        error: 'Tanggal pemberlakuan wajib diisi dengan format yang valid.',
      };
    }

    if (effectiveDate > todayWib) {
      return {
        success: false,
        error:
          'Tanggal pemberlakuan tidak boleh melebihi tanggal hari ini (WIB).',
      };
    }

    const hasPdfFile = pdfFileEntry instanceof File && pdfFileEntry.size > 0;
    if (!isDraft && !hasPdfFile && !existingPdfUrl) {
      return {
        success: false,
        error: 'Berkas dokumen PDF wajib diunggah.',
      };
    }

    let finalPdfUrl = existingPdfUrl;
    if (hasPdfFile) {
      finalPdfUrl = await saveTransparansiPdf(pdfFileEntry);
    }

    const slug = await generateUniqueTransparansiSlug(title);

    const insertResult = await pool.query<{ id: number; slug: string }>(
      `INSERT INTO public.transparansi (
         title,
         slug,
         description,
         effective_date,
         pdf_url,
         status,
         created_at,
         updated_at
       )
       VALUES ($1, $2, $3, $4::date, $5, $6, NOW(), NOW())
       RETURNING id, slug`,
      [title, slug, description, effectiveDate, finalPdfUrl, dbStatus]
    );

    revalidateTransparansiPaths();

    return {
      success: true,
      id: Number(insertResult.rows[0]?.id),
      slug: insertResult.rows[0]?.slug,
      pdf_url: finalPdfUrl,
    };
  } catch (error: unknown) {
    console.error('Error in createTransparansiAction:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan dokumen transparansi baru.',
    };
  }
}

export async function updateTransparansiAction(
  idOrFormData: number | string | FormData,
  maybeFormData?: FormData
): Promise<TransparansiMutationResult> {
  try {
    await ensureTransparansiTable();

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
        error: 'ID dokumen transparansi tidak valid.',
      };
    }

    const existingCheck = await pool.query<TransparansiRow>(
      'SELECT * FROM public.transparansi WHERE id = $1 LIMIT 1',
      [numericId]
    );

    if ((existingCheck.rowCount ?? 0) === 0) {
      return {
        success: false,
        error: 'Data dokumen transparansi tidak ditemukan.',
      };
    }

    const currentRow = existingCheck.rows[0];
    const rawTitle = ((formData.get('title') as string) || '').trim();
    const description = ((formData.get('description') as string) || '').trim();
    const rawEffectiveDate = (
      (formData.get('effective_date') as string) || ''
    ).trim();
    const rawStatus = (
      (formData.get('status') as string) || 'Diterbitkan'
    ).trim();
    const dbStatus = normalizeDbStatus(rawStatus);
    const isDraft = dbStatus === 'DRAFT';
    const title = rawTitle || (isDraft ? '(Draf Dokumen Tanpa Judul)' : '');
    const todayWib = getTodayDateWIB();
    const effectiveDate =
      rawEffectiveDate && /^\d{4}-\d{2}-\d{2}$/.test(rawEffectiveDate)
        ? rawEffectiveDate
        : isDraft
          ? todayWib
          : rawEffectiveDate;

    const pdfFileEntry = formData.get('pdf_file') || formData.get('attachment');
    const existingPdfUrl = (
      ((formData.get('existing_pdf_url') ||
        formData.get('existing_attachment_url')) as string) || ''
    ).trim();

    if (!title) {
      return {
        success: false,
        error: 'Judul dokumen wajib diisi.',
      };
    }

    if (!isDraft && !description) {
      return {
        success: false,
        error: 'Deskripsi program wajib diisi.',
      };
    }

    if (!effectiveDate || !/^\d{4}-\d{2}-\d{2}$/.test(effectiveDate)) {
      return {
        success: false,
        error: 'Tanggal pemberlakuan wajib diisi dengan format yang valid.',
      };
    }

    if (effectiveDate > todayWib) {
      return {
        success: false,
        error:
          'Tanggal pemberlakuan tidak boleh melebihi tanggal hari ini (WIB).',
      };
    }

    const hasPdfFile = pdfFileEntry instanceof File && pdfFileEntry.size > 0;
    if (!isDraft && !hasPdfFile && !existingPdfUrl) {
      return {
        success: false,
        error: 'Berkas dokumen PDF wajib diunggah.',
      };
    }

    let finalPdfUrl = existingPdfUrl;
    if (hasPdfFile) {
      finalPdfUrl = await saveTransparansiPdf(pdfFileEntry);
    }

    const slug =
      title.toLowerCase() !== currentRow.title.toLowerCase()
        ? await generateUniqueTransparansiSlug(title, numericId)
        : currentRow.slug;

    await pool.query(
      `UPDATE public.transparansi
       SET title = $2,
           slug = $3,
           description = $4,
           effective_date = $5::date,
           pdf_url = $6,
           status = $7,
           updated_at = NOW()
       WHERE id = $1`,
      [
        numericId,
        title,
        slug,
        description,
        effectiveDate,
        finalPdfUrl,
        dbStatus,
      ]
    );

    revalidateTransparansiPaths();

    return {
      success: true,
      id: numericId,
      slug,
      pdf_url: finalPdfUrl,
    };
  } catch (error: unknown) {
    console.error('Error in updateTransparansiAction:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal memperbarui dokumen transparansi.',
    };
  }
}

export async function deleteTransparansiAction(
  id: number | string
): Promise<TransparansiMutationResult> {
  try {
    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return {
        success: false,
        error: 'ID dokumen transparansi tidak valid.',
      };
    }

    const deleted = await pool.query(
      'DELETE FROM public.transparansi WHERE id = $1 RETURNING id',
      [numericId]
    );

    if ((deleted.rowCount ?? 0) === 0) {
      return {
        success: false,
        error: 'Data dokumen transparansi tidak ditemukan atau sudah dihapus.',
      };
    }

    revalidateTransparansiPaths();

    return {
      success: true,
      id: numericId,
    };
  } catch (error: unknown) {
    console.error('Error in deleteTransparansiAction:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal menghapus dokumen transparansi.',
    };
  }
}

export async function unpublishTransparansiAction(
  id: number | string
): Promise<TransparansiMutationResult> {
  try {
    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return {
        success: false,
        error: 'ID dokumen transparansi tidak valid.',
      };
    }

    const checkRow = await pool.query<TransparansiRow>(
      'SELECT id, title, status FROM public.transparansi WHERE id = $1 LIMIT 1',
      [numericId]
    );

    if ((checkRow.rowCount ?? 0) === 0) {
      return {
        success: false,
        error: 'Data dokumen transparansi tidak ditemukan.',
      };
    }

    await pool.query(
      `UPDATE public.transparansi
       SET status = 'DRAFT',
           updated_at = NOW()
       WHERE id = $1`,
      [numericId]
    );

    revalidateTransparansiPaths();

    return {
      success: true,
      id: numericId,
    };
  } catch (error: unknown) {
    console.error('Error in unpublishTransparansiAction:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal menurunkan penayangan dokumen transparansi.',
    };
  }
}

