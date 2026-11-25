import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { saveBeritaImage } from '@/lib/upload';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.mustChangePassword || user.isPasswordExpired) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
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
    const message =
      error instanceof Error
        ? error.message
        : 'Gagal mengunggah berkas gambar.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
