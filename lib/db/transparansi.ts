import pool from './pool';

// Ambil Data Transparansi Dokumen dari Tabel transparansi_dokumen
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
    console.error('Error fetching transparansi dokumen:', error);
    return [];
  }
}

