/**
 * Mengonversi pasangan tanggal (YYYY-MM-DD) dan waktu (HH:mm) WIB (UTC+7)
 * menjadi ISO string timestamp yang valid, atau mengembalikan null jika tidak valid.
 */
export function parseCustomPublishTimestamp(
  publishDate?: string | null,
  publishTime?: string | null
): string | null {
  const datePart = (publishDate || '').trim();
  const timePart = (publishTime || '').trim() || '00:00';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return null;
  }

  const normalizedTime = /^\d{2}:\d{2}$/.test(timePart)
    ? `${timePart}:00`
    : /^\d{2}:\d{2}:\d{2}$/.test(timePart)
      ? timePart
      : '00:00:00';

  const parsed = new Date(`${datePart}T${normalizedTime}+07:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  // Batasi agar tidak melebihi waktu saat ini (sesuai aturan form)
  const now = new Date();
  const finalDate = parsed.getTime() > now.getTime() ? now : parsed;
  return finalDate.toISOString();
}

