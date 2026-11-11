'use server'

import pool from './db';

export interface AnnouncementItem {
    id: number;
    title: string;
    slug: string;
    date: string;
    image?: string;
}

const DEFAULT_ANNOUNCEMENT_IMAGE = '/images/toa_pengumuman.jpg';

const LEGACY_ANNOUNCEMENTS_CTE = `
  legacy_pengumuman AS (
    SELECT
      p.id::bigint AS id,
      p.post_title::text AS title,
      p.post_name::text AS slug,
      p.post_date::timestamptz AS raw_date,
      '${DEFAULT_ANNOUNCEMENT_IMAGE}'::text AS image,
      'wp'::text AS source
    FROM wp_posts p
    JOIN wp_term_relationships tr ON p.id = tr.object_id
    JOIN wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
    JOIN wp_terms t ON tt.term_id = t.term_id
    WHERE t.slug = 'pengumuman'
      AND p.post_status = 'publish'
  )
`;

function formatAnnouncementDate(value: Date | string): string {
    return new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
    });
}

export interface AnnouncementDetail {
    title: string;
    content: string;
    date: string;
}

// 1. Fungsi ambil semua daftar pengumuman
//    Menggabungkan pengumuman CMS (`public.pengumuman`) dengan arsip `wp_posts`.
//    Jika tabel CMS belum ada (42P01), fallback ke arsip saja.
export async function getAnnouncements(): Promise<AnnouncementItem[]> {
    const unionQuery = `
      WITH native_pengumuman AS (
        SELECT
          pg.id::bigint AS id,
          pg.title::text AS title,
          pg.slug::text AS slug,
          COALESCE(pg.published_at, pg.created_at)::timestamptz AS raw_date,
          COALESCE(NULLIF(TRIM(pg.thumbnail_url), ''), '${DEFAULT_ANNOUNCEMENT_IMAGE}')::text AS image,
          'cms'::text AS source
        FROM public.pengumuman pg
        WHERE UPPER(pg.status) IN ('PUBLISHED', 'PUBLISH')
          AND (pg.published_at IS NULL OR pg.published_at <= NOW())
      ),
      ${LEGACY_ANNOUNCEMENTS_CTE}
      SELECT id, title, slug, raw_date, image, source
      FROM (
        SELECT * FROM native_pengumuman
        UNION ALL
        SELECT * FROM legacy_pengumuman
      ) combined
      ORDER BY raw_date DESC
    `;

    const legacyOnlyQuery = `
      WITH ${LEGACY_ANNOUNCEMENTS_CTE}
      SELECT id, title, slug, raw_date, image, source
      FROM legacy_pengumuman
      ORDER BY raw_date DESC
    `;

    try {
        let rows: any[] = [];
        try {
            const result = await pool.query(unionQuery);
            rows = result.rows;
        } catch (unionError: any) {
            if (unionError?.code !== '42P01') throw unionError;
            const fallback = await pool.query(legacyOnlyQuery);
            rows = fallback.rows;
        }

        // Slug yang sama di CMS dan arsip: pakai versi CMS, karena halaman detail juga memprioritaskannya.
        const cmsSlugs = new Set(
            rows.filter((row) => row.source === 'cms').map((row) => row.slug)
        );
        const seenSlugs = new Set<string>();

        return rows
            .filter((row) => {
                if (row.source !== 'cms' && cmsSlugs.has(row.slug)) return false;
                if (seenSlugs.has(row.slug)) return false;
                seenSlugs.add(row.slug);
                return true;
            })
            .map((row) => ({
                id: Number(row.id),
                title: row.title,
                slug: row.slug,
                date: formatAnnouncementDate(row.raw_date),
                image: row.image || DEFAULT_ANNOUNCEMENT_IMAGE,
            }));
    } catch (error) {
        console.error('Gagal mengambil data pengumuman:', error);
        return [];
    }
}

export interface PengumumanDetail extends AnnouncementDetail {
    status: 'PUBLISHED' | 'DRAFT';
    thumbnailUrl: string | null;
    attachmentUrl: string | null;
}

// Ambil detail dari tabel CMS `public.pengumuman`. Draf hanya ikut jika includeDraft (mode preview admin).
export async function getPengumumanDetailBySlug(
    slug: string,
    includeDraft = false
): Promise<PengumumanDetail | null> {
    try {
        const { rows } = await pool.query(
            `SELECT title, content, status, thumbnail_url, attachment_url, published_at, created_at
       FROM public.pengumuman
       WHERE slug = $1 ${includeDraft ? '' : "AND UPPER(status) IN ('PUBLISHED', 'PUBLISH') AND (published_at IS NULL OR published_at <= NOW())"}
       LIMIT 1`,
            [slug]
        );
        if (rows.length === 0) return null;

        const row = rows[0];
        const upper = String(row.status || '').toUpperCase();
        return {
            title: row.title,
            content: row.content || '',
            status: upper === 'PUBLISHED' || upper === 'PUBLISH' ? 'PUBLISHED' : 'DRAFT',
            thumbnailUrl: row.thumbnail_url || null,
            attachmentUrl: row.attachment_url || null,
            date: new Date(row.published_at || row.created_at).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                timeZone: 'Asia/Jakarta',
            }),
        };
    } catch (error) {
        console.error('Gagal mengambil detail pengumuman CMS:', error);
        return null;
    }
}

// 2. Fungsi ambil 1 detail pengumuman berdasarkan slug
export async function getAnnouncementBySlug(slug: string): Promise<AnnouncementDetail | null> {
    try {
        const query = `
      SELECT 
        post_title AS title,
        post_date AS raw_date,
        post_content AS content
      FROM wp_posts 
      WHERE post_name = $1 AND post_status = 'publish'
      LIMIT 1;
    `;

        const { rows } = await pool.query(query, [slug]);

        if (rows.length === 0) return null;

        const row = rows[0];
        return {
            title: row.title,
            content: row.content,
            date: new Date(row.raw_date).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }),
        };
    } catch (error) {
        console.error('Gagal mengambil detail pengumuman:', error);
        return null;
    }
}