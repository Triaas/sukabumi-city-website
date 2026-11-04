import { Pool } from 'pg';
import type {
  BeritaPublic,
  BeritaDetailPublic,
  BeritaAdminRow,
  NewsStatus,
  UserRole,
} from './types/berita';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'db_smi_temp',
  max: 10,
});

export default pool;

/**
 * Helper normalisasi URL gambar (menghapus domain lama portal.sukabumikota.go.id
 * agar menggunakan path relatif yang seragam).
 */
function normalizeImageUrl(rawUrl: string | null | undefined): string | undefined {
  if (!rawUrl) return undefined;
  return rawUrl
    .replace('https://portal.sukabumikota.go.id', '')
    .replace('http://portal.sukabumikota.go.id', '');
}

/**
 * Helper format tanggal ke Bahasa Indonesia (contoh: "24 Oktober 2026").
 */
function formatIndoDate(dateInput: Date | string): string {
  return new Date(dateInput).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Helper pembersihan daftar kategori (membuang kategori generik 'berita kota').
 */
function extractCategoryList(rawCategory: string | null | undefined): string[] {
  if (!rawCategory) return [];
  return rawCategory
    .split(',')
    .map((c: string) => c.trim())
    .filter((c: string) => c.toLowerCase() !== 'berita kota' && c.length > 0);
}

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
          c.name::text AS category
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
          c.name::text AS category
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
      };
    }
  } catch (nativeError: any) {
    // 42P01 = undefined_table (jika migrasi 001_create_berita_table.sql belum dijalankan di DB)
    if (nativeError?.code !== '42P01') {
      console.warn('Warning querying public.berita in getNewsBySlug, falling back to wp_posts:', nativeError?.message);
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
    console.error("Error fetching news detail:", error);
    return null;
  }
}

// 2. Ambil Semua Berita (Untuk Halaman /berita & Landing Page)
//    Menggunakan UNION ALL antara tabel mandiri `public.berita` dan arsip `wp_posts`.
export async function getAllNews(): Promise<BeritaPublic[]> {
  // Query gabungan (UNION ALL):
  // - Bagian 1: Berita baru dari `public.berita` yang berstatus 'PUBLISHED' dan sudah memasuki jadwal terbit.
  // - Bagian 2: Arsip berita lama dari `wp_posts` yang berstatus 'publish'.
  // Seluruh kolom di-CAST secara eksplisit ke tipe `text` dan `timestamptz` agar skema kedua sumber selaras.
  const unionQuery = `
    SELECT
      title,
      slug,
      date,
      featured_image,
      category
    FROM (
      -- Sumber 1: Tabel mandiri baru (public.berita)
      SELECT
        b.title::text AS title,
        b.slug::text AS slug,
        COALESCE(b.published_at, b.created_at)::timestamptz AS date,
        b.image_url::text AS featured_image,
        COALESCE(c.name, 'Informasi')::text AS category
      FROM public.berita b
      LEFT JOIN public.categories c ON b.category_id = c.id
      WHERE b.status = 'PUBLISHED'
        AND (b.published_at IS NULL OR b.published_at <= NOW())

      UNION ALL

      -- Sumber 2: Tabel arsip lama WordPress (wp_posts)
      SELECT
        p.post_title::text AS title,
        p.post_name::text AS slug,
        p.post_date::timestamptz AS date,
        (SELECT guid FROM wp_posts WHERE id::text = (
            SELECT meta_value FROM wp_postmeta WHERE post_id = p.id AND meta_key = '_thumbnail_id' LIMIT 1
        ) LIMIT 1)::text AS featured_image,
        (SELECT STRING_AGG(t.name, ', ')
         FROM wp_terms t
         INNER JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
         INNER JOIN wp_term_relationships tr ON tr.term_taxonomy_id = tt.term_taxonomy_id
         WHERE tr.object_id = p.id AND tt.taxonomy = 'category')::text AS category
      FROM wp_posts p
      WHERE p.post_type = 'post'
        AND p.post_status = 'publish'
    ) combined_news
    ORDER BY date DESC
  `;

  // Query fallback ke wp_posts saja apabila tabel public.berita belum dieksekusi di DB
  const wpOnlyQuery = `
    SELECT 
      p.post_title AS title,
      p.post_name AS slug,
      p.post_date AS date,
      (SELECT guid FROM wp_posts WHERE id::text = (
          SELECT meta_value FROM wp_postmeta WHERE post_id = p.id AND meta_key = '_thumbnail_id' LIMIT 1
      ) LIMIT 1) AS featured_image,
      (SELECT STRING_AGG(t.name, ', ') 
       FROM wp_terms t 
       INNER JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id 
       INNER JOIN wp_term_relationships tr ON tr.term_taxonomy_id = tt.term_taxonomy_id 
       WHERE tr.object_id = p.id AND tt.taxonomy = 'category') AS category
    FROM wp_posts p
    WHERE p.post_type = 'post' 
      AND p.post_status = 'publish'
    ORDER BY p.post_date DESC
  `;

  try {
    let rows: any[] = [];
    try {
      const result = await pool.query(unionQuery);
      rows = result.rows;
    } catch (unionError: any) {
      if (unionError?.code === '42P01') {
        const fallbackResult = await pool.query(wpOnlyQuery);
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
    console.error("Error fetching news list:", error);
    return [];
  }
}

// 3. Ambil Berita Terkait Berdasarkan Kategori
export async function getRelatedNews(
  category: string,
  currentSlug: string,
  limit: number = 4
): Promise<BeritaPublic[]> {
  // Gabungkan kandidat berita terkait dari public.berita dan wp_posts via UNION ALL
  const unionRelatedQuery = `
    SELECT * FROM (
      -- Sumber 1: Tabel mandiri baru (public.berita)
      SELECT
        b.title::text AS title,
        b.slug::text AS slug,
        COALESCE(b.published_at, b.created_at)::timestamptz AS date,
        b.image_url::text AS featured_image,
        COALESCE(c.name, 'Informasi')::text AS category
      FROM public.berita b
      LEFT JOIN public.categories c ON b.category_id = c.id
      WHERE b.status = 'PUBLISHED'
        AND (b.published_at IS NULL OR b.published_at <= NOW())
        AND b.slug != $1

      UNION ALL

      -- Sumber 2: Tabel arsip lama WordPress (wp_posts)
      SELECT 
        p.post_title::text AS title,
        p.post_name::text AS slug,
        p.post_date::timestamptz AS date,
        (SELECT guid FROM wp_posts WHERE id::text = (
            SELECT meta_value FROM wp_postmeta WHERE post_id = p.id AND meta_key = '_thumbnail_id' LIMIT 1
        ) LIMIT 1)::text AS featured_image,
        (SELECT STRING_AGG(t.name, ', ') 
         FROM wp_terms t 
         INNER JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id 
         INNER JOIN wp_term_relationships tr ON tr.term_taxonomy_id = tt.term_taxonomy_id 
         WHERE tr.object_id = p.id AND tt.taxonomy = 'category')::text AS category
      FROM wp_posts p
      WHERE p.post_type = 'post' 
        AND p.post_status = 'publish'
        AND p.post_name != $1
    ) sub
    WHERE sub.category ILIKE $2
    ORDER BY sub.date DESC
    LIMIT $3
  `;

  const wpOnlyRelatedQuery = `
    SELECT * FROM (
      SELECT 
        p.post_title AS title,
        p.post_name AS slug,
        p.post_date AS date,
        (SELECT guid FROM wp_posts WHERE id::text = (
            SELECT meta_value FROM wp_postmeta WHERE post_id = p.id AND meta_key = '_thumbnail_id' LIMIT 1
        ) LIMIT 1) AS featured_image,
        (SELECT STRING_AGG(t.name, ', ') 
         FROM wp_terms t 
         INNER JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id 
         INNER JOIN wp_term_relationships tr ON tr.term_taxonomy_id = tt.term_taxonomy_id 
         WHERE tr.object_id = p.id AND tt.taxonomy = 'category') AS category
      FROM wp_posts p
      WHERE p.post_type = 'post' 
        AND p.post_status = 'publish'
        AND p.post_name != $1
    ) sub
    WHERE sub.category ILIKE $2
    ORDER BY sub.date DESC
    LIMIT $3
  `;

  try {
    let rows: any[] = [];
    try {
      const result = await pool.query(unionRelatedQuery, [currentSlug, `%${category}%`, limit]);
      rows = result.rows;
    } catch (unionError: any) {
      if (unionError?.code === '42P01') {
        const fallbackResult = await pool.query(wpOnlyRelatedQuery, [currentSlug, `%${category}%`, limit]);
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
    console.error("Error fetching related news:", error);
    return [];
  }
}

// 4. Ambil Data Event Slider dari Tabel event_banners
export async function getEventBanners() {
  try {
    const query = `
      SELECT id, title, image_url AS image, target_url AS href
      FROM public.event_banners
      WHERE is_active = TRUE
      ORDER BY sort_order ASC, id ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error fetching event banners:", error);
    return [];
  }
}

// 5. Ambil Data Transparansi Dokumen dari Tabel transparansi_dokumen
export async function getTransparansiDokumen() {
  try {
    const query = `
      SELECT id, title, type, category, description, effective_date, file_url AS "pdfUrl"
      FROM public.transparansi_dokumen
      ORDER BY id ASC
    `;
    const { rows } = await pool.query(query);

    return rows.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      type: doc.type || 'PDF',
      category: doc.category || 'Transparansi Pengelolaan Keuangan Daerah',
      description: doc.description || doc.title,
      date: doc.effective_date
        ? new Date(doc.effective_date).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
        : '-',
      pdfUrl: doc.pdfUrl,
    }));
  } catch (error) {
    console.error("Error fetching transparansi dokumen:", error);
    return [];
  }
}

// 6. Helper Migrasi Otomatis Kolom Penanda Visibilitas (`was_published` & `author_role`)
let visibilityColumnsEnsured = false;

export async function ensureBeritaVisibilityColumns(): Promise<void> {
  if (visibilityColumnsEnsured) return;
  try {
    await pool.query(`
      ALTER TABLE public.berita ADD COLUMN IF NOT EXISTS was_published BOOLEAN DEFAULT FALSE;
      ALTER TABLE public.berita ADD COLUMN IF NOT EXISTS author_role VARCHAR(50) DEFAULT 'REPORTER';
      UPDATE public.berita SET was_published = TRUE WHERE status = 'PUBLISHED' AND (was_published IS NULL OR was_published = FALSE);
    `);
    visibilityColumnsEnsured = true;
  } catch (err: any) {
    if (err?.code !== '42P01') {
      console.warn('Warning ensuring berita visibility columns:', err?.message);
    }
  }
}

// 7. Ambil Daftar Berita untuk Tabel Manajemen Admin & Reporter (public.berita)
export async function getAdminNewsList(options?: {
  role?: UserRole;
  authorName?: string;
}): Promise<BeritaAdminRow[]> {
  try {
    await ensureBeritaVisibilityColumns();

    const isReporter = options?.role === 'REPORTER';
    const hasAuthorFilter = isReporter && Boolean(options?.authorName?.trim());

    let whereClause = '';
    const params: any[] = [];

    if (isReporter) {
      if (hasAuthorFilter) {
        whereClause = 'WHERE b.author_name = $1';
        params.push(options!.authorName!.trim());
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

