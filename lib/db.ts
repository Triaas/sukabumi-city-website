import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'db_smi_temp',
  max: 10,
});

export default pool;

// 1. Ambil Detail Berita Berdasarkan Slug
export async function getNewsBySlug(slug: string) {
  try {
    const query = `
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

    const { rows } = await pool.query(query, [slug]);

    if (rows.length === 0) return null;

    const news = rows[0];

    let imageUrl = news.featured_image || null;
    if (imageUrl) {
      imageUrl = imageUrl.replace('https://portal.sukabumikota.go.id', '');
      imageUrl = imageUrl.replace('http://portal.sukabumikota.go.id', '');
    }

    const formattedDate = new Date(news.date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    let categories: string[] = [];
    if (news.category) {
      categories = news.category
        .split(',')
        .map((c: string) => c.trim())
        .filter((c: string) => c.toLowerCase() !== 'berita kota' && c.length > 0);
    }

    return {
      title: news.title,
      content: news.content,
      date: formattedDate,
      image: imageUrl,
      author: 'Diskominfo Kota Sukabumi',
      categories,
    };
  } catch (error) {
    console.error("Error fetching news detail:", error);
    return null;
  }
}

// 2. Ambil Semua Berita (Untuk Halaman /berita)
export async function getAllNews() {
  try {
    const query = `
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

    const { rows } = await pool.query(query);

    return rows.map((news: any) => {
      let imageUrl = news.featured_image || null;
      if (imageUrl) {
        imageUrl = imageUrl.replace('https://portal.sukabumikota.go.id', '');
        imageUrl = imageUrl.replace('http://portal.sukabumikota.go.id', '');
      }

      let finalCategory = 'Informasi';
      if (news.category) {
        const categoryArray = news.category.split(',').map((cat: string) => cat.trim());
        const filteredCategories = categoryArray.filter((cat: string) => cat.toLowerCase() !== 'berita kota');

        if (filteredCategories.length > 0) {
          finalCategory = filteredCategories.join(', ');
        }
      }

      return {
        title: news.title,
        slug: news.slug,
        category: finalCategory,
        date: new Date(news.date).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        image: imageUrl
      };
    });
  } catch (error) {
    console.error("Error fetching news list:", error);
    return [];
  }
}

// 3. Ambil Berita Terkait Berdasarkan Kategori
export async function getRelatedNews(category: string, currentSlug: string, limit: number = 4) {
  try {
    const query = `
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

    const { rows } = await pool.query(query, [currentSlug, `%${category}%`, limit]);

    return rows.map((news: any) => {
      let imageUrl = news.featured_image || null;
      if (imageUrl) {
        imageUrl = imageUrl.replace('https://portal.sukabumikota.go.id', '');
        imageUrl = imageUrl.replace('http://portal.sukabumikota.go.id', '');
      }

      let finalCategory = 'Informasi';
      if (news.category) {
        const categoryArray = news.category.split(',').map((cat: string) => cat.trim());
        const filteredCategories = categoryArray.filter((cat: string) => cat.toLowerCase() !== 'berita kota');

        if (filteredCategories.length > 0) {
          finalCategory = filteredCategories.join(', ');
        }
      }

      return {
        title: news.title,
        slug: news.slug,
        category: finalCategory,
        date: new Date(news.date).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        image: imageUrl
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