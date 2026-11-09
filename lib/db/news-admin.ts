import pool from './pool';
import type {
  BeritaAdminRow,
  BeritaEditData,
  NewsStatus,
  UserRole,
} from '../types/berita';
import { normalizeImageUrl } from '../utils/formatters';

// 1. Ambil Daftar Berita untuk Tabel Manajemen Admin & Reporter (public.berita)
export async function getAdminNewsList(options?: {
  role?: UserRole;
  authorName?: string;
}): Promise<BeritaAdminRow[]> {
  try {
    const isReporter = options?.role === 'REPORTER';
    const hasAuthorFilter = isReporter && Boolean(options?.authorName?.trim());

    let whereClause = '';
    const params: any[] = [];

    if (isReporter) {
      if (hasAuthorFilter) {
        whereClause = `WHERE b.author_role = 'REPORTER' AND b.author_name = $1`;
        params.push(options!.authorName!.trim());
      } else {
        whereClause = `WHERE b.author_role = 'REPORTER'`;
      }
    } else {
      // Role Admin / Super Admin:
      // Draf milik Reporter yang belum pernah terbit / baru di-unsubmit TIDAK ditampilkan di meja Admin.
      whereClause = `
        WHERE b.status IN ('SUBMITTED', 'PUBLISHED')
           OR (b.status = 'DRAFT' AND (b.author_role IN ('SUPER_ADMIN', 'ADMIN_BERITA') OR b.was_published = TRUE))
      `;
    }

    const query = `
      SELECT
        b.id,
        b.title,
        b.slug,
        b.content,
        b.image_url,
        b.caption,
        b.source_credit,
        b.category_id,
        b.status,
        b.published_at,
        b.created_at,
        b.updated_at,
        b.author_name,
        b.author_role,
        b.was_published,
        COALESCE(c.name, 'Informasi') AS category_name
      FROM public.berita b
      LEFT JOIN public.categories c ON b.category_id = c.id
      ${whereClause}
      ORDER BY COALESCE(b.published_at, b.created_at) DESC, b.id DESC
    `;

    const { rows } = await pool.query(query, params);

    return rows.map((row: any, index: number): BeritaAdminRow => {
      const plainExcerpt = (row.content || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 140);

      const normalizedImg = normalizeImageUrl(row.image_url) ?? null;
      const categoryName = row.category_name || 'Informasi';
      const authorName = row.author_name || 'Diskominfo Kota Sukabumi';
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
        id: row.id,
        no: String(index + 1).padStart(2, '0'),
        title: row.title,
        slug: row.slug,
        excerpt: plainExcerpt,
        content: row.content || '',
        image: normalizedImg,
        image_url: normalizedImg,
        caption: row.caption || null,
        sourceCredit: row.source_credit || null,
        categoryId: row.category_id ?? null,
        categoryName,
        category_name: categoryName,
        categories: [categoryName],
        authorName,
        author_name: authorName,
        authorRole: (row.author_role as UserRole) || 'REPORTER',
        author_role: (row.author_role as UserRole) || 'REPORTER',
        status: (row.status as NewsStatus) || 'DRAFT',
        publishedAt: publishedIso,
        published_at: publishedIso,
        createdAt: createdIso,
        created_at: createdIso,
        updatedAt: updatedIso,
      };
    });
  } catch (error: any) {
    if (error?.code !== '42P01') {
      console.error('Error fetching admin news list:', error);
    }
    return [];
  }
}

// 2. Ambil Data Tunggal Naskah Berdasarkan ID untuk Pre-fill Form Edit (public.berita)
export async function getNewsById(id: number): Promise<BeritaEditData | null> {
  if (!Number.isFinite(id)) return null;

  try {
    const query = `
      SELECT
        b.id,
        b.title,
        b.slug,
        b.content,
        b.category_id,
        b.image_url,
        b.caption,
        b.source_credit,
        b.author_name,
        b.author_role,
        b.status,
        b.published_at,
        COALESCE(c.name, '') AS category_name
      FROM public.berita b
      LEFT JOIN public.categories c ON b.category_id = c.id
      WHERE b.id = $1
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return null;

    const row = rows[0];
    const normalizedImg = normalizeImageUrl(row.image_url) ?? null;
    const publishedIso = row.published_at
      ? new Date(row.published_at).toISOString()
      : null;

    return {
      id: Number(row.id),
      title: row.title || '',
      slug: row.slug || '',
      content: row.content || '',
      category_id: row.category_id ?? null,
      category_name: row.category_name || '',
      image_url: normalizedImg,
      caption: row.caption || null,
      source_credit: row.source_credit || null,
      author_name: row.author_name || 'Diskominfo Kota Sukabumi',
      author_role: (row.author_role as UserRole) || 'REPORTER',
      status: (row.status as NewsStatus) || 'DRAFT',
      published_at: publishedIso,
    };
  } catch (error: any) {
    if (error?.code !== '42P01') {
      console.error('Error fetching news by id:', error);
    }
    return null;
  }
}

