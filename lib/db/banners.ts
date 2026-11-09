import pool from './pool';

// Ambil Data Event Slider dari Tabel event_banners
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
    console.error('Error fetching event banners:', error);
    return [];
  }
}

