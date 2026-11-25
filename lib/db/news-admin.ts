import pool from './pool';
import type {
  BeritaAdminRow,
  BeritaEditData,
  NewsStatus,
  UserRole,
} from '../types/berita';
import { normalizeImageUrl } from '../utils/formatters';
import { ensureBeritaCategoriesTable } from '../berita/category';

export async function getAdminNewsList(options?: {
  role?: UserRole;
  authorId?: number;
  authorName?: string;
}): Promise<BeritaAdminRow[]> {
  try {
    await ensureBeritaCategoriesTable();

    const isReporter = options?.role === 'REPORTER';
    const hasAuthorId =
      isReporter && typeof options?.authorId === 'number' && Number.isFinite(options.authorId);
    const trimmedAuthorName = (options?.authorName || '').trim();

    let whereClause = '';
    const params: unknown[] = [];

    if (isReporter) {
      if (hasAuthorId) {
        params.push(options!.authorId!);
        if (trimmedAuthorName) {
          params.push(trimmedAuthorName);
          whereClause = `
            WHERE (
              b.author_id = $1
              OR (
                b.author_id IS NULL
                AND b.author_role = 'REPORTER'
                AND LOWER(b.author_name) = LOWER($2)
              )
            )
          `;
        } else {
          whereClause = `WHERE b.author_id = $1`;
        }
      } else if (trimmedAuthorName) {
        params.push(trimmedAuthorName);
        whereClause = `WHERE b.author_role = 'REPORTER' AND LOWER(b.author_name) = LOWER($1)`;
      } else {
        whereClause = `WHERE b.author_role = 'REPORTER'`;
      }
    } else {
      whereClause = `
        WHERE b.status IN ('SUBMITTED', 'PUBLISHED')
           OR (b.status = 'DRAFT' AND (b.author_role IN ('SUPER_ADMIN', 'ADMIN_BERITA') OR b.was_published = TRUE))
      `;
    }

    const query = `
      SELECT
        b.id,
        b.uuid,
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
        b.author_id,
        b.author_name,
        b.author_role,
        b.was_published,
        COALESCE(
          (SELECT STRING_AGG(c2.name, ', ' ORDER BY bc.position ASC)
           FROM public.berita_categories bc
           INNER JOIN public.categories c2 ON bc.category_id = c2.id
           WHERE bc.berita_id = b.id),
          c.name,
          'Informasi'
        ) AS category_name
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
      const categoryList = categoryName
        .split(',')
        .map((c: string) => c.trim())
        .filter(Boolean);
      const authorName = row.author_name || 'Diskominfo Kota Sukabumi';
      const authorId =
        row.author_id !== null && row.author_id !== undefined
          ? Number(row.author_id)
          : null;
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
        uuid: String(row.uuid || ''),
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
        categories: categoryList.length > 0 ? categoryList : [categoryName],
        authorId,
        author_id: authorId,
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

export async function getNewsById(id: number): Promise<BeritaEditData | null> {
  if (!Number.isFinite(id)) return null;

  try {
    await ensureBeritaCategoriesTable();

    const query = `
      SELECT
        b.id,
        b.uuid,
        b.title,
        b.slug,
        b.content,
        b.category_id,
        b.image_url,
        b.caption,
        b.source_credit,
        b.author_id,
        b.author_name,
        b.author_role,
        b.status,
        b.published_at,
        COALESCE(
          (SELECT STRING_AGG(c2.name, ', ' ORDER BY bc.position ASC)
           FROM public.berita_categories bc
           INNER JOIN public.categories c2 ON bc.category_id = c2.id
           WHERE bc.berita_id = b.id),
          c.name,
          ''
        ) AS category_name
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
    const categoryNameStr = (row.category_name || '').trim();
    const categories = categoryNameStr
      .split(',')
      .map((c: string) => c.trim())
      .filter(Boolean);

    return {
      id: Number(row.id),
      uuid: String(row.uuid || ''),
      title: row.title || '',
      slug: row.slug || '',
      content: row.content || '',
      category_id: row.category_id ?? null,
      category_name: categoryNameStr,
      categories,
      image_url: normalizedImg,
      caption: row.caption || null,
      source_credit: row.source_credit || null,
      author_id:
        row.author_id !== null && row.author_id !== undefined
          ? Number(row.author_id)
          : null,
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

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getNewsByUuid(
  uuid: string,
  options?: { role?: UserRole | string; authorId?: number; authorName?: string }
): Promise<BeritaEditData | null> {
  const trimmedUuid = (uuid || '').trim();
  if (!UUID_REGEX.test(trimmedUuid)) return null;

  try {
    await ensureBeritaCategoriesTable();

    const isReporter = options?.role === 'REPORTER';
    const params: unknown[] = [trimmedUuid];
    let ownershipFilter = '';

    if (isReporter) {
      const hasAuthorId =
        typeof options?.authorId === 'number' && Number.isFinite(options.authorId);
      const authorName = (options?.authorName || '').trim();

      if (hasAuthorId) {
        params.push(options!.authorId!);
        if (authorName) {
          params.push(authorName);
          ownershipFilter = `
            AND (
              b.author_id = $2
              OR (
                b.author_id IS NULL
                AND b.author_role = 'REPORTER'
                AND LOWER(b.author_name) = LOWER($3)
              )
            )
          `;
        } else {
          ownershipFilter = `AND b.author_id = $2`;
        }
      } else if (authorName) {
        params.push(authorName);
        ownershipFilter = `AND b.author_role = 'REPORTER' AND LOWER(b.author_name) = LOWER($2)`;
      } else {
        return null;
      }
    }

    const query = `
      SELECT
        b.id,
        b.uuid,
        b.title,
        b.slug,
        b.content,
        b.category_id,
        b.image_url,
        b.caption,
        b.source_credit,
        b.author_id,
        b.author_name,
        b.author_role,
        b.status,
        b.published_at,
        COALESCE(
          (SELECT STRING_AGG(c2.name, ', ' ORDER BY bc.position ASC)
           FROM public.berita_categories bc
           INNER JOIN public.categories c2 ON bc.category_id = c2.id
           WHERE bc.berita_id = b.id),
          c.name,
          ''
        ) AS category_name
      FROM public.berita b
      LEFT JOIN public.categories c ON b.category_id = c.id
      WHERE b.uuid = $1::uuid
      ${ownershipFilter}
      LIMIT 1
    `;

    const { rows } = await pool.query(query, params);
    if (rows.length === 0) return null;

    const row = rows[0];
    const normalizedImg = normalizeImageUrl(row.image_url) ?? null;
    const publishedIso = row.published_at
      ? new Date(row.published_at).toISOString()
      : null;
    const categoryNameStr = (row.category_name || '').trim();
    const categories = categoryNameStr
      .split(',')
      .map((c: string) => c.trim())
      .filter(Boolean);

    return {
      id: Number(row.id),
      uuid: String(row.uuid || ''),
      title: row.title || '',
      slug: row.slug || '',
      content: row.content || '',
      category_id: row.category_id ?? null,
      category_name: categoryNameStr,
      categories,
      image_url: normalizedImg,
      caption: row.caption || null,
      source_credit: row.source_credit || null,
      author_id:
        row.author_id !== null && row.author_id !== undefined
          ? Number(row.author_id)
          : null,
      author_name: row.author_name || 'Diskominfo Kota Sukabumi',
      author_role: (row.author_role as UserRole) || 'REPORTER',
      status: (row.status as NewsStatus) || 'DRAFT',
      published_at: publishedIso,
    };
  } catch (error: any) {
    if (error?.code !== '42P01') {
      console.error('Error fetching news by uuid:', error);
    }
    return null;
  }
}
