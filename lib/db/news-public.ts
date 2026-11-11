import pool from './pool';
import type { BeritaPublic, BeritaDetailPublic } from '../types/berita';
import {
  normalizeImageUrl,
  formatIndoDate,
  extractCategoryList,
} from '../utils/formatters';
import { ensureBeritaCategoriesTable } from '../berita/category';

// 1. Ambil Detail Berita Berdasarkan Slug
//    Alur: Cari di tabel mandiri `public.berita` terlebih dahulu;
//          jika tidak ditemukan (atau tabel belum dimigrasikan), fallback ke `wp_posts`.
//          Jika `isPreview === true`, syarat status PUBLISHED & published_at <= NOW() diabaikan.
export async function getNewsBySlug(
  slug: string,
  isPreview: boolean = false
): Promise<BeritaDetailPublic | null> {
  // Tahap A: Coba ambil dari tabel baru `public.berita`
  try {
    await ensureBeritaCategoriesTable();

    const nativeQuery = isPreview
      ? `
        SELECT 
          b.title::text AS title,
          b.content::text AS content,
          COALESCE(b.published_at, b.created_at) AS date,
          b.image_url::text AS featured_image,
          b.author_name::text AS author_name,
          b.caption::text AS caption,
          b.source_credit::text AS source_credit,
          b.status::text AS status,
          COALESCE(
            (SELECT STRING_AGG(c2.name, ', ' ORDER BY bc.position ASC)
             FROM public.berita_categories bc
             INNER JOIN public.categories c2 ON bc.category_id = c2.id
             WHERE bc.berita_id = b.id),
            c.name::text
          ) AS category
        FROM public.berita b
        LEFT JOIN public.categories c ON b.category_id = c.id
        WHERE b.slug = $1
        LIMIT 1
      `
      : `
        SELECT 
          b.title::text AS title,
          b.content::text AS content,
          COALESCE(b.published_at, b.created_at) AS date,
          b.image_url::text AS featured_image,
          b.author_name::text AS author_name,
          b.caption::text AS caption,
          b.source_credit::text AS source_credit,
          b.status::text AS status,
          COALESCE(
            (SELECT STRING_AGG(c2.name, ', ' ORDER BY bc.position ASC)
             FROM public.berita_categories bc
             INNER JOIN public.categories c2 ON bc.category_id = c2.id
             WHERE bc.berita_id = b.id),
            c.name::text
          ) AS category
        FROM public.berita b
        LEFT JOIN public.categories c ON b.category_id = c.id
        WHERE b.slug = $1
          AND b.status = 'PUBLISHED'
          AND (b.published_at IS NULL OR b.published_at <= NOW())
        LIMIT 1
      `;

    const { rows: nativeRows } = await pool.query(nativeQuery, [slug]);

    if (nativeRows.length > 0) {
      const news = nativeRows[0];
      const categories = extractCategoryList(news.category);

      return {
        title: news.title,
        content: news.content,
        date: formatIndoDate(news.date),
        image: normalizeImageUrl(news.featured_image),
        author: news.author_name || 'Diskominfo Kota Sukabumi',
        categories,
        caption: news.caption || null,
        sourceCredit: news.source_credit || null,
        status: news.status || null,
      };
    }
  } catch (nativeError: any) {
    // 42P01 = undefined_table (jika migrasi 001_create_berita_table.sql belum dijalankan di DB)
    if (nativeError?.code !== '42P01') {
      console.warn(
        'Warning querying public.berita in getNewsBySlug, falling back to wp_posts:',
        nativeError?.message
      );
    }
  }

  // Tahap B: Fallback ke arsip lama `wp_posts`
  try {
    const wpQuery = `
      SELECT 
        p.post_title AS title,
        p.post_content AS content,
        p.post_date AS date,
        (SELECT guid FROM wp_posts WHERE id::text = (
            SELECT meta_value FROM wp_postmeta WHERE post_id = p.id AND meta_key = '_thumbnail_id' LIMIT 1
        ) LIMIT 1) AS featured_image,
        (SELECT STRING_AGG(t.name, ',')
         FROM wp_terms t
         INNER JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
         INNER JOIN wp_term_relationships tr ON tr.term_taxonomy_id = tt.term_taxonomy_id
         WHERE tr.object_id = p.id AND tt.taxonomy = 'category') AS category
      FROM wp_posts p
      WHERE p.post_type = 'post' 
        AND p.post_status = 'publish' 
        AND p.post_name = $1
      LIMIT 1
    `;

    const { rows } = await pool.query(wpQuery, [slug]);

    if (rows.length === 0) return null;

    const news = rows[0];
    const categories = extractCategoryList(news.category);

    return {
      title: news.title,
      content: news.content,
      date: formatIndoDate(news.date),
      image: normalizeImageUrl(news.featured_image),
      author: 'Diskominfo Kota Sukabumi',
      categories,
    };
  } catch (error) {
    console.error('Error fetching news detail:', error);
    return null;
  }
}

// 2. Ambil Semua Berita (Untuk Halaman /berita & Landing Page)
//    Menggunakan UNION ALL antara tabel mandiri `public.berita` dan arsip `wp_posts`
//    dengan pembatasan jumlah baris (`limit = 100`) melalui CTE agar sub-kueri metadata
//    hanya dieksekusi pada baris teratas yang relevan.
export async function getAllNews(limit: number = 100): Promise<BeritaPublic[]> {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 100;

  const unionQuery = `
    WITH recent_wp_posts AS (
      SELECT p.id, p.post_title, p.post_name, p.post_date
      FROM wp_posts p
      WHERE p.post_type = 'post'
        AND p.post_status = 'publish'
      ORDER BY p.post_date DESC
      LIMIT $1
    ),
    recent_native_berita AS (
      SELECT
        b.title::text AS title,
        b.slug::text AS slug,
        COALESCE(b.published_at, b.created_at)::timestamptz AS date,
        b.image_url::text AS featured_image,
        COALESCE(
          (SELECT STRING_AGG(c2.name, ', ' ORDER BY bc.position ASC)
           FROM public.berita_categories bc
           INNER JOIN public.categories c2 ON bc.category_id = c2.id
           WHERE bc.berita_id = b.id),
          c.name,
          'Informasi'
        )::text AS category
      FROM public.berita b
      LEFT JOIN public.categories c ON b.category_id = c.id
      WHERE b.status = 'PUBLISHED'
        AND (b.published_at IS NULL OR b.published_at <= NOW())
      ORDER BY COALESCE(b.published_at, b.created_at) DESC
      LIMIT $1
    )
    SELECT
      title,
      slug,
      date,
      featured_image,
      category
    FROM (
      SELECT title, slug, date, featured_image, category
      FROM recent_native_berita

      UNION ALL

      SELECT
        wp.post_title::text AS title,
        wp.post_name::text AS slug,
        wp.post_date::timestamptz AS date,
        (SELECT guid FROM wp_posts WHERE id::text = (
            SELECT meta_value FROM wp_postmeta WHERE post_id = wp.id AND meta_key = '_thumbnail_id' LIMIT 1
        ) LIMIT 1)::text AS featured_image,
        (SELECT STRING_AGG(t.name, ', ')
         FROM wp_terms t
         INNER JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
         INNER JOIN wp_term_relationships tr ON tr.term_taxonomy_id = tt.term_taxonomy_id
         WHERE tr.object_id = wp.id AND tt.taxonomy = 'category')::text AS category
      FROM recent_wp_posts wp
    ) combined_news
    ORDER BY date DESC
    LIMIT $1
  `;

  // Query fallback ke wp_posts saja apabila tabel public.berita belum dieksekusi di DB
  const wpOnlyQuery = `
    WITH recent_wp_posts AS (
      SELECT p.id, p.post_title, p.post_name, p.post_date
      FROM wp_posts p
      WHERE p.post_type = 'post'
        AND p.post_status = 'publish'
      ORDER BY p.post_date DESC
      LIMIT $1
    )
    SELECT 
      wp.post_title AS title,
      wp.post_name AS slug,
      wp.post_date AS date,
      (SELECT guid FROM wp_posts WHERE id::text = (
          SELECT meta_value FROM wp_postmeta WHERE post_id = wp.id AND meta_key = '_thumbnail_id' LIMIT 1
      ) LIMIT 1) AS featured_image,
      (SELECT STRING_AGG(t.name, ', ') 
       FROM wp_terms t 
       INNER JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id 
       INNER JOIN wp_term_relationships tr ON tr.term_taxonomy_id = tt.term_taxonomy_id 
       WHERE tr.object_id = wp.id AND tt.taxonomy = 'category') AS category
    FROM recent_wp_posts wp
    ORDER BY wp.post_date DESC
  `;

  try {
    await ensureBeritaCategoriesTable();
    let rows: any[] = [];
    try {
      const result = await pool.query(unionQuery, [safeLimit]);
      rows = result.rows;
    } catch (unionError: any) {
      if (unionError?.code === '42P01') {
        const fallbackResult = await pool.query(wpOnlyQuery, [safeLimit]);
        rows = fallbackResult.rows;
      } else {
        throw unionError;
      }
    }

    return rows.map((news: any): BeritaPublic => {
      const filteredCategories = extractCategoryList(news.category);
      const finalCategory =
        filteredCategories.length > 0 ? filteredCategories.join(', ') : 'Informasi';

      return {
        title: news.title,
        slug: news.slug,
        category: finalCategory,
        date: formatIndoDate(news.date),
        image: normalizeImageUrl(news.featured_image),
      };
    });
  } catch (error) {
    console.error('Error fetching news list:', error);
    return [];
  }
}

// 3. Ambil Berita Terkait Berdasarkan Kategori
//    Mendorong filter kategori dan LIMIT ke dalam masing-masing CTE sebelum UNION ALL
//    dan sebelum mengeksekusi sub-kueri metadata gambar/kategori WordPress.
export async function getRelatedNews(
  category: string,
  currentSlug: string,
  limit: number = 4
): Promise<BeritaPublic[]> {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 4;

  const unionRelatedQuery = `
    WITH matched_native AS (
      SELECT
        b.title::text AS title,
        b.slug::text AS slug,
        COALESCE(b.published_at, b.created_at)::timestamptz AS date,
        b.image_url::text AS featured_image,
        COALESCE(
          (SELECT STRING_AGG(c2.name, ', ' ORDER BY bc.position ASC)
           FROM public.berita_categories bc
           INNER JOIN public.categories c2 ON bc.category_id = c2.id
           WHERE bc.berita_id = b.id),
          c.name,
          'Informasi'
        )::text AS category
      FROM public.berita b
      LEFT JOIN public.categories c ON b.category_id = c.id
      WHERE b.status = 'PUBLISHED'
        AND (b.published_at IS NULL OR b.published_at <= NOW())
        AND b.slug != $1
        AND (
          COALESCE(c.name, 'Informasi') ILIKE $2
          OR EXISTS (
            SELECT 1
            FROM public.berita_categories bc
            INNER JOIN public.categories c2 ON bc.category_id = c2.id
            WHERE bc.berita_id = b.id
              AND c2.name ILIKE $2
          )
        )
      ORDER BY COALESCE(b.published_at, b.created_at) DESC
      LIMIT $3
    ),
    matched_wp_posts AS (
      SELECT p.id, p.post_title, p.post_name, p.post_date
      FROM wp_posts p
      WHERE p.post_type = 'post'
        AND p.post_status = 'publish'
        AND p.post_name != $1
        AND EXISTS (
          SELECT 1
          FROM wp_term_relationships tr
          INNER JOIN wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
          INNER JOIN wp_terms t ON tt.term_id = t.term_id
          WHERE tr.object_id = p.id
            AND tt.taxonomy = 'category'
            AND t.name ILIKE $2
        )
      ORDER BY p.post_date DESC
      LIMIT $3
    )
    SELECT title, slug, date, featured_image, category
    FROM (
      SELECT title, slug, date, featured_image, category
      FROM matched_native

      UNION ALL

      SELECT
        wp.post_title::text AS title,
        wp.post_name::text AS slug,
        wp.post_date::timestamptz AS date,
        (SELECT guid FROM wp_posts WHERE id::text = (
            SELECT meta_value FROM wp_postmeta WHERE post_id = wp.id AND meta_key = '_thumbnail_id' LIMIT 1
        ) LIMIT 1)::text AS featured_image,
        (SELECT STRING_AGG(t.name, ', ')
         FROM wp_terms t
         INNER JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
         INNER JOIN wp_term_relationships tr ON tr.term_taxonomy_id = tt.term_taxonomy_id
         WHERE tr.object_id = wp.id AND tt.taxonomy = 'category')::text AS category
      FROM matched_wp_posts wp
    ) sub
    ORDER BY sub.date DESC
    LIMIT $3
  `;

  const wpOnlyRelatedQuery = `
    WITH matched_wp_posts AS (
      SELECT p.id, p.post_title, p.post_name, p.post_date
      FROM wp_posts p
      WHERE p.post_type = 'post'
        AND p.post_status = 'publish'
        AND p.post_name != $1
        AND EXISTS (
          SELECT 1
          FROM wp_term_relationships tr
          INNER JOIN wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
          INNER JOIN wp_terms t ON tt.term_id = t.term_id
          WHERE tr.object_id = p.id
            AND tt.taxonomy = 'category'
            AND t.name ILIKE $2
        )
      ORDER BY p.post_date DESC
      LIMIT $3
    )
    SELECT 
      wp.post_title AS title,
      wp.post_name AS slug,
      wp.post_date AS date,
      (SELECT guid FROM wp_posts WHERE id::text = (
          SELECT meta_value FROM wp_postmeta WHERE post_id = wp.id AND meta_key = '_thumbnail_id' LIMIT 1
      ) LIMIT 1) AS featured_image,
      (SELECT STRING_AGG(t.name, ', ') 
       FROM wp_terms t 
       INNER JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id 
       INNER JOIN wp_term_relationships tr ON tr.term_taxonomy_id = tt.term_taxonomy_id 
       WHERE tr.object_id = wp.id AND tt.taxonomy = 'category') AS category
    FROM matched_wp_posts wp
    ORDER BY wp.post_date DESC
    LIMIT $3
  `;

  try {
    await ensureBeritaCategoriesTable();
    let rows: any[] = [];
    try {
      const result = await pool.query(unionRelatedQuery, [
        currentSlug,
        `%${category}%`,
        safeLimit,
      ]);
      rows = result.rows;
    } catch (unionError: any) {
      if (unionError?.code === '42P01') {
        const fallbackResult = await pool.query(wpOnlyRelatedQuery, [
          currentSlug,
          `%${category}%`,
          safeLimit,
        ]);
        rows = fallbackResult.rows;
      } else {
        throw unionError;
      }
    }

    return rows.map((news: any): BeritaPublic => {
      const filteredCategories = extractCategoryList(news.category);
      const finalCategory =
        filteredCategories.length > 0 ? filteredCategories.join(', ') : 'Informasi';

      return {
        title: news.title,
        slug: news.slug,
        category: finalCategory,
        date: formatIndoDate(news.date),
        image: normalizeImageUrl(news.featured_image),
      };
    });
  } catch (error) {
    console.error('Error fetching related news:', error);
    return [];
  }
}

