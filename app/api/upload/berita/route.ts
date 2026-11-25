import { NextResponse } from 'next/server';
import { getCurrentUser, requireRole } from '@/lib/auth';
import {
  MAX_IMAGE_FILE_SIZE_BYTES,
  isUploadValidationError,
  saveBeritaImage,
} from '@/lib/upload';

const MAX_MULTIPART_CONTENT_LENGTH = MAX_IMAGE_FILE_SIZE_BYTES + 256 * 1024;
const ALLOWED_UPLOAD_ROLES = ['SUPER_ADMIN', 'ADMIN_BERITA', 'REPORTER'] as const;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.mustChangePassword || user.isPasswordExpired) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!ALLOWED_UPLOAD_ROLES.includes(user.role)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    );
  }

  await requireRole(['SUPER_ADMIN', 'ADMIN_BERITA', 'REPORTER']);

  const contentLengthHeader = request.headers.get('content-length');
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);
    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_MULTIPART_CONTENT_LENGTH
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ukuran berkas melebihi batas maksimal 5 MB.',
        },
        { status: 413 }
      );
    }
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image') ?? formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'Berkas gambar tidak valid.' },
        { status: 400 }
      );
    }

    const url = await saveBeritaImage(file);
    return NextResponse.json({ success: true, url });
  } catch (error: unknown) {
    if (isUploadValidationError(error)) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/upload/berita:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengunggah berkas gambar.' },
      { status: 500 }
    );
  }
}
