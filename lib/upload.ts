import { promises as fs } from 'fs';
import path from 'path';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Menyimpan berkas gambar berita ke direktori `public/uploads/berita/`
 * dan mengembalikan URL path relatif (contoh: `/uploads/berita/1730000000-a1b2c3d4.webp`).
 */
export async function saveBeritaImage(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error('Berkas gambar tidak ditemukan atau kosong.');
  }

  const ext = ALLOWED_MIME_TYPES[file.type.toLowerCase()];
  if (!ext) {
    throw new Error(
      'Format berkas tidak didukung. Gunakan format JPG, PNG, atau WebP.'
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      'Ukuran berkas melebihi batas maksimal 5 MB.'
    );
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'berita');
  await fs.mkdir(uploadDir, { recursive: true });

  const randomStr = Math.random().toString(36).substring(2, 10);
  const fileName = `${Date.now()}-${randomStr}.${ext}`;
  const filePath = path.join(uploadDir, fileName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(filePath, buffer);

  return `/uploads/berita/${fileName}`;
}

const ALLOWED_THUMBNAIL_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Menyimpan berkas gambar thumbnail pengumuman ke direktori `public/uploads/pengumuman/thumbnails/`
 * dan mengembalikan URL path relatif.
 */
export async function savePengumumanThumbnail(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error('Berkas thumbnail tidak ditemukan atau kosong.');
  }

  const ext = ALLOWED_THUMBNAIL_MIME_TYPES[file.type.toLowerCase()];
  if (!ext) {
    throw new Error(
      'Format thumbnail tidak didukung. Gunakan format JPG atau PNG.'
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Ukuran gambar thumbnail melebihi batas maksimal 5 MB.');
  }

  const uploadDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    'pengumuman',
    'thumbnails'
  );
  await fs.mkdir(uploadDir, { recursive: true });

  const randomStr = Math.random().toString(36).substring(2, 10);
  const fileName = `${Date.now()}-${randomStr}.${ext}`;
  const filePath = path.join(uploadDir, fileName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(filePath, buffer);

  return `/uploads/pengumuman/thumbnails/${fileName}`;
}

/**
 * Menyimpan berkas dokumen lampiran PDF pengumuman ke direktori `public/uploads/pengumuman/lampiran/`
 * dan mengembalikan URL path relatif.
 */
export async function savePengumumanAttachment(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error('Berkas lampiran PDF tidak ditemukan atau kosong.');
  }

  const isPdfMime = file.type.toLowerCase() === 'application/pdf';
  const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
  if (!isPdfMime && !isPdfExt) {
    throw new Error('Format lampiran tidak didukung. Gunakan berkas PDF.');
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    throw new Error('Ukuran berkas lampiran PDF melebihi batas maksimal 10 MB.');
  }

  const uploadDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    'pengumuman',
    'lampiran'
  );
  await fs.mkdir(uploadDir, { recursive: true });

  const baseName = file.name
    .replace(/\.pdf$/i, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 60);
  const fileName = `${Date.now()}-${baseName || 'Lampiran'}.pdf`;
  const filePath = path.join(uploadDir, fileName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(filePath, buffer);

  return `/uploads/pengumuman/lampiran/${fileName}`;
}


