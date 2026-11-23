'use server';

import { revalidatePath } from 'next/cache';
import pool from '@/lib/db/pool';
import { saveProfileAssetImage } from '@/lib/upload';
import { DEFAULT_PROFILE_PAGES } from './defaults';
import {
  isValidProfilePageSlug,
  type ProfilePageData,
  type ProfilePageUpdatePayload,
} from './types';

function revalidateProfilePaths(slug: string): void {
  revalidatePath(`/${slug}`);
  revalidatePath('/sejarah/pemimpin', 'layout');
  revalidatePath('/admin/profil-kota');
  revalidatePath('/admin/pengaturan');
}

export async function updateProfilePageAction(
  slug: string,
  payload: ProfilePageUpdatePayload
): Promise<{ success: boolean; data?: ProfilePageData; error?: string }> {
  try {
    if (!isValidProfilePageSlug(slug)) {
      return { success: false, error: 'Slug halaman profil tidak valid.' };
    }

    const title = payload.title?.trim();
    if (!title) {
      return { success: false, error: 'Judul halaman wajib diisi.' };
    }

    const heroImageFit =
      payload.heroImageFit === 'contain' ? 'contain' : 'cover';
    const extraData = payload.extraData ?? {};

    await pool.query(
      `INSERT INTO public.profile_pages (
        slug,
        title,
        description,
        hero_image,
        hero_image_fit,
        content_image,
        content_image_title,
        content_image_caption,
        content_html,
        extra_data,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, NOW())
      ON CONFLICT (slug)
      DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        hero_image = EXCLUDED.hero_image,
        hero_image_fit = EXCLUDED.hero_image_fit,
        content_image = EXCLUDED.content_image,
        content_image_title = EXCLUDED.content_image_title,
        content_image_caption = EXCLUDED.content_image_caption,
        content_html = EXCLUDED.content_html,
        extra_data = EXCLUDED.extra_data,
        updated_at = NOW()`,
      [
        slug,
        title,
        payload.description ?? '',
        payload.heroImage ?? '',
        heroImageFit,
        payload.contentImage ?? null,
        payload.contentImageTitle ?? null,
        payload.contentImageCaption ?? null,
        payload.contentHtml ?? '',
        JSON.stringify(extraData),
      ]
    );

    revalidateProfilePaths(slug);

    const saved: ProfilePageData = {
      slug,
      title,
      description: payload.description ?? '',
      heroImage: payload.heroImage ?? '',
      heroImageFit,
      contentImage: payload.contentImage ?? null,
      contentImageTitle: payload.contentImageTitle ?? null,
      contentImageCaption: payload.contentImageCaption ?? null,
      contentHtml: payload.contentHtml ?? '',
      extraData,
      updatedAt: new Date().toISOString(),
    };

    return { success: true, data: saved };
  } catch (error) {
    console.error(`Error in updateProfilePageAction (${slug}):`, error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan halaman profil.',
    };
  }
}

export async function resetProfilePageAction(
  slug: string
): Promise<{ success: boolean; data?: ProfilePageData; error?: string }> {
  try {
    if (!isValidProfilePageSlug(slug)) {
      return { success: false, error: 'Slug halaman profil tidak valid.' };
    }

    const def = DEFAULT_PROFILE_PAGES[slug];

    await pool.query(
      `INSERT INTO public.profile_pages (
        slug,
        title,
        description,
        hero_image,
        hero_image_fit,
        content_image,
        content_image_title,
        content_image_caption,
        content_html,
        extra_data,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, NOW())
      ON CONFLICT (slug)
      DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        hero_image = EXCLUDED.hero_image,
        hero_image_fit = EXCLUDED.hero_image_fit,
        content_image = EXCLUDED.content_image,
        content_image_title = EXCLUDED.content_image_title,
        content_image_caption = EXCLUDED.content_image_caption,
        content_html = EXCLUDED.content_html,
        extra_data = EXCLUDED.extra_data,
        updated_at = NOW()`,
      [
        def.slug,
        def.title,
        def.description,
        def.heroImage,
        def.heroImageFit,
        def.contentImage,
        def.contentImageTitle,
        def.contentImageCaption,
        def.contentHtml,
        JSON.stringify(def.extraData ?? {}),
      ]
    );

    revalidateProfilePaths(slug);

    return {
      success: true,
      data: { ...def, updatedAt: new Date().toISOString() },
    };
  } catch (error) {
    console.error(`Error in resetProfilePageAction (${slug}):`, error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal mereset halaman profil ke bawaan.',
    };
  }
}

export async function uploadProfileImageAction(
  formData: FormData
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    const fileEntry = formData.get('file');
    if (!(fileEntry instanceof File) || fileEntry.size === 0) {
      return {
        success: false,
        error: 'Berkas gambar tidak ditemukan atau kosong.',
      };
    }

    const imageUrl = await saveProfileAssetImage(fileEntry);
    return {
      success: true,
      imageUrl,
    };
  } catch (error) {
    console.error('Error in uploadProfileImageAction:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal mengunggah berkas gambar.',
    };
  }
}
