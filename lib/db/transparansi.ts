import pool from './pool';

export interface PublicTransparansiDoc {
  id: number;
  title: string;
  slug: string;
  type: string;
  category: string;
  description: string;
  date: string;
  pdfUrl: string | null;
}

function formatEffectiveDateIndo(
  value: Date | string | null | undefined
): string {
  if (!value) return '-';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    const parsed = new Date(`${value.trim()}T00:00:00+07:00`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
      });
    }
  }
  const dateObj = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dateObj.getTime())) return '-';
  return dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });
}

export async function getTransparansiDokumen(): Promise<PublicTransparansiDoc[]> {
  try {
    const query = `
      SELECT
        id,
        title,
        slug,
        description,
        TO_CHAR(effective_date, 'YYYY-MM-DD') AS effective_date_str,
        effective_date,
        pdf_url AS "pdfUrl",
        created_at
      FROM public.transparansi
      WHERE UPPER(status) IN ('PUBLISHED', 'PUBLISH')
        AND effective_date <= GREATEST(CURRENT_DATE, (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date)
      ORDER BY effective_date DESC, created_at DESC
    `;
    const { rows } = await pool.query(query);

    return rows.map((doc: any) => ({
      id: Number(doc.id),
      title: doc.title,
      slug: doc.slug,
      type: 'PDF',
      category: 'Transparansi Pengelolaan Keuangan Daerah',
      description: doc.description || doc.title,
      date: formatEffectiveDateIndo(doc.effective_date_str || doc.effective_date),
      pdfUrl: doc.pdfUrl || null,
    }));
  } catch (error) {
    console.error('Error fetching transparansi dokumen:', error);
    return [];
  }
}
