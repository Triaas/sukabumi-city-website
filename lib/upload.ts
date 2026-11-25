import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadValidationError';
  }
}

export function isUploadValidationError(
  error: unknown
): error is UploadValidationError {
  return (
    error instanceof UploadValidationError ||
    (typeof error === 'object' &&
      error !== null &&
      (error as { name?: string }).name === 'UploadValidationError')
  );
}

type SupportedImageExt = 'jpg' | 'png' | 'webp';

const ALLOWED_IMAGE_MIME_TYPES: Record<string, SupportedImageExt> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_TRANSPARANSI_PDF_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

function matchesImageMagicBytes(
  buffer: Buffer,
  expectedExt: SupportedImageExt
): boolean {
  if (expectedExt === 'jpg') {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (expectedExt === 'png') {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  if (expectedExt === 'webp') {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }

  return false;
}

function matchesPdfMagicBytes(buffer: Buffer): boolean {
  return buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-';
}

function generateRandomHexId(): string {
  return crypto.randomBytes(8).toString('hex');
}

async function saveValidatedRasterImage(
  file: File,
  subDirSegments: string[],
  options: {
    emptyMessage: string;
    invalidFormatMessage: string;
    maxSizeMessage: string;
  }
): Promise<string> {
  if (!file || file.size === 0) {
    throw new UploadValidationError(options.emptyMessage);
  }

  const ext = ALLOWED_IMAGE_MIME_TYPES[file.type.toLowerCase()];
  if (!ext) {
    throw new UploadValidationError(options.invalidFormatMessage);
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    throw new UploadValidationError(options.maxSizeMessage);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (!matchesImageMagicBytes(buffer, ext)) {
    throw new UploadValidationError(options.invalidFormatMessage);
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', ...subDirSegments);
  await fs.mkdir(uploadDir, { recursive: true });

  const fileName = `${Date.now()}-${generateRandomHexId()}.${ext}`;
  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, buffer);

  return `/uploads/${subDirSegments.join('/')}/${fileName}`;
}

export async function saveBeritaImage(file: File): Promise<string> {
  return saveValidatedRasterImage(file, ['berita'], {
    emptyMessage: 'Berkas gambar tidak ditemukan atau kosong.',
    invalidFormatMessage:
      'Format berkas tidak didukung. Gunakan format JPG, PNG, atau WebP.',
    maxSizeMessage: 'Ukuran berkas melebihi batas maksimal 5 MB.',
  });
}

export async function savePengumumanThumbnail(file: File): Promise<string> {
  return saveValidatedRasterImage(file, ['pengumuman', 'thumbnails'], {
    emptyMessage: 'Berkas thumbnail tidak ditemukan atau kosong.',
    invalidFormatMessage:
      'Format thumbnail tidak didukung. Gunakan format JPG, PNG, atau WebP.',
    maxSizeMessage: 'Ukuran gambar thumbnail melebihi batas maksimal 5 MB.',
  });
}

export async function savePengumumanAttachment(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new UploadValidationError(
      'Berkas lampiran PDF tidak ditemukan atau kosong.'
    );
  }

  const isPdfMime = file.type.toLowerCase() === 'application/pdf';
  const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
  if (!isPdfMime || !isPdfExt) {
    throw new UploadValidationError(
      'Format lampiran tidak didukung. Gunakan berkas PDF.'
    );
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    throw new UploadValidationError(
      'Ukuran berkas lampiran PDF melebihi batas maksimal 10 MB.'
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (!matchesPdfMagicBytes(buffer)) {
    throw new UploadValidationError(
      'Format lampiran tidak didukung. Berkas bukan dokumen PDF yang valid.'
    );
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
    .slice(0, 50);
  const fileName = `${Date.now()}-${generateRandomHexId()}-${baseName || 'Lampiran'}.pdf`;
  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, buffer);

  return `/uploads/pengumuman/lampiran/${fileName}`;
}

export async function saveTransparansiPdf(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new UploadValidationError(
      'Berkas dokumen PDF tidak ditemukan atau kosong.'
    );
  }

  const isPdfMime = file.type.toLowerCase() === 'application/pdf';
  const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
  if (!isPdfMime || !isPdfExt) {
    throw new UploadValidationError(
      'Format dokumen tidak didukung. Gunakan berkas PDF.'
    );
  }

  if (file.size > MAX_TRANSPARANSI_PDF_SIZE_BYTES) {
    throw new UploadValidationError(
      'Ukuran berkas PDF melebihi batas maksimal 25 MB.'
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (!matchesPdfMagicBytes(buffer)) {
    throw new UploadValidationError(
      'Format dokumen tidak didukung. Berkas bukan dokumen PDF yang valid.'
    );
  }

  const uploadDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    'transparansi'
  );
  await fs.mkdir(uploadDir, { recursive: true });

  const baseName = file.name
    .replace(/\.pdf$/i, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50);
  const fileName = `${Date.now()}-${generateRandomHexId()}-${baseName || 'Dokumen'}.pdf`;
  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, buffer);

  return `/uploads/transparansi/${fileName}`;
}

export async function saveBannerImage(file: File): Promise<string> {
  return saveValidatedRasterImage(file, ['banner'], {
    emptyMessage: 'Berkas gambar banner tidak ditemukan atau kosong.',
    invalidFormatMessage:
      'Format berkas gambar tidak didukung. Gunakan format JPG, PNG, atau WebP.',
    maxSizeMessage:
      'Ukuran berkas gambar banner melebihi batas maksimal 5 MB.',
  });
}

export async function saveSiteAssetImage(file: File): Promise<string> {
  return saveValidatedRasterImage(file, ['site'], {
    emptyMessage: 'Berkas gambar tidak ditemukan atau kosong.',
    invalidFormatMessage:
      'Format berkas gambar tidak didukung. Gunakan format JPG, PNG, atau WebP.',
    maxSizeMessage: 'Ukuran berkas gambar melebihi batas maksimal 5 MB.',
  });
}

export async function saveProfileAssetImage(file: File): Promise<string> {
  return saveValidatedRasterImage(file, ['profile'], {
    emptyMessage: 'Berkas gambar tidak ditemukan atau kosong.',
    invalidFormatMessage:
      'Format berkas gambar tidak didukung. Gunakan format JPG, PNG, atau WebP.',
    maxSizeMessage: 'Ukuran berkas gambar melebihi batas maksimal 5 MB.',
  });
}

export async function deleteUploadedFileSafely(
  publicUrl: string | null | undefined
): Promise<void> {
  if (!publicUrl || typeof publicUrl !== 'string') return;

  let normalizedUrl = publicUrl.trim();
  if (!normalizedUrl || normalizedUrl.includes('\0')) return;

  if (!normalizedUrl.startsWith('/uploads/')) return;

  try {
    normalizedUrl = decodeURIComponent(normalizedUrl);
  } catch {
    return;
  }

  if (!normalizedUrl.startsWith('/uploads/') || normalizedUrl.includes('\0')) {
    return;
  }

  const uploadsRoot = path.resolve(process.cwd(), 'public', 'uploads');
  const relativeSubPath = normalizedUrl.replace(/^\/uploads\/+/, '');
  if (!relativeSubPath) return;

  const resolvedPath = path.resolve(uploadsRoot, relativeSubPath);
  if (!resolvedPath.startsWith(uploadsRoot + path.sep)) {
    return;
  }

  try {
    const stat = await fs.lstat(resolvedPath);
    if (stat.isFile()) {
      await fs.unlink(resolvedPath);
    }
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code !== 'ENOENT') {
      console.error('Error deleting uploaded file:', err);
    }
  }
}
